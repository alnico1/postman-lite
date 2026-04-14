import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAuthToken } from '../lib/api.js';

const AuthCtx = createContext(null);

const LS_KEY = 'api-tester.auth';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.token) {
        setToken(parsed.token);
        setAuthToken(parsed.token);
        setUser(parsed.user ?? null);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (token) localStorage.setItem(LS_KEY, JSON.stringify({ token, user }));
    else localStorage.removeItem(LS_KEY);
  }, [token, user]);

  async function register(email, password) {
    const { data } = await api.post('/auth/register', { email, password });
    setToken(data.token);
    setAuthToken(data.token);
    setUser(data.user);
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.token);
    setAuthToken(data.token);
    setUser(data.user);
  }

  function logout() {
    setToken(null);
    setAuthToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ token, user, register, login, logout, isAuthed: Boolean(token) }),
    [token, user]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const v = useContext(AuthCtx);
  if (!v) throw new Error('useAuth must be used within AuthProvider');
  return v;
}

