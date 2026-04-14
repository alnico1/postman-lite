import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

function getErrorMessage(e) {
  return e?.response?.data?.error || e?.message || 'Something went wrong';
}

export default function EnvPage() {
  const [items, setItems] = useState([]);
  const [keyName, setKeyName] = useState('');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/env');
      setItems(data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function upsert() {
    setError('');
    if (!keyName.trim()) return;
    try {
      await api.post('/env', { key: keyName.trim(), value });
      setKeyName('');
      setValue('');
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  return (
    <div className="card">
      <div className="rowWrap" style={{ justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Environment Variables</div>
          <div className="muted">
            Use in URL/headers/body like <span className="pill">{'{{base_url}}'}</span>
          </div>
        </div>
        <button className="btn secondary" onClick={load} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error ? (
        <div className="pill" style={{ borderColor: 'var(--danger)', marginTop: 10 }}>
          {error}
        </div>
      ) : null}

      <div className="rowWrap" style={{ marginTop: 12 }}>
        <input
          className="input"
          placeholder="Key (alphanumeric/underscore)"
          value={keyName}
          onChange={(e) => setKeyName(e.target.value)}
        />
        <input className="input" placeholder="Value" value={value} onChange={(e) => setValue(e.target.value)} />
        <button className="btn" onClick={upsert}>
          Save
        </button>
      </div>

      <div className="col" style={{ marginTop: 12 }}>
        {items.map((v) => (
          <div key={v.id} className="historyItem" style={{ cursor: 'default' }}>
            <div className="rowWrap" style={{ justifyContent: 'space-between' }}>
              <div className="rowWrap">
                <span className="pill">{v.key}</span>
                <span className="muted" style={{ wordBreak: 'break-word' }}>
                  {v.value}
                </span>
              </div>
              <span className="muted">Updated {new Date(v.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
        {items.length === 0 ? <div className="muted">No env vars yet.</div> : null}
      </div>
    </div>
  );
}

