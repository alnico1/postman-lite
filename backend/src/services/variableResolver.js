const VAR_RE = /\{\{([a-zA-Z0-9_]+)\}\}/g;

export function resolveTemplateString(input, envMap) {
  if (typeof input !== 'string') return input;
  return input.replace(VAR_RE, (_, key) => {
    if (Object.prototype.hasOwnProperty.call(envMap, key)) return String(envMap[key]);
    return '';
  });
}

export function resolveHeaders(headers, envMap) {
  if (!headers || typeof headers !== 'object') return headers;
  const out = {};
  for (const [k, v] of Object.entries(headers)) {
    out[resolveTemplateString(k, envMap)] = resolveTemplateString(String(v), envMap);
  }
  return out;
}

export function resolveBody(body, envMap) {
  if (body === null || typeof body === 'undefined') return body;
  if (typeof body === 'string') return resolveTemplateString(body, envMap);
  if (Array.isArray(body)) return body.map((v) => resolveBody(v, envMap));
  if (typeof body === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(body)) {
      out[resolveTemplateString(k, envMap)] = resolveBody(v, envMap);
    }
    return out;
  }
  return body;
}

export function resolveRequest({ url, headers, body }, envMap) {
  return {
    url: resolveTemplateString(url, envMap),
    headers: resolveHeaders(headers, envMap),
    body: resolveBody(body, envMap)
  };
}

