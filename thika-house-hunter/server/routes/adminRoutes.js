const express = require('express');
const {
  approveProperty,
  createAd,
  createBudgetRange,
  createLocation,
  createPropertyType,
  deactivateProperty,
  deleteUser,
  getDashboard,
  listAds,
  listLandlordVerifications,
  listProperties,
  listPendingProperties,
  listReports,
  listUsers,
  updateLandlordVerification,
  updateReportStatus,
  updateAd,
} = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/adminMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, requireAdmin);
router.get('/dashboard', getDashboard);
router.get('/ads', listAds);
router.post('/ads', createAd);
router.patch('/ads/:id', updateAd);
router.get('/users', listUsers);
router.delete('/users/:id', deleteUser);
router.get('/properties', listProperties);
router.get('/properties/pending', listPendingProperties);
router.patch('/properties/:id/approve', approveProperty);
router.patch('/properties/:id/deactivate', deactivateProperty);
router.get('/landlords/verification', listLandlordVerifications);
router.patch('/landlords/:id/verification', updateLandlordVerification);
router.get('/reports', listReports);
router.patch('/reports/:id', updateReportStatus);
router.post('/locations', createLocation);
router.post('/property-types', createPropertyType);
router.post('/budget-ranges', createBudgetRange);

module.exports = router;
