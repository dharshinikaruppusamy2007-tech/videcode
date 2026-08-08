import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, BookOpen, CalendarCheck, CalendarX, TrendingUp, User, Briefcase, GraduationCap, Clock, BadgeCheck } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useApp } from '../context/AppContext';
import api from '../services/api';

const initials = (name = '') =>
    name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');

export default function Profile() {
    const navigate = useNavigate();
    const { candidate } = useApp();

    const [stats, setStats] = useState(null);
    const [statsError, setStatsError] = useState('');
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        if (!candidate?.member?.id) return;
        let cancelled = false;
        setLoadingStats(true);
        api.getDashboard(candidate.member.id)
            .then(d => { if (!cancelled) setStats(d.stats || null); })
            .catch(e => { if (!cancelled) setStatsError(e.message); })
            .finally(() => { if (!cancelled) setLoadingStats(false); });
        return () => { cancelled = true; };
    }, [candidate]);

    if (!candidate) {
        return (
            <div className="app-layout">
                <Sidebar active="profile" />
                <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: 'var(--muted)', marginBottom: 16 }}>Candidate not selected</p>
                        <button onClick={() => navigate('/')} className="btn btn-primary">Go to Login</button>
                    </div>
                </main>
            </div>
        );
    }

    const member = candidate.member || {};
    const signals = candidate.signals || {};
    const missions = candidate.missions || [];

    // Fallback stats derived purely from candidate data (used if backend is unreachable)
    const completedDays = stats?.completedDays ?? missions.filter(m => m.passed === true).length;
    const skippedDays = stats?.skippedDays ?? missions.filter(m => m.skipped === true).length;
    const modulesCompleted = stats?.modulesCompleted ?? signals.missionsCompleted ?? completedDays;
    const totalModules = stats?.totalModules ?? missions.length;
    const progress = stats?.overallProgressPercent ?? (totalModules > 0 ? Math.round((completedDays / totalModules) * 100) : 0);

    const completedTopics = stats?.completedTopics ?? missions.filter(m => m.passed === true).map(m => ({ day: m.day, title: m.title }));
    const skippedTopics = stats?.skippedTopics ?? missions.filter(m => m.skipped === true).map(m => ({ day: m.day, title: m.title }));

    const infoRows = [
        { icon: <Briefcase size={16} />, label: 'Job Role', value: member.jobRole },
        { icon: <GraduationCap size={16} />, label: 'Education', value: member.education },
        { icon: <Clock size={16} />, label: 'Years Experience', value: member.yearsExperience != null ? `${member.yearsExperience} yrs` : '—' },
        { icon: <BadgeCheck size={16} />, label: 'Status', value: member.status },
        { icon: <CalendarCheck size={16} />, label: 'Commit Days', value: signals.commitDays ?? '—' },
        { icon: <BookOpen size={16} />, label: 'Missions Completed', value: signals.missionsCompleted ?? '—' },
        { icon: <TrendingUp size={16} />, label: 'Missions First Try', value: signals.missionsFirstTry ?? '—' },
    ];

    const statCards = [
        { label: 'Completed Days', val: completedDays, icon: <CalendarCheck size={18} color="#10B981" />, bg: '#D1FAE5' },
        { label: 'Skipped Days', val: skippedDays, icon: <CalendarX size={18} color="#F43F5E" />, bg: '#FFE4E6' },
        { label: 'Modules Completed', val: modulesCompleted, icon: <BookOpen size={18} color="#3B82F6" />, bg: '#DBEAFE' },
        { label: 'Overall Progress', val: `${progress}%`, icon: <TrendingUp size={18} color="#8B5CF6" />, bg: '#EDE9FE' },
    ];

    return (
        <div className="app-layout">
            <Sidebar active="profile" />

            <main className="main-content" style={{ background: 'var(--bg)' }}>
                <style>{`
                    .pf { padding:28px 40px; max-width:760px; width:100%; margin:0 auto; }
                    .pf-avatar { width:84px; height:84px; border-radius:50%; background:linear-gradient(135deg,#4F46E5,#7C3AED); color:#fff; display:flex; align-items:center; justify-content:center; font-family:'Outfit'; font-weight:700; font-size:30px; box-shadow:0 8px 20px rgba(79,70,229,0.35); }
                    .pf-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
                    .pf-cta { display:flex; flex-wrap:wrap; gap:10px; justify-content:center; }
                    @media(max-width:768px){
                        .pf { padding:20px 16px 84px; }
                        .pf-grid { grid-template-columns:1fr 1fr; }
                    }
                    @media(max-width:400px){
                        .pf-grid { grid-template-columns:1fr; }
                    }
                    @media(max-width:640px){
                        .pf-topics { grid-template-columns:1fr; }
                    }
                `}</style>

                <div className="pf animate-in">
                    {/* Back */}
                    <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: 13, marginBottom: 20 }}>
                        <ArrowLeft size={15} /> Back to Dashboard
                    </button>

                    {/* Profile header */}
                    <div style={{ textAlign: 'center', marginBottom: 28 }}>
                        <div className="pf-avatar" style={{ margin: '0 auto 16px' }}>{initials(member.name)}</div>
                        <h1 style={{ fontSize: 'clamp(22px,4vw,28px)', margin: '0 0 4px' }}>{member.name}</h1>
                        <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>Candidate ID: {member.id}</p>
                        {loadingStats && <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 8 }}>Loading profile…</p>}
                        {statsError && <p style={{ color: '#B91C1C', fontSize: 12, marginTop: 8 }}>Live stats unavailable: {statsError}</p>}
                    </div>

                    {/* Interview Progress */}
                    <h3 style={{ fontSize: 16, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Award size={18} color="var(--primary)" /> Interview Progress
                    </h3>
                    <div className="pf-grid" style={{ marginBottom: 28 }}>
                        {statCards.map((s, i) => (
                            <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px' }}>
                                <div style={{ width: 38, height: 38, borderRadius: 9, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 500 }}>{s.label}</div>
                                    <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{s.val}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Learning / Interview information */}
                    <h3 style={{ fontSize: 16, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <User size={18} color="var(--primary)" /> Learning / Interview Information
                    </h3>
                    <div className="card" style={{ marginBottom: 20, padding: 8 }}>
                        {infoRows.map((row, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 12px', borderBottom: i < infoRows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                <span style={{ color: 'var(--primary)', flexShrink: 0, display: 'flex' }}>{row.icon}</span>
                                <span style={{ color: 'var(--muted)', fontSize: 13, flex: 1 }}>{row.label}</span>
                                <span style={{ fontSize: 14, fontWeight: 600, textAlign: 'right', wordBreak: 'break-word', maxWidth: '60%' }}>{row.value ?? '—'}</span>
                            </div>
                        ))}
                    </div>

                    {/* Completed / Skipped topics */}
                    <div className="pf-topics" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
                        <div className="card" style={{ maxHeight: 220, display: 'flex', flexDirection: 'column' }}>
                            <h4 style={{ fontSize: 14, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} /> Completed Topics
                            </h4>
                            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {completedTopics.length === 0
                                    ? <p style={{ color: 'var(--muted)', fontSize: 13 }}>None yet.</p>
                                    : completedTopics.map((t, i) => (
                                        <div key={i} style={{ padding: '8px 10px', background: '#F0FDF4', borderRadius: 6, fontSize: 13, color: '#065F46' }}>
                                            Day {t.day}: {t.title}
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                        <div className="card" style={{ maxHeight: 220, display: 'flex', flexDirection: 'column' }}>
                            <h4 style={{ fontSize: 14, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F43F5E', display: 'inline-block' }} /> Skipped Topics
                            </h4>
                            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {skippedTopics.length === 0
                                    ? <p style={{ color: 'var(--muted)', fontSize: 13 }}>None skipped. Great!</p>
                                    : skippedTopics.map((t, i) => (
                                        <div key={i} style={{ padding: '8px 10px', background: '#FFF1F2', borderRadius: 6, fontSize: 13, color: '#BE123C' }}>
                                            Day {t.day}: {t.title}
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>

                    <div className="pf-cta">
                        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
                            <ArrowLeft size={15} /> Back to Dashboard
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
