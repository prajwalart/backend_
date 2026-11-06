const mongoose = require('mongoose');

const changeRequestSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Request title is required'],
      trim: true,
      maxlength: 160,
    },
    description: {
      type: String,
      default: '',
      maxlength: 3000,
    },
    reason: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    additionalCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    additionalEffort: {
      type: String,
      default: '',
      maxlength: 80,
    },
    additionalTime: {
      type: Number,
      default: 0,
      min: 0,
      description: 'Additional days required',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      index: true,
    },
    decisionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    decisionAt: {
      type: Date,
      default: null,
    },
    decisionNote: {
      type: String,
      default: '',
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

changeRequestSchema.index({ projectId: 1, status: 1 });

module.exports = mongoose.model('ChangeRequest', changeRequestSchema);
