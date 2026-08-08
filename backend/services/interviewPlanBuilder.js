const fs = require('fs');
const path = require('path');

/**
 * Loads JSON data from the /data directory safely.
 */
function loadDataFile(filename) {
    try {
        const filePath = path.join(__dirname, '..', 'data', filename);
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.warn(`[Warning] Could not load ${filename}. Please ensure the file exists at backend/data/${filename}`);
        return null;
    }
}

/**
 * Builds an interview plan by cross-referencing candidate mission results with the AI curriculum.
 * rules:
 * - gap: skipped the topic (mission.skipped === true)
 * - weak_signal: attempts >= 3
 * - strong_signal: attempts == 1 AND passed == true
 * priority: gap > weak_signal > strong_signal
 * output: 8-10 items spanning at least 4 distinct days.
 */
function buildInterviewPlan(candidate, curriculumOverride = null) {
    let curriculum = curriculumOverride || loadDataFile('curriculum.json');
    if (curriculum && !Array.isArray(curriculum) && curriculum.days) {
        curriculum = curriculum.days;
    }
    if (!candidate || !candidate.missions || !curriculum) {
        return [];
    }

    let taggedItems = [];

    // 1. Cross-reference candidates' missions against curriculum and tag them
    for (const mission of candidate.missions) {
        const curriculumItem = curriculum.find(item => item.day === mission.day);
        if (!curriculumItem) continue;

        let tag = null;

        if (mission.skipped === true) {
            tag = 'gap';
        } else if (mission.attempts >= 3) {
            tag = 'weak_signal';
        } else if (mission.attempts === 1 && mission.passed === true) {
            tag = 'strong_signal';
        }

        if (tag) {
            taggedItems.push({
                day: curriculumItem.day,
                title: curriculumItem.title,
                tag: tag,
                objectives: curriculumItem.objectives || [],
                tools: curriculumItem.tools || []
            });
        }
    }

    // 2. Sort by priority: gap > weak_signal > strong_signal
    const priority = { 'gap': 1, 'weak_signal': 2, 'strong_signal': 3 };
    taggedItems.sort((a, b) => priority[a.tag] - priority[b.tag]);

    // 3. Selection Algorithm (8-10 items, spanning at least 4 distinct days)
    let plan = [];
    let usedDays = new Set();
    let remainingItems = [...taggedItems];

    // First pass: Try to pick items from distinct days to fulfill the 4 distinct days requirement
    const daysAvailable = new Set(remainingItems.map(i => i.day)).size;
    const daysToTarget = Math.min(4, daysAvailable);

    while (usedDays.size < daysToTarget && remainingItems.length > 0) {
        const idx = remainingItems.findIndex(i => !usedDays.has(i.day));
        if (idx !== -1) {
            const item = remainingItems.splice(idx, 1)[0];
            plan.push(item);
            usedDays.add(item.day);
        } else {
            break;
        }
    }

    // Second pass: Fill the rest until we reach up to 10 items total
    while (plan.length < 10 && remainingItems.length > 0) {
        plan.push(remainingItems.shift());
    }

    // Re-apply sort to fix the distinct day prioritization breaking the priority sorting
    plan.sort((a, b) => priority[a.tag] - priority[b.tag]);

    return plan;
}

module.exports = {
    buildInterviewPlan,
    loadDataFile
};
