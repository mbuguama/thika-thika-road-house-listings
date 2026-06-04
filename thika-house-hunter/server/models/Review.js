const { query } = require('../config/db');

function toReview(row) {
  if (!row) return null;

  return {
    id: row.id,
    property_id: row.property_id,
    user_id: row.user_id,
    user_name: row.user_name,
    rating: Number(row.rating),
    comment: row.comment,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function listByProperty(propertyId) {
  const rows = await query(
    `SELECT r.*, u.full_name AS user_name
     FROM reviews r
     LEFT JOIN users u ON u.id = r.user_id
     WHERE r.property_id = $1
     ORDER BY r.created_at DESC`,
    [propertyId],
  );

  return rows.map(toReview);
}

async function create(data) {
  const rows = await query(
    `INSERT INTO reviews (property_id, user_id, rating, comment)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      data.property_id,
      data.user_id,
      Number(data.rating),
      data.comment || null,
    ],
  );

  return findById(rows[0].id);
}

async function findById(id) {
  const rows = await query(
    `SELECT r.*, u.full_name AS user_name
     FROM reviews r
     LEFT JOIN users u ON u.id = r.user_id
     WHERE r.id = $1`,
    [id],
  );

  return toReview(rows[0]);
}

async function update(id, data) {
  const rows = await query(
    `UPDATE reviews
     SET rating = COALESCE($2, rating),
         comment = COALESCE($3, comment),
         updated_at = NOW()
     WHERE id = $1
     RETURNING id`,
    [
      id,
      data.rating === undefined ? null : Number(data.rating),
      data.comment || null,
    ],
  );

  return rows[0] ? findById(id) : null;
}

async function remove(id) {
  const rows = await query('DELETE FROM reviews WHERE id = $1 RETURNING id', [id]);
  return rows[0] || null;
}

module.exports = {
  create,
  findById,
  listByProperty,
  remove,
  update,
};
