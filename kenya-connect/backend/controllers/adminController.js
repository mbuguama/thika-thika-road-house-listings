const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const getPagination = require('../utils/pagination');
const { cleanString } = require('../utils/sanitize');

const dashboard = asyncHandler(async (req, res) => {
  const [users, activeUsers, matches, messages, towns] = await Promise.all([
    query("SELECT COUNT(*)::int AS count FROM users WHERE created_at >= NOW() - INTERVAL '1 day'"),
    query("SELECT COUNT(*)::int AS count FROM profiles WHERE last_active_at >= NOW() - INTERVAL '1 day'"),
    query("SELECT COUNT(*)::int AS count FROM matches WHERE matched_at >= NOW() - INTERVAL '1 day'"),
    query("SELECT COUNT(*)::int AS count FROM messages WHERE created_at >= NOW() - INTERVAL '1 day'"),
    query('SELECT town, COUNT(*)::int AS count FROM profiles GROUP BY town ORDER BY count DESC LIMIT 8'),
  ]);

  res.json({
    analytics: {
      daily_registrations: users[0].count,
      active_users: activeUsers[0].count,
      matches_created: matches[0].count,
      messages_sent: messages[0].count,
      popular_towns: towns,
    },
  });
});

const listUsers = asyncHandler(async (req, res) => {
  const { limit, offset, page } = getPagination(req.query);
  const rows = await query(
    `SELECT u.id, u.email, u.role, u.status, u.is_email_verified, u.is_phone_verified, u.created_at,
            p.display_name, p.town, p.age, p.verification_badge
     FROM users u
     LEFT JOIN profiles p ON p.user_id = u.id
     ORDER BY u.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
  res.json({ users: rows, page, limit });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const status = cleanString(req.body.status, 20);
  if (!['active', 'suspended', 'banned'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status.');
  }

  const rows = await query('UPDATE users SET status = $1 WHERE id = $2 RETURNING id, email, status', [status, req.params.id]);
  await query(
    `INSERT INTO admin_logs (admin_id, action, target_type, target_id, metadata)
     VALUES ($1, 'update_user_status', 'user', $2, $3::jsonb)`,
    [req.user.id, req.params.id, JSON.stringify({ status })],
  );
  res.json({ user: rows[0] });
});

const verifyProfile = asyncHandler(async (req, res) => {
  const badge = cleanString(req.body.badge || 'full', 20);
  const rows = await query(
    `UPDATE profiles SET verification_badge = $1 WHERE id = $2 RETURNING *`,
    [badge, req.params.profileId],
  );
  res.json({ profile: rows[0] });
});

const listReports = asyncHandler(async (req, res) => {
  const rows = await query('SELECT * FROM reports ORDER BY created_at DESC LIMIT 100');
  res.json({ reports: rows });
});

const updateReport = asyncHandler(async (req, res) => {
  const status = cleanString(req.body.status, 20);
  if (!['open', 'reviewing', 'resolved', 'dismissed'].includes(status)) {
    res.status(400);
    throw new Error('Invalid report status.');
  }
  const rows = await query('UPDATE reports SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
  res.json({ report: rows[0] });
});

module.exports = {
  dashboard,
  listReports,
  listUsers,
  updateReport,
  updateUserStatus,
  verifyProfile,
};
