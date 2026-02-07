<<<<<<< HEAD
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
=======
import React, { useEffect, useMemo, useState } from 'react';
>>>>>>> Dravya
import Home from './pages/Home';
import Profile from './pages/Profile';
import './styles.css';
import {
  clearStoredToken,
  getApiBaseUrl,
  getStoredToken,
  setStoredToken,
  validateSession,
} from './utils/api';

<<<<<<< HEAD
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected App Route (Mocked for now, direct access allowed per instructions) */}
        <Route path="/app" element={<Home />} />
      </Routes>
    </Router>
  );
=======
const getPath = () => window.location.pathname || '/';

const AuthGate = ({ message }) => {
  const authUrl = useMemo(() => `${getApiBaseUrl()}/auth/google`, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '420px', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '1.25rem', backgroundColor: '#111' }}>
        <h1 style={{ margin: 0, fontSize: '1.3rem' }}>Sign in required</h1>
        <p style={{ marginTop: '0.6rem', color: '#bdbdbd', fontSize: '0.92rem' }}>
          {message || 'Please sign in to upload and save submissions.'}
        </p>
        <a
          href={authUrl}
          style={{
            marginTop: '0.9rem',
            display: 'inline-block',
            textDecoration: 'none',
            border: '1px solid #333',
            borderRadius: '999px',
            padding: '0.6rem 1rem',
            color: '#fff',
            backgroundColor: '#1a1a1a',
          }}
        >
          Continue with Google
        </a>
      </div>
    </div>
  );
};

function App() {
  const [path, setPath] = useState(getPath());
  const [authState, setAuthState] = useState({ status: 'checking', user: null, message: '' });

  useEffect(() => {
    const handleRouteChange = () => setPath(getPath());
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const tokenFromQuery = params.get('token');

      if (tokenFromQuery) {
        setStoredToken(tokenFromQuery);
        params.delete('token');
        const cleanQuery = params.toString();
        const cleanUrl = `${window.location.pathname}${cleanQuery ? `?${cleanQuery}` : ''}`;
        window.history.replaceState({}, '', cleanUrl);
      }

      const token = getStoredToken();
      if (!token) {
        setAuthState({ status: 'unauthenticated', user: null, message: 'No active session found.' });
        return;
      }

      try {
        const user = await validateSession();
        setAuthState({ status: 'authenticated', user, message: '' });
      } catch (error) {
        const isAuthError = error?.status === 401 || error?.status === 403;
        clearStoredToken();
        setAuthState({
          status: 'unauthenticated',
          user: null,
          message: isAuthError
            ? 'Session expired. Please log in again.'
            : 'Backend unreachable (check server running / CORS)',
        });
      }
    };

    bootstrapAuth();
  }, []);

  const handleSessionExpired = () => {
    clearStoredToken();
    setAuthState({ status: 'unauthenticated', user: null, message: 'Session expired. Please log in again.' });
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  if (authState.status === 'checking') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', display: 'grid', placeItems: 'center' }}>
        Checking session...
      </div>
    );
  }

  if (authState.status !== 'authenticated') {
    return <AuthGate message={authState.message} />;
  }

  if (path === '/profile') {
    return <Profile />;
  }

  return <Home currentUser={authState.user} onSessionExpired={handleSessionExpired} />;
>>>>>>> Dravya
}

export default App;
