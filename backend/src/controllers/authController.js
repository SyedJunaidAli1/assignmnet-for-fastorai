import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const signToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    algorithm: 'HS256',
  });

/** POST /api/auth/register - open a CRM account for a counselor (1 account per email id) */
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ name, email, passwordHash });

    return res.status(201).json({
      success: true,
      message: 'Account created. Please log in.',
      user,
    });
  } catch (err) {
    return next(err); // duplicate key -> 409 via errorHandler
  }
}

/** POST /api/auth/login - returns the JWT for the counselor's CRM account */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    return res.json({
      success: true,
      token: signToken(user._id),
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      user,
    });
  } catch (err) {
    return next(err);
  }
}

/** GET /api/auth/me - profile of the logged-in counselor */
export function me(req, res) {
  return res.json({ success: true, user: req.user });
}
