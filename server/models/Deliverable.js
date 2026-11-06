const mongoose = require('mongoose');

const deliverableSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, 'Deliverable title is required'],
      trim: true,
      maxlength: 160,
    },
    description: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    category: {
      type: String,
      default: 'General',
      maxlength: 80,
    },
    estimatedEffort: {
      type: String,
      default: '',
      maxlength: 80,
    },
    dueDate: {
      type: Date,
    },
    revisionAllowance: {
      type: Number,
      default: 2,
      min: 0,
    },
    status: {
      type: String,
      enum: ['planned', 'in-progress', 'completed'],
      default: 'planned',
    },
    isOriginal: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

deliverableSchema.index({ projectId: 1, status: 1 });

module.exports = mongoose.model('Deliverable', deliverableSchema);
