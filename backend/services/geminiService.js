const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is missing in .env");
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Generate a response from Gemini
 *
 * @param {string} prompt
 * @param {string} systemInstruction
 * @param {boolean} isJsonMode
 * @returns {Promise<string>}
 */
async function generateGeminiResponse(
    prompt,
    systemInstruction = "",
    isJsonMode = false
) {
    try {
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is missing in .env file");
        }

        // Current Gemini Flash model
        const model = genAI.getGenerativeModel({
            model: "gemini-3.6-flash"
        });

        const fullPrompt = systemInstruction
            ? `${systemInstruction}\n\nUser Question/Context:\n${prompt}`
            : prompt;

        const generationConfig = {
            temperature: 0.7
        };

        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: fullPrompt
                        }
                    ]
                }
            ],
            generationConfig
        });

        const response = result.response;
        const responseText = response.text();

        if (!responseText) {
            throw new Error("Empty response received from Gemini");
        }

        return responseText;

    } catch (error) {
        console.error("Gemini Service Error:", error.message);

        // Keep the original error visible during development
        throw error;
    }
}

module.exports = {
    generateGeminiResponse
};