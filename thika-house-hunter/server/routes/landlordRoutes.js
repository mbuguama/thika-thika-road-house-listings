const express = require('express');
const { getDashboard, listMyProperties, submitVerification } = require('../controllers/landlordController');
const { protect } = require('../middleware/authMiddleware');
const { requireLandlord } = require('../middleware/landlordMiddleware');

const router = express.Router();

router.use(protect, requireLandlord);
router.get('/dashboard', getDashboard);
router.get('/properties', listMyProperties);
router.post('/verification', submitVerification);

module.exports = router;
