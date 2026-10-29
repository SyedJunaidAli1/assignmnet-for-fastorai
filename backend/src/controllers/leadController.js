/**
 * Counselor-facing lead APIs (all require JWT):
 *   GET  /api/leads/public   -> unclaimed enquiries, visible to every counselor
 *   POST /api/leads/:id/claim-> assign an enquiry to the logged-in counselor
 *   GET  /api/leads/mine     -> enquiries this counselor has claimed
 */
import Lead from '../models/leadModel.js';

const LEAD_FIELDS = 'name email phone courseInterest message status claimedBy claimedAt createdAt updatedAt';

/** GET /api/leads/public - the shared pool of enquiries nobody has claimed yet */
export async function listPublicLeads(_req, res, next) {
  try {
    const leads = await Lead.find({ status: 'unclaimed' })
      .select(LEAD_FIELDS)
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/leads/:id/claim
 * Atomically flips an unclaimed enquiry to claimed by the current counselor.
 * After claiming, the enquiry is private: hidden from the public pool and
 * from every other counselor.
 */
export async function claimLead(req, res, next) {
  try {
    const claim = {
      status: 'claimed',
      claimedBy: req.user._id,
      claimedAt: new Date(),
    };

    // Atomic + race-safe: the update only matches a lead that is still unclaimed
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, status: 'unclaimed' },
      { $set: claim },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(409).json({
        success: false,
        error: 'This enquiry has already been claimed or was deleted',
      });
    }

    return res.json({
      success: true,
      message: `Enquiry claimed successfully. It is now private to ${req.user.email}.`,
      lead,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid lead id' });
    }
    return next(err);
  }
}

/** GET /api/leads/mine - private enquiries of the logged-in counselor */
export async function listMyLeads(req, res, next) {
  try {
    const leads = await Lead.find({ claimedBy: req.user._id })
      .select(LEAD_FIELDS)
      .sort({ claimedAt: -1 });

    return res.json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (err) {
    return next(err);
  }
}
