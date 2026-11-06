/**
 * Seed script for FreelanceScope
 * Run with: npm run seed
 * Creates a demo user and sample project with deliverables, a change request, and milestones.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Project = require('./models/Project');
const Deliverable = require('./models/Deliverable');
const ChangeRequest = require('./models/ChangeRequest');
const Milestone = require('./models/Milestone');
const ActivityLog = require('./models/ActivityLog');

const seed = async () => {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({ email: 'demo@freelancescope.com' }),
    Project.deleteMany({}),
    Deliverable.deleteMany({}),
    ChangeRequest.deleteMany({}),
    Milestone.deleteMany({}),
    ActivityLog.deleteMany({}),
  ]);

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('password123', salt);
  const user = await User.create({ name: 'Demo Freelancer', email: 'demo@freelancescope.com', password });
  console.log('Demo user created: demo@freelancescope.com / password123');

  const project = await Project.create({
    owner: user._id,
    projectName: 'Corporate Website Redesign',
    clientName: 'Acme Corp',
    clientEmail: 'contact@acmecorp.com',
    description: 'Complete redesign of the company website with modern UI and CMS integration.',
    budget: 5000,
    startDate: new Date(),
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    status: 'In Progress',
    priority: 'High',
    revisionLimit: 3,
  });

  const deliverables = await Deliverable.insertMany([
    { projectId: project._id, owner: user._id, title: 'Home Page', description: 'Landing page with hero section', category: 'Page', estimatedEffort: '2 days', dueDate: new Date(Date.now() + 3 * 86400000), revisionAllowance: 2, status: 'completed', isOriginal: true },
    { projectId: project._id, owner: user._id, title: 'Login Page', description: 'User login form', category: 'Page', estimatedEffort: '1 day', dueDate: new Date(Date.now() + 5 * 86400000), revisionAllowance: 2, status: 'in-progress', isOriginal: true },
    { projectId: project._id, owner: user._id, title: 'Registration Page', description: 'New user signup', category: 'Page', estimatedEffort: '1 day', dueDate: new Date(Date.now() + 6 * 86400000), revisionAllowance: 2, status: 'planned', isOriginal: true },
    { projectId: project._id, owner: user._id, title: 'Contact Page', description: 'Contact form and map', category: 'Page', estimatedEffort: '1 day', dueDate: new Date(Date.now() + 8 * 86400000), revisionAllowance: 1, status: 'planned', isOriginal: true },
  ]);

  project.originalScopeSnapshot = deliverables.map((d) => ({
    title: d.title, description: d.description, category: d.category,
    estimatedEffort: d.estimatedEffort, dueDate: d.dueDate,
    revisionAllowance: d.revisionAllowance, status: d.status,
  }));
  project.scopeLockedAt = new Date();
  await project.save();

  await ChangeRequest.create({
    projectId: project._id,
    owner: user._id,
    requestedBy: user._id,
    title: 'Add Payment Gateway Integration',
    description: 'Client requested Stripe payment integration for online orders.',
    reason: 'Client wants to accept online payments — not in original scope.',
    additionalCost: 800,
    additionalEffort: '3 days',
    additionalTime: 3,
    status: 'Pending',
  });

  await ChangeRequest.create({
    projectId: project._id,
    owner: user._id,
    requestedBy: user._id,
    title: 'Admin Dashboard',
    description: 'Backend admin panel to manage content.',
    reason: 'Client wants to edit content themselves.',
    additionalCost: 1200,
    additionalEffort: '5 days',
    additionalTime: 5,
    status: 'Approved',
    decisionBy: user._id,
    decisionAt: new Date(),
  });

  await Milestone.insertMany([
    { projectId: project._id, owner: user._id, title: 'Design Approval', description: 'Get client sign-off on designs', startDate: new Date(), dueDate: new Date(Date.now() + 2 * 86400000), status: 'Completed', priority: 'High', completedAt: new Date() },
    { projectId: project._id, owner: user._id, title: 'Frontend Development', description: 'Build all pages', startDate: new Date(), dueDate: new Date(Date.now() + 10 * 86400000), status: 'In Progress', priority: 'High' },
    { projectId: project._id, owner: user._id, title: 'Final Delivery', description: 'Deploy and handover', startDate: new Date(), dueDate: new Date(Date.now() + 15 * 86400000), status: 'Not Started', priority: 'Critical' },
  ]);

  await ActivityLog.insertMany([
    { userId: user._id, projectId: project._id, action: 'project_created', description: 'Created project "Corporate Website Redesign"', entityType: 'Project', entityId: project._id },
    { userId: user._id, projectId: project._id, action: 'deliverable_added', description: 'Added deliverable "Home Page"', entityType: 'Deliverable' },
    { userId: user._id, projectId: project._id, action: 'scope_locked', description: 'Locked original scope (4 deliverables)', entityType: 'Project', entityId: project._id },
    { userId: user._id, projectId: project._id, action: 'change_request_submitted', description: 'Submitted change request "Add Payment Gateway Integration"', entityType: 'ChangeRequest' },
    { userId: user._id, projectId: project._id, action: 'change_request_approved', description: 'Approved change request "Admin Dashboard"', entityType: 'ChangeRequest' },
    { userId: user._id, projectId: project._id, action: 'milestone_completed', description: 'Completed milestone "Design Approval"', entityType: 'Milestone' },
  ]);

  console.log('Seed complete!');
  mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
