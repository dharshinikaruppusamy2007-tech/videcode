// Centralized API service for the AI Interview Agent frontend.
// All backend calls go through this module. No secrets are stored or exposed here.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export class ApiError extends Error {
    constructor(message, status = 0, code = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
    }
}

const FRIENDLY_ERRORS = {
    400: 'Invalid interview request.',
    401: 'Session expired. Please sign in again.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'There was a conflict with the current request.',
    429: 'Too many requests. Please wait and try again.',
    500: 'Something went wrong on the server.',
    502: 'The server received an invalid response from an upstream service.',
    503: 'AI service is temporarily unavailable. Please try again.',
};

const NETWORK_ERROR = 'Unable to connect to the backend. Please make sure the server is running.';

function toFriendlyMessage(status, rawMessage) {
    if (FRIENDLY_ERRORS[status]) return FRIENDLY_ERRORS[status];
    if (rawMessage && typeof rawMessage === 'string' && rawMessage.trim()) return rawMessage;
    return 'Something went wrong. Please try again.';
}

async function request(path, options = {}) {
    let res;
    try {
        res = await fetch(`${API_BASE_URL}${path}`, options);
    } catch {
        throw new ApiError(NETWORK_ERROR, 0, 'NETWORK_ERROR');
    }

    let data = null;
    try {
        data = await res.json();
    } catch {
        data = null;
    }

    if (!res.ok) {
        throw new ApiError(toFriendlyMessage(res.status, data?.error), res.status, data?.error ?? null);
    }

    return data;
}

function post(path, body) {
    return request(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

export const api = {
    // Backend availability check
    async checkHealth() {
        try {
            const data = await request('/health');
            return data && data.status === 'ok';
        } catch {
            return false;
        }
    },

    // Candidates / login
    getCandidates: () => request('/api/candidates'),
    getDashboard: (candidateId) => request(`/api/candidates/${encodeURIComponent(candidateId)}/dashboard`),

    // Interview
    startInterview: (sessionId, candidate) => post('/api/interview', { sessionId, candidate }),
    sendInterviewMessage: (sessionId, message) => post('/api/interview', { sessionId, message }),
};

export default api;
