/**
 * Tiny hand-rolled validator - no extra packages needed.
 *
 *   validate([{ field: 'name', msg: '...' },
 *             { field: 'email', pattern: /.../, msg: '...' },
 *             { field: 'password', min: 8, msg: '...' },
 *             { field: 'phone', optional: true }])
 *
 * Trims every listed field, then fails (400) with the given message on the
 * first rule that does not pass. Attaches the cleaned body values back to
 * req.body for the controller.
 */
export function validate(rules) {
  return (req, res, next) => {
    for (const rule of rules) {
      const raw = req.body[rule.field];
      const value = typeof raw === 'string' ? raw.trim() : '';
      req.body[rule.field] = value;

      if (rule.optional && value === '') continue;
      if (!value) {
        return res.status(400).json({ success: false, error: rule.msg });
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        return res.status(400).json({ success: false, error: rule.msg });
      }
      if (rule.min && value.length < rule.min) {
        return res.status(400).json({ success: false, error: rule.msg });
      }
      if (rule.max && value.length > rule.max) {
        return res.status(400).json({ success: false, error: rule.msg });
      }
    }
    return next();
  };
}
