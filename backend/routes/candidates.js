const express = require('express');
const router = express.Router();
const { loadDataFile } = require('../services/interviewPlanBuilder');
const { calculateDashboardStats } = require('../services/dashboardHelper');

const candidatesData = loadDataFile('candidates.json');

// Get all candidates for the login screen
router.get('/', (req, res) => {
    try {
        if (!candidatesData) {
            return res.status(500).json({ error: "Candidate data not found" });
        }
        const list = candidatesData.candidates ? candidatesData.candidates : candidatesData;
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: "Failed to parse candidates" });
    }
});

// Get dashboard stats for a specific candidate ID
router.get('/:id/dashboard', (req, res) => {
    try {
        const list = candidatesData.candidates ? candidatesData.candidates : candidatesData;
        const candidate = list.find(c => c.member && c.member.id === req.params.id);

        if (!candidate) {
            return res.status(404).json({ error: "Candidate not found" });
        }

        const stats = calculateDashboardStats(candidate);

        res.json({
            candidate,
            stats
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate comprehensive dashboard statistics" });
    }
});

module.exports = router;
