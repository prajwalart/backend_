/**
 * FreelanceScope Comprehensive Automated Test Suite
 * Validates CIA requirements, business logic, differentiating features, security and REST APIs.
 */
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');

// Set test environment variables before requiring server
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_freelancescope_ci_test_key_2026';

let mongoServer;
let app;

const runTests = async () => {
  console.log('====================================================');
  console.log('  FREELANCESCOPE CIA AUTOMATED INTEGRATION TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`  [PASS] ${description}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${description}`);
      failed++;
    }
  };

  try {
    console.log('1. Setting up In-Memory MongoDB Server...');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;

    // Disconnect any existing default connection if open
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(uri);
    console.log(`   Connected to in-memory MongoDB: ${uri}\n`);

    app = require('./server');

    // TEST 1: Health check
    console.log('2. Testing Health Check API...');
    const healthRes = await request(app).get('/api/health');
    assert(healthRes.status === 200, 'GET /api/health returns 200 OK');
    assert(healthRes.body.status === 'ok', 'Health status is "ok"');
    assert(healthRes.body.database === 'connected', 'Database status reports "connected"');

    // TEST 2: User Registration & Validation
    console.log('\n3. Testing Authentication & Validation...');
    const user1Data = {
      name: 'Alex Freelancer',
      email: 'alex@freelancescope.dev',
      password: 'password123',
      confirmPassword: 'password123',
    };

    const regRes = await request(app).post('/api/auth/register').send(user1Data);
    assert(regRes.status === 201, 'POST /api/auth/register returns 201 Created');
    assert(regRes.body.token, 'Registration returns JWT token');
    assert(regRes.body.user.email === user1Data.email, 'User email matches registered email');
    assert(!regRes.body.user.password, 'Password is not exposed in response');
    const token1 = regRes.body.token;

    // Duplicate email registration should fail
    const dupRes = await request(app).post('/api/auth/register').send(user1Data);
    assert(dupRes.status === 400, 'Duplicate email registration returns 400 Bad Request');

    // TEST 3: User Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alex@freelancescope.dev', password: 'password123' });
    assert(loginRes.status === 200, 'POST /api/auth/login returns 200 OK');
    assert(loginRes.body.token, 'Login returns valid token');

    // Invalid password should fail
    const badLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alex@freelancescope.dev', password: 'wrongpassword' });
    assert(badLoginRes.status === 401, 'Invalid password returns 401 Unauthorized');

    // TEST 4: Get Current User Profile (Protected)
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token1}`);
    assert(meRes.status === 200, 'GET /api/auth/me returns 200 OK with Bearer token');
    assert(meRes.body.user.name === 'Alex Freelancer', 'Profile name matches');

    // Unauthenticated request should fail
    const unauthRes = await request(app).get('/api/auth/me');
    assert(unauthRes.status === 401, 'GET /api/auth/me without token returns 401 Unauthorized');

    // TEST 5: Project Creation & Retrieval
    console.log('\n4. Testing Project CRUD Operations...');
    const projectInput = {
      projectName: 'E-Commerce Platform Redesign',
      clientName: 'Starlight Retail',
      clientEmail: 'billing@starlight.com',
      description: 'Full-stack store redesign with product catalog and checkout.',
      budget: 8500,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'In Progress',
      priority: 'High',
      revisionLimit: 3,
    };

    const projRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token1}`)
      .send(projectInput);
    assert(projRes.status === 201, 'POST /api/projects creates project (201)');
    assert(projRes.body._id, 'Project ID generated');
    const projectId = projRes.body._id;

    const tamperedProjectRes = await request(app)
      .put(`/api/projects/${projectId}`)
      .set('Authorization', 'Bearer ' + token1)
      .send({
        description: 'Owner fields are protected',
        owner: new mongoose.Types.ObjectId().toString(),
        originalScopeSnapshot: [{ title: 'Injected scope' }],
        scopeLockedAt: new Date().toISOString(),
      });
    assert(tamperedProjectRes.status === 200, 'Project updates accept allowed fields');
    assert(
      tamperedProjectRes.body.owner === projRes.body.owner &&
        tamperedProjectRes.body.originalScopeSnapshot.length === 0 &&
        tamperedProjectRes.body.scopeLockedAt === null,
      'Project updates cannot change ownership or scope-lock metadata'
    );

    const listProjRes = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token1}`);
    assert(listProjRes.status === 200, 'GET /api/projects returns 200 OK');
    assert(listProjRes.body.length === 1, 'Project list contains created project');

    const singleProjRes = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token1}`);
    assert(singleProjRes.status === 200, 'GET /api/projects/:id returns 200 OK');
    assert(singleProjRes.body.projectName === projectInput.projectName, 'Project name matches');

    // TEST 6: Original Deliverables Management
    console.log('\n5. Testing Original Deliverables & Scope Baseline...');
    const deliv1 = await request(app)
      .post(`/api/projects/${projectId}/deliverables`)
      .set('Authorization', `Bearer ${token1}`)
      .send({
        title: 'User Authentication & Roles',
        description: 'Customer login, registration and admin role permissions',
        category: 'Backend',
        estimatedEffort: '3 days',
        revisionAllowance: 2,
        status: 'completed',
        owner: new mongoose.Types.ObjectId().toString(),
        projectId: new mongoose.Types.ObjectId().toString(),
        isOriginal: false,
      });
    assert(deliv1.status === 201, 'POST /api/projects/:id/deliverables creates deliverable 1');
    assert(
      deliv1.body.owner === projRes.body.owner &&
        deliv1.body.projectId === projectId &&
        deliv1.body.isOriginal === true,
      'Deliverable creation preserves owner, project association, and original-scope status'
    );

    const deliv2 = await request(app)
      .post(`/api/projects/${projectId}/deliverables`)
      .set('Authorization', `Bearer ${token1}`)
      .send({
        title: 'Product Catalog & Search Filters',
        description: 'Product listing page with category filters',
        category: 'Frontend',
        estimatedEffort: '4 days',
        revisionAllowance: 2,
        status: 'in-progress',
      });
    assert(deliv2.status === 201, 'POST /api/projects/:id/deliverables creates deliverable 2');

    // TEST 7: Lock Original Scope (Differentiating Feature)
    console.log('\n6. Testing Differentiating Feature: Scope Locking...');
    const lockRes = await request(app)
      .post(`/api/projects/${projectId}/lock-scope`)
      .set('Authorization', `Bearer ${token1}`);
    assert(lockRes.status === 200, 'POST /api/projects/:id/lock-scope returns 200 OK');
    assert(lockRes.body.scopeLockedAt !== null, 'Project scopeLockedAt timestamp is recorded');
    assert(
      lockRes.body.originalScopeSnapshot && lockRes.body.originalScopeSnapshot.length === 2,
      'originalScopeSnapshot contains exact snapshot of agreed deliverables (2 items)'
    );

    const relockRes = await request(app)
      .post(`/api/projects/${projectId}/lock-scope`)
      .set('Authorization', 'Bearer ' + token1);
    assert(
      relockRes.status === 200 &&
        relockRes.body.scopeLockedAt === lockRes.body.scopeLockedAt &&
        relockRes.body.originalScopeSnapshot[0].title === 'User Authentication & Roles',
      'Repeated scope lock preserves the original snapshot'
    );

    const addedAfterLockRes = await request(app)
      .post(`/api/projects/${projectId}/deliverables`)
      .set('Authorization', 'Bearer ' + token1)
      .send({ title: 'Unapproved scope addition' });
    assert(addedAfterLockRes.status === 409, 'Locked scope rejects new original deliverables');

    const editedAfterLockRes = await request(app)
      .put(`/api/deliverables/${deliv1.body._id}`)
      .set('Authorization', 'Bearer ' + token1)
      .send({ title: 'Changed agreed scope' });
    assert(editedAfterLockRes.status === 409, 'Locked scope rejects deliverable scope edits');

    const progressAfterLockRes = await request(app)
      .put(`/api/deliverables/${deliv1.body._id}`)
      .set('Authorization', 'Bearer ' + token1)
      .send({
        status: 'completed',
        owner: new mongoose.Types.ObjectId().toString(),
        projectId: new mongoose.Types.ObjectId().toString(),
      });
    assert(
      progressAfterLockRes.status === 200 &&
        progressAfterLockRes.body.owner === projRes.body.owner &&
        String(progressAfterLockRes.body.projectId._id || progressAfterLockRes.body.projectId) ===
          projectId,
      'Locked deliverables can update progress without changing ownership'
    );

    const deletedAfterLockRes = await request(app)
      .delete(`/api/deliverables/${deliv1.body._id}`)
      .set('Authorization', 'Bearer ' + token1);
    assert(deletedAfterLockRes.status === 409, 'Locked original deliverables cannot be deleted');

    // TEST 8: Separate Change Request Management (Differentiating Feature)
    console.log('\n7. Testing Separate Change Request Lifecycle...');
    const cr1 = await request(app)
      .post(`/api/projects/${projectId}/changes`)
      .set('Authorization', `Bearer ${token1}`)
      .send({
        title: 'PayPal & Apple Pay Integration',
        description: 'Client requested Apple Pay and PayPal one-click checkout.',
        reason: 'Client added new payment method requirement post-baseline.',
        additionalCost: 1200,
        additionalEffort: '3 days',
        additionalTime: 3,
        status: 'Approved',
        decisionBy: new mongoose.Types.ObjectId().toString(),
        decisionAt: new Date().toISOString(),
      });
    assert(cr1.status === 201, 'POST /api/projects/:id/changes creates Change Request 1');
    assert(cr1.body.status === 'Pending', 'New change request initial status is "Pending"');
    assert(
      cr1.body.decisionBy === null && cr1.body.decisionAt === null,
      'New change requests cannot supply decision metadata'
    );
    const cr1Id = cr1.body._id;

    // Approve Change Request 1
    const approveRes = await request(app)
      .put(`/api/changes/${cr1Id}/status`)
      .set('Authorization', `Bearer ${token1}`)
      .send({
        status: 'Approved',
        decisionNote: 'Client agreed to additional cost of $1,200 via email confirmation.',
      });
    assert(approveRes.status === 200, 'PUT /api/changes/:id/status updates status to "Approved"');
    assert(approveRes.body.status === 'Approved', 'Change Request status is now Approved');
    assert(approveRes.body.decisionBy, 'decisionBy user recorded in audit trail');
    assert(approveRes.body.decisionAt !== null, 'decisionAt timestamp recorded');
    const repeatedDecisionRes = await request(app)
      .put(`/api/changes/${cr1Id}/status`)
      .set('Authorization', 'Bearer ' + token1)
      .send({ status: 'Rejected' });
    assert(repeatedDecisionRes.status === 409, 'A decided change request cannot be re-decided');

    // Submit and Reject Change Request 2
    const cr2 = await request(app)
      .post(`/api/projects/${projectId}/changes`)
      .set('Authorization', `Bearer ${token1}`)
      .send({
        title: 'Native iOS & Android Mobile Apps',
        description: 'Build native companion mobile applications.',
        reason: 'Outside contract scope, client budget insufficient.',
        additionalCost: 6000,
        additionalEffort: '20 days',
        additionalTime: 20,
      });
    assert(cr2.status === 201, 'Creates Change Request 2');
    const cr2Id = cr2.body._id;

    const rejectRes = await request(app)
      .put(`/api/changes/${cr2Id}/status`)
      .set('Authorization', `Bearer ${token1}`)
      .send({
        status: 'Rejected',
        decisionNote: 'Deferred to Phase 2 after web platform release.',
      });
    assert(rejectRes.status === 200, 'PUT /api/changes/:id/status updates status to "Rejected"');
    assert(rejectRes.body.status === 'Rejected', 'Change Request status is now Rejected');

    // Verify GET /api/changes (Global)
    const allChangesRes = await request(app)
      .get('/api/changes')
      .set('Authorization', `Bearer ${token1}`);
    assert(allChangesRes.status === 200, 'GET /api/changes returns 200 OK');
    assert(allChangesRes.body.length === 2, 'Global change requests list contains both requests');

    // TEST 9: Milestones Management
    console.log('\n8. Testing Milestones Tracking...');
    const ms1 = await request(app)
      .post(`/api/projects/${projectId}/milestones`)
      .set('Authorization', `Bearer ${token1}`)
      .send({
        title: 'MVP Backend Architecture',
        description: 'Complete data models, REST APIs, and authentication',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'High',
        status: 'Not Started',
        owner: new mongoose.Types.ObjectId().toString(),
        projectId: new mongoose.Types.ObjectId().toString(),
        completedAt: new Date().toISOString(),
      });
    assert(ms1.status === 201, 'POST /api/projects/:id/milestones creates milestone');
    assert(
      ms1.body.owner === projRes.body.owner &&
        ms1.body.projectId === projectId &&
        ms1.body.completedAt === null,
      'Milestone creation cannot override ownership or completion metadata'
    );
    const msId = ms1.body._id;

    const msUpdate = await request(app)
      .put(`/api/milestones/${msId}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({
        status: 'Completed',
        owner: new mongoose.Types.ObjectId().toString(),
        projectId: new mongoose.Types.ObjectId().toString(),
        completedAt: new Date('2000-01-01').toISOString(),
      });
    assert(msUpdate.status === 200, 'PUT /api/milestones/:id marks milestone as Completed');
    assert(msUpdate.body.completedAt !== null, 'completedAt timestamp recorded on completion');
    assert(
      msUpdate.body.owner === projRes.body.owner && msUpdate.body.projectId === projectId,
      'Milestone updates cannot override ownership or project association'
    );
    const reopenedMilestoneRes = await request(app)
      .put(`/api/milestones/${msId}`)
      .set('Authorization', 'Bearer ' + token1)
      .send({ status: 'Not Started' });
    assert(
      reopenedMilestoneRes.status === 200 && reopenedMilestoneRes.body.completedAt === null,
      'Reopening a milestone clears its completion timestamp'
    );

    // TEST 10: Activity Log Audit History
    console.log('\n9. Testing Activity Log Audit Trail...');
    const histRes = await request(app)
      .get(`/api/projects/${projectId}/history`)
      .set('Authorization', `Bearer ${token1}`);
    assert(histRes.status === 200, 'GET /api/projects/:id/history returns 200 OK');
    assert(histRes.body.length > 0, `Project history contains ${histRes.body.length} logged actions`);

    const recentActRes = await request(app)
      .get('/api/activity/recent?limit=20')
      .set('Authorization', `Bearer ${token1}`);
    assert(recentActRes.status === 200, 'GET /api/activity/recent returns 200 OK');
    assert(recentActRes.body.length > 0, `Global activity log returned ${recentActRes.body.length} events`);

    // TEST 11: Dashboard Statistics Aggregation
    console.log('\n10. Testing Dashboard Statistics...');
    const statsRes = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${token1}`);
    assert(statsRes.status === 200, 'GET /api/dashboard/stats returns 200 OK');
    assert(statsRes.body.totalProjects === 1, 'totalProjects is 1');
    assert(statsRes.body.approvedChanges === 1, 'approvedChanges is 1');
    assert(statsRes.body.rejectedChanges === 1, 'rejectedChanges is 1');
    assert(statsRes.body.additionalCostApproved === 1200, 'additionalCostApproved is $1200 (exact)');
    assert(statsRes.body.totalDeliverables === 2, 'totalDeliverables is 2');
    assert(statsRes.body.completedDeliverables === 1, 'completedDeliverables is 1');
    assert(statsRes.body.progress === 50, 'Overall progress is accurately 50%');

    // TEST 12: Security & Authorization (Multi-Tenant Isolation)
    console.log('\n11. Testing Multi-Tenant Authorization Security...');
    const user2Res = await request(app).post('/api/auth/register').send({
      name: 'Bob Competitor',
      email: 'bob@competitor.dev',
      password: 'password123',
      confirmPassword: 'password123',
    });
    const token2 = user2Res.body.token;

    // User 2 attempts to read User 1's project
    const unauthorizedProject = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token2}`);
    assert(
      unauthorizedProject.status === 404,
      'User 2 cannot access User 1 project (404 Not Found prevents ID enumeration)'
    );

    // User 2 attempts to approve User 1's change request
    const unauthorizedDecision = await request(app)
      .put(`/api/changes/${cr1Id}/status`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ status: 'Rejected' });
    assert(
      unauthorizedDecision.status === 403,
      'User 2 cannot approve/reject User 1 change request (403 Forbidden)'
    );

    // TEST 13: Project Summary Endpoint
    console.log('\n12. Testing Project Summary Aggregation...');
    const summaryRes = await request(app)
      .get(`/api/projects/${projectId}/summary`)
      .set('Authorization', `Bearer ${token1}`);
    assert(summaryRes.status === 200, 'GET /api/projects/:id/summary returns 200 OK');
    assert(summaryRes.body.project && summaryRes.body.deliverables && summaryRes.body.changeRequests && summaryRes.body.milestones, 'Summary contains aggregated project data');

    // Summary of Results
    console.log('\n====================================================');
    console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    await mongoose.disconnect();
    await mongoServer.stop();

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    if (mongoServer) await mongoServer.stop();
    process.exit(1);
  }
};

runTests();
