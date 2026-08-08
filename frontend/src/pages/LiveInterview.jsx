import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Mic, MicOff, Send, Volume2, VolumeX, User, RotateCcw } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useApp } from '../context/AppContext';
import { useVoice } from '../hooks/useVoice';
import api, { ApiError } from '../services/api';

export default function LiveInterview() {
    const navigate = useNavigate();
    const { candidate, sessionId, setFeedback, setInterviewDone, messages, setMessages } = useApp();
    const [input, setInput] = useState('');
    const [thinking, setThinking] = useState(false);
    const [error, setError] = useState('');
    const [recovery, setRecovery] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const chatEndRef = useRef(null);
    const spokenRef = useRef(false);
    const lastTextRef = useRef('');

    // Voice hook
    const { speak, stopSpeaking, startListening, stopListening, voiceStatus, isRecognitionSupported, isSynthSupported, cleanup } = useVoice({
        onTranscript: (text) => setInput(prev => prev ? prev + ' ' + text : text)
    });

    // Auto-scroll to bottom
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, thinking]);

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
        stopSpeaking();

        try {
            const data = await api.sendInterviewMessage(sessionId, text);

            if (data.done) {
                cleanup();
                setFeedback(data.feedback ?? { summary: 'Interview complete', strengths: [], gaps: [], next: [] });
                setInterviewDone(true);
                navigate('/feedback');
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
                setThinking(false);
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
    }, [sessionId, voiceEnabled, isSynthSupported, speak, stopSpeaking, cleanup, setFeedback, setInterviewDone, navigate, setMessages, thinking]);

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
            listening: '🎙 Listening…',
            speaking: '🔊 AI speaking…',
            error: 'Microphone permission was denied. You can type your answer instead.'
        }[voiceStatus] || 'Ready';
    })();

    return (
        <div className="app-layout">
            <Sidebar active="interview" />

            <main className="main-content" style={{ background: '#F0F4F8' }}>
                <style>{`
                    .iv-header { padding:16px 28px; background:#fff; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; }
                    .iv-chat   { flex:1; overflow-y:auto; padding:24px 28px; display:flex; flex-direction:column; gap:18px; }
                    .iv-footer { background:#fff; border-top:1px solid var(--border); padding:16px 28px; }
                    .voice-bar { padding:10px 16px; border-radius:8px; background:#EEF2FF; color:#3730A3; font-size:13px; display:flex; align-items:center; gap:10px; margin-bottom:12px; }
                    .input-row { display:flex; gap:10px; align-items:flex-end; }
                    .btn-row   { display:flex; gap:8px; flex-direction:column; }

                    @media(max-width:768px){
                        .iv-header { padding:12px 16px; }
                        .iv-chat   { padding:16px 12px 12px; padding-bottom:calc(var(--bottom-nav-h) + 16px); }
                        .iv-footer { padding:12px 16px; position:sticky; bottom:var(--bottom-nav-h); }
                        .input-row { flex-direction:column; }
                        .btn-row   { flex-direction:row; }
                    }
                `}</style>

                {/* Header */}
                <div className="iv-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', animation: 'pulse 1.5s ease infinite' }} />
                        <span style={{ fontWeight: 600, fontSize: 14, color: '#DC2626' }}>Interview in Progress</span>
                        <span style={{ color: 'var(--muted)', fontSize: 13, marginLeft: 4 }}>— {candidate?.member?.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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

                {/* Chat */}
                <div className="iv-chat">
                    {messages.length === 0 && !thinking && !error && (
                        <div style={{ textAlign: 'center', color: 'var(--muted)', marginTop: 32 }}>
                            <Bot size={40} color="var(--primary)" style={{ marginBottom: 12, opacity: 0.6 }} />
                            <p style={{ fontSize: 14 }}>Connecting to AI Interviewer…</p>
                        </div>
                    )}

                    {messages.map((msg, i) => {
                        const isAI = msg.role === 'ai';
                        return (
                            <div key={i} className="animate-in" style={{ display: 'flex', flexDirection: isAI ? 'row' : 'row-reverse', gap: 10, alignItems: 'flex-start' }}>
                                <div className={`avatar ${isAI ? 'avatar-ai' : 'avatar-user'}`}>
                                    {isAI ? <Bot size={16} /> : <User size={16} />}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: '78%', minWidth: 0, alignItems: isAI ? 'flex-start' : 'flex-end' }}>
                                    <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{isAI ? 'AI Interviewer' : (candidate?.member?.name ?? 'You')}</span>
                                    <div className={`bubble ${isAI ? 'bubble-ai' : 'bubble-user'}`}>{msg.text}</div>
                                </div>
                            </div>
                        );
                    })}

                    {thinking && (
                        <div className="animate-in" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <div className="avatar avatar-ai"><Bot size={16} /></div>
                            <div className="bubble bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                                <span style={{ color: 'var(--muted)', fontSize: 13 }}>Thinking…</span>
                            </div>
                        </div>
                    )}

                    {error && <div className="banner-error animate-in">{error}</div>}

                    {recovery && (
                        <div className="card animate-in" style={{ border: '1.5px solid #FECACA', textAlign: 'center', padding: 24, marginBottom: 12 }}>
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
                    <div className="voice-bar" role="status" aria-live="polite">
                        <span className={voiceStatus === 'listening' ? 'pulse' : ''} style={{ fontSize: 16 }}>
                            {voiceStatus === 'listening' ? '🎙' : voiceStatus === 'speaking' ? '🔊' : '💬'}
                        </span>
                        <span>{voiceStatusLabel}</span>
                    </div>

                    <div className="input-row">
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Type your answer… (Shift+Enter for new line)"
                            aria-label="Your answer"
                            disabled={thinking || recovery}
                            maxLength={1200}
                            className="input-field"
                            rows={3}
                            style={{ resize: 'none', flex: 1 }}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                        />

                        <div className="btn-row">
                            <button onClick={handleSubmit} disabled={thinking || !input.trim() || recovery} className="btn btn-primary" style={{ height: 48 }}>
                                {thinking
                                    ? <><div className="spinner" style={{ width: 15, height: 15, borderWidth: 2, borderTopColor: '#fff' }} /> Submitting answer...</>
                                    : <><Send size={16} /> Submit</>}
                            </button>
                            {isRecognitionSupported && (
                                <button
                                    onClick={toggleMic}
                                    disabled={thinking || recovery}
                                    className={`btn ${voiceStatus === 'listening' ? 'btn-danger' : 'btn-secondary'}`}
                                    style={{ height: 48 }}
                                    aria-label={voiceStatus === 'listening' ? 'Stop microphone' : 'Start microphone'}
                                    title={voiceStatus === 'listening' ? 'Stop microphone' : 'Start microphone'}
                                >
                                    {voiceStatus === 'listening' ? <MicOff size={16} /> : <Mic size={16} />}
                                </button>
                            )}
                            <button onClick={handleNotSure} disabled={thinking || recovery} className="btn btn-secondary" style={{ fontSize: 12, height: 48 }}>
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
            </main>
        </div>
    );
}
