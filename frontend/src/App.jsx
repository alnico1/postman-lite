import React from 'react';
import { Navigate, Route, Routes, Link, useLocation } from 'react-router-dom';
import { useAuth } from './state/auth.jsx';
import { useTheme } from './state/theme.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import CollectionsPage from './pages/CollectionsPage.jsx';
import EnvPage from './pages/EnvPage.jsx';

function RequireAuth({ children }) {
  const { isAuthed } = useAuth();
  const loc = useLocation();
  if (!isAuthed) return <Navigate to="/auth" replace state={{ from: loc.pathname }} />;
  return children;
}

function Shell({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <div className="main">
      <div className="topbar">
        <div className="rowWrap">
          <div style={{ fontWeight: 800 }}>API Tester</div>
          <span className="pill">{user?.email}</span>
          <Link className="pill" to="/dashboard">
            Dashboard
          </Link>
          <Link className="pill" to="/collections">
            Collections
          </Link>
          <Link className="pill" to="/env">
            Environments
          </Link>
        </div>
        <div className="rowWrap">
          <button className="btn secondary" onClick={toggle}>
            Theme: {theme}
          </button>
          <button className="btn danger" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function App() {
  const { isAuthed } = useAuth();
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/collections"
        element={
          <RequireAuth>
            <Shell>
              <CollectionsPage />
            </Shell>
          </RequireAuth>
        }
      />
      <Route
        path="/env"
        element={
          <RequireAuth>
            <Shell>
              <EnvPage />
            </Shell>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to={isAuthed ? '/dashboard' : '/auth'} replace />} />
    </Routes>
  );
}

