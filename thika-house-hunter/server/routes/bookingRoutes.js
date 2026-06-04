const express = require('express');
const { createBooking, listBookings, updateBookingStatus } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { requireLandlord } = require('../middleware/landlordMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', listBookings);
router.post('/', createBooking);
router.patch('/:id/status', requireLandlord, updateBookingStatus);

module.exports = router;
