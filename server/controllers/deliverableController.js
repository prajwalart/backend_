const Project = require('../models/Project');
const Deliverable = require('../models/Deliverable');
const { logActivity } = require('../services/activityLogger');

exports.getDeliverables = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const deliverables = await Deliverable.find({ projectId: req.params.id }).sort({ createdAt: 1 });
    res.json(deliverables);
  } catch (err) {
    next(err);
  }
};

exports.createDeliverable = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.scopeLockedAt) {
      return res.status(409).json({
        message: 'Original scope is locked. Submit a change request for additional work.',
      });
    }

    const deliverable = await Deliverable.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      estimatedEffort: req.body.estimatedEffort,
      dueDate: req.body.dueDate,
      revisionAllowance: req.body.revisionAllowance,
      status: req.body.status,
      projectId: project._id,
      owner: req.user._id,
      isOriginal: true,
    });
    await logActivity({
      userId: req.user._id,
      projectId: project._id,
      action: 'deliverable_added',
      description: `Added deliverable "${deliverable.title}" to "${project.projectName}"`,
      entityType: 'Deliverable',
      entityId: deliverable._id,
    });
    res.status(201).json(deliverable);
  } catch (err) {
    next(err);
  }
};

exports.updateDeliverable = async (req, res, next) => {
  try {
    const deliverable = await Deliverable.findById(req.params.id).populate(
      'projectId',
      'scopeLockedAt'
    );
    if (!deliverable) return res.status(404).json({ message: 'Deliverable not found' });

    if (!deliverable.owner || deliverable.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this deliverable' });
    }

    const scopeFields = [
      'title',
      'description',
      'category',
      'estimatedEffort',
      'dueDate',
      'revisionAllowance',
    ];
    if (
      deliverable.isOriginal &&
      deliverable.projectId?.scopeLockedAt &&
      scopeFields.some((field) => Object.prototype.hasOwnProperty.call(req.body, field))
    ) {
      return res.status(409).json({
        message: 'Original scope is locked. Submit a change request for scope changes.',
      });
    }

    const updates = {};
    for (const field of [...scopeFields, 'status']) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    const wasCompleted = deliverable.status === 'completed';
    deliverable.set(updates);
    await deliverable.save();

    if (!wasCompleted && deliverable.status === 'completed') {
      await logActivity({
        userId: req.user._id,
        projectId: deliverable.projectId,
        action: 'deliverable_completed',
        description: `Marked deliverable "${deliverable.title}" as completed`,
        entityType: 'Deliverable',
        entityId: deliverable._id,
      });
    } else {
      await logActivity({
        userId: req.user._id,
        projectId: deliverable.projectId,
        action: 'deliverable_updated',
        description: `Updated deliverable "${deliverable.title}"`,
        entityType: 'Deliverable',
        entityId: deliverable._id,
      });
    }
    res.json(deliverable);
  } catch (err) {
    next(err);
  }
};

exports.deleteDeliverable = async (req, res, next) => {
  try {
    const deliverable = await Deliverable.findById(req.params.id).populate(
      'projectId',
      'scopeLockedAt'
    );
    if (!deliverable) return res.status(404).json({ message: 'Deliverable not found' });
    if (!deliverable.owner || deliverable.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (deliverable.isOriginal && deliverable.projectId?.scopeLockedAt) {
      return res.status(409).json({
        message: 'Original scope is locked. Submit a change request for scope changes.',
      });
    }
    const projectId = deliverable.projectId;
    await Deliverable.findByIdAndDelete(req.params.id);
    await logActivity({
      userId: req.user._id,
      projectId,
      action: 'deliverable_deleted',
      description: `Deleted deliverable "${deliverable.title}"`,
      entityType: 'Deliverable',
      entityId: deliverable._id,
    });
    res.json({ message: 'Deliverable deleted' });
  } catch (err) {
    next(err);
  }
};
