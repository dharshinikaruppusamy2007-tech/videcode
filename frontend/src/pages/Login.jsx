import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, CheckCircle2, Sparkles } from 'lucide-react';
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
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8F7FF' }}>
            <style>{`
                .login-wrap { display:flex; flex-direction:row; min-height:100vh; }
                .login-brand { width:42%; background:
                    radial-gradient(900px 500px at -10% -10%, rgba(156,138,251,0.35), transparent 60%),
                    radial-gradient(700px 500px at 110% 110%, rgba(124,91,240,0.35), transparent 60%),
                    linear-gradient(150deg, #5436BD 0%, #4B32A8 55%, #3A2A8A 100%);
                    padding:60px 48px; display:flex; flex-direction:column; color:#fff; position:relative; overflow:hidden; }
                .login-brand .glow-dot { position:absolute; border-radius:50%; background:radial-gradient(circle at 30% 30%, #9B8AFB, transparent 70%); opacity:0.5; pointer-events:none; }
                .login-form  { flex:1; padding:60px 48px; display:flex; align-items:center; justify-content:center; overflow-y:auto; background:
                    radial-gradient(600px 400px at 90% 10%, rgba(156,138,251,0.08), transparent 60%),
                    #F8F7FF; }
                .login-card { width:100%; max-width:420px; background:#fff; border:1px solid #E6E1F5; border-radius:18px; box-shadow:0 12px 34px rgba(75,50,168,0.12); padding:28px; }
                .cand-opt { display:flex; align-items:center; justify-content:space-between; width:100%; text-align:left; padding:14px 16px; border-radius:12px; cursor:pointer; transition:border-color 0.15s, background 0.15s, box-shadow 0.15s; }
                @media(max-width:860px){
                    .login-wrap  { flex-direction:column; }
                    .login-brand { width:100%; padding:32px 24px; }
                    .login-form  { padding:24px 16px 40px; }
                    .brand-feats { display:none!important; }
                }
            `}</style>

            <div className="login-wrap animate-in">
                {/* ── Branding ── */}
                <div className="login-brand">
                    <div className="glow-dot" style={{ width: 260, height: 260, top: -80, right: -60 }} />
                    <div className="glow-dot" style={{ width: 180, height: 180, bottom: 40, left: -60 }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40, position: 'relative', zIndex: 1 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#9B8AFB,#6C4DE6,#4B32A8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(20,10,60,0.4)' }}>
                            <Bot size={24} color="#fff" />
                        </div>
                        <div>
                            <div style={{ color: '#fff', fontWeight: 800, fontSize: 19, lineHeight: 1.15 }}>AI Interview Agent</div>
                            <div style={{ color: '#D6CCF8', fontSize: 12, fontWeight: 500, marginTop: 2 }}>Your Personal AI Interviewer</div>
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto', marginBottom: 'auto', position: 'relative', zIndex: 1 }}>
                        <h2 style={{ color: '#fff', fontSize: 'clamp(28px,5vw,42px)', lineHeight: 1.15, marginBottom: 0 }}>
                            Your Personal<br />
                            <span style={{ color: '#9B8AFB' }}>AI Interviewer</span>
                        </h2>
                        <ul className="brand-feats" style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {features.map((f, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#E4DCFC', fontSize: 15 }}>
                                    <CheckCircle2 size={18} color="#9B8AFB" /> {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* ── Form ── */}
                <div className="login-form">
                    <div className="login-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <Sparkles size={18} color="#6C4DE6" />
                            <h2 style={{ fontSize: 'clamp(21px,4vw,26px)', margin: 0 }}>Welcome Back!</h2>
                        </div>
                        <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: 14 }}>Select a candidate profile to begin.</p>

                        {error && <div className="banner-error" style={{ marginBottom: 20 }}>{error}</div>}

                        {/* Candidate cards */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '42vh', overflowY: 'auto', marginBottom: 20, paddingRight: 4 }}>
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
                                        className="cand-opt"
                                        style={{
                                            border: `2px solid ${isSel ? '#6C4DE6' : '#E6E1F5'}`,
                                            background: isSel ? '#F8F7FF' : '#fff',
                                            boxShadow: isSel ? '0 0 0 4px rgba(108,77,230,0.12)' : 'none',
                                            outline: isSel ? 'none' : undefined,
                                        }}>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{name}</div>
                                            <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>ID: {id}</div>
                                        </div>
                                        <div style={{
                                            width: 18, height: 18, borderRadius: '50%',
                                            border: `2px solid ${isSel ? '#6C4DE6' : '#CBD5E1'}`,
                                            background: isSel ? '#6C4DE6' : 'transparent',
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
