const { generateGeminiResponse } = require("./geminiService");

/**
 * Generate the next question from Gemini given the current context
 */
async function getInterviewTurn(candidate, interviewPlan, conversationHistory, retryInstruction = "") {
    const systemPrompt = `
You are an expert technical AI Interviewer. You are conducting an evaluation interview for ${candidate?.member?.name || 'the candidate'}.

INSTRUCTIONS:
1. Ask ONE clear, technical question at a time based on the CANDIDATE INTERVIEW PLAN. 
2. Use candidate signals (gap, weak_signal, strong_signal). Probe deeper into 'gap' and 'weak_signal' topics.
3. If an answer was PARTIAL or WEAK, ask a deeper technical follow-up on the SAME topic.
4. Only move to a new topic from the plan when the current topic has been satisfactorily answered or heavily probed.
5. Identify the internal integer "day" (curriculum day) your generated question corresponds to.
6. If the interview is naturally reaching a close because the candidate answered everything well, set "done": true.
7. Return a strictly valid JSON response exactly like this:
{
  "reply": "Your conversational text/question.",
  "done": false,
  "day": 12
}

${retryInstruction ? `\nCRITICAL SYSTEM OVERRIDE: ${retryInstruction}` : ""}
`;

    let contextPrompt = `CANDIDATE INTERVIEW PLAN:\n${JSON.stringify(interviewPlan, null, 2)}\n\n`;
    contextPrompt += `CONVERSATION HISTORY:\n`;

    if (!conversationHistory || conversationHistory.length === 0) {
        contextPrompt += "No history yet. Start the interview by greeting the candidate by name briefly, and asking exactly ONE question from the highest-priority plan item.";
    } else {
        conversationHistory.forEach((msg) => {
            contextPrompt += `${msg.role === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${msg.content}\n`;
        });
        contextPrompt += `\nGenerate the next immediate turn for the interviewer in JSON.`;
    }

    try {
        const responseText = await generateGeminiResponse(contextPrompt, systemPrompt, true);

        // Clean up markdown wrapping if present
        let cleanJson = responseText.trim();
        if (cleanJson.startsWith('```json')) cleanJson = cleanJson.replace(/```json/g, '');
        if (cleanJson.startsWith('```')) cleanJson = cleanJson.replace(/```/g, '');
        if (cleanJson.endsWith('```')) cleanJson = cleanJson.replace(/```/g, '');

        return JSON.parse(cleanJson.trim());
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
