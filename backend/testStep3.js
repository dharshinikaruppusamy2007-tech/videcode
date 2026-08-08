require('dotenv').config();
const { buildInterviewPlan, loadDataFile } = require('./services/interviewPlanBuilder');
const { generateNextQuestion, generateFinalFeedback } = require('./services/interviewerLogic');

async function runStep3Test() {
    console.log("=== STEP 3 GEMINI TEST ===");

    if (!process.env.GEMINI_API_KEY) {
        console.error("FAIL: GEMINI_API_KEY is not set in .env");
        return;
    } else {
        console.log("PASS: Found GEMINI_API_KEY environment variable.");
    }

    try {
        const candidates = loadDataFile('candidates.json');
        const curriculum = loadDataFile('curriculum.json');
        const candidate = candidates.candidates ? candidates.candidates[1] : candidates[1];

        const plan = buildInterviewPlan(candidate, curriculum);

        // Dummy conversation history simulating part of an interview
        const dummyHistory = [
            { role: "interviewer", content: `Welcome. Let's start with ${plan[0]?.title}. Can you explain it?` },
            { role: "candidate", content: "I'm not too sure, I skipped some of the reading." } // Simulating a weak answer to test follow-up
        ];

        console.log("\n== Testing generateNextQuestion ==");
        console.log("Generating follow-up question. This might take a few seconds...");

        const nextQ = await generateNextQuestion(candidate, plan, dummyHistory, 1);
        console.log("\n[Interviewer Next Question Response]:\n", nextQ);

        console.log("\n== Testing generateFinalFeedback ==");
        console.log("Generating final overall JSON feedback. Please wait...");

        const feedback = await generateFinalFeedback(candidate, plan, dummyHistory);
        console.log("\n[Final Feedback JSON Response]:\n", JSON.stringify(feedback, null, 2));

        console.log("\nPASS: Successfully communicated with Gemini API.");

    } catch (error) {
        console.error("FAIL: Step 3 Test Error ->", error.message);
    }
}

runStep3Test();
