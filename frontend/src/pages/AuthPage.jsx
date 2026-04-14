import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/auth.jsx';

function getErrorMessage(e) {
  return e?.response?.data?.error || e?.message || 'Something went wrong';
}

export default function AuthPage() {
  const { login, register, isAuthed } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthed) {
    nav('/dashboard', { replace: true });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password);
      nav('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: '80px auto', padding: 16 }}>
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>API Tester</div>
            <div className="muted">Postman-lite with history, collections, and environments.</div>
          </div>
          <div className="row">
            <button className={`btn ${mode === 'login' ? '' : 'secondary'}`} onClick={() => setMode('login')}>
              Login
            </button>
            <button className={`btn ${mode === 'register' ? '' : 'secondary'}`} onClick={() => setMode('register')}>
              Register
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="col" style={{ marginTop: 12 }}>
          <div className="col">
            <label className="muted">Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div className="col">
            <label className="muted">Password (min 8 chars)</label>
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              minLength={8}
              required
            />
          </div>

          {error ? <div className="pill" style={{ borderColor: 'var(--danger)' }}>{error}</div> : null}

          <button className="btn" disabled={loading}>
            {loading ? 'Working…' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>
      </div>
      <div className="muted" style={{ marginTop: 10 }}>
        Backend: <span className="pill">{import.meta.env.VITE_API_URL}</span>
      </div>
    </div>
  );
}

