import { Router } from 'express';
import { register, login, me } from '../controllers/authController.js';
import auth from '../middleware/auth.js';
import { validate } from '../validators/validate.js';

const router = Router();

/** POST /api/auth/register - open a CRM account for a counselor (1 account per email id) */
router.post(
  '/register',
  validate([
    { field: 'name', msg: 'Name is required', max: 120 },
    { field: 'email', msg: 'A valid email is required', pattern: /^\S+@\S+\.\S+$/ },
    { field: 'password', msg: 'Password must be at least 8 characters', min: 8 },
  ]),
  register
);

/** POST /api/auth/login */
router.post(
  '/login',
  validate([
    { field: 'email', msg: 'A valid email is required', pattern: /^\S+@\S+\.\S+$/ },
    { field: 'password', msg: 'Password is required' },
  ]),
  login
);

/** GET /api/auth/me - requires JWT */
router.get('/me', auth, me);

export default router;
