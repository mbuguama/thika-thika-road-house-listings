const Favorite = require('../models/Favorite');
const { asyncHandler } = require('../middleware/errorMiddleware');

const listFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.listByUser(req.user.id);
  res.json({ favorites });
});

const addFavorite = asyncHandler(async (req, res) => {
  const propertyId = req.params.propertyId || req.body.property_id;

  if (!propertyId) {
    res.status(400);
    throw new Error('property_id is required.');
  }

  const favorite = await Favorite.add(req.user.id, propertyId);
  res.status(201).json({ favorite });
});

const removeFavorite = asyncHandler(async (req, res) => {
  const removed = await Favorite.remove(req.user.id, req.params.propertyId);
  res.json({ removed: Boolean(removed) });
});

module.exports = {
  addFavorite,
  listFavorites,
  removeFavorite,
};
