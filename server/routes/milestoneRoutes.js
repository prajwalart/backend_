const express = require('express');
const router = express.Router();
const { updateMilestone, deleteMilestone } = require('../controllers/milestoneController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validate');
const { milestoneUpdateRules } = require('../validators/projectValidators');

router.use(protect);

router.route('/:id')
  .put(milestoneUpdateRules, handleValidationErrors, updateMilestone)
  .delete(deleteMilestone);

module.exports = router;
