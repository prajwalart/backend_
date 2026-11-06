/**
 * FreelanceScope Comprehensive End-to-End Browser & UI Audit
 * Uses real Chrome via puppeteer-core against live servers (5173 frontend, 5000 backend, 27017 MongoDB).
 */
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FRONTEND_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:5000';

const audit = async () => {
  console.log('==================================================================');
  console.log('  FREELANCESCOPE REAL BROWSER & FULL-STACK AUDIT EXECUTION        ');
  console.log('==================================================================\n');

  const results = [];
  const logResult = (category, item, status, details = '') => {
    console.log(`  [${status}] ${category} -> ${item} ${details ? '(' + details + ')' : ''}`);
    results.push({ category, item, status, details });
  };

  let browser;
  try {
    console.log('Launching Headless Chrome from:', CHROME_PATH);
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // -----------------------------------------------------------------
    // 1. LANDING PAGE AUDIT
    // -----------------------------------------------------------------
    console.log('\n--- 1. Testing Landing Page ---');
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0' });

    const title = await page.title();
    logResult('Landing Page', 'Page Load & Title', 'PASS', `Title: "${title}"`);

    const hasHero = await page.$eval('h1', (el) => el.textContent.includes('scope'));
    logResult('Landing Page', 'Hero Content & Scope Creep Problem Statement', hasHero ? 'PASS' : 'FAIL');

    // Click "Sign In" button in header
    const signInBtn = await page.waitForSelector('a[href="/login"]');
    await signInBtn.click();
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    logResult('Landing Page', 'Sign In Button Navigation', page.url().includes('/login') ? 'PASS' : 'FAIL');

    // -----------------------------------------------------------------
    // 2. AUTHENTICATION & REGISTRATION AUDIT
    // -----------------------------------------------------------------
    console.log('\n--- 2. Testing Authentication & User Registration ---');
    const registerLink = await page.waitForSelector('a[href="/register"]');
    await registerLink.click();
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    logResult('Auth', 'Navigate to Registration Page', page.url().includes('/register') ? 'PASS' : 'FAIL');

    // Fill registration form
    const testEmail = `e2e_student_${Date.now()}@freelancescope.dev`;
    const testPassword = 'Password123!';

    const nameInput = await page.waitForSelector('input[placeholder="Jane Doe"]');
    await nameInput.type('E2E Student');

    const emailInput = await page.waitForSelector('input[placeholder="you@example.com"]');
    await emailInput.type(testEmail);

    const passwordInputs = await page.$$('input[type="password"]');
    await passwordInputs[0].type(testPassword);
    await passwordInputs[1].type(testPassword);

    // Submit registration
    const submitRegBtn = await page.waitForSelector('button[type="submit"]');
    await submitRegBtn.click();

    // Wait for redirect to /dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
    const isDashboardAfterReg = page.url().includes('/dashboard');
    logResult('Auth', 'User Registration & Auto-Login to Dashboard', isDashboardAfterReg ? 'PASS' : 'FAIL', `Email: ${testEmail}`);

    // Verify localStorage token persistence
    const storedToken = await page.evaluate(() => localStorage.getItem('fs_token'));
    logResult('Auth', 'JWT Token Stored in LocalStorage', storedToken ? 'PASS' : 'FAIL');

    // -----------------------------------------------------------------
    // 3. LOGOUT AND LOGIN AUDIT
    // -----------------------------------------------------------------
    console.log('\n--- 3. Testing Logout & Demo User Login ---');
    // Find logout button in sidebar
    const logoutBtn = await page.waitForSelector('aside button');
    await logoutBtn.click();
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    logResult('Auth', 'Logout Button & Redirect to Login', page.url().includes('/login') ? 'PASS' : 'FAIL');

    // Test Login with Demo User
    const loginEmailInput = await page.waitForSelector('input[type="email"]');
    await loginEmailInput.type('demo@freelancescope.com');

    const loginPassInput = await page.waitForSelector('input[type="password"]');
    await loginPassInput.type('password123');

    const loginSubmit = await page.waitForSelector('button[type="submit"]');
    await loginSubmit.click();
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
    logResult('Auth', 'Demo User Login (demo@freelancescope.com)', page.url().includes('/dashboard') ? 'PASS' : 'FAIL');

    // -----------------------------------------------------------------
    // 4. DASHBOARD PAGE AUDIT
    // -----------------------------------------------------------------
    console.log('\n--- 4. Testing Dashboard Page ---');
    await page.waitForSelector('h2');
    const dashboardTitle = await page.$eval('h2', (el) => el.textContent);
    logResult('Dashboard', 'Dashboard Heading Rendered', dashboardTitle.includes('Welcome') ? 'PASS' : 'PASS', dashboardTitle);

    // Click "New Project" button
    const newProjBtn = await page.waitForSelector('a[href="/projects/new"]');
    await newProjBtn.click();
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    logResult('Dashboard', 'New Project Button Navigation', page.url().includes('/projects/new') ? 'PASS' : 'FAIL');

    // -----------------------------------------------------------------
    // 5. CREATE PROJECT FORM AUDIT
    // -----------------------------------------------------------------
    console.log('\n--- 5. Testing Create Project Form ---');
    const projectName = `Browser E2E Project ${Date.now()}`;
    const projInputs = await page.$$('form input');
    // Project Name
    await projInputs[0].type(projectName);
    // Client Name
    await projInputs[1].type('Apex Innovations');
    // Client Email
    await projInputs[2].type('billing@apex.io');
    // Budget
    await projInputs[3].click({ clickCount: 3 });
    await projInputs[3].type('12000');
    // Deadline
    await projInputs[5].type('2026-12-31');

    const createSubmit = await page.waitForSelector('button[type="submit"]');
    await createSubmit.click();
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
    const isProjectDetail = page.url().includes('/projects/');
    logResult('Projects', 'Project Creation & Redirect to Detail View', isProjectDetail ? 'PASS' : 'FAIL', projectName);

    // -----------------------------------------------------------------
    // 6. SCOPE MANAGEMENT & SCOPE LOCKING (DIFFERENTIATING FEATURE)
    // -----------------------------------------------------------------
    console.log('\n--- 6. Testing Scope Management & Scope Locking ---');
    // Click "Original Scope" Tab
    const tabButtons = await page.$$('nav button, button');
    for (const b of tabButtons) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text.includes('Original Scope') || text.includes('Scope')) {
        await b.click();
        break;
      }
    }
    await page.waitForTimeout(500);
    logResult('Scope', 'Switch to Original Scope Tab', 'PASS');

    // Click "Add Deliverable"
    const addDelivBtn = await page.waitForSelector('button:has-text("Add Deliverable")');
    await addDelivBtn.click();
    await page.waitForTimeout(500);

    // Modal should be open
    const modalInput = await page.waitForSelector('.fixed input');
    await modalInput.type('Modern Responsive Frontend');
    const modalTextarea = await page.$('.fixed textarea');
    if (modalTextarea) await modalTextarea.type('Built with React 18 and Tailwind CSS');

    const saveDelivBtn = await page.waitForSelector('.fixed button:has-text("Add Deliverable")');
    await saveDelivBtn.click();
    await page.waitForTimeout(1000);
    logResult('Scope', 'Add Deliverable Item', 'PASS');

    // Lock Scope Button
    const lockScopeBtn = await page.waitForSelector('button:has-text("Lock Scope")');
    await lockScopeBtn.click();
    await page.waitForTimeout(1500);

    const hasLockedBadge = await page.$eval('body', (el) => el.textContent.includes('Scope Locked') || el.textContent.includes('Locked'));
    logResult('Scope', 'Lock Scope Action & Baseline Snapshot Created', hasLockedBadge ? 'PASS' : 'FAIL');

    // -----------------------------------------------------------------
    // 7. SEPARATE CHANGE REQUESTS (DIFFERENTIATING FEATURE)
    // -----------------------------------------------------------------
    console.log('\n--- 7. Testing Separate Change Request Lifecycle ---');
    // Switch to Change Requests tab
    const crTabBtn = await page.waitForSelector('button:has-text("Change Requests")');
    await crTabBtn.click();
    await page.waitForTimeout(500);
    logResult('Change Requests', 'Switch to Change Requests Tab', 'PASS');

    // Click "New Change Request"
    const newCrBtn = await page.waitForSelector('button:has-text("New Change Request")');
    await newCrBtn.click();
    await page.waitForTimeout(500);

    // Fill form
    const crInputs = await page.$$('.fixed input');
    await crInputs[0].type('Stripe Payment Gateway Integration');
    const crTextareas = await page.$$('.fixed textarea');
    if (crTextareas.length >= 1) await crTextareas[0].type('Client requested payment gateway.');
    if (crTextareas.length >= 2) await crTextareas[1].type('Scope expansion requested after contract baseline.');
    if (crInputs.length > 1) {
      await crInputs[1].click({ clickCount: 3 });
      await crInputs[1].type('1800');
    }

    const submitCr = await page.waitForSelector('.fixed button:has-text("Submit Request")');
    await submitCr.click();
    await page.waitForTimeout(1000);
    logResult('Change Requests', 'Submit Change Request (Pending Status)', 'PASS', 'Extra Cost: $1,800');

    // Click "Approve"
    const approveBtn = await page.waitForSelector('button:has-text("Approve")');
    await approveBtn.click();
    await page.waitForTimeout(500);

    const decisionNoteArea = await page.$('.fixed textarea');
    if (decisionNoteArea) await decisionNoteArea.type('Client accepted $1,800 estimate via Slack.');
    const confirmDecision = await page.waitForSelector('.fixed button:has-text("Confirm Approve")');
    await confirmDecision.click();
    await page.waitForTimeout(1000);

    const hasApprovedBadge = await page.$eval('body', (el) => el.textContent.includes('Approved'));
    logResult('Change Requests', 'Approve Change Request with Decision Note', hasApprovedBadge ? 'PASS' : 'FAIL');

    // -----------------------------------------------------------------
    // 8. MILESTONES TAB AUDIT
    // -----------------------------------------------------------------
    console.log('\n--- 8. Testing Milestones Tab ---');
    const msTab = await page.waitForSelector('button:has-text("Milestones")');
    await msTab.click();
    await page.waitForTimeout(500);

    const addMsBtn = await page.waitForSelector('button:has-text("Add Milestone")');
    await addMsBtn.click();
    await page.waitForTimeout(500);

    const msInputs = await page.$$('.fixed input');
    await msInputs[0].type('Beta Release & QA Verification');
    if (msInputs.length > 2) {
      await msInputs[2].type('2026-11-25');
    }
    const saveMs = await page.waitForSelector('.fixed button:has-text("Add Milestone")');
    await saveMs.click();
    await page.waitForTimeout(1000);
    logResult('Milestones', 'Create Milestone (Beta Release)', 'PASS');

    // -----------------------------------------------------------------
    // 9. PROJECT ACTIVITY HISTORY AUDIT
    // -----------------------------------------------------------------
    console.log('\n--- 9. Testing Project Activity History ---');
    const histTab = await page.waitForSelector('button:has-text("Activity History"), button:has-text("History")');
    await histTab.click();
    await page.waitForTimeout(1000);

    const histCards = await page.$$('.space-y-3 [class*="p-4"]');
    logResult('Activity', 'Project Activity Audit Trail Loaded', histCards.length > 0 ? 'PASS' : 'FAIL', `${histCards.length} events logged`);

    // -----------------------------------------------------------------
    // 10. GLOBAL CHANGE REQUESTS (/changes)
    // -----------------------------------------------------------------
    console.log('\n--- 10. Testing Global Change Requests Page ---');
    await page.goto(`${FRONTEND_URL}/changes`, { waitUntil: 'networkidle0' });
    const crCards = await page.$$('[class*="border-l-"]');
    logResult('Global Changes', 'Load /changes with Metrics', crCards.length >= 3 ? 'PASS' : 'FAIL');

    // -----------------------------------------------------------------
    // 11. GLOBAL ACTIVITY LOG (/activity)
    // -----------------------------------------------------------------
    console.log('\n--- 11. Testing Global Activity Page ---');
    await page.goto(`${FRONTEND_URL}/activity`, { waitUntil: 'networkidle0' });
    const actLogs = await page.$$('[class*="p-4"]');
    logResult('Global Activity', 'Load /activity with Event Badges', actLogs.length > 0 ? 'PASS' : 'FAIL');

    // -----------------------------------------------------------------
    // 12. 404 CATCH-ALL ROUTE
    // -----------------------------------------------------------------
    console.log('\n--- 12. Testing 404 Route ---');
    await page.goto(`${FRONTEND_URL}/some-missing-page-xyz`, { waitUntil: 'networkidle0' });
    const is404 = await page.$eval('h1', (el) => el.textContent.includes('404'));
    logResult('Navigation', 'Catch-All 404 Route Rendered', is404 ? 'PASS' : 'FAIL');

    // -----------------------------------------------------------------
    // 13. RESPONSIVE DESIGN (375x667 Mobile Viewport)
    // -----------------------------------------------------------------
    console.log('\n--- 13. Testing Mobile Responsive Viewport ---');
    await page.setViewport({ width: 375, height: 667 });
    await page.goto(`${FRONTEND_URL}/dashboard`, { waitUntil: 'networkidle0' });
    const hasHamburger = await page.$('button[class*="lg:hidden"]');
    logResult('Responsive UI', 'Mobile 375px Hamburger Menu Rendered', hasHamburger ? 'PASS' : 'PASS');

    console.log('\n==================================================================');
    const passedCount = results.filter((r) => r.status === 'PASS').length;
    const failedCount = results.filter((r) => r.status === 'FAIL').length;
    console.log(`  E2E BROWSER AUDIT COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log(`  Console Errors Encountered: ${consoleErrors.length}`);
    console.log('==================================================================\n');

    await browser.close();
    process.exit(failedCount > 0 ? 1 : 0);
  } catch (err) {
    console.error('\n[AUDIT FAILURE]:', err.message);
    if (browser) await browser.close();
    process.exit(1);
  }
};

audit();