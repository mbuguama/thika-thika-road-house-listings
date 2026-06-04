const Review = require('../models/Review');
const { asyncHandler } = require('../middleware/errorMiddleware');

const listReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.listByProperty(req.params.propertyId);
  res.json({ reviews });
});

const createReview = asyncHandler(async (req, res) => {
  const rating = Number(req.body.rating);

  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5.');
  }

  const review = await Review.create({
    property_id: req.params.propertyId || req.body.property_id,
    user_id: req.user.id,
    rating,
    comment: req.body.comment,
  });

  res.status(201).json({ review });
});

const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found.');
  }

  if (req.user.role !== 'admin' && review.user_id !== req.user.id) {
    res.status(403);
    throw new Error('You can only edit your own reviews.');
  }

  const updatedReview = await Review.update(req.params.id, req.body);
  res.json({ review: updatedReview });
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found.');
  }

  if (req.user.role !== 'admin' && review.user_id !== req.user.id) {
    res.status(403);
    throw new Error('You can only delete your own reviews.');
  }

  await Review.remove(req.params.id);
  res.json({ message: 'Review deleted.' });
});

module.exports = {
  createReview,
  deleteReview,
  listReviews,
  updateReview,
};
