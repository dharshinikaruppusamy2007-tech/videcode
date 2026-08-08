import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Award, User, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sidebar({ active = 'dashboard' }) {
    const navigate = useNavigate();
    const { sessionId, logout } = useApp();
    const [toastMsg, setToastMsg] = useState(null);

    const showToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 3000);
    };

    const handleLogout = () => { logout(); navigate('/'); };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, action: () => navigate('/dashboard') },
        { id: 'interview', label: 'Interview', icon: <MessageSquare size={18} />, action: () => { if (!sessionId) { showToast('Start an interview from the Dashboard first.'); return; } navigate('/interview'); } },
        { id: 'feedback', label: 'Feedback', icon: <Award size={18} />, action: () => navigate('/feedback') },
        { id: 'profile', label: 'Profile', icon: <User size={18} />, action: () => navigate('/profile') },
    ];

    return (
        <>
            {/* ── Desktop sidebar ── */}
            <aside className="sidebar" style={{ padding: '28px 16px' }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36, padding: '0 8px' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit', fontWeight: 700, color: '#fff', fontSize: 14 }}>AI</div>
                    <span style={{ color: '#fff', fontFamily: 'Outfit', fontWeight: 600, fontSize: 16, lineHeight: 1 }}>Interview Agent</span>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {navItems.map(item => (
                        <button key={item.id} onClick={item.action}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '11px 14px', borderRadius: 9, width: '100%', textAlign: 'left',
                                background: active === item.id ? 'var(--primary)' : 'transparent',
                                color: active === item.id ? '#fff' : '#94A3B8',
                                fontSize: 14, fontWeight: 500, transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { if (active !== item.id) e.currentTarget.style.background = '#1E293B'; }}
                            onMouseLeave={e => { if (active !== item.id) e.currentTarget.style.background = 'transparent'; }}
                        >
                            {item.icon}
                            <span style={{ flex: 1 }}>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <button onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 9, width: '100%', background: 'transparent', color: '#64748B', fontSize: 14, fontWeight: 500 }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#1E293B'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = 'transparent'; }}
                >
                    <LogOut size={18} /> Logout
                </button>
            </aside>

            {/* ── Mobile bottom bar ── */}
            <nav className="mobile-nav">
                {[...navItems, { id: 'logout', label: 'Logout', icon: <LogOut size={18} />, action: handleLogout }].map(item => (
                    <button key={item.id} className={`mobile-nav-btn${active === item.id ? ' active' : ''}`} onClick={item.action}>
                        {item.icon}
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* ── Toast ── */}
            {toastMsg && (
                <div style={{
                    position: 'fixed', bottom: 72, left: '50%', transform: 'translateX(-50%)',
                    background: '#1E293B', color: '#fff', padding: '10px 20px', borderRadius: 8,
                    fontSize: 13, zIndex: 200, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', pointerEvents: 'none',
                    whiteSpace: 'nowrap'
                }}>
                    {toastMsg}
                </div>
            )}
        </>
    );
}
