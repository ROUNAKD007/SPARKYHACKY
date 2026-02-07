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

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setForm(initialForm);
  };

  if (user) {
    return (
      <main className="container">
        <h1>Hi, welcome to the app, {user.username}!</h1>
        <button type="button" className="button" onClick={handleLogout}>
          Logout
        </button>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="card">
        <h1>Login</h1>
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
