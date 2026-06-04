const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const getPagination = require('../utils/pagination');

const listNotifications = asyncHandler(async (req, res) => {
  const { limit, offset, page } = getPagination(req.query);
  const rows = await query(
    `SELECT * FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [req.user.id, limit, offset],
  );
  res.json({ notifications: rows, page, limit });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const rows = await query(
    `UPDATE notifications SET read_at = NOW()
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [req.params.id, req.user.id],
  );
  res.json({ notification: rows[0] || null });
});

module.exports = {
  listNotifications,
  markNotificationRead,
};
