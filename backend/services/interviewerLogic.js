const { generateGeminiResponse } = require("./geminiService");

/**
 * Generate the next question from Gemini given the current context.
 * The interviewer evaluates the candidate's latest answer, classifies their
 * level (beginner/intermediate/advanced) and adapts the next question.
 */
async function getInterviewTurn(candidate, interviewPlan, conversationHistory, retryInstruction = "") {
    const history = Array.isArray(conversationHistory) ? conversationHistory : [];
    const hasCandidateAnswer = history.length > 0 && history[history.length - 1].role === 'candidate';

    const systemPrompt = `
You are an expert technical AI Interviewer conducting an evaluation interview for ${candidate?.member?.name || 'the candidate'}.

${hasCandidateAnswer
    ? `TASK — EVALUATE THE CANDIDATE'S LATEST ANSWER AND CONTINUE:
1. Analyze the candidate's answer carefully.
2. Evaluate it based on:
   - Correctness
   - Clarity
   - Depth of explanation
3. Classify the candidate into one level:
   - "beginner"
   - "intermediate"
   - "advanced"
4. Based on the level, generate the NEXT interview question:
   - If beginner → ask an easy/basic question
   - If intermediate → ask a moderate question
   - If advanced → ask a difficult/deep question
5. Keep the interview natural and professional.`
    : `TASK — OPEN THE INTERVIEW:
Greet the candidate briefly by name and ask exactly ONE opening question from the highest-priority item in the CANDIDATE INTERVIEW PLAN. Set "level" to "beginner" for this first question.`}

6. Ground every question in the CANDIDATE INTERVIEW PLAN. Probe deeper into 'gap' and 'weak_signal' topics, and use the curriculum "day" objectives/tools to phrase technical questions.
7. Ask exactly ONE question per turn.
8. If the interview is naturally reaching a close because the candidate has answered well across the required topics, set "done": true. Otherwise set "done": false.
9. Identify the internal integer "day" (curriculum day) your generated question corresponds to.
10. Return a strictly valid JSON response exactly like this:
{
  "level": "beginner | intermediate | advanced",
  "nextQuestion": "Your conversational question text.",
  "done": false,
  "day": 12
}

${retryInstruction ? `\nCRITICAL SYSTEM OVERRIDE: ${retryInstruction}` : ""}
`;

    let contextPrompt = `CANDIDATE INTERVIEW PLAN:\n${JSON.stringify(interviewPlan, null, 2)}\n\n`;
    contextPrompt += `CONVERSATION HISTORY:\n`;

    if (history.length === 0) {
        contextPrompt += "No history yet. Open the interview now.";
    } else {
        history.forEach((msg) => {
            contextPrompt += `${msg.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${msg.content}\n`;
        });
        contextPrompt += `\nEvaluate the candidate's latest answer above, classify their level, and generate the next interviewer question in JSON.`;
    }

    try {
        const responseText = await generateGeminiResponse(contextPrompt, systemPrompt, true);

        // Clean up markdown wrapping if present
        let cleanJson = responseText.trim();
        if (cleanJson.startsWith('```json')) cleanJson = cleanJson.replace(/```json/g, '');
        if (cleanJson.startsWith('```')) cleanJson = cleanJson.replace(/```/g, '');
        if (cleanJson.endsWith('```')) cleanJson = cleanJson.replace(/```/g, '');

        const data = JSON.parse(cleanJson.trim());

        // Map the evaluator output onto the app's turn contract
        return {
            reply: data.nextQuestion || data.reply,
            done: !!data.done,
            day: data.day ?? null,
            level: data.level || null,
        };
    } catch (error) {
        throw new Error("Interview turn generation failed: " + error.message);
    }
}

/**
 * Generate final feedback after the interview has concluded
 */
async function getFeedback(transcript, candidateProfile) {
    const systemPrompt = `
You are an expert technical grading assistant. Evaluate the candidate's performance based on the real interview transcript.

Return a strictly valid JSON response in this exact format:
{
    "summary": "Overall summary of the candidate's performance.",
    "strengths": ["string", "string"],
    "gaps": ["string", "string"],
    "next": ["string", "string"],
    "categories": {
        "RAG & Embeddings": 8.6,
        "Prompt Engineering": 7.2,
        "Vector Databases": 8.1,
        "System Design": 6.9,
        "MCP & Advanced Topics": 5.8
    }
}

Scoring rules for "categories":
1. Each category must be a number between 0 and 10 reflecting how well the candidate answered questions on that topic in this transcript.
2. Use the exact category labels above.
3. Higher scores mean strong, accurate, confident answers. Lower scores mean weak, vague, or incorrect answers.
4. If a topic was barely covered, give a moderate score (5-6) rather than inventing detail.
`;

    let contextPrompt = `CANDIDATE INFO:\n${JSON.stringify(candidateProfile, null, 2)}\n\n`;
    contextPrompt += `TRANSCRIPT:\n`;

    transcript.forEach((msg) => {
        contextPrompt += `Question: ${msg.question}\nAnswer: ${msg.answer}\n\n`;
    });

    contextPrompt += `\nProvide the final feedback for the candidate in JSON format.`;

    try {
        const responseText = await generateGeminiResponse(contextPrompt, systemPrompt, true);

        let cleanJson = responseText.trim();
        if (cleanJson.startsWith('```json')) cleanJson = cleanJson.replace(/```json/g, '');
        if (cleanJson.startsWith('```')) cleanJson = cleanJson.replace(/```/g, '');
        if (cleanJson.endsWith('```')) cleanJson = cleanJson.replace(/```/g, '');

        return JSON.parse(cleanJson.trim());
    } catch (error) {
        throw new Error("Feedback generation failed: " + error.message);
    }
}

module.exports = {
    getInterviewTurn,
    getFeedback
};
