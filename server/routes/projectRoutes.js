const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  lockScope,
  getProjectSummary,
} = require('../controllers/projectController');
const {
  getDeliverables,
  createDeliverable,
} = require('../controllers/deliverableController');
const {
  getChangeRequests,
  createChangeRequest,
} = require('../controllers/changeRequestController');
const {
  getMilestones,
  createMilestone,
} = require('../controllers/milestoneController');
const { getProjectHistory } = require('../controllers/activityController');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validate');
const {
  projectRules,
  projectUpdateRules,
  deliverableRules,
  changeRequestRules,
  milestoneRules,
} = require('../validators/projectValidators');

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(projectRules, handleValidationErrors, createProject);

router.get('/:id/summary', getProjectSummary);
router.get('/:id/history', getProjectHistory);

router.post('/:id/lock-scope', lockScope);

router.route('/:id')
  .get(getProject)
  .put(projectUpdateRules, handleValidationErrors, updateProject)
  .delete(deleteProject);

router.route('/:id/deliverables')
  .get(getDeliverables)
  .post(deliverableRules, handleValidationErrors, createDeliverable);

router.route('/:id/changes')
  .get(getChangeRequests)
  .post(changeRequestRules, handleValidationErrors, createChangeRequest);

router.route('/:id/milestones')
  .get(getMilestones)
  .post(milestoneRules, handleValidationErrors, createMilestone);

module.exports = router;
