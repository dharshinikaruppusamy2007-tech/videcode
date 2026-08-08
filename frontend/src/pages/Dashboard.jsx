import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, CalendarCheck, CalendarX, BookOpen, TrendingUp, PlayCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useApp } from '../context/AppContext';
import { v4 as uuidv4 } from 'uuid';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export default function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const { candidate, setSessionId } = useApp();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statsError, setStatsError] = useState('');
    const [starting, setStarting] = useState(false);
    const [startError, setStartError] = useState('');
    const redirectMsg = location.state?.msg || '';

    useEffect(() => {
        if (!candidate) return;
        fetch(`${API_BASE}/api/candidates/${candidate.member.id}/dashboard`)
            .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
            .then(d => { setStats(d.stats || null); setLoading(false); })
            .catch(e => { setStatsError(e.message); setLoading(false); });
    }, [candidate]);

    const handleStartInterview = async () => {
        if (!candidate) return;
        setStarting(true); setStartError('');
        const sid = uuidv4();
        try {
            const res = await fetch(`${API_BASE}/api/interview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: sid, candidate })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            // Store both the session ID and the first reply so LiveInterview can use it
            setSessionId(sid);
            sessionStorage.setItem('firstReply', data.reply || '');
            navigate('/interview');
        } catch (e) {
            setStartError('Failed to start interview: ' + e.message);
            setStarting(false);
        }
    };

    if (!candidate) return null;

    // dashboardHelper returns: completedTopics, skippedTopics, modulesCompleted, overallProgressPercent, completedDays, skippedDays
    const completed = stats?.completedTopics ?? [];
    const skipped = stats?.skippedTopics ?? [];
    const progress = stats?.overallProgressPercent ?? 0;
    const daysOk = stats?.completedDays ?? 0;
    const daysSkip = stats?.skippedDays ?? 0;
    const modulesDone = stats?.modulesCompleted ?? 0;

    return (
        <div className="app-layout">
            <Sidebar active="dashboard" />
            <main className="main-content" style={{ background: 'var(--bg)' }}>
                <style>{`
                    .dp { padding: 28px 40px; }
                    .grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
                    .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
                    .cta-row{ display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap; }
                    @media(max-width:768px){
                        .dp { padding:20px 16px 80px; }
                        .grid-4 { grid-template-columns:1fr 1fr; }
                        .grid-2 { grid-template-columns:1fr; }
                        .cta-row{ flex-direction:column; align-items:stretch; }
                    }
                `}</style>

                <div className="dp">
                    {/* Header */}
                    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                        <div>
                            <h2 style={{ fontSize: 'clamp(18px,3vw,24px)', margin: 0 }}>Welcome, {candidate.member.name} 👋</h2>
                            <p style={{ color: 'var(--muted)', margin: '4px 0 0', fontSize: 13 }}>ID: {candidate.member.id}</p>
                        </div>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                            <User size={20} />
                        </div>
                    </header>

                    {redirectMsg && <div className="banner-info" style={{ marginBottom: 16 }}>{redirectMsg}</div>}
                    {statsError && <div className="banner-warn" style={{ marginBottom: 16 }}>Stats unavailable: {statsError}</div>}
                    {startError && <div className="banner-error" style={{ marginBottom: 16 }}>{startError}</div>}

                    {/* Stats */}
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--muted)', margin: '24px 0' }}>
                            <div className="spinner" /> Loading stats...
                        </div>
                    ) : (
                        <div className="grid-4 animate-in" style={{ marginBottom: 24 }}>
                            {[
                                { label: 'Completed Days', val: daysOk, icon: <CalendarCheck size={18} color="#10B981" />, bg: '#D1FAE5' },
                                { label: 'Skipped Days', val: daysSkip, icon: <CalendarX size={18} color="#F43F5E" />, bg: '#FFE4E6' },
                                { label: 'Modules Done', val: modulesDone, icon: <BookOpen size={18} color="#3B82F6" />, bg: '#DBEAFE' },
                                { label: 'Progress', val: `${progress}%`, icon: <TrendingUp size={18} color="#8B5CF6" />, bg: '#EDE9FE' }
                            ].map((s, i) => (
                                <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 9, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 500 }}>{s.label}</div>
                                        <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{s.val}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Topic lists */}
                    {!loading && (
                        <div className="grid-2 animate-in" style={{ marginBottom: 24 }}>
                            {/* Completed */}
                            <div className="card" style={{ maxHeight: 240, display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} /> Completed Topics
                                </h3>
                                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {completed.length === 0
                                        ? <p style={{ color: 'var(--muted)', fontSize: 13 }}>None yet.</p>
                                        : completed.map((t, i) => (
                                            <div key={i} style={{ padding: '8px 10px', background: '#F0FDF4', borderRadius: 6, fontSize: 13, color: '#065F46' }}>
                                                Day {t.day}: {t.title}
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                            {/* Skipped */}
                            <div className="card" style={{ maxHeight: 240, display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F43F5E', display: 'inline-block' }} /> Skipped Topics
                                </h3>
                                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {skipped.length === 0
                                        ? <p style={{ color: 'var(--muted)', fontSize: 13 }}>None skipped. Great!</p>
                                        : skipped.map((t, i) => (
                                            <div key={i} style={{ padding: '8px 10px', background: '#FFF1F2', borderRadius: 6, fontSize: 13, color: '#BE123C' }}>
                                                Day {t.day}: {t.title}
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CTA */}
                    <div className="card cta-row animate-in">
                        <div>
                            <h3 style={{ fontSize: 17, margin: '0 0 4px' }}>Ready to start your interview?</h3>
                            <p style={{ color: 'var(--muted)', margin: 0, fontSize: 13 }}>The AI will evaluate you across your curriculum topics.</p>
                        </div>
                        <button onClick={handleStartInterview} disabled={starting} className="btn btn-primary" style={{ minWidth: 180 }}>
                            {starting ? 'Connecting...' : <><PlayCircle size={17} /> Start Interview</>}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
