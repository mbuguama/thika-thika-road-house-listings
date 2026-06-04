const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { cleanString } = require('../utils/sanitize');

const createReport = asyncHandler(async (req, res) => {
  const rows = await query(
    `INSERT INTO reports (reporter_id, reported_user_id, reported_profile_id, reason, details)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      req.user.id,
      req.body.reported_user_id || null,
      req.body.reported_profile_id || null,
      cleanString(req.body.reason, 120),
      cleanString(req.body.details, 1000),
    ],
  );
  res.status(201).json({ report: rows[0] });
});

module.exports = {
  createReport,
};
