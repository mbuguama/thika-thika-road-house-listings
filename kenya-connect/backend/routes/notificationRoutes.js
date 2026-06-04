const express = require('express');
const { listNotifications, markNotificationRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, listNotifications);
router.post('/:id/read', protect, markNotificationRead);

module.exports = router;
