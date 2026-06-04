const express = require('express');
const { actOnProfile, listMatches } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, listMatches);
router.post('/:profileId/action', protect, actOnProfile);

module.exports = router;
