const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const { logActivity } = require('../services/activityLogger');

exports.getMilestones = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const milestones = await Milestone.find({ projectId: req.params.id }).sort({ dueDate: 1 });
    res.json(milestones);
  } catch (err) {
    next(err);
  }
};

exports.createMilestone = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const milestone = await Milestone.create({
      title: req.body.title,
      description: req.body.description,
      startDate: req.body.startDate,
      dueDate: req.body.dueDate,
      priority: req.body.priority,
      status: req.body.status,
      projectId: project._id,
      owner: req.user._id,
      completedAt: req.body.status === 'Completed' ? new Date() : null,
    });
    await logActivity({
      userId: req.user._id,
      projectId: project._id,
      action: 'milestone_created',
      description: `Created milestone "${milestone.title}" for "${project.projectName}"`,
      entityType: 'Milestone',
      entityId: milestone._id,
    });
    res.status(201).json(milestone);
  } catch (err) {
    next(err);
  }
};

exports.updateMilestone = async (req, res, next) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found' });
    if (!milestone.owner || milestone.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = {};
    for (const field of ['title', 'description', 'startDate', 'dueDate', 'priority', 'status']) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    const wasCompleted = milestone.status === 'Completed';
    milestone.set(updates);
    if (!wasCompleted && milestone.status === 'Completed') {
      milestone.completedAt = new Date();
    } else if (wasCompleted && milestone.status !== 'Completed') {
      milestone.completedAt = null;
    }
    await milestone.save();

    if (!wasCompleted && milestone.status === 'Completed') {
      await logActivity({
        userId: req.user._id,
        projectId: milestone.projectId,
        action: 'milestone_completed',
        description: `Completed milestone "${milestone.title}"`,
        entityType: 'Milestone',
        entityId: milestone._id,
      });
    } else {
      await logActivity({
        userId: req.user._id,
        projectId: milestone.projectId,
        action: 'milestone_updated',
        description: `Updated milestone "${milestone.title}"`,
        entityType: 'Milestone',
        entityId: milestone._id,
      });
    }
    res.json(milestone);
  } catch (err) {
    next(err);
  }
};

exports.deleteMilestone = async (req, res, next) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found' });
    if (!milestone.owner || milestone.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const projectId = milestone.projectId;
    await Milestone.findByIdAndDelete(req.params.id);
    await logActivity({
      userId: req.user._id,
      projectId,
      action: 'milestone_deleted',
      description: `Deleted milestone "${milestone.title}"`,
      entityType: 'Milestone',
      entityId: milestone._id,
    });
    res.json({ message: 'Milestone deleted' });
  } catch (err) {
    next(err);
  }
};
