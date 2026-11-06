# FreelanceScope — Freelance Project Scope Manager

> **B.Tech Computer Science & Engineering — Backend Development Continuous Internal Assessment (CIA)**

FreelanceScope is a full-stack MERN application engineered to eliminate **scope creep** in freelance software engagements. It enables freelancers to define agreed deliverables, lock an immutable scope baseline, and systematically manage post-baseline client change requests with full audit history, cost tracking, and timeline impact analysis.

---

## 1. Problem Statement: Scope Creep in Freelance Projects

In freelance web and software contracts, **scope creep** occurs when clients continuously request additional features, modifications, and UI changes after the project agreement and pricing have already been finalized. 

### Why Conventional Project Tools Fail:
- Tools like Trello, Jira, or plain todo apps blend new change requests into the existing task list, obscuring what was originally agreed upon.
- Freelancers end up working extra hours without extra compensation because there is no formal audit trail of scope modifications.
- Disagreements arise at final handover because the client believes the additional features were part of the initial budget.

### FreelanceScope's Differentiating Solution:
FreelanceScope enforces a strict **two-tier scope boundary**:
1. **Original Agreed Deliverables (`originalScopeSnapshot`)**: Once defined and agreed with the client, the scope can be formally **locked**. The exact deliverable set is snapshotted into an immutable array within the project document.
2. **Separate Change Request Management (`ChangeRequest`)**: Any subsequent feature requests or additions are submitted to a dedicated change management workflow. Each change request details:
   - Request justification and client reasoning.
   - Additional billing cost and extra effort.
   - Additional time in days.
   - Distinct lifecycle status: `Pending`, `Approved`, or `Rejected`.
   - Immutable decision timestamps and audit notes.

Pending requests are **never** treated as approved deliverables, and rejected changes are permanently kept in the audit record without altering the project scope baseline.

---

## 2. Technology Stack

| Layer | Technology | Key Libraries / Modules |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite | React Router v7, Axios, Lucide React, Tailwind CSS |
| **Backend** | Node.js, Express.js | Mongoose ODM, JWT (`jsonwebtoken`), `bcryptjs`, `express-validator`, `cors`, `dotenv` |
| **Database** | MongoDB | Document-based persistence, multi-collection referencing, indexed queries |
| **Testing** | Node.js, Supertest | In-Memory MongoDB (`mongodb-memory-server`), automated API integration tests |

---

## 3. System Architecture

```
┌────────────────────────────────────────────────────────┐
│               React 18 Single Page App                 │
│  (AuthContext, React Router, Tailwind UI, Axios API)  │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP REST (JSON + JWT Bearer)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Express.js Server                    │
│    CORS Middleware ──▶ JWT Auth ──▶ express-validator  │
├────────────────────────────────────────────────────────┤
│                      Controllers                       │
│  authController       projectController                │
│  deliverableController changeRequestController         │
│  milestoneController  dashboardController              │
│  activityController   activityLogger (Service)         │
└───────────────────────────┬────────────────────────────┘
                            │ Mongoose ODM
                            ▼
┌────────────────────────────────────────────────────────┐
│                    MongoDB Database                    │
│  - users              - projects (with scope snapshot) │
│  - deliverables       - changerequests                 │
│  - milestones         - activitylogs                   │
└────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema Design & Relationships

### `User` Collection
- `_id`: ObjectId
- `name`: String (Required, trimmed, max 80 chars)
- `email`: String (Required, unique, lowercase, regex-validated)
- `password`: String (Hashed with `bcryptjs`, 10 salt rounds, `select: false`)
- `role`: String (`enum: ['freelancer', 'admin']`, default: `freelancer`)
- `timestamps`: `createdAt`, `updatedAt`

### `Project` Collection
- `_id`: ObjectId
- `owner`: ObjectId (References `User`, required, indexed)
- `projectName`: String (Required, max 120 chars)
- `clientName`: String (Required, max 120 chars)
- `clientEmail`: String (Required, lowercase, email format)
- `description`: String (Max 2000 chars)
- `budget`: Number (Base agreed budget, min 0)
- `startDate`: Date (Defaults to current date)
- `deadline`: Date (Required deadline)
- `status`: String (`enum: ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled']`)
- `priority`: String (`enum: ['Low', 'Medium', 'High', 'Critical']`)
- `revisionLimit`: Number (Agreed revision iterations)
- `originalScopeSnapshot`: Subdocument array storing deliverable snapshots at lock time:
  - `title`, `description`, `category`, `estimatedEffort`, `dueDate`, `revisionAllowance`, `status`
- `scopeLockedAt`: Date (Timestamp when original deliverables were locked)

### `Deliverable` Collection
- `_id`: ObjectId
- `projectId`: ObjectId (References `Project`, indexed)
- `owner`: ObjectId (References `User`)
- `title`: String (Required)
- `description`: String
- `category`: String (e.g., `Frontend`, `Backend`, `API`, `Design`)
- `estimatedEffort`: String (e.g., `3 days`)
- `dueDate`: Date
- `revisionAllowance`: Number (Defaults to 2)
- `status`: String (`enum: ['planned', 'in-progress', 'completed']`)
- `isOriginal`: Boolean (True if part of original agreement)

### `ChangeRequest` Collection
- `_id`: ObjectId
- `projectId`: ObjectId (References `Project`, indexed)
- `owner`: ObjectId (References `User`)
- `requestedBy`: ObjectId (References `User`)
- `title`: String (Required)
- `description`: String
- `reason`: String (Why change is requested beyond original scope)
- `additionalCost`: Number (Extra billing requested)
- `additionalEffort`: String (e.g., `2 days`)
- `additionalTime`: Number (Additional calendar days needed)
- `status`: String (`enum: ['Pending', 'Approved', 'Rejected']`, default: `Pending`)
- `decisionBy`: ObjectId (References `User`, recorded upon decision)
- `decisionAt`: Date (Timestamp of decision)
- `decisionNote`: String (Audit justification for approval or rejection)

### `Milestone` Collection
- `_id`: ObjectId
- `projectId`: ObjectId (References `Project`, indexed)
- `owner`: ObjectId (References `User`)
- `title`: String
- `description`: String
- `startDate`: Date
- `dueDate`: Date
- `completedAt`: Date (Automatically recorded when marked `Completed`)
- `status`: String (`enum: ['Not Started', 'In Progress', 'Completed', 'Overdue']`)
- `priority`: String (`enum: ['Low', 'Medium', 'High', 'Critical']`)

### `ActivityLog` Collection
- `_id`: ObjectId
- `projectId`: ObjectId (References `Project`, nullable)
- `userId`: ObjectId (References `User`)
- `action`: String (Enum of logged actions: `project_created`, `scope_locked`, `change_request_submitted`, `change_request_approved`, etc.)
- `description`: String (Human-readable description)
- `entityType`: String (`Project`, `Deliverable`, `ChangeRequest`, `Milestone`)
- `entityId`: ObjectId

---

## 5. REST API Documentation

Base URL: `http://localhost:5000/api`

### Authentication (`/api/auth`)
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user; returns JWT token + user profile |
| `POST` | `/api/auth/login` | Public | Authenticate user; returns JWT token |
| `GET` | `/api/auth/me` | Bearer Token | Get currently logged-in user profile |

### Projects (`/api/projects`)
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `GET` | `/api/projects` | Bearer Token | List all projects owned by authenticated user |
| `POST` | `/api/projects` | Bearer Token | Create new project with baseline client info |
| `GET` | `/api/projects/:id` | Bearer Token | Retrieve single project by ID (owner check enforced) |
| `PUT` | `/api/projects/:id` | Bearer Token | Update project details |
| `DELETE` | `/api/projects/:id` | Bearer Token | Delete project (cascades to deliverables, changes, milestones, logs) |
| `POST` | `/api/projects/:id/lock-scope` | Bearer Token | Snapshot current deliverables into `originalScopeSnapshot` |
| `GET` | `/api/projects/:id/summary` | Bearer Token | Aggregated view of project, deliverables, changes, and milestones |
| `GET` | `/api/projects/:id/history` | Bearer Token | Retrieve activity log for specific project |

### Deliverables (`/api/deliverables` & `/api/projects/:id/deliverables`)
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `GET` | `/api/projects/:id/deliverables` | Bearer Token | List deliverables for project |
| `POST` | `/api/projects/:id/deliverables` | Bearer Token | Create new deliverable item |
| `PUT` | `/api/deliverables/:id` | Bearer Token | Update deliverable status or content |
| `DELETE` | `/api/deliverables/:id` | Bearer Token | Remove deliverable item |

### Change Requests (`/api/changes` & `/api/projects/:id/changes`)
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `GET` | `/api/changes` | Bearer Token | List all change requests across all user projects |
| `GET` | `/api/projects/:id/changes` | Bearer Token | List change requests for specific project |
| `POST` | `/api/projects/:id/changes` | Bearer Token | Submit new change request with cost & time estimate |
| `GET` | `/api/changes/:id` | Bearer Token | Retrieve change request by ID |
| `PUT` | `/api/changes/:id/status` | Bearer Token | Approve or Reject change request with decision note |

### Milestones (`/api/milestones` & `/api/projects/:id/milestones`)
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `GET` | `/api/projects/:id/milestones` | Bearer Token | List milestones for project |
| `POST` | `/api/projects/:id/milestones` | Bearer Token | Create project milestone |
| `PUT` | `/api/milestones/:id` | Bearer Token | Update milestone status/due date (sets `completedAt`) |
| `DELETE` | `/api/milestones/:id` | Bearer Token | Remove milestone |

### Dashboard & Activity (`/api/dashboard` & `/api/activity`)
| Method | Endpoint | Protection | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Bearer Token | Aggregated metrics (total projects, approved changes, budget, progress) |
| `GET` | `/api/dashboard/recent-activities` | Bearer Token | Recent activity logs for dashboard widget |
| `GET` | `/api/activity/recent` | Bearer Token | Full audit trail queryable with limit parameter |

---

## 6. Installation & Execution Guide

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- MongoDB (Local Community Server running on `mongodb://127.0.0.1:27017/` or MongoDB Atlas URI)

### Step 1: Clone or Navigate to Directory
```powershell
cd c:\Users\scand\Downloads\backend-main\backend-main
```

### Step 2: Configure Environment Variables
Backend configuration in `server/.env`:
```ini
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/freelancescope
JWT_SECRET=freelancescope_secure_jwt_dev_secret_key_btech_cia_2026
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Frontend configuration in `.env`:
```ini
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Install Dependencies
```powershell
# Install frontend packages
npm.cmd install

# Install backend packages
cd server
npm.cmd install
cd ..
```

### Step 4: Run the Automated Integration Test Suite
To verify all 68 integration tests before launching servers:
```powershell
cd server
npm.cmd test
cd ..
```

### Step 5: Start the Development Servers
For the included local MongoDB binary, start the database first in a terminal:

```powershell
cd server
npm.cmd run db
```

If you use MongoDB Community Server or Atlas instead, ensure the configured `MONGODB_URI` is reachable.

Open two additional terminal windows:

**Terminal 1 — Express Backend:**
```powershell
cd server
npm.cmd run dev
# Server will listen on http://localhost:5000
```

**Terminal 2 — React Frontend:**
```powershell
npm.cmd run dev
# Vite will serve frontend on http://localhost:5173
```

Visit `http://localhost:5173` in your browser.

---

## 7. Quality Assurance & Test Verification

The application includes an automated integration test suite (`server/test-suite.js`) executing against an in-memory MongoDB database.

```
====================================================
  TEST RESULTS: 68 PASSED, 0 FAILED
====================================================
```

### Test Coverage Highlights:
- **Authentication**: Registration, password hashing, JWT signing, profile verification, duplicate email rejection (400), invalid password handling (401).
- **Multi-Tenant Security**: User 1 cannot access User 2's projects (404 Not Found prevents enumeration); User 2 cannot approve User 1's change requests (403 Forbidden).
- **Core Scope Creep Logic**: Deliverables snapshotted once into `originalScopeSnapshot`; locked original scope cannot be expanded, edited, or deleted (progress status remains editable); separate change requests preserve the baseline and have one-way pending-to-decision transitions.
- **Ownership & Validation**: Project, deliverable, change request, and milestone updates ignore client-supplied ownership/association fields; milestone completion timestamps are maintained by the API.
- **Frontend Quality**: Zero TypeScript errors (`npm.cmd run typecheck`); production bundle built successfully with Vite (`npm.cmd run build`).
