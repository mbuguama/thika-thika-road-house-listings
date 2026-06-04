const express = require('express');
const {
  addPropertyImage,
  createProperty,
  deleteProperty,
  getProperty,
  getPropertyImageFile,
  listProperties,
  updateProperty,
} = require('../controllers/propertyController');
const { createBooking } = require('../controllers/bookingController');
const { createReport } = require('../controllers/reportController');
const { createReview, listReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { requireLandlord } = require('../middleware/landlordMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', listProperties);
router.post('/', protect, requireLandlord, createProperty);
router.get('/images/:imageId', getPropertyImageFile);
router.get('/:id', getProperty);
router.put('/:id', protect, requireLandlord, updateProperty);
router.delete('/:id', protect, requireLandlord, deleteProperty);
router.post('/:id/images', protect, requireLandlord, upload.single('image'), addPropertyImage);
router.get('/:propertyId/reviews', listReviews);
router.post('/:propertyId/reviews', protect, createReview);
router.post('/:propertyId/bookings', protect, createBooking);
router.post('/:propertyId/reports', protect, createReport);

module.exports = router;
