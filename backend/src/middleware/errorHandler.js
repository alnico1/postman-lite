export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Not found' });
}

export function errorHandler(err, req, res, next) {
  const status = Number(err?.statusCode ?? err?.status ?? 500);
  const message = err?.message ?? 'Internal server error';

  if (status >= 500) {
    // Avoid leaking sensitive details
    console.error(err);
  }

  res.status(status).json({ error: message });
}

