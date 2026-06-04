const express = require('express');
const { listMessages, markRead, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:matchId', protect, listMessages);
router.post('/:matchId', protect, sendMessage);
router.post('/:matchId/read', protect, markRead);

module.exports = router;
