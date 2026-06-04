const { query } = require('../config/db');
const { randomUUID } = require('crypto');

async function listByProperty(propertyId) {
  return query(
    `SELECT id, property_id, image_url, public_id, caption, is_primary, sort_order, created_at
     FROM property_images
     WHERE property_id = $1
       AND (image_data IS NOT NULL OR image_url NOT LIKE '/api/properties/images/%')
     ORDER BY is_primary DESC, sort_order ASC, created_at ASC`,
    [propertyId],
  );
}

async function create(data) {
  const id = data.id || randomUUID();
  const imageUrl = data.image_url || `/api/properties/images/${id}`;
  const imageDataBase64 = data.image_data ? Buffer.from(data.image_data).toString('base64') : null;
  const rows = await query(
    `INSERT INTO property_images (
       id, property_id, image_url, public_id, caption, is_primary, sort_order,
       image_data, mime_type, file_size
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, decode($8::text, 'base64'), $9, $10)
     RETURNING id, property_id, image_url, public_id, caption, is_primary, sort_order, created_at`,
    [
      id,
      data.property_id,
      imageUrl,
      data.public_id || null,
      data.caption || null,
      Boolean(data.is_primary),
      Number(data.sort_order || 0),
      imageDataBase64,
      data.mime_type || null,
      data.file_size || null,
    ],
  );

  return rows[0];
}

async function findFileById(id) {
  const rows = await query(
    `SELECT id, image_data, mime_type, file_size, caption, created_at
     FROM property_images
     WHERE id = $1 AND image_data IS NOT NULL`,
    [id],
  );

  return rows[0] || null;
}

async function remove(id) {
  const rows = await query('DELETE FROM property_images WHERE id = $1 RETURNING id', [id]);
  return rows[0] || null;
}

module.exports = {
  create,
  findFileById,
  listByProperty,
  remove,
};
