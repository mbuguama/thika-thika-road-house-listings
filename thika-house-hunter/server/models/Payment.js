const { query } = require('../config/db');

function toClientPayment(row) {
  if (!row) return null;

  return {
    id: row.id,
    user_id: row.user_id,
    property_id: row.property_id,
    property_title: row.property_title,
    purpose: row.purpose,
    provider: row.provider,
    amount: Number(row.amount || 0),
    currency: row.currency,
    phone: row.phone,
    status: row.status,
    account_reference: row.account_reference,
    description: row.description,
    merchant_request_id: row.merchant_request_id,
    checkout_request_id: row.checkout_request_id,
    mpesa_receipt_number: row.mpesa_receipt_number,
    transaction_date: row.transaction_date,
    result_code: row.result_code,
    result_description: row.result_description,
    metadata: row.metadata || {},
    applied_at: row.applied_at,
    paid_at: row.paid_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function create(data) {
  const rows = await query(
    `INSERT INTO payments (
       user_id, property_id, purpose, provider, amount, currency, phone, status,
       account_reference, description, metadata
     )
     VALUES ($1, $2, $3, 'mpesa', $4, 'KES', $5, 'pending', $6, $7, $8::jsonb)
     RETURNING *`,
    [
      data.user_id,
      data.property_id || null,
      data.purpose,
      Number(data.amount),
      data.phone || null,
      data.account_reference,
      data.description,
      JSON.stringify(data.metadata || {}),
    ],
  );

  return toClientPayment(rows[0]);
}

async function findById(id) {
  const rows = await query(
    `SELECT py.*, p.title AS property_title
     FROM payments py
     LEFT JOIN properties p ON p.id = py.property_id
     WHERE py.id = $1`,
    [id],
  );

  return toClientPayment(rows[0]);
}

async function findRawById(id) {
  const rows = await query('SELECT * FROM payments WHERE id = $1', [id]);
  return rows[0] || null;
}

async function findRawByCheckoutRequestId(checkoutRequestId) {
  const rows = await query('SELECT * FROM payments WHERE checkout_request_id = $1', [checkoutRequestId]);
  return rows[0] || null;
}

async function listForUser(userId, { limit = 20 } = {}) {
  const rows = await query(
    `SELECT py.*, p.title AS property_title
     FROM payments py
     LEFT JOIN properties p ON p.id = py.property_id
     WHERE py.user_id = $1
     ORDER BY py.created_at DESC
     LIMIT $2`,
    [userId, Number(limit)],
  );

  return rows.map(toClientPayment);
}

async function markProcessing(id, data) {
  const rows = await query(
    `UPDATE payments
     SET status = 'processing',
         merchant_request_id = $2,
         checkout_request_id = $3,
         raw_request = $4::jsonb,
         raw_response = $5::jsonb,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      data.merchant_request_id || null,
      data.checkout_request_id || null,
      JSON.stringify(data.raw_request || {}),
      JSON.stringify(data.raw_response || {}),
    ],
  );

  return toClientPayment(rows[0]);
}

async function markFailed(id, description, rawResponse = {}) {
  const rows = await query(
    `UPDATE payments
     SET status = 'failed',
         result_description = $2,
         raw_response = CASE WHEN $3::jsonb = '{}'::jsonb THEN raw_response ELSE $3::jsonb END,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, description || 'Payment failed.', JSON.stringify(rawResponse || {})],
  );

  return toClientPayment(rows[0]);
}

async function updateFromCallback(checkoutRequestId, callback, metadata) {
  const resultCode = Number(callback.ResultCode);
  const success = resultCode === 0;
  const rows = await query(
    `UPDATE payments
     SET status = $2,
         result_code = $3,
         result_description = $4,
         mpesa_receipt_number = COALESCE($5, mpesa_receipt_number),
         transaction_date = COALESCE($6, transaction_date),
         phone = COALESCE($7, phone),
         amount = COALESCE($8, amount),
         raw_callback = $9::jsonb,
         paid_at = CASE WHEN $2 = 'paid' THEN COALESCE(paid_at, NOW()) ELSE paid_at END,
         updated_at = NOW()
     WHERE checkout_request_id = $1
     RETURNING *`,
    [
      checkoutRequestId,
      success ? 'paid' : 'failed',
      resultCode,
      callback.ResultDesc || callback.ResultDescription || null,
      metadata.MpesaReceiptNumber || null,
      metadata.TransactionDate ? String(metadata.TransactionDate) : null,
      metadata.PhoneNumber ? String(metadata.PhoneNumber) : null,
      metadata.Amount === undefined ? null : Number(metadata.Amount),
      JSON.stringify(callback || {}),
    ],
  );

  return rows[0] || null;
}

async function updateFromQuery(id, result) {
  const resultCode = result.ResultCode === undefined ? null : Number(result.ResultCode);
  const status = resultCode === 0 ? 'paid' : resultCode === null ? 'processing' : 'failed';
  const rows = await query(
    `UPDATE payments
     SET status = $2,
         result_code = COALESCE($3, result_code),
         result_description = COALESCE($4, result_description),
         raw_response = $5::jsonb,
         paid_at = CASE WHEN $2 = 'paid' THEN COALESCE(paid_at, NOW()) ELSE paid_at END,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      status,
      resultCode,
      result.ResultDesc || result.ResultDescription || result.ResponseDescription || null,
      JSON.stringify(result || {}),
    ],
  );

  return rows[0] || null;
}

async function markApplied(id) {
  const rows = await query(
    `UPDATE payments
     SET applied_at = COALESCE(applied_at, NOW()), updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id],
  );

  return rows[0] || null;
}

module.exports = {
  create,
  findById,
  findRawByCheckoutRequestId,
  findRawById,
  listForUser,
  markApplied,
  markFailed,
  markProcessing,
  toClientPayment,
  updateFromCallback,
  updateFromQuery,
};
