/**
 * Public, unauthenticated endpoints (the enquiry form lives here):
 *   POST /api/public/leads -> prospective client submits basic details
 *   GET  /api/public/leads -> whitelisted enquiry data for a shared form page
 */

import Lead from '../models/leadModel.js';

/**
 * POST /api/public/leads
 * Enquiry form submitted by a prospective client (via a shared link or
 * an online campaign). Creates an UNCLAIMED enquiry visible to all counselors.
 */
export async function submitLead(req, res, next) {
  try {
    const { name, email, phone, courseInterest, message } = req.body;
    const lead = await Lead.create({
      name,
      email,
      phone,
      courseInterest,
      message,
      status: 'unclaimed',
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your enquiry has been received. A counselor will contact you soon.',
      lead: lead.toPublicJSON(),
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/public/leads
 * Public listing used by the shared enquiry/landing page. Only whitelisted
 * fields are returned; internal claim data is never exposed.
 */
export async function listLeadsForForm(_req, res, next) {
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 }).limit(50);
    return res.json({
      success: true,
      count: leads.length,
      leads: leads.map((lead) => lead.toPublicJSON()),
    });
  } catch (err) {
    return next(err);
  }
}
