const express = require('express');
const {
  favoriteProfile,
  getMyProfile,
  getProfile,
  listFavorites,
  listRecentlyViewed,
  listProfiles,
  updateMyProfile,
  uploadProfilePhoto,
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', listProfiles);
router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);
router.post('/me/photos', protect, upload.single('photo'), uploadProfilePhoto);
router.get('/favorites', protect, listFavorites);
router.get('/recently-viewed', protect, listRecentlyViewed);
router.post('/:id/favorite', protect, favoriteProfile);
router.get('/:id', getProfile);

module.exports = router;
