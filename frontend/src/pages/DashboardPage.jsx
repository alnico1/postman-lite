import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import JsonViewer from '../components/JsonViewer.jsx';
import { useAuth } from '../state/auth.jsx';
import { useTheme } from '../state/theme.jsx';

function statusClass(code) {
  if (code >= 200 && code < 300) return 'statusGood';
  if (code >= 300 && code < 400) return 'statusWarn';
  if (code >= 400) return 'statusBad';
  return '';
}

function safeParseJson(text) {
  if (!text) return { ok: true, value: null };
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: e };
  }
}

function getErrorMessage(e) {
  return e?.response?.data?.error || e?.message || 'Something went wrong';
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [history, setHistory] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://httpbin.org/get');
  const [headersText, setHeadersText] = useState('{\n  "Accept": "application/json"\n}');
  const [bodyText, setBodyText] = useState('{\n  "hello": "world"\n}');
  const [collectionId, setCollectionId] = useState('');

  const [lastResponse, setLastResponse] = useState(null);

  async function load() {
    setLoadingHistory(true);
    setError('');
    try {
      const [h, c] = await Promise.all([api.get('/requests'), api.get('/collections')]);
      setHistory(h.data);
      setCollections(c.data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parsedHeaders = useMemo(() => safeParseJson(headersText), [headersText]);
  const parsedBody = useMemo(() => safeParseJson(bodyText), [bodyText]);

  async function send() {
    setError('');
    if (!parsedHeaders.ok) return setError('Headers must be valid JSON');
    if (!parsedBody.ok) return setError('Body must be valid JSON');

    setSending(true);
    try {
      const payload = {
        method,
        url,
        headers: parsedHeaders.value ?? {},
        body: method === 'GET' || method === 'DELETE' ? null : parsedBody.value ?? null,
        collectionId: collectionId || undefined
      };
      const { data } = await api.post('/requests/send', payload);
      setLastResponse(data);
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSending(false);
    }
  }

  async function loadFromHistory(id) {
    setError('');
    try {
      const { data } = await api.get(`/requests/${id}`);
      setMethod(data.method);
      setUrl(data.url);
      setHeadersText(JSON.stringify(data.headers ?? {}, null, 2));
      setBodyText(JSON.stringify(data.body ?? null, null, 2));
      setCollectionId(data.collectionId ?? '');
      setLastResponse(data);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  return (
    <div className="appShell">
      <div className="sidebar">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontWeight: 900 }}>History</div>
          <button className="btn secondary" onClick={load} disabled={loadingHistory}>
            {loadingHistory ? 'Loading…' : 'Refresh'}
          </button>
        </div>
        <div className="muted" style={{ marginBottom: 8 }}>
          Click an item to reload request.
        </div>
        <div className="col" style={{ gap: 8, overflow: 'auto', maxHeight: 'calc(100vh - 140px)' }}>
          {history.map((h) => (
            <div key={h.id} className="historyItem" onClick={() => loadFromHistory(h.id)}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div className="pill">{h.method}</div>
                <div className={`pill ${statusClass(h.statusCode ?? 0)}`}>{h.statusCode ?? '-'}</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, wordBreak: 'break-word' }}>{h.url}</div>
              <div className="muted">{new Date(h.createdAt).toLocaleString()}</div>
            </div>
          ))}
          {history.length === 0 ? <div className="muted">No requests yet.</div> : null}
        </div>
      </div>

      <div className="main">
        <div className="topbar">
          <div className="rowWrap">
            <div style={{ fontWeight: 900 }}>API Tester</div>
            <span className="pill">{user?.email}</span>
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

        {error ? (
          <div className="card" style={{ borderColor: 'var(--danger)', marginBottom: 12 }}>
            <div style={{ fontWeight: 800 }}>Error</div>
            <div className="muted">{error}</div>
          </div>
        ) : null}

        <div className="card" style={{ marginBottom: 12 }}>
          <div className="rowWrap" style={{ alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="muted">Method</div>
              <select className="select" value={method} onChange={(e) => setMethod(e.target.value)}>
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
              </select>
            </div>
            <div style={{ flex: 4, minWidth: 280 }}>
              <div className="muted">URL (supports {'{{var}}'})</div>
              <input className="input" value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
            <div style={{ flex: 2, minWidth: 220 }}>
              <div className="muted">Collection (optional)</div>
              <select className="select" value={collectionId} onChange={(e) => setCollectionId(e.target.value)}>
                <option value="">—</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c._count?.requests ?? 0})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <button className="btn" onClick={send} disabled={sending}>
                {sending ? 'Sending…' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>

        <div className="split">
          <div className="card">
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Headers (JSON)</div>
            <textarea className="textarea" value={headersText} onChange={(e) => setHeadersText(e.target.value)} />
            {!parsedHeaders.ok ? <div className="muted" style={{ color: 'var(--danger)' }}>Invalid JSON</div> : null}
          </div>
          <div className="card">
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Body (JSON)</div>
            <textarea className="textarea" value={bodyText} onChange={(e) => setBodyText(e.target.value)} />
            {!parsedBody.ok ? <div className="muted" style={{ color: 'var(--danger)' }}>Invalid JSON</div> : null}
            <div className="muted" style={{ marginTop: 6 }}>
              For GET/DELETE, body is not sent.
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          {lastResponse ? (
            <div className="col" style={{ gap: 12 }}>
              <div className="card">
                <div className="rowWrap" style={{ justifyContent: 'space-between' }}>
                  <div className="rowWrap">
                    <span className="pill">{lastResponse.method}</span>
                    <span className="pill">{lastResponse.url}</span>
                    <span className={`pill ${statusClass(lastResponse.statusCode ?? 0)}`}>
                      Status: {lastResponse.statusCode ?? '-'}
                    </span>
                  </div>
                  <span className="muted">{new Date(lastResponse.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <JsonViewer value={lastResponse.response} />
            </div>
          ) : (
            <div className="muted" style={{ marginTop: 8 }}>
              Send a request to see the response.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

