const { query } = require('../config/db');
const { toClientProperty } = require('./Property');

async function listByUser(userId) {
  const rows = await query(
    `SELECT
       f.id AS favorite_id,
       f.created_at AS favorited_at,
       p.*,
       COALESCE(e.name, p.location) AS estate_name,
       u.full_name AS landlord_name,
       COALESCE(
         (
           SELECT pi.image_url
           FROM property_images pi
           WHERE pi.property_id = p.id
            AND (pi.image_data IS NOT NULL OR pi.image_url NOT LIKE '/api/properties/images/%')
           ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.created_at ASC
           LIMIT 1
         ),
         p.image_url
       ) AS image_url,
       COALESCE(AVG(r.rating), 0) AS average_rating,
       COUNT(r.id) AS review_count
     FROM favorites f
     JOIN properties p ON p.id = f.property_id
     LEFT JOIN estates e ON e.id = p.estate_id
     LEFT JOIN users u ON u.id = p.landlord_id
     LEFT JOIN reviews r ON r.property_id = p.id
     WHERE f.user_id = $1 AND p.deleted_at IS NULL
     GROUP BY f.id, p.id, e.name, u.full_name
     ORDER BY f.created_at DESC`,
    [userId],
  );

  return rows.map((row) => ({
    favorite_id: row.favorite_id,
    favorited_at: row.favorited_at,
    ...toClientProperty(row),
  }));
}

async function add(userId, propertyId) {
  const rows = await query(
    `INSERT INTO favorites (user_id, property_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, property_id)
     DO UPDATE SET created_at = favorites.created_at
     RETURNING id, user_id, property_id, created_at`,
    [userId, propertyId],
  );

  return rows[0];
}

async function remove(userId, propertyId) {
  const rows = await query(
    `DELETE FROM favorites
     WHERE user_id = $1 AND property_id = $2
     RETURNING id`,
    [userId, propertyId],
  );

  return rows[0] || null;
}

module.exports = {
  add,
  listByUser,
  remove,
};
