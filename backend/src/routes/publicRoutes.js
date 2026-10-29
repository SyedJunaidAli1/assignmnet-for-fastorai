import { Router } from 'express';
import { submitLead, listLeadsForForm } from '../controllers/publicController.js';
import { validate } from '../validators/validate.js';

const router = Router();

// NOTE: no auth middleware here - the enquiry form must be reachable by
// anyone (shared link / online campaign).

/** POST /api/public/leads - enquiry form submission */
router.post(
  '/leads',
  validate([
    { field: 'name', msg: 'Name is required', max: 120 },
    { field: 'email', msg: 'A valid email is required', pattern: /^\S+@\S+\.\S+$/ },
    { field: 'phone', msg: 'Phone is too long', max: 20, optional: true },
    { field: 'courseInterest', msg: 'Course interest is required', max: 120 },
    { field: 'message', msg: 'Message is too long', max: 1000, optional: true },
  ]),
  submitLead
);

/** GET /api/public/leads - whitelisted listing for the shared form page */
router.get('/leads', listLeadsForForm);

export default router;
