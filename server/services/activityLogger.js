const ActivityLog = require('../models/ActivityLog');

/**
 * Creates an activity log entry.
 * @param {Object} params - { userId, projectId, action, description, entityType, entityId }
 */
const logActivity = async ({
  userId,
  projectId = null,
  action,
  description,
  entityType = 'Project',
  entityId = null,
}) => {
  try {
    await ActivityLog.create({ userId, projectId, action, description, entityType, entityId });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};

module.exports = { logActivity };
