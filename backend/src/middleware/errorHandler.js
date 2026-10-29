/** Central error handler - keeps API responses in a single shape. */
export default function errorHandler(err, _req, res, _next) {
  console.error(`[error] ${err.status || 500}: ${err.message}`);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, error: 'Malformed JSON body' });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, error: messages.join('; ') });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, error: 'Invalid id format' });
  }

  if (err.code === 11000) {
    return res.status(409).json({ success: false, error: 'Email is already registered' });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  if (status === 500) console.error(err);
  return res.status(status).json({ success: false, error: message });
}
