const express = require('express');
const {
  getAdConfig,
  listActiveAds,
  recordAdClick,
  recordAdImpression,
} = require('../controllers/adController');

const router = express.Router();

router.get('/config', getAdConfig);
router.get('/', listActiveAds);
router.post('/:id/impression', recordAdImpression);
router.post('/:id/click', recordAdClick);

module.exports = router;
