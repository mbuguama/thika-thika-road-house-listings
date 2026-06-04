const { query } = require('../config/db');

async function list() {
  return query(
    `SELECT id, name, description, city, latitude, longitude, created_at, updated_at
     FROM estates
     ORDER BY name ASC`,
  );
}

async function findById(id) {
  const rows = await query(
    `SELECT id, name, description, city, latitude, longitude, created_at, updated_at
     FROM estates
     WHERE id = $1`,
    [id],
  );

  return rows[0] || null;
}

async function create(data) {
  const rows = await query(
    `INSERT INTO estates (name, description, city, latitude, longitude)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, description, city, latitude, longitude, created_at, updated_at`,
    [
      data.name,
      data.description || null,
      data.city || 'Thika',
      data.latitude || null,
      data.longitude || null,
    ],
  );

  return rows[0];
}

module.exports = {
  create,
  findById,
  list,
};
