const Project = require('../models/Project');
const ChangeRequest = require('../models/ChangeRequest');
const { logActivity } = require('../services/activityLogger');

exports.getChangeRequests = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const filter = { projectId: req.params.id };
    if (req.query.status) filter.status = req.query.status;
    const requests = await ChangeRequest.find(filter)
      .populate('requestedBy decisionBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    next(err);
  }
};

exports.getAllChangeRequests = async (req, res, next) => {
  try {
    const filter = { owner: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    const requests = await ChangeRequest.find(filter)
      .populate('projectId', 'projectName clientName')
      .populate('requestedBy decisionBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    next(err);
  }
};

exports.createChangeRequest = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const changeRequest = await ChangeRequest.create({
      title: req.body.title,
      description: req.body.description,
      reason: req.body.reason,
      additionalCost: req.body.additionalCost,
      additionalEffort: req.body.additionalEffort,
      additionalTime: req.body.additionalTime,
      projectId: project._id,
      owner: req.user._id,
      requestedBy: req.user._id,
      status: 'Pending',
    });
    await logActivity({
      userId: req.user._id,
      projectId: project._id,
      action: 'change_request_submitted',
      description: `Submitted change request "${changeRequest.title}" for "${project.projectName}"`,
      entityType: 'ChangeRequest',
      entityId: changeRequest._id,
    });
    res.status(201).json(changeRequest);
  } catch (err) {
    next(err);
  }
};

exports.getChangeRequest = async (req, res, next) => {
  try {
    const request = await ChangeRequest.findById(req.params.id)
      .populate('requestedBy decisionBy', 'name email')
      .populate('projectId', 'projectName clientName');
    if (!request) return res.status(404).json({ message: 'Change request not found' });
    if (!request.owner || request.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(request);
  } catch (err) {
    next(err);
  }
};

exports.updateChangeStatus = async (req, res, next) => {
  try {
    const { status, decisionNote } = req.body;
    const request = await ChangeRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Change request not found' });
    if (!request.owner || request.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to approve or reject this request' });
    }
    if (request.status !== 'Pending') {
      return res.status(409).json({ message: 'This change request has already been decided' });
    }

    request.status = status;
    request.decisionBy = req.user._id;
    request.decisionAt = new Date();
    if (decisionNote) request.decisionNote = decisionNote;
    await request.save();

    const action = status === 'Approved' ? 'change_request_approved' : 'change_request_rejected';
    await logActivity({
      userId: req.user._id,
      projectId: request.projectId,
      action,
      description: `${status} change request "${request.title}"`,
      entityType: 'ChangeRequest',
      entityId: request._id,
    });

    const populated = await ChangeRequest.findById(request._id)
      .populate('requestedBy decisionBy', 'name email');
    res.json(populated);
  } catch (err) {
    next(err);
  }
};
