const { query } = require('../config/db');

function normaliseRole(role) {
  if (role === 'user') return 'renter';
  return ['renter', 'landlord', 'admin'].includes(role) ? role : 'renter';
}

function toPublicUser(row) {
  if (!row) return null;

  return {
    id: row.id,
    full_name: row.full_name,
    name: row.full_name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    phone_verified: row.phone_verified,
    landlord_verification_status: row.landlord_verification_status,
    id_number: row.id_number,
    id_document_url: row.id_document_url,
    ownership_document_url: row.ownership_document_url,
    verification_notes: row.verification_notes,
    landlord_verified_at: row.landlord_verified_at,
    privacy_consent_at: row.privacy_consent_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function findById(id, options = {}) {
  const rows = await query('SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL', [id]);
  const user = rows[0];
  return options.includePassword ? user : toPublicUser(user);
}

async function findByEmail(email, options = {}) {
  const rows = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND deleted_at IS NULL', [email]);
  const user = rows[0];
  return options.includePassword ? user : toPublicUser(user);
}

async function create(data) {
  const rows = await query(
    `INSERT INTO users (full_name, email, password_hash, phone, role, privacy_consent_at)
     VALUES ($1, LOWER($2), $3, $4, $5, $6)
     RETURNING *`,
    [
      data.full_name || data.name,
      data.email,
      data.password_hash,
      data.phone || null,
      normaliseRole(data.role),
      data.privacy_consent_at || null,
    ],
  );

  return toPublicUser(rows[0]);
}

async function update(id, data) {
  const rows = await query(
    `UPDATE users
     SET full_name = COALESCE($2, full_name),
         email = COALESCE(LOWER($3), email),
         phone = COALESCE($4, phone),
         role = COALESCE($5, role),
         updated_at = NOW()
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING *`,
    [
      id,
      data.full_name || data.name || null,
      data.email || null,
      data.phone || null,
      data.role ? normaliseRole(data.role) : null,
    ],
  );

  return toPublicUser(rows[0]);
}

async function list({ limit = 50, offset = 0, role } = {}) {
  const params = [];
  const where = ['deleted_at IS NULL'];

  if (role) {
    params.push(normaliseRole(role));
    where.push(`role = $${params.length}`);
  }

  params.push(limit);
  params.push(offset);

  const rows = await query(
    `SELECT * FROM users
     WHERE ${where.join(' AND ')}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );

  return rows.map(toPublicUser);
}

async function remove(id) {
  const rows = await query(
    `UPDATE users
     SET deleted_at = NOW(), updated_at = NOW()
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING *`,
    [id],
  );

  return toPublicUser(rows[0]);
}

async function submitLandlordVerification(id, data) {
  const rows = await query(
    `UPDATE users
     SET phone = COALESCE($2, phone),
         phone_verified = COALESCE($3, phone_verified),
         id_number = COALESCE($4, id_number),
         id_document_url = NULL,
         ownership_document_url = NULL,
         verification_notes = NULL,
         landlord_verification_status = 'pending',
         updated_at = NOW()
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING *`,
    [
      id,
      data.phone || null,
      data.phone_verified === undefined ? null : Boolean(data.phone_verified),
      data.id_number || null,
    ],
  );

  return toPublicUser(rows[0]);
}

async function updateLandlordVerification(id, status, notes) {
  const verifiedAt = status === 'approved' ? 'NOW()' : 'NULL';
  const rows = await query(
    `UPDATE users
     SET landlord_verification_status = $2,
         landlord_verified_at = ${verifiedAt},
         verification_notes = COALESCE($3, verification_notes),
         phone_verified = CASE WHEN $2 = 'approved' THEN TRUE ELSE phone_verified END,
         updated_at = NOW()
     WHERE id = $1 AND deleted_at IS NULL
     RETURNING *`,
    [id, status, notes || null],
  );

  return toPublicUser(rows[0]);
}

async function listVerificationQueue(status = 'pending') {
  const params = [];
  const where = ["role IN ('landlord', 'admin')", 'deleted_at IS NULL'];

  if (status && status !== 'all') {
    params.push(status);
    where.push(`landlord_verification_status = $${params.length}`);
  }

  const rows = await query(
    `SELECT * FROM users
     WHERE ${where.join(' AND ')}
     ORDER BY updated_at DESC`,
    params,
  );

  return rows.map(toPublicUser);
}

module.exports = {
  create,
  findByEmail,
  findById,
  list,
  listVerificationQueue,
  remove,
  submitLandlordVerification,
  toPublicUser,
  update,
  updateLandlordVerification,
};
