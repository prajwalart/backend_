# FreelanceScope — 5-Minute CIA Presentation & Demo Script

> **Student Presentation Guide for CIA Evaluation**  
> **Target Duration:** Exactly 5 Minutes  
> **Student Role:** Lead Developer & Presenter  
> **Audience:** Internal Examiner / Lecturer

---

## Presentation Checklist Before You Begin
- [ ] Backend running in Terminal 1 (`npm.cmd run dev` in `server/`)
- [ ] Frontend running in Terminal 2 (`npm.cmd run dev` in root)
- [ ] Browser open at `http://localhost:5173`
- [ ] Test suite verified (`cd server && npm.cmd test` -> 55 PASSED)

---

## Timeline Overview
| Time | Phase | Action / Screen |
|---|---|---|
| **0:00 – 0:45** | Introduction & Problem | Landing Page (`/`) |
| **0:45 – 1:30** | Authentication & Dashboard | Sign Up / Login (`/login`) ➔ Dashboard (`/dashboard`) |
| **1:30 – 2:30** | Project Creation & Scope Locking | Project Details (`/projects/:id`) ➔ Scope Tab |
| **2:30 – 3:45** | Scope Creep Handling (Differentiating Feature) | Change Requests Tab ➔ Approve/Reject Modal |
| **3:45 – 4:30** | Milestones & Audit History | Milestones Tab ➔ Global Activity Log (`/activity`) |
| **4:30 – 5:00** | Architectural Summary & Conclusion | Architecture Overview & Wrap-up |

---

## Detailed Spoken Script & Screen Actions

### [0:00 – 0:45] Introduction & The Problem Statement
**Screen:** Open `http://localhost:5173` (Landing Page)

**What to Say:**
> *"Good morning, respected faculty and examiner. Today, I am presenting **FreelanceScope**, a full-stack MERN application built to solve one of the most persistent and costly problems in software freelancing: **Scope Creep**.*
>
> *In freelance contracts, clients frequently agree on an initial price and deadline, but midway through development they begin asking for 'small extra features'—like adding payment gateways, extra pages, or admin dashboards. Traditional tools like Trello or Jira simply mix these extra requests into the to-do list. The freelancer ends up doing unpaid overtime, and disputes erupt at final delivery.*
>
> *FreelanceScope solves this by enforcing a strict **two-tier scope boundary**: locking the original agreed deliverables as an immutable baseline, while tracking every subsequent change request with separate cost, time, and audit approval.*

---

### [0:45 – 1:30] Authentication & Dashboard Overview
**Screen:** Click **Login** (or **Get Started**) ➔ Log in with demo account (`alex@freelancescope.dev` / `password123`) ➔ Navigate to `/dashboard`

**What to Say:**
> *"I will now sign in using our JWT-based authentication system. Passwords are encrypted on the backend using `bcryptjs` with 10 salt rounds.*
>
> *Here is the FreelanceScope **Command Dashboard**. At a single glance, a freelancer sees:
> 1. Active vs. completed projects.
> 2. Total agreed contract budget.
> 3. **Additional Revenue Approved from Scope Changes**—highlighting the exact extra money earned rather than given away for free.
> 4. Overall completion percentage calculated dynamically from deliverable states.
> 5. A real-time timeline of upcoming milestones and recent audit logs.*"

---

### [1:30 – 2:30] Project Creation & The Scope Lock Feature
**Screen:** Navigate to **Projects** ➔ Click on an existing project (e.g., *E-Commerce Platform Redesign*) ➔ Click **Scope** Tab

**What to Say:**
> *"Let us inspect an active project workspace. Under the **Scope Tab**, we have our baseline agreed deliverables:
> - Item 1: 'User Authentication & Roles'
> - Item 2: 'Product Catalog & Search Filters'
>
> *Notice this purple badge: **'Scope Locked'**. When a contract is finalized, the freelancer clicks 'Lock Scope'. The Express backend takes an instant snapshot of all agreed deliverables into the project document under `originalScopeSnapshot` with an immutable timestamp.*
>
> *Even if deliverable statuses change during development, this baseline snapshot remains untouched as permanent evidence of the original agreement.*"

---

### [2:30 – 3:45] The Differentiating Feature: Change Request Management
**Screen:** Click **Change Requests** Tab ➔ Click **New Change Request** ➔ Submit a request ➔ Approve with note

**What to Say:**
> *"Now, let's look at the core differentiating feature of our project. Suppose the client calls and says: 'We also need Stripe payment gateway integration with Apple Pay.'*
>
> *Instead of adding this to the baseline deliverables, the freelancer clicks **New Change Request**:
> - We enter the title: 'Stripe & Apple Pay Integration'.
> - We specify the scope justification: 'Requested after contract signoff.'
> - We attach an extra cost: '\$1,200'.
> - We specify additional calendar time: '3 days'.
>
> *When submitted, notice its status: **Pending**. Crucially, the pending change is **not** treated as approved work, nor is it added to the baseline.*
>
> *Now, when the client confirms, the freelancer clicks **Approve**. A decision modal appears, allowing us to record an audit note—such as 'Approved via email on Nov 5th'.*
>
> *Once approved, the status changes to green, the decision timestamp is permanently recorded, and the project budget dynamically updates to reflect the additional revenue.*
>
> *Conversely, if a request is **Rejected**, it stays in the history to document that the feature was formally declined, preventing future misunderstandings.*"

---

### [3:45 – 4:30] Milestones & Activity History
**Screen:** Click **Milestones** Tab ➔ Toggle milestone status ➔ Navigate to **Activity Log** in Sidebar (`/activity`)

**What to Say:**
> *"In the **Milestones Tab**, we break delivery into manageable phases. When a milestone is marked as 'Completed', the backend automatically records `completedAt = new Date()`, enabling timeline accuracy.*
>
> *Next, let's look at the **Global Activity Log**. Every action across the system—project creation, deliverable changes, scope locking, and change approvals—generates an immutable event in MongoDB.*
>
> *Freelancers can filter by event type (Scope Locks, Changes, Deliverables) or search across projects, giving them a complete audit trail if a client questions project progress.*"

---

### [4:30 – 5:00] Architecture Summary & Conclusion
**Screen:** Return to Dashboard or open code/architecture slide

**What to Say:**
> *"To summarize the technical architecture:
> - **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS, and React Router v7. Zero type errors and full production build.
> - **Backend**: Node.js and Express REST APIs with JWT authentication, multi-tenant owner checks, and `express-validator` at the route boundary.
> - **Database**: MongoDB with Mongoose ODM models for Users, Projects, Deliverables, ChangeRequests, Milestones, and ActivityLogs.
> - **Quality Assurance**: We have implemented an automated integration test suite running 55 tests covering all CRUD operations, security checks, and edge cases with a **100% pass rate**.
>
> *FreelanceScope transforms freelance software delivery from chaotic verbal promises into professional, profitable, and auditable engineering. Thank you, and I welcome any questions!*"

---

## Quick Reference: 3 Questions the Examiner is Likely to Ask You

1. **"What happens if User B tries to view or approve User A's change request?"**
   > *Answer: "Our JWT middleware extracts the authenticated user ID. In `changeRequestController.js`, we verify `request.owner.toString() === req.user._id.toString()`. If they don't match, it immediately returns HTTP 403 Forbidden, guaranteeing complete tenant isolation."*

2. **"Why didn't you just add a boolean flag `isChangeRequest` inside the Deliverable collection?"**
   > *Answer: "Because change requests represent an entirely different business entity. They carry additional billing costs, time delays, approval/rejection decision notes, decision timestamps, and request reasons. Separating them into a dedicated `ChangeRequest` collection keeps our schema normalized, prevent bugs, and preserves an indisputable baseline."*

3. **"How did you verify your backend code?"**
   > *Answer: "We developed an automated integration test suite in `server/test-suite.js` using `supertest` and an in-memory MongoDB server. It executes 55 real end-to-end tests covering registration, login, project creation, deliverables, scope locking, change approval/rejection, milestones, and dashboard stats, all of which passed."*

