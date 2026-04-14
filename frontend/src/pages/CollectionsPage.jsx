import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

function getErrorMessage(e) {
  return e?.response?.data?.error || e?.message || 'Something went wrong';
}

export default function CollectionsPage() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/collections');
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

  async function create() {
    setError('');
    if (!name.trim()) return;
    try {
      await api.post('/collections', { name: name.trim() });
      setName('');
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  async function remove(id) {
    setError('');
    try {
      await api.delete(`/collections/${id}`);
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  return (
    <div className="card">
      <div className="rowWrap" style={{ justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Collections</div>
          <div className="muted">Group requests into collections (like Postman).</div>
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
        <input className="input" placeholder="New collection name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn" onClick={create}>
          Create
        </button>
      </div>

      <div className="col" style={{ marginTop: 12 }}>
        {items.map((c) => (
          <div key={c.id} className="historyItem" style={{ cursor: 'default' }}>
            <div className="rowWrap" style={{ justifyContent: 'space-between' }}>
              <div className="rowWrap">
                <span className="pill">{c.name}</span>
                <span className="muted">{c._count?.requests ?? 0} requests</span>
              </div>
              <button className="btn danger" onClick={() => remove(c.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 ? <div className="muted">No collections.</div> : null}
      </div>
    </div>
  );
}

