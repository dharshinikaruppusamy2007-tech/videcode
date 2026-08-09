import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, CalendarCheck, CalendarX, BookOpen, TrendingUp, PlayCircle, ChevronRight, ServerOff } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import { v4 as uuidv4 } from 'uuid';

const initials = (name = '') =>
    name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');

export default function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const { candidate, beginInterview } = useApp();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statsError, setStatsError] = useState('');
    const [starting, setStarting] = useState(false);
    const [startError, setStartError] = useState('');
    const [backendUp, setBackendUp] = useState(null);
    const [checkingHealth, setCheckingHealth] = useState(false);
    const redirectMsg = location.state?.msg || '';

    const loadStats = useCallback(async () => {
        if (!candidate?.member?.id) return;
        setLoading(true); setStatsError('');
        try {
            const d = await api.getDashboard(candidate.member.id);
            setStats(d.stats || null);
        } catch (e) {
            setStatsError(e.message);
        } finally {
            setLoading(false);
        }
    }, [candidate]);

    const checkBackend = useCallback(async () => {
        setCheckingHealth(true);
        const up = await api.checkHealth();
        setBackendUp(up);
        setCheckingHealth(false);
        return up;
    }, []);

    useEffect(() => {
        if (!candidate) return;
        loadStats();
        checkBackend();
    }, [candidate, loadStats, checkBackend]);

    const handleStartInterview = async () => {
        if (!candidate || starting) return;
        setStarting(true); setStartError('');
        // Unique session id created only when actually starting a new interview
        const sid = uuidv4();
        try {
            const data = await api.startInterview(sid, candidate);
            // Reset any previous conversation/feedback, set the new session
            beginInterview(sid, data.reply || '');
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
                    .dp { padding: 28px 40px; max-width: 1100px; width: 100%; margin: 0 auto; }
                    .grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
                    .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
                    .cta-row{ display:flex; justify-content:space-between; align-items:center; gap:16px; flex-wrap:wrap; }
                    .profile-card { display:flex; align-items:center; gap:16px; padding:18px 22px; background:var(--card); border:1.5px solid var(--border); border-radius:var(--radius); box-shadow:var(--shadow); cursor:pointer; transition:border-color 0.18s ease, box-shadow 0.18s ease, transform 0.12s ease; -webkit-tap-highlight-color:transparent; }
                    .profile-card:hover { border-color:#6C4DE6; box-shadow:var(--shadow-md); }
                    .profile-card:active { transform:scale(0.99); }
                    .profile-card:focus-visible { outline:2px solid var(--primary); outline-offset:2px; }
                    .profile-avatar { width:54px; height:54px; border-radius:50%; background:linear-gradient(135deg,#9B8AFB,#6C4DE6 55%,#4B32A8); color:#fff; display:flex; align-items:center; justify-content:center; font-family:'Plus Jakarta Sans'; font-weight:700; font-size:20px; flex-shrink:0; box-shadow:0 6px 16px rgba(108,77,230,0.35); }
                    .stat-icon { width:40px; height:40px; border-radius:11px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
                    .topic-chip { padding:8px 10px; border-radius:8px; font-size:13px; }
                    @media(max-width:768px){
                        .dp { padding:20px 16px 80px; }
                        .grid-4 { grid-template-columns:1fr 1fr; }
                        .grid-2 { grid-template-columns:1fr; }
                        .cta-row{ flex-direction:column; align-items:stretch; }
                    }
                    @media(max-width:420px){
                        .grid-4 { grid-template-columns:1fr; }
                    }
                `}</style>

                <div className="dp">
                    {/* Header / Profile card — clickable → /profile */}
                    <div
                        role="button"
                        tabIndex={0}
                        aria-label="Open profile"
                        onClick={() => navigate('/profile')}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/profile'); } }}
                        className="profile-card"
                        style={{ marginBottom: 24 }}
                    >
                        <div className="profile-avatar">{initials(candidate.member.name)}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h2 style={{ fontSize: 'clamp(17px,3vw,22px)', margin: 0 }}>Welcome, {candidate.member.name} 👋</h2>
                            <p style={{ color: 'var(--muted)', margin: '4px 0 0', fontSize: 13 }}>ID: {candidate.member.id}{candidate.member.jobRole ? ` · ${candidate.member.jobRole}` : ''}</p>
                        </div>
                        <span className="profile-card-hint" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6C4DE6', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                            <User size={15} /> <span className="profile-card-hint-text">View Profile</span> <ChevronRight size={16} />
                        </span>
                    </div>

                    {redirectMsg && <div className="banner-info" style={{ marginBottom: 16 }}>{redirectMsg}</div>}
                    {statsError && <div className="banner-warn" style={{ marginBottom: 16 }}>Stats unavailable: {statsError}</div>}
                    {startError && <div className="banner-error" style={{ marginBottom: 16 }}>{startError}</div>}

                    {/* Backend unavailable */}
                    {backendUp === false && (
                        <div className="banner-error" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ServerOff size={16} /> Backend unavailable. Unable to connect to the interview service.
                            </span>
                            <button onClick={checkBackend} disabled={checkingHealth} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }}>
                                {checkingHealth ? 'Checking...' : 'Try Again'}
                            </button>
                        </div>
                    )}

                    {/* Stats */}
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--muted)', margin: '24px 0' }}>
                            <div className="spinner" /> Loading stats...
                        </div>
                    ) : (
                        <div className="grid-4 animate-in" style={{ marginBottom: 24 }}>
                            {[
                                { label: 'Completed Days', val: daysOk, icon: <CalendarCheck size={18} color="#6C4DE6" />, bg: '#F1EEFF' },
                                { label: 'Skipped Days', val: daysSkip, icon: <CalendarX size={18} color="#F43F5E" />, bg: '#FFE9EC' },
                                { label: 'Modules Done', val: modulesDone, icon: <BookOpen size={18} color="#6C4DE6" />, bg: '#EDE9FE' },
                                { label: 'Progress', val: `${progress}%`, icon: <TrendingUp size={18} color="#9B8AFB" />, bg: '#F8F7FF' }
                            ].map((s, i) => (
                                <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
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
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6C4DE6', display: 'inline-block' }} /> Completed Topics
                                </h3>
                                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {completed.length === 0
                                        ? <p style={{ color: 'var(--muted)', fontSize: 13 }}>None yet.</p>
                                        : completed.map((t, i) => (
                                            <div key={i} className="topic-chip" style={{ background: '#F1EEFF', color: '#4B32A8' }}>
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
                                            <div key={i} className="topic-chip" style={{ background: '#FFE9EC', color: '#BE123C' }}>
                                                Day {t.day}: {t.title}
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CTA */}
                    <div className="card cta-row animate-in" style={{ background: 'linear-gradient(120deg,#F8F7FF,#F1EEFF 70%,#EDE9FE)' }}>
                        <div>
                            <h3 style={{ fontSize: 17, margin: '0 0 4px' }}>Ready to start your interview?</h3>
                            <p style={{ color: 'var(--muted)', margin: 0, fontSize: 13 }}>The AI will evaluate you across your curriculum topics.</p>
                        </div>
                        <button onClick={handleStartInterview} disabled={starting || backendUp === false} className="btn btn-primary" style={{ minWidth: 200, padding: '14px 24px', fontSize: 15 }}>
                            {starting
                                ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: '#fff' }} /> Connecting to interview...</>
                                : <><PlayCircle size={18} /> Start Interview</>}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
