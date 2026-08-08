import { useNavigate } from 'react-router-dom';
import { Award, CheckCircle, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useApp } from '../context/AppContext';

export default function Feedback() {
    const navigate = useNavigate();
    const { feedback, candidate } = useApp();

    // Guard: if no feedback (shouldn't happen — route guard handles it)
    if (!feedback) {
        return (
            <div className="app-layout">
                <Sidebar active="feedback" />
                <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: 'var(--muted)', marginBottom: 16 }}>No feedback available yet. Complete an interview first.</p>
                        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">Go to Dashboard</button>
                    </div>
                </main>
            </div>
        );
    }

    const asList = (v) => !v ? [] : Array.isArray(v) ? v : typeof v === 'string' ? [v] : [];

    const strengths = asList(feedback.strengths);
    const gaps = asList(feedback.gaps);
    const next = asList(feedback.next);
    const summary = feedback.summary || feedback.overall_summary || '';

    return (
        <div className="app-layout">
            <Sidebar active="feedback" />

            <main className="main-content" style={{ background: 'var(--bg)' }}>
                <style>{`
                    .fb { padding:32px 40px; max-width:900px; width:100%; margin:0 auto; }
                    .fb-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
                    @media(max-width:768px){
                        .fb { padding:20px 16px 80px; }
                        .fb-grid { grid-template-columns:1fr; }
                    }
                `}</style>

                <div className="fb animate-in">
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 36 }}>
                        <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg,#10B981,#059669)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: 16, boxShadow: '0 6px 20px rgba(16,185,129,0.35)' }}>
                            <Award size={34} />
                        </div>
                        <h1 style={{ fontSize: 'clamp(22px,3vw,28px)', margin: '0 0 6px' }}>Interview Completed 🎉</h1>
                        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
                            {candidate?.member?.name} · ID: {candidate?.member?.id}
                        </p>
                    </div>

                    {/* Summary */}
                    {summary && (
                        <div className="card" style={{ marginBottom: 20, borderLeft: '4px solid var(--primary)' }}>
                            <h3 style={{ fontSize: 15, marginBottom: 10 }}>Overall Summary</h3>
                            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text)', margin: 0 }}>{summary}</p>
                        </div>
                    )}

                    {/* Strengths + Gaps */}
                    <div className="fb-grid" style={{ marginBottom: 20 }}>
                        <div className="card" style={{ borderTop: '3px solid #10B981' }}>
                            <h3 style={{ fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, color: '#065F46' }}>
                                <CheckCircle size={17} color="#10B981" /> Strengths
                            </h3>
                            {strengths.length === 0
                                ? <p style={{ color: 'var(--muted)', fontSize: 13 }}>None identified.</p>
                                : <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {strengths.map((s, i) => (
                                        <li key={i} style={{ fontSize: 14, display: 'flex', gap: 8 }}>
                                            <span style={{ color: '#10B981', flexShrink: 0 }}>✓</span> {s}
                                        </li>
                                    ))}
                                </ul>
                            }
                        </div>

                        <div className="card" style={{ borderTop: '3px solid #F59E0B' }}>
                            <h3 style={{ fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, color: '#92400E' }}>
                                <AlertTriangle size={17} color="#F59E0B" /> Areas to Improve
                            </h3>
                            {gaps.length === 0
                                ? <p style={{ color: 'var(--muted)', fontSize: 13 }}>None identified.</p>
                                : <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {gaps.map((g, i) => (
                                        <li key={i} style={{ fontSize: 14, display: 'flex', gap: 8 }}>
                                            <span style={{ color: '#F59E0B', flexShrink: 0 }}>!</span> {g}
                                        </li>
                                    ))}
                                </ul>
                            }
                        </div>
                    </div>

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
                            <RotateCcw size={15} /> Return to Dashboard
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
