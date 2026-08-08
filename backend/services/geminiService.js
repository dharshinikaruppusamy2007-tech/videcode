const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is missing in .env");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Models to try in order
const MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3-flash-preview",
];

/**
 * Sleep for ms milliseconds
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a response from Gemini with automatic retry on rate limiting
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
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing in .env file");
    }

    const fullPrompt = systemInstruction
        ? `${systemInstruction}\n\nUser Question/Context:\n${prompt}`
        : prompt;

    const generationConfig = { temperature: 0.7 };

    let lastError = null;

    for (const modelName of MODELS) {
        // Try each model with up to 3 retries for rate limit errors
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });

                const result = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
                    generationConfig
                });

                const responseText = result.response.text();
                if (!responseText) throw new Error("Empty response from Gemini");

                if (attempt > 0 || modelName !== MODELS[0]) {
                    console.log(`✅ Gemini success with model: ${modelName} (attempt ${attempt + 1})`);
                }
                return responseText;

            } catch (error) {
                lastError = error;
                const msg = error.message || "";
                const isRateLimit = msg.includes("RESOURCE_EXHAUSTED") || msg.includes("429") || msg.includes("quota");
                const isNotFound = msg.includes("404") || msg.includes("not found") || msg.includes("MODEL_NOT_FOUND");

                if (isNotFound) {
                    console.warn(`⚠️  Model ${modelName} not found, trying next...`);
                    break; // Try next model immediately
                }

                // Daily per-project free-tier quota is exhausted — retrying will not help, skip to next model
                const isDailyQuotaExhausted = msg.includes("free_tier_requests") || msg.includes("GenerateRequestsPerDayPerProjectPerModel-FreeTier") || msg.includes("limit: 0");

                if (isRateLimit && !isDailyQuotaExhausted && attempt < 2) {
                    // Extract retryDelay from error if available, else use exponential backoff
                    let waitMs = Math.pow(2, attempt + 1) * 5000; // 10s, 20s
                    const delayMatch = msg.match(/retryDelay['":\s]+(\d+)/);
                    if (delayMatch) waitMs = parseInt(delayMatch[1]) * 1000 + 1000;

                    console.warn(`⏳ Rate limited by Gemini (model: ${modelName}). Retrying in ${waitMs / 1000}s...`);
                    await sleep(waitMs);
                    continue;
                }

                // Non-retryable error — try next model
                console.error(`Gemini error with ${modelName}:`, msg);
                break;
            }
        }
    }

    console.error("❌ All Gemini models exhausted:", lastError?.message);
    throw lastError || new Error("All Gemini models failed");
}

module.exports = { generateGeminiResponse };