import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [candidate, setCandidate] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [interviewDone, setInterviewDone] = useState(false);

    const logout = useCallback(() => {
        setCandidate(null);
        setSessionId(null);
        setFeedback(null);
        setInterviewDone(false);
    }, []);

    return (
        <AppContext.Provider value={{
            candidate, setCandidate,
            sessionId, setSessionId,
            feedback, setFeedback,
            interviewDone, setInterviewDone,
            logout
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
