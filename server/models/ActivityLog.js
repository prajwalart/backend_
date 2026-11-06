const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'project_created',
        'project_updated',
        'project_deleted',
        'deliverable_added',
        'deliverable_updated',
        'deliverable_completed',
        'deliverable_deleted',
        'scope_locked',
        'change_request_submitted',
        'change_request_approved',
        'change_request_rejected',
        'milestone_created',
        'milestone_completed',
        'milestone_updated',
        'milestone_deleted',
      ],
    },
    description: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      enum: ['Project', 'Deliverable', 'ChangeRequest', 'Milestone'],
      default: 'Project',
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

activityLogSchema.index({ projectId: 1, createdAt: -1 });
activityLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
