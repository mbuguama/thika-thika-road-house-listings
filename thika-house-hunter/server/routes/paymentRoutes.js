const express = require('express');
const {
  getPayment,
  getPaymentConfig,
  handleMpesaCallback,
  listMyPayments,
  queryMpesaPayment,
  startMpesaPayment,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/mpesa/callback', handleMpesaCallback);
router.get('/config', protect, getPaymentConfig);
router.get('/', protect, listMyPayments);
router.post('/mpesa/stk-push', protect, startMpesaPayment);
router.get('/:id', protect, getPayment);
router.post('/:id/query', protect, queryMpesaPayment);

module.exports = router;
