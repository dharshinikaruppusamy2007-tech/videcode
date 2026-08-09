import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Send, Volume2, VolumeX, User, RotateCcw, ShieldAlert, Video, VideoOff, Sparkles, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AIInterviewerAvatar from '../components/AIInterviewerAvatar';
import { useApp } from '../context/AppContext';
import { useVoice } from '../hooks/useVoice';
import { useProctoring } from '../hooks/useProctoring';
import api, { ApiError } from '../services/api';

const initials = (name = '') =>
    name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');

export default function LiveInterview() {
    const navigate = useNavigate();
    const { candidate, sessionId, endReason, setEndReason, setFeedback, setInterviewDone, setInterviewStatus, interviewStatus, messages, setMessages } = useApp();
    const [input, setInput] = useState('');
    const [thinking, setThinking] = useState(false);
    const [error, setError] = useState('');
    const [recovery, setRecovery] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [proctorToast, setProctorToast] = useState(null);
    const [cameraOpen, setCameraOpen] = useState(false);
    const chatEndRef = useRef(null);
    const spokenRef = useRef(false);
    const lastTextRef = useRef('');
    const failRef = useRef(null);

    // Proctoring hook (tab switch, inactivity, webcam face detection)
    const {
        warnings, webcamState, faceVisible, lastWarning,
        videoRef, canvasRef,
        startProctoring, stopProctoring, startWebcam, stopWebcam, refreshActivity
    } = useProctoring({ onFail: () => { failRef.current?.(); } });

    // Voice hook
    const { speak, stopSpeaking, startListening, stopListening, voiceStatus, isRecognitionSupported, isSynthSupported, cleanup } = useVoice({
        onTranscript: (text) => { refreshActivity(); setInput(prev => prev ? prev + ' ' + text : text); }
    });

    const handleProctorFail = useCallback(() => {
        stopProctoring();
        cleanup();
        setEndReason('suspicious-activity');
        setInterviewStatus('completed');
        navigate('/feedback', { replace: true });
    }, [stopProctoring, cleanup, setEndReason, setInterviewStatus, navigate]);

    useEffect(() => { failRef.current = handleProctorFail; }, [handleProctorFail]);

    // Camera preview — opt-in via the header Camera button
    const openCamera = useCallback(() => {
        setCameraOpen(true);
        if (webcamState === 'off' || webcamState === 'denied' || webcamState === 'unsupported') startWebcam();
    }, [webcamState, startWebcam]);

    const closeCamera = useCallback(() => setCameraOpen(false), []);

    const turnOffCamera = useCallback(() => {
        stopWebcam();
        setCameraOpen(false);
    }, [stopWebcam]);

    // Auto-scroll to bottom
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, thinking]);

    // Start proctoring on mount, stop on unmount
    useEffect(() => {
        startProctoring();
        return () => stopProctoring();
    }, [startProctoring, stopProctoring]);

    // If a previous interview was ended for suspicious activity, leave this page
    useEffect(() => {
        if (endReason) navigate('/feedback', { replace: true });
    }, [endReason, navigate]);

    // A completed interview must never render the interview UI again — go to feedback
    useEffect(() => {
        if (interviewStatus === 'completed') navigate('/feedback', { replace: true });
    }, [interviewStatus, navigate]);

    // Show toast on each proctoring warning
    useEffect(() => {
        if (!lastWarning) return;
        setProctorToast(lastWarning);
        const timer = setTimeout(() => setProctorToast(null), 4500);
        return () => clearTimeout(timer);
    }, [lastWarning]);

    // Speaking/listening counts as active engagement (avoids false inactivity warnings)
    useEffect(() => {
        if (voiceStatus === 'listening' || voiceStatus === 'speaking') refreshActivity();
    }, [voiceStatus, refreshActivity]);

    // Cleanup voice on unmount (navigation away / logout)
    useEffect(() => () => { spokenRef.current = false; cleanup(); }, [cleanup]);

    // Speak the opening AI question (only for a fresh interview)
    useEffect(() => {
        if (spokenRef.current) return;
        if (messages.length === 1 && messages[0].role === 'ai') {
            spokenRef.current = true;
            if (voiceEnabled && isSynthSupported) speak(messages[0].text);
        }
    }, [messages, voiceEnabled, isSynthSupported, speak]);

    const sendMessage = useCallback(async (userText) => {
        if (!userText?.trim() || thinking) return;
        const text = userText.trim();
        lastTextRef.current = text;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text }]);
        setThinking(true); setError(''); setRecovery(false);
        refreshActivity();
        stopSpeaking();

        try {
            const data = await api.sendInterviewMessage(sessionId, text);

            if (data.done) {
                stopProctoring();
                cleanup();
                setFeedback(data.feedback ?? { summary: 'Interview complete', strengths: [], gaps: [], next: [] });
                setInterviewDone(true);
                setInterviewStatus('completed');
                navigate('/feedback');
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
                setThinking(false);
                refreshActivity();
                if (voiceEnabled && isSynthSupported) speak(data.reply);
            }
        } catch (e) {
            setThinking(false);
            if (e instanceof ApiError && (e.status === 400 || e.code === 'candidate is required when starting an interview')) {
                setRecovery(true);
            } else {
                setError('Failed to submit answer: ' + e.message);
                // Restore the answer so the user can retry without retyping
                setInput(lastTextRef.current);
            }
        }
    }, [sessionId, voiceEnabled, isSynthSupported, speak, stopSpeaking, cleanup, setFeedback, setInterviewDone, setInterviewStatus, navigate, setMessages, thinking, refreshActivity, stopProctoring]);

    const handleSubmit = () => {
        if (!input.trim()) { setError('Please enter an answer.'); return; }
        sendMessage(input);
    };

    const handleNotSure = () => sendMessage("I'm not sure about this. Can you give me a hint or move on?");

    const handleRetry = () => sendMessage(lastTextRef.current || input);

    const toggleMic = () => {
        if (voiceStatus === 'listening') { stopListening(); }
        else { startListening(); }
    };

    const voiceStatusLabel = (() => {
        if (!isRecognitionSupported) return 'Voice input is not supported in this browser. You can type your answer instead.';
        if (thinking) return 'Processing answer…';
        return {
            idle: 'Mic ready',
            listening: 'Listening…',
            speaking: 'AI speaking…',
            error: 'Microphone permission was denied. You can type your answer instead.'
        }[voiceStatus] || 'Ready';
    })();

    // AI avatar / status state derived from the existing voice + interview state
    const avatarState = thinking ? 'thinking' : voiceStatus === 'speaking' ? 'speaking' : voiceStatus === 'listening' ? 'listening' : 'idle';
    const statusText = thinking ? 'Thinking…' : voiceStatus === 'speaking' ? 'AI is speaking…' : voiceStatus === 'listening' ? 'Listening…' : 'Ready for your answer';
    const statusDot = thinking ? '#9B8AFB' : voiceStatus === 'speaking' ? '#6C4DE6' : voiceStatus === 'listening' ? '#4B32A8' : '#9B8AFB';

    // Interview progress derived from the live conversation (not backend-provided)
    const aiCount = messages.filter(m => m.role === 'ai').length;
    const userCount = messages.filter(m => m.role === 'user').length;
    const progressPct = Math.min(100, Math.round((aiCount / 12) * 100));

    // A completed interview must not render — the effect above redirects to /feedback
    if (interviewStatus === 'completed') return null;

    return (
        <div className="app-layout">
            <Sidebar active="interview" />

            <main className="main-content iv-main">
                <div className="iv-page">
                    {/* ── LEFT: AI Interviewer panel ── */}
                    <aside className="iv-avatar-panel">
                        <span className="iv-panel-tag">
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6C4DE6', display: 'inline-block' }} />
                            Live Interview
                        </span>

                        <div className="iv-panel-mid">
                            <AIInterviewerAvatar state={avatarState} size={248} />
                            <div className="iv-ai-name">AI Interviewer</div>
                            <span className={`iv-status-chip ${avatarState}`} role="status" aria-live="polite">
                                <span className="iv-status-dot" style={{ background: statusDot, animation: avatarState === 'idle' ? 'none' : 'pulse 1.4s ease infinite' }} />
                                {statusText}
                            </span>
                        </div>

                        <div className="iv-panel-bottom">
                            <div className="iv-progress-card">
                                <div className="iv-progress-head">
                                    <span className="iv-progress-label">Interview Progress</span>
                                    <span className="iv-progress-val">{Math.min(userCount, 12)} answered</span>
                                </div>
                                <div className="iv-progress-track" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100} aria-label="Interview progress">
                                    <div className="iv-progress-fill" style={{ width: `${progressPct}%` }} />
                                </div>
                            </div>

                            <div className="iv-candidate-chip">
                                <span className="iv-candidate-avatar">{initials(candidate?.member?.name)}</span>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1F2430', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {candidate?.member?.name ?? 'Candidate'}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#6B7280' }}>{candidate?.member?.jobRole ?? 'Candidate'}</div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* ── RIGHT: Conversation ── */}
                    <section className="iv-conversation">
                        {/* Header */}
                        <div className="iv-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                                <span className="iv-live-dot" />
                                <span className="iv-live-label">Interview in Progress</span>
                                <span className="iv-header-candidate" style={{ color: 'var(--muted)', fontSize: 13, marginLeft: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>— {candidate?.member?.name}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                {warnings > 0 && (
                                    <span className="iv-warn-badge" role="status" aria-label={`Warnings ${warnings} of 3`}>
                                        <ShieldAlert size={14} /> Warnings: {warnings}/3
                                    </span>
                                )}
                                <button
                                    onClick={openCamera}
                                    className={`btn iv-cam-btn ${webcamState === 'active' ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ padding: '8px 12px', fontSize: 12 }}
                                    aria-pressed={webcamState === 'active'}
                                    title={webcamState === 'active' ? 'Camera is on — click to view preview' : 'Turn on camera'}
                                >
                                    {webcamState === 'active' ? <Video size={14} /> : <VideoOff size={14} />}
                                    <span>{webcamState === 'active' ? 'Camera On' : 'Camera'}</span>
                                </button>
                                {isSynthSupported && (
                                    <button onClick={() => { setVoiceEnabled(v => !v); if (voiceEnabled) stopSpeaking(); }}
                                        className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: 12 }}>
                                        {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                                        <span>{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
                                    </button>
                                )}
                                <button onClick={() => { cleanup(); navigate('/dashboard'); }} className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: 12 }}>
                                    Exit
                                </button>
                            </div>
                        </div>

                        {/* Proctoring warning toast */}
                        {proctorToast && (
                            <div className="iv-toast" role="alert">
                                <ShieldAlert size={16} />
                                <span><strong>Warning {proctorToast.count}/3</strong> — {proctorToast.text}</span>
                            </div>
                        )}

                        {/* Chat */}
                        <div className="iv-chat">
                            {messages.length === 0 && !thinking && !error && (
                                <div style={{ textAlign: 'center', color: 'var(--muted)', marginTop: 32 }}>
                                    <Sparkles size={40} color="var(--primary)" style={{ marginBottom: 12, opacity: 0.6 }} />
                                    <p style={{ fontSize: 14 }}>Connecting to AI Interviewer…</p>
                                </div>
                            )}

                            {messages.map((msg, i) => {
                                const isAI = msg.role === 'ai';
                                return (
                                    <div key={i} className="animate-in" style={{ display: 'flex', flexDirection: isAI ? 'row' : 'row-reverse', gap: 10, alignItems: 'flex-start' }}>
                                        <div className={`avatar ${isAI ? 'avatar-ai' : 'avatar-user'}`}>
                                            {isAI ? <Sparkles size={16} /> : <User size={16} />}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: '78%', minWidth: 0, alignItems: isAI ? 'flex-start' : 'flex-end' }}>
                                            <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{isAI ? 'AI Interviewer' : (candidate?.member?.name ?? 'You')}</span>
                                            <div className={`bubble ${isAI ? 'bubble-ai' : 'bubble-user'}`}>{msg.text}</div>
                                        </div>
                                    </div>
                                );
                            })}

                            {thinking && (
                                <div className="animate-in" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                    <div className="avatar avatar-ai"><Sparkles size={16} /></div>
                                    <div className="bubble bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                                        <span style={{ color: 'var(--muted)', fontSize: 13 }}>Thinking…</span>
                                    </div>
                                </div>
                            )}

                            {error && <div className="banner-error animate-in">{error}</div>}

                            {recovery && (
                                <div className="card animate-in" style={{ border: '1.5px solid #F8CECE', textAlign: 'center', padding: 24, marginBottom: 12 }}>
                                    <p style={{ fontWeight: 600, margin: '0 0 6px', color: '#B91C1C' }}>Your previous interview session could not be restored.</p>
                                    <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 14px' }}>Start a new interview from the Dashboard.</p>
                                    <button onClick={() => { cleanup(); navigate('/dashboard'); }} className="btn btn-primary" style={{ gap: 8 }}>
                                        <RotateCcw size={15} /> Return to Dashboard
                                    </button>
                                </div>
                            )}

                            <div ref={chatEndRef} style={{ height: 1 }} />
                        </div>

                        {/* Footer */}
                        <div className="iv-footer">
                            {/* Voice status bar */}
                            <div className={`voice-bar${voiceStatus === 'error' ? ' mic-error' : ''}`} role="status" aria-live="polite">
                                <span className={voiceStatus === 'listening' ? 'pulse' : ''} style={{ fontSize: 16, display: 'inline-flex' }}>
                                    {voiceStatus === 'listening' ? <Mic size={16} /> : voiceStatus === 'speaking' ? <Volume2 size={16} /> : <Sparkles size={16} />}
                                </span>
                                <span>{voiceStatusLabel}</span>
                            </div>

                            <div className="input-row">
                                <textarea
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Type your answer here..."
                                    aria-label="Your answer"
                                    disabled={thinking || recovery}
                                    maxLength={1200}
                                    className="input-field"
                                    rows={3}
                                    style={{ resize: 'none', flex: 1 }}
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                                />

                                <div className="btn-row">
                                    {isRecognitionSupported && (
                                        <button
                                            onClick={toggleMic}
                                            disabled={thinking || recovery}
                                            className={`btn-mic${voiceStatus === 'listening' ? ' listening' : ''}`}
                                            aria-label={voiceStatus === 'listening' ? 'Stop microphone' : 'Start microphone'}
                                            title={voiceStatus === 'listening' ? 'Stop microphone' : 'Start microphone'}
                                        >
                                            {voiceStatus === 'listening' ? <MicOff size={19} /> : <Mic size={19} />}
                                        </button>
                                    )}
                                    <button onClick={handleSubmit} disabled={thinking || !input.trim() || recovery} className="btn btn-primary btn-full-sm" style={{ height: 48 }}>
                                        {thinking
                                            ? <><div className="spinner" style={{ width: 15, height: 15, borderWidth: 2, borderTopColor: '#fff' }} /> Submitting answer...</>
                                            : <><Send size={16} /> Submit Answer</>}
                                    </button>
                                    <button onClick={handleNotSure} disabled={thinking || recovery} className="btn btn-secondary btn-full-sm" style={{ fontSize: 13, height: 48 }}>
                                        Not sure
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                                    <button onClick={handleRetry} disabled={thinking} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }}>
                                        Retry
                                    </button>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{input.length} / 1200</span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Camera preview modal (opt-in, never permanent) */}
                {(cameraOpen || webcamState === 'active' || webcamState === 'requested') && (
                    <div
                        className={`cam-backdrop${cameraOpen ? '' : ' cam-backdrop-hidden'}`}
                        onClick={closeCamera}
                        role="presentation"
                    >
                        <div className="cam-modal" role="dialog" aria-modal="true" aria-label="Camera preview" onClick={(e) => e.stopPropagation()}>
                            <div className="cam-modal-head">
                                <span className="cam-modal-title"><span className="cam-live-dot" /> Camera Preview</span>
                                <button className="cam-modal-x" onClick={closeCamera} aria-label="Close camera preview">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="cam-modal-body">
                                {webcamState === 'active' ? (
                                    <>
                                        <video ref={videoRef} className="cam-video" autoPlay playsInline muted aria-label="Live camera preview" />
                                        <div className="cam-status" role="status">
                                            <span className="cam-status-dot" /> Camera On
                                        </div>
                                        {faceVisible === false && (
                                            <div className="cam-face-warn" role="status">Face not detected — please look at the camera.</div>
                                        )}
                                    </>
                                ) : webcamState === 'requested' ? (
                                    <div className="cam-empty">
                                        <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                                        <span>Starting camera…</span>
                                    </div>
                                ) : (
                                    <div className="cam-empty cam-error">
                                        <VideoOff size={22} />
                                        <span>{webcamState === 'unsupported'
                                            ? 'Camera is not supported in this browser.'
                                            : 'Camera access is disabled. Enable camera permission to use video.'}</span>
                                    </div>
                                )}
                                <canvas ref={canvasRef} width={96} height={72} style={{ display: 'none' }} />
                            </div>
                            <div className="cam-modal-foot">
                                <button className="btn btn-secondary" onClick={turnOffCamera}>
                                    <VideoOff size={14} /> Turn Off Camera
                                </button>
                                <button className="btn btn-primary" onClick={closeCamera}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
