const express = require('express');
const { createReview, deleteReview, listReviews, updateReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/property/:propertyId', listReviews);
router.post('/property/:propertyId', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
