const { query } = require('../config/db');

function toBooking(row) {
  if (!row) return null;

  return {
    id: row.id,
    property_id: row.property_id,
    property_title: row.property_title,
    renter_id: row.renter_id,
    renter_name: row.renter_name,
    landlord_id: row.landlord_id,
    landlord_name: row.landlord_name,
    viewing_date: row.viewing_date,
    message: row.message,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function bookingSelect() {
  return `
    SELECT
      b.*,
      p.title AS property_title,
      p.landlord_id,
      renter.full_name AS renter_name,
      landlord.full_name AS landlord_name
    FROM bookings b
    JOIN properties p ON p.id = b.property_id
    LEFT JOIN users renter ON renter.id = b.renter_id
    LEFT JOIN users landlord ON landlord.id = p.landlord_id
  `;
}

async function create(data) {
  const rows = await query(
    `INSERT INTO bookings (property_id, renter_id, viewing_date, message, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [
      data.property_id,
      data.renter_id,
      data.viewing_date || null,
      data.message || null,
      data.status || 'pending',
    ],
  );

  return findById(rows[0].id);
}

async function findById(id) {
  const rows = await query(
    `${bookingSelect()}
     WHERE b.id = $1`,
    [id],
  );

  return toBooking(rows[0]);
}

async function listForUser(user) {
  const isLandlord = ['landlord', 'admin'].includes(user.role);
  const rows = await query(
    `${bookingSelect()}
     WHERE ${isLandlord ? 'p.landlord_id = $1' : 'b.renter_id = $1'}
     ORDER BY b.created_at DESC`,
    [user.id],
  );

  return rows.map(toBooking);
}

async function updateStatus(id, status) {
  const rows = await query(
    `UPDATE bookings
     SET status = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING id`,
    [id, status],
  );

  return rows[0] ? findById(id) : null;
}

module.exports = {
  create,
  findById,
  listForUser,
  updateStatus,
};
