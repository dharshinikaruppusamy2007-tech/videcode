# AI Interview Agent

An AI-powered technical interview application that evaluates candidates in real time using the Google Gemini API. Candidates select their profile, start a live interview, answer spoken or typed questions, and receive AI-generated feedback — all driven by real backend data and real AI responses.

## Table of Contents

1. [Project Description](#project-description)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Installation](#installation)
7. [Environment Variables](#environment-variables)
8. [Backend Setup](#backend-setup)
9. [Frontend Setup](#frontend-setup)
10. [Running the Application](#running-the-application)
11. [API Overview](#api-overview)
12. [Interview Flow](#interview-flow)
13. [Voice Assistant Requirements](#voice-assistant-requirements)
14. [Browser Compatibility](#browser-compatibility)
15. [Troubleshooting](#troubleshooting)
16. [Production Build Instructions](#production-build-instructions)

---

## Project Description

The AI Interview Agent simulates a live technical interview. An interviewer agent builds a personalized interview plan from a candidate's real learning history (completed, skipped, and weakly-mastered topics) and generates conversational technical questions via the Gemini API. The interview continues turn-by-turn until the candidate has covered the required material, then the backend produces genuine feedback — strengths, areas to improve, and next steps — derived only from the actual conversation.

The application is a full-stack monorepo with an Express backend and a React (Vite) frontend, optimized for mobile use with a desktop layout.

## Features

- Candidate selection from a real candidate data source (`backend/data/candidates.json`)
- Personalized interview plan built from candidate signals (gaps, weak signals, strong signals)
- Real-time AI questions and follow-ups via the Google Gemini API
- Turn-by-turn interview with backend-controlled completion (`done: true`)
- AI-generated final feedback (Overall, Strengths, Areas to Improve, Next Steps)
- Candidate dashboard with real progress statistics (completed/skipped days, modules, progress %)
- Candidate profile page showing the selected candidate's information
- Voice support: SpeechSynthesis (AI reads questions aloud) and SpeechRecognition (answer by speaking)
- State persistence across page refreshes via `localStorage` (candidate, session, feedback — no secrets)
- Responsive, mobile-first UI with a bottom navigation bar
- Centralized API service with consistent error handling and loading/empty/error states
- Error boundary with a safe recovery UI

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, React Router, lucide-react, uuid |
| Backend | Node.js, Express, dotenv, cors, uuid |
| AI | Google Gemini (`@google/generative-ai`) |
| Styling | Custom CSS (CSS custom properties) |

## Project Structure

```
ai-interview-agent/
├── backend/
│   ├── data/
│   │   ├── candidates.json      # Real candidate data (source of truth)
│   │   └── curriculum.json      # AI curriculum days
│   ├── routes/
│   │   ├── candidates.js        # /api/candidates
│   │   └── interview.js         # /api/interview
│   ├── services/
│   │   ├── dashboardHelper.js   # Dashboard statistics
│   │   ├── geminiService.js     # Gemini API wrapper + model fallback
│   │   ├── interviewPlanBuilder.js
│   │   ├── interviewerLogic.js  # Turn generation + feedback
│   ├── .env                     # Backend secrets (NOT committed)
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── ErrorBoundary.jsx
    │   │   └── Sidebar.jsx
    │   ├── context/AppContext.jsx    # Global state + persistence
    │   ├── hooks/useVoice.js         # SpeechRecognition / SpeechSynthesis
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Feedback.jsx
    │   │   ├── LiveInterview.jsx
    │   │   ├── Login.jsx
    │   │   └── Profile.jsx
    │   ├── services/api.js           # Centralized API client
    │   ├── App.jsx                   # Routes + route guards
    │   ├── main.jsx
    │   └── index.css
    ├── .env                          # Frontend config (NOT committed)
    ├── .env.example
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Prerequisites

- Node.js 18 or newer (Node 24 tested)
- npm
- A Google Gemini API key (free tier works)
- Chrome or Edge for full voice support (see [Browser Compatibility](#browser-compatibility))

## Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Environment Variables

> **Important:** The Gemini API key belongs **only** to the backend. It must never appear in frontend code, browser JavaScript, HTML, or any Git-tracked file.

### Backend — `backend/.env`

```
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
PORT=3001
FRONTEND_URL=http://localhost:5173
```

- `GEMINI_API_KEY` — your Google Gemini API key. **Required.**
- `PORT` — backend port (defaults to `3000`; the app uses `3001`).
- `FRONTEND_URL` — allowed frontend origin for CORS. Set to the real deployed frontend URL in production.

### Frontend — `frontend/.env`

```
VITE_API_BASE_URL=http://localhost:3001
```

- `VITE_API_BASE_URL` — base URL of the backend. Vite exposes only `VITE_`-prefixed variables to the client.

### Example files

- `backend/.env.example` and `frontend/.env.example` contain safe placeholders and can be committed. Never put a real key in `.env.example`.

## Backend Setup

1. Copy the example environment file and add your key:

```bash
cd backend
cp .env.example .env
# Edit .env and set GEMINI_API_KEY=your_real_key_here
```

2. Start the backend:

```bash
npm start        # production
# or
npm run dev      # auto-restart on file changes
```

Expected output:

```
Backend server is running on http://localhost:3001
```

3. Verify the health endpoint:

```
GET http://localhost:3001/health
```

## Frontend Setup

1. Copy the example environment file:

```bash
cd frontend
cp .env.example .env
```

2. Start the dev server:

```bash
npm run dev
```

The app opens at `http://localhost:5173`.

## Running the Application

1. Start the backend (port 3001).
2. Start the frontend dev server (port 5173).
3. Open `http://localhost:5173`.
4. Select a candidate and sign in to the dashboard.
5. Click **Start Interview** to begin a live AI interview.
6. Answer via text or microphone, then submit.
7. When the interview completes, the app navigates to the Feedback page with real AI-generated feedback.

## API Overview

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | Backend health check |
| GET | `/api/candidates` | List all candidates (login screen) |
| GET | `/api/candidates/:id/dashboard` | Dashboard statistics for a candidate |
| POST | `/api/interview` | Start (with `candidate`) or continue (with `message`) an interview |

`POST /api/interview` request body:

- **Start a new interview:** `{ "sessionId": "<uuid>", "candidate": { ... } }`
- **Continue an interview:** `{ "sessionId": "<uuid>", "message": "your answer" }`

Response:

```json
{ "reply": "The AI's next question...", "done": false }
```

When the interview is complete:

```json
{
  "reply": "Interview completed.",
  "done": true,
  "feedback": {
    "summary": "...",
    "strengths": ["...", "..."],
    "gaps": ["...", "..."],
    "next": ["...", "..."]
  }
}
```

> The frontend never calls Gemini directly. All AI traffic goes through the backend.

## Interview Flow

1. Login → candidate selection.
2. Dashboard → **Start Interview** creates a unique `sessionId` and calls `POST /api/interview`.
3. The backend builds an interview plan from the candidate's real history and returns the first AI question.
4. The candidate answers (typed or spoken); each answer is sent with `POST /api/interview`.
5. The AI asks follow-ups and probes weak topics until the backend determines coverage is sufficient.
6. The backend returns `done: true` with real feedback.
7. The frontend stores the feedback, navigates to `/feedback`, and displays it.

The backend is the source of truth for interview completion — there is no frontend question counter and no forced completion.

## Voice Assistant Requirements

- **AI voice output** uses the browser's `speechSynthesis` (Web Speech API).
- **Microphone input** uses `SpeechRecognition` / `webkitSpeechRecognition`.
- The microphone requires an active browser permission (HTTPS or `localhost`).
- If voice is unsupported or permission is denied, the interview remains fully usable with typed answers.

Supported voice states: Ready, Listening, Processing, AI Speaking, Stopped, Unsupported, Permission Denied.

## Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
| --- | --- | --- | --- | --- |
| Routing / UI / API | ✅ | ✅ | ✅ | ✅ |
| SpeechSynthesis (AI voice) | ✅ | ✅ | ⚠️ | ⚠️ |
| SpeechRecognition (mic input) | ✅ | ✅ | ❌ | ❌ |

- If `SpeechRecognition` is unavailable, the app shows: *"Voice input is not supported in this browser. You can type your answer instead."*
- If the microphone permission is denied, the app shows: *"Microphone permission was denied. You can type your answer instead."*
- Text input always works.

## Troubleshooting

### Port 3001 already in use

The backend cannot start because another process is using port 3001.

```bash
# Find the process using the port (Windows)
netstat -ano | findstr :3001

# Kill it
taskkill /PID <PID> /F
```

On macOS/Linux:

```bash
lsof -i :3001
kill <PID>
```

### Backend unavailable / "Unable to connect to the backend"

- Make sure the backend is running (`npm start` in `backend/`).
- Check the backend port matches `VITE_API_BASE_URL` in `frontend/.env`.
- The Dashboard shows a "Backend unavailable" banner with a **Try Again** button.

### CORS problems

- In development the backend allows the origin `http://localhost:5173` (or the origin in `FRONTEND_URL`).
- If you host the frontend and backend on different domains in production, set `FRONTEND_URL` in `backend/.env` to the real deployed frontend URL. The backend rejects requests from any other origin.

### Gemini errors / HTTP 503 ("AI service is temporarily unavailable")

- 503 responses mean the Gemini request failed after retries.
- Free-tier quotas are limited (e.g., requests per day per model). Wait for the quota window to reset, or use a model with available quota.
- Ensure `GEMINI_API_KEY` is set in `backend/.env` and valid.

### No candidates appear on the login page

- Verify `backend/data/candidates.json` exists and is valid JSON.
- Verify the backend is running and reachable.

### Microphone permission denied

- Allow microphone access in the browser's site settings.
- Use `localhost` or HTTPS (required for microphone access).
- You can always type your answer instead.

### Voice input not supported

- Use Chrome or Edge, which support `SpeechRecognition`.
- The app will show a message and text input remains fully functional.

### Interview session lost after refresh

- Active interview state is restored from `localStorage` when possible.
- Because the backend keeps sessions in memory, a backend restart will end the session. The app detects this and shows: *"Your previous interview session could not be restored."* with a **Return to Dashboard** action.

## Production Build Instructions

### Frontend

```bash
cd frontend
npm run build
```

Output is generated in `frontend/dist/`. Serve it with any static host (or `npm run preview`).

```bash
npm run preview
```

### Backend

```bash
cd backend
npm start
```

In production, keep `GEMINI_API_KEY` set in `backend/.env` and never expose it to the frontend.

---

> **Security note:** The Gemini API key is backend-only. Do not add it to frontend code, `frontend/.env`, or commit it to Git. `.env` files are Git-ignored.
