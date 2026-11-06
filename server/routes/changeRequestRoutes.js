const express = require('express');
const router = express.Router();
const {
  getChangeRequest,
  getAllChangeRequests,
  updateChangeStatus,
} = require('../controllers/changeRequestController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validate');
const { changeStatusRules } = require('../validators/projectValidators');

router.use(protect);

router.route('/').get(getAllChangeRequests);
router.route('/:id').get(getChangeRequest);
router.put('/:id/status', changeStatusRules, handleValidationErrors, updateChangeStatus);

module.exports = router;
