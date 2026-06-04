const express = require('express');
const { deactivateMyAccount, getMyAccount } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', protect, getMyAccount);
router.delete('/me', protect, deactivateMyAccount);

module.exports = router;
