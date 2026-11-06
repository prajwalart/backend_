# FreelanceScope — Comprehensive CIA Viva & Project Explanation

> **Author Guide for B.Tech Computer Science & Engineering Student**  
> **Course:** Backend Development Continuous Internal Assessment (CIA)  
> **Project:** FreelanceScope (Freelance Project Scope Manager)

---

## Table of Contents
1. [Section A: Project Overview](#section-a-project-overview)
2. [Section B: Why This Project Was Developed](#section-b-why-this-project-was-developed)
3. [Section C: What Scope Creep Means](#section-c-what-scope-creep-means)
4. [Section D: What Makes FreelanceScope Unique (Differentiating Feature)](#section-d-what-makes-freelancescope-unique)
5. [Section E: Why the MERN Stack Was Chosen](#section-e-why-the-mern-stack-was-chosen)
6. [Section F: React Frontend Architecture](#section-f-react-frontend-architecture)
7. [Section G: Node.js and Express Backend Architecture](#section-g-nodejs-and-express-backend-architecture)
8. [Section H: MongoDB and Mongoose ODM](#section-h-mongodb-and-mongoose-odm)
9. [Section I: Detailed Database Collections](#section-i-detailed-database-collections)
10. [Section J: REST API Architecture](#section-j-rest-api-architecture)
11. [Section K: JWT Authentication Workflow](#section-k-jwt-authentication-workflow)
12. [Section L: Secure Password Hashing (bcrypt)](#section-l-secure-password-hashing-bcrypt)
13. [Section M: Express Middleware Flow](#section-m-express-middleware-flow)
14. [Section N: Input Validation (express-validator)](#section-n-input-validation-express-validator)
15. [Section O: Centralized Error Handling](#section-o-centralized-error-handling)
16. [Section P: Project CRUD Workflow](#section-p-project-crud-workflow)
17. [Section Q: Original Scope Management & Locking](#section-q-original-scope-management--locking)
18. [Section R: Change Request Workflow](#section-r-change-request-workflow)
19. [Section S: Approval and Rejection Decision Workflow](#section-s-approval-and-rejection-decision-workflow)
20. [Section T: Milestone Management](#section-t-milestone-management)
21. [Section U: Activity Logging & Audit Trail](#section-u-activity-logging--audit-trail)
22. [Section V: Frontend-to-Backend Communication](#section-v-frontend-to-backend-communication)

---

## Section A: Project Overview
**FreelanceScope** is a specialized project management platform built using the MERN stack (MongoDB, Express.js, React.js, Node.js). It is tailored specifically for freelance software developers, web designers, and independent agencies to protect their profitability.

Instead of managing tasks like generic tools (e.g., Trello or Todoist), FreelanceScope solves a critical business and contractual problem: **scope creep**. It provides an immutable snapshot of agreed project deliverables, while giving freelancers and clients a transparent process to submit, review, price, and approve extra features separately from the original contract.

---

## Section B: Why This Project Was Developed
Freelancers regularly suffer from financial loss and burnout because client agreements are informal or lack clear boundaries. 

**A classic real-world scenario:**
1. A freelancer agrees to build a 4-page business website for \$1,000 in 2 weeks.
2. In the second week, the client asks: *"Can we also add a Stripe payment gateway, user login, and an admin dashboard?"*
3. The freelancer adds these tasks to their to-do list.
4. At delivery, the project took 5 weeks instead of 2. The client still only pays \$1,000, arguing: *"You never told me this would cost extra!"*

FreelanceScope was built to solve this exact dispute by establishing clear software boundaries.

---

## Section C: What Scope Creep Means
**Scope creep** is the gradual, uncontrolled expansion of a project's requirements beyond the originally agreed contract, without adjustments to time, cost, or resources.

In software engineering, scope creep is considered one of the top causes of project failure, delayed deliveries, and financial loss.

---

## Section D: What Makes FreelanceScope Unique
Most task managers allow users to freely add tasks to a board. In those tools, an extra task looks identical to an original task.

FreelanceScope introduces a **Strict Two-Tier Scope Architecture**:
1. **Tier 1 — Baseline Scope Snapshot (`originalScopeSnapshot`)**:
   - The agreed deliverables (e.g., Homepage, Contact Page, About Page) are entered.
   - When the client signs off, the freelancer clicks **Lock Scope**.
   - The backend creates a deep copy snapshot into `project.originalScopeSnapshot` and saves `project.scopeLockedAt`.
   - Even if original deliverables are updated or completed, this snapshot remains immutable as legal proof of the initial agreement.
2. **Tier 2 — Separate Change Requests (`ChangeRequest`)**:
   - New client requests are **never** added directly to the baseline deliverables.
   - They are entered into the `ChangeRequest` collection with:
     - Justification / Client reason.
     - Additional cost (e.g., +\$400).
     - Additional time in calendar days (e.g., +3 days).
     - Status: `Pending`, `Approved`, or `Rejected`.
   - **Rules Enforced in Code:**
     - Pending requests are **not** counted as approved deliverables or added to the active budget.
     - Rejected requests remain in the audit trail but cannot alter the deliverables.
     - Approved requests update the calculated total project value without overwriting original baseline deliverables.

---

## Section E: Why the MERN Stack Was Chosen
1. **JavaScript / TypeScript End-to-End**: A single language is used across frontend components, backend APIs, data models, and database queries.
2. **MongoDB (NoSQL Document Store)**: Ideal for storing dynamic deliverable snapshots and nested change logs as JSON documents without requiring complex SQL joins.
3. **Express.js & Node.js**: Lightweight, non-blocking asynchronous event loop with powerful middleware architecture for JWT security and validation.
4. **React.js**: Declarative, component-based user interface enabling instant reactive updates when approving changes, updating milestone statuses, or filtering audit logs.

---

## Section F: React Frontend Architecture
The frontend is built with React 18 and Vite, organized cleanly into functional layers:
- **`src/pages/`**: Page views loaded via React Router:
  - `LandingPage.tsx`: Public showcase of product benefits.
  - `LoginPage.tsx` / `RegisterPage.tsx`: Secure auth forms.
  - `DashboardPage.tsx`: High-level metrics (active projects, pending changes, approved budget, timeline).
  - `ProjectsPage.tsx`: Project catalog with search and status filtering.
  - `ProjectFormPage.tsx`: Project creation with client terms.
  - `ProjectDetailPage.tsx`: Main workspace with 5 dedicated tabs:
    - *Overview*: Key project metadata, progress bars, budget metrics.
    - *Scope*: Original agreed deliverables and Scope Lock trigger.
    - *Changes*: Dedicated list of scope changes with Approve/Reject modal.
    - *Milestones*: Due dates, priorities, and status toggles.
    - *History*: Complete chronological audit trail.
  - `ChangeRequestsPage.tsx`: Global overview across all projects.
  - `ActivityPage.tsx`: Comprehensive audit log with filters.
  - `NotFoundPage.tsx`: Fallback 404 view.
- **`src/context/`**:
  - `AuthContext.tsx`: Provides `user`, `login`, `register`, and `logout` across the entire application using local storage and JWT tokens.
- **`src/services/`**: Axios API abstraction layers (`api.ts`, `authService.ts`, `projectService.ts`, `deliverableService.ts`, `changeRequestService.ts`, `milestoneService.ts`, `dashboardService.ts`).
- **`src/components/ui/`**: Reusable atomic UI components (`Badge`, `Button`, `Card`, `Modal`, `Input`, `ProgressBar`, `Spinner`, `Toast`).

---

## Section G: Node.js and Express Backend Architecture
The backend follows the classic **Layered MVC Pattern**:
1. **Entry Point (`server.js`)**: Configures CORS, parses JSON payloads, mounts API routes under `/api`, connects to MongoDB, and registers centralized error handling.
2. **Router Layer (`server/routes/`)**: Defines HTTP verbs, paths, validation middleware, and links to controller functions.
3. **Controller Layer (`server/controllers/`)**: Contains the business logic, database queries, and response formatting.
4. **Service Layer (`server/services/activityLogger.js`)**: Encapsulates reusable tasks such as creating audit logs.
5. **Model Layer (`server/models/`)**: Mongoose schemas enforcing database-level rules, data types, and default values.

---

## Section H: MongoDB and Mongoose ODM
**Mongoose** is an Object Data Modeling (ODM) library for MongoDB and Node.js. It provides:
- Schema definitions with strict type checking.
- Built-in and custom validators (e.g., email format regex).
- Automatic timestamp generation (`createdAt`, `updatedAt`).
- Population (`.populate()`) allowing foreign key referencing between collections.

---

## Section I: Detailed Database Collections

```
+--------------------------------------------------------+
|                          User                          |
+--------------------------------------------------------+
| _id: ObjectId                                          |
| name: String                                           |
| email: String (Unique)                                 |
| password: String (Hashed with bcrypt, select: false)   |
| role: String ('freelancer' | 'admin')                  |
+--------------------------------------------------------+
                           │ 1
                           │
                           ▼ *
+--------------------------------------------------------+
|                        Project                         |
+--------------------------------------------------------+
| _id: ObjectId                                          |
| owner: ObjectId -> User                                |
| projectName: String                                    |
| clientName: String                                     |
| clientEmail: String                                    |
| budget: Number                                         |
| deadline: Date                                         |
| status: 'Planning'|'In Progress'|'Completed'|...       |
| originalScopeSnapshot: [DeliverableSnapshotSchema]     |
| scopeLockedAt: Date                                    |
+--------------------------------------------------------+
         │ 1                         │ 1             │ 1
         │                           │               │
         ▼ *                         ▼ *             ▼ *
+--------------------+      +------------------+  +--------------------+
|    Deliverable     |      |  ChangeRequest   |  |     Milestone      |
+--------------------+      +------------------+  +--------------------+
| _id: ObjectId      |      | _id: ObjectId    |  | _id: ObjectId      |
| projectId -> Proj  |      | projectId -> Proj|  | projectId -> Proj  |
| owner -> User      |      | owner -> User    |  | owner -> User      |
| title: String      |      | title: String    |  | title: String      |
| status: planned |  |      | additionalCost: N|  | dueDate: Date      |
|   in-progress |    |      | additionalTime: N|  | status: Not Started|
|   completed        |      | status: Pending ||  |   | In Progress    |
| isOriginal: Boolean|      |   Approved |     |  |   | Completed      |
+--------------------+      |   Rejected       |  | completedAt: Date  |
                            | decisionNote: Str|  +--------------------+
                            | decisionAt: Date |
                            +------------------+
```

---

## Section J: REST API Architecture
The application uses standard REST conventions:
- `GET`: Read resources without side-effects.
- `POST`: Create new resources (Projects, Deliverables, Changes, Milestones).
- `PUT`: Update existing resources or mutate status.
- `DELETE`: Remove resources (with cascading deletion of child documents).
- HTTP Status Codes:
  - `200 OK`: Successful retrieval or update.
  - `201 Created`: Resource successfully created.
  - `400 Bad Request`: Input validation failed or duplicate key.
  - `401 Unauthorized`: Token missing or invalid.
  - `403 Forbidden`: User attempting to access or approve another user's project.
  - `404 Not Found`: Target resource does not exist.
  - `500 Internal Server Error`: Unhandled server exception.

---

## Section K: JWT Authentication Workflow
1. User submits email and password to `POST /api/auth/login`.
2. Backend validates credentials, generates a JSON Web Token signed with `JWT_SECRET`:
   ```javascript
   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
   ```
3. Frontend receives the token and stores it in `localStorage` under `fs_token`.
4. On all subsequent requests, Axios interceptor (`api.ts`) automatically attaches the token:
   ```javascript
   config.headers.Authorization = `Bearer ${token}`;
   ```
5. `auth.js` middleware on Express decodes the token, fetches the user from the database, and attaches it to `req.user`.

---

## Section L: Secure Password Hashing (bcrypt)
Passwords are **never** stored in plain text.
- During registration:
  ```javascript
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  ```
- During login:
  ```javascript
  const isMatch = await bcrypt.compare(password, user.password);
  ```
- In the User model, `select: false` ensures password hashes are never accidentally sent in API responses.

---

## Section M: Express Middleware Flow
Every incoming HTTP request passes through a pipeline:
1. `cors()`: Validates origin matches frontend URL (`http://localhost:5173`).
2. `express.json()`: Parses incoming JSON body.
3. `protect`: Validates JWT token and populates `req.user`.
4. `express-validator`: Validates input types, formats, and lengths.
5. `handleValidationErrors`: Rejects with 400 if validation errors exist.
6. Controller function: Executes business logic.
7. `errorHandler`: Formats exceptions into safe JSON responses.

---

## Section N: Input Validation (express-validator)
Input rules are defined in `server/validators/`:
- **Auth**: Name required, valid email, minimum 6-character password, password match.
- **Projects**: Project name required, valid client email, positive budget, valid ISO deadline.
- **Change Requests**: Title required, positive extra cost, non-negative days.
- **Decision Status**: Status must strictly be `Approved` or `Rejected`.

---

## Section O: Centralized Error Handling
In `server/middleware/errorHandler.js`:
- MongoDB `CastError` (invalid ObjectId format) -> returns `400 Invalid ID format`.
- Duplicate key error (`11000`) -> returns `400 A record with that email already exists`.
- Mongoose `ValidationError` -> maps individual field messages into a clean array.
- In production, error stack traces are hidden to prevent information disclosure.

---

## Section P: Project CRUD Workflow
- **Create**: Inserts new Project document with `owner: req.user._id` and logs activity.
- **Read**: Queries projects filtered by `{ owner: req.user._id }`. Users can never view another user's projects.
- **Update**: Modifies fields while running Mongoose validators.
- **Delete**: Cascading deletion executes:
  ```javascript
  await Deliverable.deleteMany({ projectId: project._id });
  await ChangeRequest.deleteMany({ projectId: project._id });
  await Milestone.deleteMany({ projectId: project._id });
  await ActivityLog.deleteMany({ projectId: project._id });
  ```

---

## Section Q: Original Scope Management & Locking
1. Freelancer adds the agreed deliverables (e.g. "Landing Page", "User Authentication").
2. Freelancer clicks **Lock Scope**.
3. Backend controller (`projectController.lockScope`):
   - Reads all current deliverables for this project.
   - Maps them into `project.originalScopeSnapshot`.
   - Sets `project.scopeLockedAt = new Date()`.
   - Saves project and logs `scope_locked` in `ActivityLog`.
4. The UI displays a lock badge showing when the scope was locked and the exact deliverables preserved in that snapshot.

---

## Section R: Change Request Workflow
When a client requests an extra feature:
1. Freelancer opens the **Change Requests** tab and clicks **New Change Request**.
2. Fills in:
   - Feature title (e.g., "Export to PDF").
   - Detailed description.
   - Scope justification / Reason.
   - Additional billing cost (e.g., \$300).
   - Additional time in days (e.g., 2 days).
3. Backend creates the document with `status: 'Pending'`.
4. In the dashboard and project overview, this request appears with a yellow **Pending** badge and is **not** counted in the approved budget until formally approved.

---

## Section S: Approval and Rejection Decision Workflow
1. The freelancer reviews the change request with the client.
2. Clicking **Approve** or **Reject** opens a decision modal where an optional decision note is recorded (e.g. *"Approved via Slack confirmation on Nov 5th"*).
3. Backend controller (`changeRequestController.updateChangeStatus`):
   - Verifies the user owns the project.
   - Sets `request.status` to `Approved` or `Rejected`.
   - Sets `request.decisionBy = req.user._id`.
   - Sets `request.decisionAt = new Date()`.
   - Sets `request.decisionNote`.
   - Logs `change_request_approved` or `change_request_rejected` to `ActivityLog`.
4. If approved, the dashboard automatically aggregates the extra revenue into `additionalCostApproved`.

---

## Section T: Milestone Management
- Milestones break project delivery into verifiable stages (e.g., "Design Approval", "Frontend MVP", "Final Handover").
- Each milestone tracks `dueDate`, `priority`, and `status`.
- When marked as `Completed`, the backend automatically stamps `completedAt = new Date()`.
- Overdue milestones are dynamically calculated on the dashboard if `dueDate < now` and `status !== 'Completed'`.

---

## Section U: Activity Logging & Audit Trail
Whenever a critical action occurs (project created, scope locked, deliverable completed, change approved/rejected, milestone finished), the service helper `logActivity()` writes an immutable entry into the `ActivityLog` collection:
- `projectId`: References the project.
- `userId`: Who triggered the action.
- `action`: Categorical action enum.
- `description`: Human-readable summary.
- `createdAt`: Accurate ISO timestamp.

This ensures complete non-repudiation and clear audit history if a client disputes the project timeline.

---

## Section V: Frontend-to-Backend Communication
- **Axios HTTP Client (`api.ts`)**: Base URL points to `http://localhost:5000/api`.
- **Request Interceptor**: Extracts JWT from `localStorage` and appends `Authorization: Bearer <token>` to request headers.
- **Response Interceptor**: Catches HTTP error responses (e.g., 400 validation error, 401 expired token) and transforms them into friendly error messages.
- **Toast Notifications**: React `ToastProvider` displays popup feedback upon successful actions or failed validations.

