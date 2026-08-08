import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';

export default function Login() {
    const navigate = useNavigate();
    const { setCandidate, candidate } = useApp();
    const [candidates, setCandidates] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [signingIn, setSigningIn] = useState(false);
    const [error, setError] = useState('');
    const requestedRef = useRef(false);

    // If already logged in (e.g., restored after refresh), go straight to dashboard
    useEffect(() => {
        if (candidate) { navigate('/dashboard'); return; }
    }, [candidate, navigate]);

    useEffect(() => {
        if (requestedRef.current) return;
        requestedRef.current = true;

        const load = async () => {
            try {
                const data = await api.getCandidates();
                setCandidates(Array.isArray(data) ? data : []);
            } catch {
                setError('Unable to connect to the interview service. Please make sure the backend is running.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleLogin = async () => {
        if (!selected) { setError('Please select a candidate to continue.'); return; }
        setSigningIn(true); setError('');
        try {
            setCandidate(selected);
            navigate('/dashboard');
        } catch {
            setError('Something went wrong while signing in. Please try again.');
            setSigningIn(false);
        }
    };

    const retryLoad = () => {
        setLoading(true); setError('');
        api.getCandidates()
            .then(data => { setCandidates(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => { setError('Unable to connect to the interview service. Please make sure the backend is running.'); setLoading(false); });
    };

    const features = ['Personalized technical questions', 'Real-time AI evaluation', 'Detailed strengths & gaps feedback', 'Track your learning progress'];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
            <style>{`
                .login-wrap { display:flex; flex-direction:row; min-height:100vh; }
                .login-brand { width:42%; background:linear-gradient(145deg,#1E1B4B,#312E81); padding:60px 48px; display:flex; flex-direction:column; }
                .login-form  { flex:1; padding:60px 48px; display:flex; align-items:center; justify-content:center; overflow-y:auto; }
                @media(max-width:860px){
                    .login-wrap  { flex-direction:column; }
                    .login-brand { width:100%; padding:36px 24px; }
                    .login-form  { padding:32px 20px 40px; }
                    .brand-feats { display:none!important; }
                }
            `}</style>

            <div className="login-wrap animate-in">
                {/* ── Branding ── */}
                <div className="login-brand">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bot size={24} color="#fff" />
                        </div>
                        <span style={{ color: '#fff', fontFamily: 'Outfit', fontWeight: 700, fontSize: 20 }}>AI Interview Agent</span>
                    </div>

                    <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                        <h2 style={{ color: '#fff', fontSize: 'clamp(28px,5vw,42px)', lineHeight: 1.15, marginBottom: 0 }}>
                            Your Personal<br />
                            <span style={{ color: '#818CF8' }}>AI Interviewer</span>
                        </h2>
                        <ul className="brand-feats" style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {features.map((f, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#C7D2FE', fontSize: 15 }}>
                                    <CheckCircle2 size={18} color="#818CF8" /> {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* ── Form ── */}
                <div className="login-form">
                    <div style={{ width: '100%', maxWidth: 420 }}>
                        <h2 style={{ fontSize: 'clamp(22px,4vw,30px)', marginBottom: 6 }}>Welcome Back! 👋</h2>
                        <p style={{ color: 'var(--muted)', marginBottom: 28, fontSize: 14 }}>Select a candidate profile to begin.</p>

                        {error && <div className="banner-error" style={{ marginBottom: 20 }}>{error}</div>}

                        {/* Candidate cards */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '45vh', overflowY: 'auto', marginBottom: 20, paddingRight: 4 }}>
                            {loading ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--muted)', padding: 16 }}>
                                    <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Loading candidates...
                                </div>
                            ) : candidates.length === 0 ? (
                                <p style={{ color: 'var(--muted)', fontSize: 14 }}>No candidates found. Make sure the backend is running.</p>
                            ) : candidates.map((c, idx) => {
                                const id = c.member?.id ?? idx;
                                const name = c.member?.name ?? 'Unknown';
                                const isSel = selected?.member?.id === id;
                                return (
                                    <div key={id} onClick={() => { setSelected(c); setError(''); }}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`Select candidate ${name}`}
                                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(c); setError(''); } }}
                                        style={{
                                            padding: '14px 16px', border: `2px solid ${isSel ? 'var(--primary)' : 'var(--border)'}`,
                                            borderRadius: 10, cursor: 'pointer',
                                            background: isSel ? 'var(--primary-light)' : '#fff',
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            transition: 'border-color 0.15s, background 0.15s',
                                            outline: isSel ? 'none' : undefined,
                                        }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{name}</div>
                                            <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>ID: {id}</div>
                                        </div>
                                        <div style={{
                                            width: 18, height: 18, borderRadius: '50%',
                                            border: `2px solid ${isSel ? 'var(--primary)' : '#CBD5E1'}`,
                                            background: isSel ? 'var(--primary)' : 'transparent',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                        }}>
                                            {isSel && <div style={{ width: 7, height: 7, background: '#fff', borderRadius: '50%' }} />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {!loading && candidates.length === 0 && (
                            <button onClick={retryLoad} className="btn btn-secondary btn-full" style={{ marginBottom: 10 }}>
                                Try Again
                            </button>
                        )}

                        <button onClick={handleLogin} disabled={!selected || loading || signingIn} className="btn btn-primary btn-full" style={{ padding: '14px', fontSize: 15 }}>
                            {signingIn ? (
                                <>
                                    <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: '#fff' }} /> Signing in...
                                </>
                            ) : 'Sign in to Dashboard'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
