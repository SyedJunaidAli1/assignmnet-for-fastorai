import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

/** Verifies the Bearer JWT and loads the logged-in counselor onto req.user. */
export default async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Missing or invalid Authorization header. Expected: Bearer <token>' });
    }

    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET, { algorithms: ['HS256'] });
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Account no longer exists' });
    }

    req.user = user;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired, please log in again' });
    }
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
}
