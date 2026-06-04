const { query } = require('../config/db');

function toReport(row) {
  if (!row) return null;

  return {
    id: row.id,
    property_id: row.property_id,
    property_title: row.property_title,
    reporter_id: row.reporter_id,
    reporter_name: row.reporter_name,
    reporter_email: row.reporter_email,
    reason: row.reason,
    details: row.details,
    status: row.status,
    admin_notes: row.admin_notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function create(data) {
  const rows = await query(
    `INSERT INTO listing_reports (property_id, reporter_id, reason, details)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.property_id, data.reporter_id || null, data.reason, data.details || null],
  );

  return findById(rows[0].id);
}

async function findById(id) {
  const rows = await query(
    `SELECT lr.*, p.title AS property_title, u.full_name AS reporter_name, u.email AS reporter_email
     FROM listing_reports lr
     LEFT JOIN properties p ON p.id = lr.property_id
     LEFT JOIN users u ON u.id = lr.reporter_id
     WHERE lr.id = $1`,
    [id],
  );

  return toReport(rows[0]);
}

async function list({ status = 'new', limit = 100 } = {}) {
  const params = [];
  const where = [];

  if (status && status !== 'all') {
    params.push(status);
    where.push(`lr.status = $${params.length}`);
  }

  params.push(Math.min(Number(limit) || 100, 200));

  const rows = await query(
    `SELECT lr.*, p.title AS property_title, u.full_name AS reporter_name, u.email AS reporter_email
     FROM listing_reports lr
     LEFT JOIN properties p ON p.id = lr.property_id
     LEFT JOIN users u ON u.id = lr.reporter_id
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY lr.created_at DESC
     LIMIT $${params.length}`,
    params,
  );

  return rows.map(toReport);
}

async function updateStatus(id, status, adminNotes) {
  const rows = await query(
    `UPDATE listing_reports
     SET status = $2,
         admin_notes = COALESCE($3, admin_notes),
         updated_at = NOW()
     WHERE id = $1
     RETURNING id`,
    [id, status, adminNotes || null],
  );

  return rows[0] ? findById(id) : null;
}

module.exports = {
  create,
  findById,
  list,
  updateStatus,
};
