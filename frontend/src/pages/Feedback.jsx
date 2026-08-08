import { useNavigate } from 'react-router-dom';
import { Award, CheckCircle, AlertTriangle, ArrowRight, PlayCircle, RotateCcw, FileQuestion } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useApp } from '../context/AppContext';

const asList = (v) => !v ? [] : Array.isArray(v) ? v : typeof v === 'string' ? [v] : [];

export default function Feedback() {
    const navigate = useNavigate();
    const { feedback, candidate } = useApp();

    if (!feedback) {
        return (
            <div className="app-layout">
                <Sidebar active="feedback" />
                <main className="main-content" style={{ background: 'var(--bg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', flex: 1 }}>
                        <div style={{ textAlign: 'center', maxWidth: 420, width: '100%' }}>
                            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#EEF2FF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                                <FileQuestion size={34} color="var(--primary)" />
                            </div>
                            <h1 style={{ fontSize: 'clamp(20px,4vw,26px)', margin: '0 0 8px' }}>Interview not completed yet</h1>
                            <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
                                Complete your interview to receive AI-generated feedback.
                            </p>
                            <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ minWidth: 180 }}>
                                <PlayCircle size={17} /> Start Interview
                            </button>
                            <div style={{ marginTop: 14 }}>
                                <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }}>
                                    Back to Dashboard
                                </button>
                            </div>
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

    // Backend feedback object exists but contains no usable data — do not invent it.
    if (!summary && strengths.length === 0 && gaps.length === 0 && next.length === 0) {
        return (
            <div className="app-layout">
                <Sidebar active="feedback" />
                <main className="main-content" style={{ background: 'var(--bg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', flex: 1 }}>
                        <div style={{ textAlign: 'center', maxWidth: 420, width: '100%' }}>
                            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#EEF2FF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                                <Award size={34} color="var(--primary)" />
                            </div>
                            <h1 style={{ fontSize: 'clamp(20px,4vw,26px)', margin: '0 0 8px' }}>Feedback is not available yet.</h1>
                            <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
                                Complete your interview to receive AI-generated feedback.
                            </p>
                            <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ minWidth: 180 }}>
                                <PlayCircle size={17} /> Start Interview
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <Sidebar active="feedback" />

            <main className="main-content" style={{ background: 'var(--bg)' }}>
                <style>{`
                    .fb { padding:32px 40px; max-width:720px; width:100%; margin:0 auto; }
                    .fb-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
                    .fb-li { display:flex; gap:8px; }
                    @media(max-width:768px){
                        .fb { padding:20px 16px 84px; }
                        .fb-grid { grid-template-columns:1fr; }
                    }
                `}</style>

                <div className="fb animate-in">
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#059669)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: 16, boxShadow: '0 6px 20px rgba(16,185,129,0.35)' }}>
                            <Award size={34} />
                        </div>
                        <h1 style={{ fontSize: 'clamp(22px,3vw,28px)', margin: '0 0 6px' }}>Feedback</h1>
                        <p style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#059669', fontSize: 14, fontWeight: 600, background: '#D1FAE5', padding: '4px 12px', borderRadius: 999, margin: '0 0 10px' }}>
                            <CheckCircle size={15} /> Interview Complete
                        </p>
                        <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
                            {candidate?.member?.name} · ID: {candidate?.member?.id}
                        </p>
                    </div>

                    {/* Overall Summary (real backend data) */}
                    {summary && (
                        <div className="card" style={{ marginBottom: 20, borderLeft: '4px solid var(--primary)' }}>
                            <h3 style={{ fontSize: 15, marginBottom: 10 }}>Overall</h3>
                            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text)', margin: 0 }}>{summary}</p>
                        </div>
                    )}

                    {/* Strengths + Gaps */}
                    {(strengths.length > 0 || gaps.length > 0) && (
                        <div className="fb-grid" style={{ marginBottom: 20 }}>
                            {strengths.length > 0 && (
                                <div className="card" style={{ borderTop: '3px solid #10B981' }}>
                                    <h3 style={{ fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, color: '#065F46' }}>
                                        <CheckCircle size={17} color="#10B981" /> Strengths
                                    </h3>
                                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {strengths.map((s, i) => (
                                            <li key={i} className="fb-li" style={{ fontSize: 14 }}>
                                                <span style={{ color: '#10B981', flexShrink: 0 }}>✓</span> {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {gaps.length > 0 && (
                                <div className="card" style={{ borderTop: '3px solid #F59E0B' }}>
                                    <h3 style={{ fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, color: '#92400E' }}>
                                        <AlertTriangle size={17} color="#F59E0B" /> Areas to Improve
                                    </h3>
                                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {gaps.map((g, i) => (
                                            <li key={i} className="fb-li" style={{ fontSize: 14 }}>
                                                <span style={{ color: '#F59E0B', flexShrink: 0 }}>!</span> {g}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Next Steps */}
                    {next.length > 0 && (
                        <div className="card" style={{ borderTop: '3px solid var(--primary)', marginBottom: 28 }}>
                            <h3 style={{ fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)' }}>
                                <ArrowRight size={17} color="var(--primary)" /> Next Steps
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {next.map((n, i) => (
                                    <div key={i} style={{ background: 'var(--primary-light)', padding: '10px 14px', borderRadius: 8, fontSize: 14, color: '#1e1b4b' }}>
                                        {n}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ textAlign: 'center' }}>
                        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ gap: 8 }}>
                            <RotateCcw size={15} /> Back to Dashboard
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
