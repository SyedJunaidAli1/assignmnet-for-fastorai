import { Router } from 'express';
import { listPublicLeads, claimLead, listMyLeads } from '../controllers/leadController.js';
import auth from '../middleware/auth.js';

const router = Router();

// Everything here requires a valid JWT: these are counselor-only views.
router.use(auth);

/** GET /api/leads/public - unclaimed enquiries visible to every counselor */
router.get('/public', listPublicLeads);

/** GET /api/leads/mine - enquiries claimed by the logged-in counselor */
router.get('/mine', listMyLeads);

/** POST /api/leads/:id/claim - claim an enquiry -> becomes private */
router.post('/:id/claim', claimLead);

export default router;
