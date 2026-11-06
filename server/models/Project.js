const mongoose = require('mongoose');

const deliverableSnapshotSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'General' },
    estimatedEffort: { type: String, default: '' },
    dueDate: { type: Date },
    revisionAllowance: { type: Number, default: 2 },
    status: {
      type: String,
      enum: ['planned', 'in-progress', 'completed'],
      default: 'planned',
    },
  },
  { _id: true, timestamps: true }
);

const projectSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: 120,
    },
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      maxlength: 120,
    },
    clientEmail: {
      type: String,
      required: [true, 'Client email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    description: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    budget: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'],
      default: 'Planning',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    revisionLimit: {
      type: Number,
      default: 3,
      min: 0,
    },
    originalScopeSnapshot: {
      type: [deliverableSnapshotSchema],
      default: [],
    },
    scopeLockedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

projectSchema.index({ owner: 1, status: 1 });

module.exports = mongoose.model('Project', projectSchema);
