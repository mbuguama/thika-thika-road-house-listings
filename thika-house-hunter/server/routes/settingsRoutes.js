const express = require('express');
const { listSettings } = require('../controllers/settingsController');

const router = express.Router();

router.get('/', listSettings);

module.exports = router;
