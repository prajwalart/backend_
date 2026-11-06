const ActivityLog = require('../models/ActivityLog');

exports.getProjectHistory = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find({ projectId: req.params.id, userId: req.user._id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

exports.getRecentActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const logs = await ActivityLog.find({ userId: req.user._id })
      .populate('projectId', 'projectName')
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(logs);
  } catch (err) {
    next(err);
  }
};
