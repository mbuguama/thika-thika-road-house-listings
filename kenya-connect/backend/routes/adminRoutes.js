const express = require('express');
const {
  dashboard,
  listReports,
  listUsers,
  updateReport,
  updateUserStatus,
  verifyProfile,
} = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, requireAdmin);
router.get('/dashboard', dashboard);
router.get('/users', listUsers);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/profiles/:profileId/verify', verifyProfile);
router.get('/reports', listReports);
router.patch('/reports/:id', updateReport);

module.exports = router;
