import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Award, User, LogOut, Bot } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sidebar({ active = 'dashboard' }) {
    const navigate = useNavigate();
    const { sessionId, logout, interviewStatus } = useApp();
    const [toastMsg, setToastMsg] = useState(null);

    const showToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 3000);
    };

    const handleLogout = () => { logout(); navigate('/'); };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={19} />, action: () => navigate('/dashboard') },
        { id: 'interview', label: 'Interview', icon: <MessageSquare size={19} />, action: () => {
            if (interviewStatus === 'completed') { navigate('/feedback'); return; }
            if (!sessionId) { showToast('Start an interview from the Dashboard first.'); return; }
            navigate('/interview');
        } },
        { id: 'feedback', label: 'Feedback', icon: <Award size={19} />, action: () => navigate('/feedback') },
        { id: 'profile', label: 'Profile', icon: <User size={19} />, action: () => navigate('/profile') },
    ];

    return (
        <>
            {/* ── Desktop sidebar ── */}
            <aside className="sidebar" style={{ padding: '26px 16px 20px' }}>
                {/* Logo */}
                <div className="side-brand">
                    <div className="side-logo">
                        <Bot size={21} color="#fff" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div className="side-title">AI Interview Agent</div>
                        <div className="side-sub">Your Personal AI Interviewer</div>
                    </div>
                </div>

                <nav className="side-nav">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={item.action}
                            className={`side-item${active === item.id ? ' side-item-active' : ''}`}
                            aria-current={active === item.id ? 'page' : undefined}
                        >
                            {item.icon}
                            <span style={{ flex: 1 }}>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <button onClick={handleLogout} className="side-logout">
                    <LogOut size={19} /> Logout
                </button>
            </aside>

            {/* ── Mobile bottom bar ── */}
            <nav className="mobile-nav">
                {[...navItems, { id: 'logout', label: 'Logout', icon: <LogOut size={19} />, action: handleLogout }].map(item => (
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
                    background: '#4B32A8', color: '#fff', padding: '10px 20px', borderRadius: 10,
                    fontSize: 13, fontWeight: 600, zIndex: 200,
                    boxShadow: '0 8px 20px rgba(75,50,168,0.4)', pointerEvents: 'none',
                    whiteSpace: 'nowrap'
                }}>
                    {toastMsg}
                </div>
            )}
        </>
    );
}
