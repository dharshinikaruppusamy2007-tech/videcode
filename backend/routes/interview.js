const express = require('express');
const router = express.Router();
const { getInterviewTurn, getFeedback } = require('../services/interviewerLogic');
const { buildInterviewPlan } = require('../services/interviewPlanBuilder');
const { buildScoring } = require('../services/feedbackScoring');

const sessions = new Map();

router.post('/', async (req, res) => {
    try {
        const { sessionId, candidate, message } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: "sessionId is required" });
        }

        let session = sessions.get(sessionId);

        // CASE 1 — START NEW INTERVIEW
        if (!session) {
            if (!candidate) {
                return res.status(400).json({ error: "candidate is required when starting an interview" });
            }

            const plan = buildInterviewPlan(candidate);

            session = {
                sessionId,
                candidate,
                plan,
                history: [],
                askedDays: new Set(),
                questionCount: 0,
                currentDay: null,
                completed: false,
                createdAt: new Date()
            };

            sessions.set(sessionId, session);

            const turn = await getInterviewTurn(candidate, plan, session.history);

            if (turn.reply) {
                session.questionCount += 1;
                session.currentDay = turn.day;
                if (turn.day) session.askedDays.add(turn.day);

                session.history.push({
                    role: "interviewer",
                    content: turn.reply,
                    day: turn.day
                });
            }

            return res.json({
                reply: turn.reply,
                done: false
            });
        }

        // CASE 2 — CONTINUE INTERVIEW
        if (!message) {
            return res.status(400).json({ error: "message is required" });
        }

        if (session.completed) {
            return res.status(400).json({ error: "This interview has already been completed." });
        }

        if (message.trim().length === 0) {
            return res.status(400).json({ error: "message cannot be empty" });
        }

        session.history.push({
            role: "candidate",
            content: message
        });

        let retryCount = 0;
        const MAX_CONTINUATION_RETRIES = 3;
        let turn = null;
        let retryInstruction = "";
        let finalDone = false;

        while (retryCount <= MAX_CONTINUATION_RETRIES) {
            turn = await getInterviewTurn(session.candidate, session.plan, session.history, retryInstruction);

            if (turn.done) {
                // Server-Side End Gate checks
                if (session.questionCount >= 8 && session.askedDays.size >= 4) {
                    finalDone = true;
                    break;
                } else {
                    retryInstruction = "Continue the interview. The minimum coverage requirements have not been met. You must continue asking questions. Ensure the next question covers a curriculum day that has not yet been sufficiently covered. Ask exactly one question and set done: false.";
                    retryCount++;
                }
            } else {
                break; // Valid continuation
            }
        }

        if (finalDone) {
            const transcript = [];
            let lastQ = "";
            for (const msg of session.history) {
                if (msg.role === 'interviewer') {
                    lastQ = msg.content;
                } else if (msg.role === 'candidate' && lastQ) {
                    transcript.push({ question: lastQ, answer: msg.content });
                }
            }

            const aiFeedback = await getFeedback(transcript, session.candidate.member);
            const scoring = buildScoring(session.candidate, aiFeedback.categories);

            const feedback = {
                summary: aiFeedback.summary,
                strengths: aiFeedback.strengths,
                gaps: aiFeedback.gaps,
                next: aiFeedback.next,
                categories: scoring.categories,
                overall: scoring.overall
            };

            sessions.delete(sessionId);

            return res.json({
                reply: "Interview completed.",
                done: true,
                feedback
            });
        }

        // Handle max retries exceeded for continuation bypass
        if (turn.done && !finalDone) {
            return res.json({
                reply: "Let's continue with one more question before we wrap up. Can you tell me your thoughts on a topic from the curriculum you feel weakest at?",
                done: false
            });
        }

        session.questionCount += 1;
        session.currentDay = turn.day;
        if (turn.day) session.askedDays.add(turn.day);

        session.history.push({
            role: "interviewer",
            content: turn.reply,
            day: turn.day
        });

        // Hide internal props from output
        return res.json({
            reply: turn.reply,
            done: false
        });

    } catch (error) {
        console.error("Interview Route Error:", error);
        return res.status(503).json({ error: "AI interview service is temporarily unavailable. Please try again." });
    }
});

module.exports = router;
