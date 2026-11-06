const express = require('express');
const router = express.Router();
const { updateDeliverable, deleteDeliverable } = require('../controllers/deliverableController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validate');
const { deliverableUpdateRules } = require('../validators/projectValidators');

router.use(protect);

router.route('/:id')
  .put(deliverableUpdateRules, handleValidationErrors, updateDeliverable)
  .delete(deleteDeliverable);

module.exports = router;
