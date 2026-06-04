const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const getMyAccount = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT u.id, u.email, u.role, u.status, u.is_email_verified, u.is_phone_verified, u.created_at,
            s.plan, s.status AS subscription_status
     FROM users u
     LEFT JOIN subscriptions s ON s.user_id = u.id
     WHERE u.id = $1
     LIMIT 1`,
    [req.user.id],
  );
  res.json({ account: rows[0] });
});

const deactivateMyAccount = asyncHandler(async (req, res) => {
  await query("UPDATE users SET status = 'deleted' WHERE id = $1", [req.user.id]);
  res.json({ ok: true });
});

module.exports = {
  deactivateMyAccount,
  getMyAccount,
};
