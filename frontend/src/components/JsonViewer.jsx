import React, { useMemo, useState } from 'react';

function stringify(value) {
  try {
    if (typeof value === 'string') return value;
    return JSON.stringify(value ?? null, null, 2);
  } catch {
    return String(value);
  }
}

export default function JsonViewer({ value }) {
  const text = useMemo(() => stringify(value), [value]);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {
      // ignore
    }
  }

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontWeight: 800 }}>Response</div>
        <button className="btn secondary" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="code">{text}</div>
    </div>
  );
}

