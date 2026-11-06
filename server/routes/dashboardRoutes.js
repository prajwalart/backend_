const express = require('express');
const router = express.Router();
const { getStats, getRecentActivities } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getStats);
router.get('/recent-activities', getRecentActivities);

module.exports = router;
