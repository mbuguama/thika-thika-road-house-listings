const express = require('express');
const {
  login,
  logout,
  me,
  register,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', protect, me);
router.post('/password/forgot', authLimiter, requestPasswordReset);
router.post('/password/reset', authLimiter, resetPassword);
router.get('/verify-email', verifyEmail);

module.exports = router;
