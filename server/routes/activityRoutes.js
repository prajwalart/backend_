const express = require('express');
const router = express.Router();
const { getRecentActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/recent', getRecentActivity);

module.exports = router;
