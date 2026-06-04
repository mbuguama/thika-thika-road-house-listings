const express = require('express');
const { deleteUser, getProfile, getUser, listUsers, updateProfile } = require('../controllers/userController');
const { requireAdmin } = require('../middleware/adminMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/', protect, requireAdmin, listUsers);
router.get('/:id', protect, requireAdmin, getUser);
router.delete('/:id', protect, requireAdmin, deleteUser);

module.exports = router;
