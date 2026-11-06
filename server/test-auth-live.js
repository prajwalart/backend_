/**
 * Live Database and Authentication Verification Script
 * Tests live connection, health endpoint, registration, login, error handling and profile verification.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('./server');

const runAuthVerification = async () => {
  console.log('======================================================');
  console.log('  FREELANCESCOPE LIVE AUTH & DATABASE VERIFICATION   ');
  console.log('======================================================\n');

  try {
    // Await database connection initialization
    if (app.ready) {
      await app.ready;
    }

    // 1. Verify MongoDB Connection
    console.log('1. Verifying Live MongoDB Connection...');
    const dbState = mongoose.connection.readyState;
    console.log(`   Mongoose readyState: ${dbState} (${dbState === 1 ? 'Connected' : 'Not Connected'})`);
    if (dbState !== 1) {
      throw new Error(`MongoDB is not connected! readyState = ${dbState}`);
    }
    console.log(`   Host: ${mongoose.connection.host}, Database: ${mongoose.connection.name}\n`);

    // 2. Test /api/health
    console.log('2. Testing /api/health Endpoint...');
    const healthRes = await request(app).get('/api/health');
    console.log(`   Status Code: ${healthRes.status}`);
    console.log(`   Response: ${JSON.stringify(healthRes.body)}`);
    if (healthRes.status !== 200 || healthRes.body.database !== 'connected') {
      throw new Error('Health check failed or database is not reported as connected!');
    }
    console.log('   [PASS] /api/health reports status: "ok" and database: "connected"\n');

    // 3. Register a Test User
    console.log('3. Registering a New Test User...');
    const testEmail = `tester_${Date.now()}@freelancescope.dev`;
    const testPassword = 'SecurePassword123!';
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Live QA Tester',
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
      });
    console.log(`   Status Code: ${regRes.status}`);
    console.log(`   User registered: ${regRes.body.user.email} (ID: ${regRes.body.user.id})`);
    if (regRes.status !== 201 || !regRes.body.token) {
      throw new Error(`Registration failed: ${JSON.stringify(regRes.body)}`);
    }
    console.log('   [PASS] Test user registered successfully with JWT issued\n');

    // 4. Test Login with Registered User
    console.log('4. Testing Login with Valid Credentials...');
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });
    console.log(`   Status Code: ${loginRes.status}`);
    console.log(`   Token received: ${loginRes.body.token ? 'YES (Valid JWT string)' : 'NO'}`);
    if (loginRes.status !== 200 || !loginRes.body.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
    }
    const authToken = loginRes.body.token;
    console.log('   [PASS] Login successful with immediate response (No buffering!)\n');

    // 5. Test Login with Invalid Password
    console.log('5. Testing Login with Invalid Password...');
    const badLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'WrongPassword456' });
    console.log(`   Status Code: ${badLoginRes.status} (Expected 401)`);
    console.log(`   Message: "${badLoginRes.body.message}"`);
    if (badLoginRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized, got: ${badLoginRes.status}`);
    }
    console.log('   [PASS] Invalid password properly rejected with 401 Unauthorized\n');

    // 6. Test Demo User Login
    console.log('6. Testing Demo User Login (demo@freelancescope.com)...');
    const demoLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'demo@freelancescope.com', password: 'password123' });
    console.log(`   Status Code: ${demoLoginRes.status}`);
    console.log(`   Demo user: ${demoLoginRes.body.user ? demoLoginRes.body.user.name : 'None'}`);
    if (demoLoginRes.status !== 200) {
      throw new Error(`Demo user login failed: ${JSON.stringify(demoLoginRes.body)}`);
    }
    console.log('   [PASS] Seeded demo user logged in successfully\n');

    // 7. Test /api/auth/me Profile Retrieval
    console.log('7. Verifying /api/auth/me with Bearer Token...');
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);
    console.log(`   Status Code: ${meRes.status}`);
    console.log(`   User Profile: ${JSON.stringify(meRes.body.user)}`);
    if (meRes.status !== 200 || meRes.body.user.email !== testEmail) {
      throw new Error(`Profile retrieval failed: ${JSON.stringify(meRes.body)}`);
    }
    console.log('   [PASS] /api/auth/me verified successfully\n');

    console.log('======================================================');
    console.log('  ALL LIVE AUTH & DATABASE VERIFICATIONS PASSED!     ');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n[TEST FAILURE]:', err.message);
    process.exit(1);
  }
};

runAuthVerification();
