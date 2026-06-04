const { query } = require('../config/db');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { sendContactNotification } = require('../services/emailService');

const createContactMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message, property_id } = req.body;

  if (!name || !email || !message) {
    res.status(400);
    throw new Error('Name, email, and message are required.');
  }

  const rows = await query(
    `INSERT INTO contact_messages (name, email, phone, subject, message, property_id)
     VALUES ($1, LOWER($2), $3, $4, $5, $6)
     RETURNING id, name, email, phone, subject, message, property_id, status, created_at`,
    [name, email, phone || null, subject || null, message, property_id || null],
  );

  await sendContactNotification(rows[0]);

  res.status(201).json({
    message: 'Contact message received.',
    contact: rows[0],
  });
});

module.exports = {
  createContactMessage,
};
