import { useNavigate } from 'react-router-dom';
import { Award, CheckCircle, AlertTriangle, ArrowRight, PlayCircle, FileQuestion, Download, Lightbulb } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useApp } from '../context/AppContext';

const asList = (v) => !v ? [] : Array.isArray(v) ? v : typeof v === 'string' ? [v] : [];

const clampScore = (s) => {
    const n = Number(s);
    return Number.isFinite(n) ? Math.max(0, Math.min(10, n)) : 0;
};

const scoreLabel = (s) => {
    if (s >= 8.5) return 'Excellent Performance';
    if (s >= 7) return 'Strong Performance';
    if (s >= 5) return 'Good Performance';
    return 'Needs Improvement';
};

const scoreColor = (s) => {
    if (s >= 8.5) return '#10B981';
    if (s >= 7) return '#4F46E5';
    if (s >= 5) return '#F59E0B';
    return '#EF4444';
};

function ScoreRing({ score, color }) {
    const size = 168;
    const stroke = 13;
    const r = (size - stroke) / 2 - 5;
    const c = 2 * Math.PI * r;
    const pct = clampScore(score) / 10;

    return (
        <div className="fd-ring" style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} role="img" aria-label={`Overall score ${score.toFixed(1)} out of 10`}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EEF2F7" strokeWidth={stroke} />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={`${c * pct} ${c}`}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1, color: 'var(--text)' }}>{score.toFixed(1)}</div>
                <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>out of 10</div>
            </div>
        </div>
    );
}

function CategoryBar({ label, score }) {
    const value = clampScore(score);
    const color = scoreColor(value);
    const pct = Math.round((value / 10) * 100);

    return (
        <div className="fd-bar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color, minWidth: 38, textAlign: 'right' }}>{value.toFixed(1)}</span>
            </div>
            <div className="fd-track" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={10} aria-label={label}>
                <div className="fd-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
        </div>
    );
}

function buildReport(candidate, feedback) {
    const asList2 = (v) => !v ? [] : Array.isArray(v) ? v : typeof v === 'string' ? [v] : [];
    const lines = [];
    lines.push('AI INTERVIEW REPORT');
    lines.push('===================');
    lines.push(`Candidate: ${candidate?.member?.name || 'Unknown'} (${candidate?.member?.id || ''})`);
    lines.push(`Date: ${new Date().toLocaleDateString()}`);
    if (typeof feedback.overall === 'number') {
        lines.push(`Overall Score: ${feedback.overall.toFixed(1)} / 10`);
    }
    if (Array.isArray(feedback.categories) && feedback.categories.length > 0) {
        lines.push('');
        lines.push('PERFORMANCE BREAKDOWN:');
        feedback.categories.forEach((category) => lines.push(`  - ${category.label}: ${Number(category.score).toFixed(1)} / 10`));
    }
    if (feedback.summary) {
        lines.push('');
        lines.push('SUMMARY:');
        lines.push(feedback.summary);
    }
    if (asList2(feedback.strengths).length > 0) {
        lines.push('');
        lines.push('STRENGTHS:');
        asList2(feedback.strengths).forEach((item) => lines.push(`  - ${item}`));
    }
    if (asList2(feedback.gaps).length > 0) {
        lines.push('');
        lines.push('AREAS TO IMPROVE:');
        asList2(feedback.gaps).forEach((item) => lines.push(`  - ${item}`));
    }
    if (asList2(feedback.next).length > 0) {
        lines.push('');
        lines.push('RECOMMENDATIONS:');
        asList2(feedback.next).forEach((item) => lines.push(`  - ${item}`));
    }
    lines.push('');
    lines.push('Keep learning and building! You are on the right track.');

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interview-report-${(candidate?.member?.name || 'candidate').replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

export default function Feedback() {
    const navigate = useNavigate();
    const { feedback, candidate } = useApp();

    if (!feedback) {
        return (
            <div className="app-layout">
                <Sidebar active="feedback" />
                <main className="main-content" style={{ background: 'var(--bg)' }}>
                    <div className="fd-container animate-in">
                        <div className="fd-empty">
                            <div className="fd-empty-icon">
                                <FileQuestion size={34} color="var(--primary)" />
                            </div>
                            <h1>Interview not completed yet</h1>
                            <p>Complete your interview to receive AI-generated feedback.</p>
                            <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ minWidth: 200 }}>
                                <PlayCircle size={17} /> Start Interview
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const strengths = asList(feedback.strengths);
    const gaps = asList(feedback.gaps);
    const next = asList(feedback.next);
    const summary = feedback.summary || feedback.overall_summary || '';
    const categories = Array.isArray(feedback.categories) ? feedback.categories.filter((c) => c && c.label) : [];
    const overall = typeof feedback.overall === 'number' ? clampScore(feedback.overall) : null;
    const hasRealContent = summary || strengths.length > 0 || gaps.length > 0 || next.length > 0 || categories.length > 0 || overall !== null;

    if (!hasRealContent) {
        return (
            <div className="app-layout">
                <Sidebar active="feedback" />
                <main className="main-content" style={{ background: 'var(--bg)' }}>
                    <div className="fd-container animate-in">
                        <div className="fd-empty">
                            <div className="fd-empty-icon">
                                <Award size={34} color="var(--primary)" />
                            </div>
                            <h1>Feedback is not available yet.</h1>
                            <p>Complete your interview to receive AI-generated feedback.</p>
                            <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ minWidth: 200 }}>
                                <PlayCircle size={17} /> Start Interview
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const name = candidate?.member?.name || 'Candidate';
    const ringColor = overall !== null ? scoreColor(overall) : 'var(--primary)';

    return (
        <div className="app-layout">
            <Sidebar active="feedback" />

            <main className="main-content" style={{ background: 'var(--bg)' }}>
                <div className="fd-container animate-in">
                    {/* 1. Header */}
                    <div className="fd-header">
                        <div>
                            <h1>Interview Completed!</h1>
                            <p>Great job, {name}! Here&apos;s your performance summary.</p>
                        </div>
                        <button className="btn btn-primary" onClick={() => buildReport(candidate, feedback)}>
                            <Download size={16} /> Download Report
                        </button>
                    </div>

                    {/* 2 + 3. Score & breakdown */}
                    <div className="fd-grid-top">
                        <div className="card fd-score-card">
                            <h3>Overall Score</h3>
                            {overall !== null ? (
                                <>
                                    <ScoreRing score={overall} color={ringColor} />
                                    <span className="fd-label" style={{ background: `${ringColor}1A`, color: ringColor }}>
                                        {scoreLabel(overall)}
                                    </span>
                                </>
                            ) : (
                                <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>Score not available.</p>
                            )}
                        </div>

                        <div className="card fd-breakdown-card">
                            <h3>Performance Breakdown</h3>
                            {categories.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                    {categories.map((category, i) => (
                                        <CategoryBar key={`${category.label}-${i}`} label={category.label} score={category.score} />
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>Breakdown not available.</p>
                            )}
                        </div>
                    </div>

                    {/* Real overall summary */}
                    {summary && (
                        <div className="card fd-summary-card">
                            <h3>Overall</h3>
                            <p>{summary}</p>
                        </div>
                    )}

                    {/* 4 + 5. Strengths & Areas to improve */}
                    {(strengths.length > 0 || gaps.length > 0) && (
                        <div className="fd-grid-col">
                            {strengths.length > 0 && (
                                <div className="card fd-col-card">
                                    <h3 style={{ color: '#065F46' }}>
                                        <CheckCircle size={18} color="#10B981" /> Strengths
                                    </h3>
                                    <ul>
                                        {strengths.map((item, i) => (
                                            <li key={i} className="fd-li">
                                                <CheckCircle size={18} color="#10B981" className="fd-li-icon" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {gaps.length > 0 && (
                                <div className="card fd-col-card">
                                    <h3 style={{ color: '#92400E' }}>
                                        <AlertTriangle size={18} color="#F59E0B" /> Areas to Improve
                                    </h3>
                                    <ul>
                                        {gaps.map((item, i) => (
                                            <li key={i} className="fd-li">
                                                <AlertTriangle size={18} color="#F59E0B" className="fd-li-icon" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 6. Recommendations */}
                    {next.length > 0 && (
                        <div className="card fd-rec-card">
                            <h3 style={{ color: 'var(--primary)' }}>
                                <Lightbulb size={18} color="var(--primary)" /> Recommendations
                            </h3>
                            <ul>
                                {next.map((item, i) => (
                                    <li key={i} className="fd-rec-item">
                                        <ArrowRight size={16} color="var(--primary)" className="fd-li-icon" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* 7. Footer message */}
                    <div className="fd-footer">
                        Keep learning and building! You&apos;re on the right track 🚀
                    </div>
                </div>
            </main>
        </div>
    );
}
