const Project = require('../models/Project');
const Deliverable = require('../models/Deliverable');
const ChangeRequest = require('../models/ChangeRequest');
const Milestone = require('../models/Milestone');
const ActivityLog = require('../models/ActivityLog');
const { logActivity } = require('../services/activityLogger');

exports.getProjects = async (req, res, next) => {
  try {
    const filter = { owner: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    const projects = await Project.find(filter).sort({ updatedAt: -1 });
    res.json(projects);
  } catch (err) {
    next(err);
  }
};

exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    next(err);
  }
};

exports.createProject = async (req, res, next) => {
  try {
    const project = await Project.create({ ...req.body, owner: req.user._id });
    await logActivity({
      userId: req.user._id,
      projectId: project._id,
      action: 'project_created',
      description: `Created project "${project.projectName}" for ${project.clientName}`,
      entityType: 'Project',
      entityId: project._id,
    });
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const updates = {};
    for (const field of [
      'projectName',
      'clientName',
      'clientEmail',
      'description',
      'budget',
      'startDate',
      'deadline',
      'status',
      'priority',
      'revisionLimit',
    ]) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      updates,
      { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await logActivity({
      userId: req.user._id,
      projectId: project._id,
      action: 'project_updated',
      description: `Updated project "${project.projectName}"`,
      entityType: 'Project',
      entityId: project._id,
    });
    res.json(project);
  } catch (err) {
    next(err);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await Deliverable.deleteMany({ projectId: project._id });
    await ChangeRequest.deleteMany({ projectId: project._id });
    await Milestone.deleteMany({ projectId: project._id });
    await ActivityLog.deleteMany({ projectId: project._id });
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.lockScope = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.scopeLockedAt) return res.json(project);

    const deliverables = await Deliverable.find({ projectId: project._id }).sort({ createdAt: 1 });
    const snapshot = deliverables.map((d) => ({
      title: d.title,
      description: d.description,
      category: d.category,
      estimatedEffort: d.estimatedEffort,
      dueDate: d.dueDate,
      revisionAllowance: d.revisionAllowance,
      status: d.status,
    }));

    const lockedProject = await Project.findOneAndUpdate(
      { _id: project._id, owner: req.user._id, scopeLockedAt: null },
      { $set: { originalScopeSnapshot: snapshot, scopeLockedAt: new Date() } },
      { new: true, runValidators: true }
    );
    if (!lockedProject) {
      const currentProject = await Project.findOne({
        _id: project._id,
        owner: req.user._id,
      });
      if (!currentProject) return res.status(404).json({ message: 'Project not found' });
      return res.json(currentProject);
    }

    await logActivity({
      userId: req.user._id,
      projectId: lockedProject._id,
      action: 'scope_locked',
      description: `Locked original scope snapshot for "${lockedProject.projectName}" (${deliverables.length} deliverables)`,
      entityType: 'Project',
      entityId: lockedProject._id,
    });

    res.json(lockedProject);
  } catch (err) {
    next(err);
  }
};

exports.getProjectSummary = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findOne({ _id: projectId, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const [deliverables, changeRequests, milestones] = await Promise.all([
      Deliverable.find({ projectId }).sort({ createdAt: 1 }),
      ChangeRequest.find({ projectId }).sort({ createdAt: -1 }),
      Milestone.find({ projectId }).sort({ dueDate: 1 }),
    ]);

    res.json({ project, deliverables, changeRequests, milestones });
  } catch (err) {
    next(err);
  }
};
