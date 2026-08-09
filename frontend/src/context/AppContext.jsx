import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AppContext = createContext(null);

const STORAGE_KEY = 'ai-interview-agent-state';
const INTERVIEW_STATUS_KEY = 'interviewStatus';
const INTERVIEW_STATUSES = ['not_started', 'in_progress', 'completed'];

function loadInterviewStatus() {
    try {
        const raw = localStorage.getItem(INTERVIEW_STATUS_KEY);
        return INTERVIEW_STATUSES.includes(raw) ? raw : 'not_started';
    } catch {
        return 'not_started';
    }
}

// Restore safe application state from localStorage (candidate, session, feedback).
// Sensitive data (API keys, prompts, internal plans) is never persisted.
function loadPersistedState() {
    const emptyState = {
        candidate: null,
        sessionId: null,
        feedback: null,
        endReason: null,
        interviewDone: false,
        messages: [],
    };

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return emptyState;
        const state = JSON.parse(raw);
        return {
            candidate: state.candidate || null,
            sessionId: state.sessionId || null,
            feedback: state.feedback || null,
            endReason: state.endReason || null,
            interviewDone: !!state.interviewDone,
            messages: Array.isArray(state.messages) ? state.messages : [],
        };
    } catch {
        return emptyState;
    }
}

const persisted = loadPersistedState();

export function AppProvider({ children }) {
    const [candidate, setCandidate] = useState(persisted.candidate);
    const [sessionId, setSessionId] = useState(persisted.sessionId);
    const [feedback, setFeedback] = useState(persisted.feedback);
    const [endReason, setEndReason] = useState(persisted.endReason);
    const [interviewDone, setInterviewDone] = useState(persisted.interviewDone);
    const [messages, setMessages] = useState(Array.isArray(persisted.messages) ? persisted.messages : []);
    const [interviewStatus, setInterviewStatusState] = useState(loadInterviewStatus);

    // Persist the interview status under its own localStorage key
    const setInterviewStatus = useCallback((status) => {
        if (!INTERVIEW_STATUSES.includes(status)) return;
        setInterviewStatusState(status);
        try {
            if (status === 'not_started') {
                localStorage.removeItem(INTERVIEW_STATUS_KEY);
            } else {
                localStorage.setItem(INTERVIEW_STATUS_KEY, status);
            }
        } catch (e) {
            console.warn('Could not persist interview status:', e);
        }
    }, []);

    // Persist safe state whenever it changes
    useEffect(() => {
        try {
            const isEmpty = !candidate && !sessionId && !feedback && !endReason && !interviewDone && messages.length === 0;
            if (isEmpty) {
                localStorage.removeItem(STORAGE_KEY);
            } else {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    candidate,
                    sessionId,
                    feedback,
                    endReason,
                    interviewDone,
                    messages,
                }));
            }
        } catch (e) {
            console.warn('Could not persist application state:', e);
        }
    }, [candidate, sessionId, feedback, endReason, interviewDone, messages]);

    // Reset everything: context state + persisted state.
    // Safe to call from Logout anywhere.
    const logout = useCallback(() => {
        setCandidate(null);
        setSessionId(null);
        setFeedback(null);
        setEndReason(null);
        setInterviewDone(false);
        setMessages([]);
        setInterviewStatus('not_started');
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.warn('Could not clear persisted state:', e);
        }
    }, [setInterviewStatus]);

    // Prepare for a brand-new interview session.
    const beginInterview = useCallback((sid, firstReply) => {
        setMessages([]);
        setFeedback(null);
        setEndReason(null);
        setInterviewDone(false);
        setSessionId(sid);
        setInterviewStatus('in_progress');
        if (firstReply) setMessages([{ role: 'ai', text: firstReply }]);
    }, [setInterviewStatus]);

    return (
        <AppContext.Provider value={{
            candidate, setCandidate,
            sessionId, setSessionId,
            feedback, setFeedback,
            endReason, setEndReason,
            interviewDone, setInterviewDone,
            messages, setMessages,
            interviewStatus, setInterviewStatus,
            logout,
            beginInterview,
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used inside AppProvider');
    return ctx;
}
