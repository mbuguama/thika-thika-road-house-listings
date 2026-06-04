const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { asyncHandler } = require('../middleware/errorMiddleware');

const listBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.listForUser(req.user);
  res.json({ bookings });
});

const createBooking = asyncHandler(async (req, res) => {
  const propertyId = req.body.property_id || req.params.propertyId;
  const property = await Property.findById(propertyId);

  if (!property) {
    res.status(404);
    throw new Error('Property not found.');
  }

  const booking = await Booking.create({
    property_id: propertyId,
    renter_id: req.user.id,
    viewing_date: req.body.viewing_date,
    message: req.body.message,
  });

  res.status(201).json({ booking });
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const allowed = ['pending', 'confirmed', 'cancelled', 'completed'];
  const status = req.body.status;

  if (!allowed.includes(status)) {
    res.status(400);
    throw new Error('Invalid booking status.');
  }

  const booking = await Booking.updateStatus(req.params.id, status);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found.');
  }

  res.json({ booking });
});

module.exports = {
  createBooking,
  listBookings,
  updateBookingStatus,
};
