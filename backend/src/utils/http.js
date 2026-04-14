export function isPlainObject(v) {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function normalizeHeaders(headers) {
  if (!headers) return {};
  if (!isPlainObject(headers)) return {};
  const out = {};
  for (const [k, v] of Object.entries(headers)) {
    if (!k) continue;
    if (typeof v === 'undefined' || v === null) continue;
    out[String(k)] = String(v);
  }
  return out;
}

export function safeJsonParse(str) {
  try {
    return { ok: true, value: JSON.parse(str) };
  } catch (e) {
    return { ok: false, error: e };
  }
}

