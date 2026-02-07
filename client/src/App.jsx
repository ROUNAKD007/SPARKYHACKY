import { useEffect, useState } from 'react';
import { getMe, getToken, login, setToken } from './api';

const initialForm = { email: '', password: '' };

function App() {
  const [form, setForm] = useState(initialForm);
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    const boot = async () => {
      // Check for token in URL (from Google Auth redirect)
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');

      if (tokenFromUrl) {
        setToken(tokenFromUrl);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const token = getToken();
      if (!token) return;

      setStatus('loading');
      try {
        const data = await getMe();
        setUser(data.user);
      } catch {
        setToken(null);
      } finally {
        setStatus('idle');
      }
    };

    boot();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('loading');

    try {
      const data = await login(form);
      setToken(data.token);
      setUser(data.user);
      setForm(initialForm);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setStatus('idle');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5001/auth/google';
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setForm(initialForm);
  };

  if (user) {
    return (
      <main className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">Hi, welcome to the app, <br /> <span className="highlight">{user.email}</span>!</h1>
          <p className="hero-subtitle">You are successfully logged in.</p>
          <button type="button" className="button logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="card">
        <h1>Login</h1>
        <div className="social-login">
          <button type="button" className="google-button" onClick={handleGoogleLogin}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="google-icon" />
            Sign in with Google
          </button>
        </div>

        <div className="divider">
          <span>or</span>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button type="submit" className="button" disabled={status === 'loading'}>
            {status === 'loading' ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default App;
