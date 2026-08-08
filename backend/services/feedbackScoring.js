const PERFORMANCE_CATEGORIES = [
    { id: "rag_embeddings", label: "RAG & Embeddings", days: [7, 8, 10, 11] },
    { id: "prompt_engineering", label: "Prompt Engineering", days: [12, 13, 14, 15] },
    { id: "vector_databases", label: "Vector Databases", days: [7, 8, 9, 10] },
    { id: "system_design", label: "System Design", days: [16, 17, 18, 19, 20, 25, 26, 27, 28] },
    { id: "mcp_advanced", label: "MCP & Advanced Topics", days: [21, 22, 23, 24, 29, 30, 31] }
];

const round1 = (value) => Math.round(value * 10) / 10;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function baseScoreForMission(mission) {
    if (!mission) return 4.5;
    if (mission.skipped) return 2.5;
    if (mission.passed) {
        if (mission.attempts === 1) return 8.8;
        if (mission.attempts === 2) return 8.0;
        if (mission.attempts === 3) return 7.0;
        return 6.2;
    }
    return 4.0;
}

function computeCategoryBase(candidate) {
    const missions = Array.isArray(candidate?.missions) ? candidate.missions : [];
    const byDay = new Map();
    missions.forEach((mission) => {
        if (mission && typeof mission.day === "number") byDay.set(mission.day, mission);
    });

    return PERFORMANCE_CATEGORIES.map((category) => {
        let total = 0;
        category.days.forEach((day) => {
            total += baseScoreForMission(byDay.get(day));
        });
        const score = clamp(round1(total / category.days.length), 1, 10);
        return { label: category.label, score };
    });
}

function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function blendScores(baseCategories, aiScores) {
    const aiMap = {};
    if (aiScores && typeof aiScores === "object") {
        Object.entries(aiScores).forEach(([key, value]) => {
            const score = toNumber(value);
            if (score !== null) {
                aiMap[String(key).toLowerCase().trim()] = clamp(score, 0, 10);
            }
        });
    }

    return baseCategories.map((base) => {
        const aiScore = aiMap[base.label.toLowerCase()];
        if (aiScore === undefined) return base;
        return { label: base.label, score: round1(clamp(aiScore * 0.6 + base.score * 0.4, 1, 10)) };
    });
}

function buildScoring(candidate, aiCategories) {
    const base = computeCategoryBase(candidate);
    const categories = blendScores(base, aiCategories);
    const total = categories.reduce((sum, category) => sum + category.score, 0);
    const overall = round1(clamp(total / categories.length, 1, 10));
    return { categories, overall };
}

module.exports = {
    PERFORMANCE_CATEGORIES,
    computeCategoryBase,
    buildScoring
};
