require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

async function runTest() {
    console.log("=== Testing POST /api/interview ===\n");

    try {
        const candidatesPath = path.join(__dirname, 'data', 'candidates.json');
        const candidatesPayload = JSON.parse(fs.readFileSync(candidatesPath, 'utf8'));
        const candidate = candidatesPayload.candidates ? candidatesPayload.candidates[1] : candidatesPayload[1];

        const sessionId = uuidv4();
        // Assuming your backend is running on PORT 3000 by default (as per .env), unless you changed it to 5000!
        const port = process.env.PORT || 3000;
        const endpoint = `http://127.0.0.1:${port}/api/interview`;

        console.log(`Sending POST request to ${endpoint}...`);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId,
                candidate
            })
        });

        // 1. HTTP status
        const status = response.status;
        console.log(`1. HTTP Status: ${status}`);

        // 2. Response body
        const body = await response.json();
        console.log(`2. Response Body:\n${JSON.stringify(body, null, 2)}\n`);

        // 3. Whether reply exists
        const replyCheck = (body.reply !== undefined && body.reply !== null) ? "PASS" : "FAIL";
        console.log(`3. Whether 'reply' exists: ${replyCheck}`);

        // 4. Whether done exists
        const doneCheck = (body.done !== undefined && body.done !== null) ? "PASS" : "FAIL";
        console.log(`4. Whether 'done' exists: ${doneCheck}\n`);

        // Verify that the response does NOT expose internal metrics
        const forbiddenFields = [
            'day',
            'plan',
            'internal tags',
            'system prompt',
            'candidate profile',
            'questionCount',
            'askedDays'
        ];

        let leakedFields = [];
        for (const field of forbiddenFields) {
            if (body[field] !== undefined) {
                leakedFields.push(field);
            }
        }

        if (leakedFields.length === 0) {
            console.log("PASS: Response does NOT expose internal tracking variables.");
        } else {
            console.log(`FAIL: Response exposed forbidden fields -> ${leakedFields.join(', ')}`);
        }

    } catch (error) {
        console.error("Test failed. Is your Express backend server running in another terminal?");
        console.error("Error details:", error.message);
    }
}

runTest();
