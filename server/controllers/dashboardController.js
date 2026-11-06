const Project = require('../models/Project');
const Deliverable = require('../models/Deliverable');
const ChangeRequest = require('../models/ChangeRequest');
const Milestone = require('../models/Milestone');
const ActivityLog = require('../models/ActivityLog');

exports.getStats = async (req, res, next) => {
  try {
    const owner = req.user._id;
    const projects = await Project.find({ owner });
    const projectIds = projects.map((p) => p._id);

    const [deliverables, changeRequests, milestones] = await Promise.all([
      Deliverable.find({ owner }),
      ChangeRequest.find({ owner }),
      Milestone.find({ owner }),
    ]);

    const activeProjects = projects.filter(
      (p) => p.status === 'In Progress' || p.status === 'Planning'
    ).length;
    const completedProjects = projects.filter((p) => p.status === 'Completed').length;

    const pendingChanges = changeRequests.filter((c) => c.status === 'Pending').length;
    const approvedChanges = changeRequests.filter((c) => c.status === 'Approved').length;
    const rejectedChanges = changeRequests.filter((c) => c.status === 'Rejected').length;

    const completedDeliverables = deliverables.filter((d) => d.status === 'completed').length;
    const totalDeliverables = deliverables.length;

    const completedMilestones = milestones.filter((m) => m.status === 'Completed').length;

    const now = new Date();
    const upcomingMilestones = milestones
      .filter((m) => m.dueDate && m.dueDate >= now && m.status !== 'Completed')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5)
      .map((m) => ({
        id: m._id,
        title: m.title,
        dueDate: m.dueDate,
        priority: m.priority,
        projectId: m.projectId,
      }));

    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const additionalCostApproved = changeRequests
      .filter((c) => c.status === 'Approved')
      .reduce((sum, c) => sum + (c.additionalCost || 0), 0);

    const progress =
      totalDeliverables > 0
        ? Math.round((completedDeliverables / totalDeliverables) * 100)
        : 0;

    res.json({
      totalProjects: projects.length,
      activeProjects,
      completedProjects,
      pendingChanges,
      approvedChanges,
      rejectedChanges,
      totalDeliverables,
      completedDeliverables,
      totalMilestones: milestones.length,
      completedMilestones,
      upcomingMilestones,
      progress,
      totalBudget,
      additionalCostApproved,
    });
  } catch (err) {
    next(err);
  }
};

exports.getRecentActivities = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const logs = await ActivityLog.find({ userId: req.user._id })
      .populate('projectId', 'projectName')
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(logs);
  } catch (err) {
    next(err);
  }
};
