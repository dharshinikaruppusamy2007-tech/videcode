require('dotenv').config();
const { generateGeminiResponse } = require('./services/geminiService');

async function runGeminiTest() {
    console.log("=== Testing Gemini API ===\n");

    // 3. Send a simple technical interview question to Gemini.
    const systemPrompt = "You are an expert technical AI Interviewer.";
    const testPrompt = "What is the difference between an inner join and a left join in SQL? Please answer concisely.";

    console.log("Sending prompt to Gemini...");
    console.log(`Prompt: "${testPrompt}"\n`);

    try {
        // 4. Get and print the response.
        const response = await generateGeminiResponse(testPrompt, systemPrompt);
        console.log("---------------------------------------");
        console.log("[Gemini Response]:\n" + response);
        console.log("---------------------------------------\n");

        // 5. Clearly print PASS if a non-empty Gemini response is received.
        if (response && response.trim().length > 0) {
            console.log("PASS: Successfully received a non-empty response from Gemini!");
        } else {
            console.log("FAIL: Received an empty response from Gemini.");
        }
    } catch (error) {
        // 6. Print FAIL with the error if Gemini does not respond.
        console.log("\nFAIL: Gemini did not respond or an error occurred.");
        console.log("Error details:", error.message);
    }
}

runGeminiTest();
