const { loadDataFile } = require('./interviewPlanBuilder');

/**
 * Calculates dashboard statistics based on candidate missions and curriculum.
 */
function calculateDashboardStats(candidate, curriculumOverride = null) {
    let curriculum = curriculumOverride || loadDataFile('curriculum.json');
    if (curriculum && !Array.isArray(curriculum) && curriculum.days) {
        curriculum = curriculum.days;
    }
    if (!candidate || !candidate.missions || !curriculum) {
        return null;
    }

    let completedDays = 0;
    let skippedDaysCount = 0;

    let completedTopics = [];
    let skippedTopics = [];

    // Process candidate missions
    candidate.missions.forEach(mission => {
        const curriculumItem = curriculum.find(c => c.day === mission.day);
        if (!curriculumItem) return;

        if (mission.passed === true) {
            completedDays++;
            completedTopics.push({
                day: mission.day,
                title: curriculumItem.title
            });
        }

        if (mission.skipped === true) {
            skippedDaysCount++;
            skippedTopics.push({
                day: mission.day,
                title: curriculumItem.title
            });
        }
    });

    const totalModules = curriculum.length;
    // Assuming 'module' directly correlates to a curriculum 'day' based on progress format
    const modulesCompleted = completedDays;

    let overallProgressPercent = 0;
    if (totalModules > 0) {
        overallProgressPercent = Math.round((modulesCompleted / totalModules) * 100);
    }

    return {
        completedDays: completedDays,
        skippedDays: skippedDaysCount,
        modulesCompleted: modulesCompleted,
        totalModules: totalModules,
        overallProgressPercent: overallProgressPercent,
        completedTopics: completedTopics,
        skippedTopics: skippedTopics
    };
}

module.exports = {
    calculateDashboardStats
};
