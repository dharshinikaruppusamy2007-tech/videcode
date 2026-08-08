import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LiveInterview from './pages/LiveInterview';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';

function RequireCandidate({ children }) {
  const { candidate } = useApp();
  if (!candidate) return <Navigate to="/" replace />;
  return children;
}

function RequireSession({ children }) {
  const { candidate, sessionId } = useApp();
  if (!candidate) return <Navigate to="/" replace />;
  if (!sessionId) return <Navigate to="/dashboard" state={{ msg: 'Start an interview from the Dashboard first.' }} replace />;
  return children;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<RequireCandidate><Dashboard /></RequireCandidate>} />
          <Route path="/profile" element={<RequireCandidate><Profile /></RequireCandidate>} />
          <Route path="/interview" element={<RequireSession><LiveInterview /></RequireSession>} />
          <Route path="/feedback" element={<RequireCandidate><Feedback /></RequireCandidate>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
