const { body } = require('express-validator');

const projectRules = [
  body('projectName').trim().notEmpty().withMessage('Project name is required').isLength({ max: 120 }),
  body('clientName').trim().notEmpty().withMessage('Client name is required').isLength({ max: 120 }),
  body('clientEmail').trim().isEmail().withMessage('Valid client email is required').normalizeEmail(),
  body('budget').optional().isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
  body('deadline').isISO8601().withMessage('Valid deadline date is required'),
  body('startDate').optional().isISO8601(),
  body('status')
    .optional()
    .isIn(['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled']),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
  body('revisionLimit').optional().isInt({ min: 0 }),
  body('description').optional().isLength({ max: 2000 }),
];

const deliverableRules = [
  body('title').trim().notEmpty().withMessage('Deliverable title is required').isLength({ max: 160 }),
  body('description').optional().isLength({ max: 2000 }),
  body('category').optional().isLength({ max: 80 }),
  body('estimatedEffort').optional().isLength({ max: 80 }),
  body('dueDate').optional().isISO8601(),
  body('revisionAllowance').optional().isInt({ min: 0 }),
  body('status').optional().isIn(['planned', 'in-progress', 'completed']),
];

const changeRequestRules = [
  body('title').trim().notEmpty().withMessage('Request title is required').isLength({ max: 160 }),
  body('description').optional().isLength({ max: 3000 }),
  body('reason').optional().isLength({ max: 1000 }),
  body('additionalCost').optional().isFloat({ min: 0 }),
  body('additionalEffort').optional().isLength({ max: 80 }),
  body('additionalTime').optional().isInt({ min: 0 }),
];

const changeStatusRules = [
  body('status').isIn(['Approved', 'Rejected']).withMessage('Status must be Approved or Rejected'),
  body('decisionNote').optional().isLength({ max: 1000 }),
];

const milestoneRules = [
  body('title').trim().notEmpty().withMessage('Milestone title is required').isLength({ max: 160 }),
  body('description').optional().isLength({ max: 2000 }),
  body('startDate').optional().isISO8601(),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
  body('status')
    .optional()
    .isIn(['Not Started', 'In Progress', 'Completed', 'Overdue']),
];

const projectUpdateRules = [
  body('projectName').optional().trim().notEmpty().withMessage('Project name cannot be empty').isLength({ max: 120 }),
  body('clientName').optional().trim().notEmpty().withMessage('Client name cannot be empty').isLength({ max: 120 }),
  body('clientEmail').optional().trim().isEmail().withMessage('Valid client email is required').normalizeEmail(),
  body('budget').optional().isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
  body('deadline').optional().isISO8601().withMessage('Valid deadline date is required'),
  body('startDate').optional().isISO8601(),
  body('status')
    .optional()
    .isIn(['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled']),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
  body('revisionLimit').optional().isInt({ min: 0 }),
  body('description').optional().isLength({ max: 2000 }),
];

const deliverableUpdateRules = [
  body('title').optional().trim().notEmpty().withMessage('Deliverable title cannot be empty').isLength({ max: 160 }),
  body('description').optional().isLength({ max: 2000 }),
  body('category').optional().isLength({ max: 80 }),
  body('estimatedEffort').optional().isLength({ max: 80 }),
  body('dueDate').optional().isISO8601(),
  body('revisionAllowance').optional().isInt({ min: 0 }),
  body('status').optional().isIn(['planned', 'in-progress', 'completed']),
];

const milestoneUpdateRules = [
  body('title').optional().trim().notEmpty().withMessage('Milestone title cannot be empty').isLength({ max: 160 }),
  body('description').optional().isLength({ max: 2000 }),
  body('startDate').optional().isISO8601(),
  body('dueDate').optional().isISO8601().withMessage('Valid due date is required'),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
  body('status')
    .optional()
    .isIn(['Not Started', 'In Progress', 'Completed', 'Overdue']),
];

module.exports = {
  projectRules,
  projectUpdateRules,
  deliverableRules,
  deliverableUpdateRules,
  changeRequestRules,
  changeStatusRules,
  milestoneRules,
  milestoneUpdateRules,
};
