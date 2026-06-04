const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { query } = require('../config/db');
const { asyncHandler } = require('../middleware/errorMiddleware');

const getDashboard = asyncHandler(async (req, res) => {
  const [properties, bookingRows, inquiryRows] = await Promise.all([
    Property.list({ landlord_id: req.user.id, status: req.query.status || undefined, limit: 100 }),
    Booking.listForUser(req.user),
    query(
      `SELECT COUNT(*)::int AS total
       FROM contact_messages
       WHERE property_id IN (
         SELECT id FROM properties WHERE landlord_id = $1 AND deleted_at IS NULL
       )
       AND status = 'new'`,
      [req.user.id],
    ),
  ]);

  res.json({
    summary: {
      total_properties: properties.length,
      total_bookings: bookingRows.length,
      pending_inquiries: inquiryRows[0]?.total || 0,
    },
    properties,
    bookings: bookingRows,
  });
});

const listMyProperties = asyncHandler(async (req, res) => {
  const properties = await Property.list({
    landlord_id: req.user.id,
    status: req.query.status || undefined,
    sort: req.query.sort || 'newest',
    limit: req.query.limit || 100,
  });

  res.json({ properties });
});

const submitVerification = asyncHandler(async (req, res) => {
  if (!req.body.phone?.trim() || !req.body.id_number?.trim()) {
    res.status(400);
    throw new Error('Phone number and ID number are required for landlord verification.');
  }

  const user = await require('../models/User').submitLandlordVerification(req.user.id, req.body);

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  res.json({ user });
});

module.exports = {
  getDashboard,
  listMyProperties,
  submitVerification,
};
