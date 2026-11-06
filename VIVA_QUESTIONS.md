# FreelanceScope — 60 Comprehensive Viva Questions & Answers

> **B.Tech Computer Science & Engineering — Continuous Internal Assessment (CIA)**  
> **Topic:** Backend Development & MERN Stack Architecture  
> **Project:** FreelanceScope (Freelance Project Scope Manager)

---

## Part 1: Core Technologies & Concepts (Questions 1 – 15)

### Q1: What is the MERN stack?
**Answer:** MERN stands for **M**ongoDB (NoSQL database), **E**xpress.js (backend web framework), **R**eact.js (frontend UI library), and **N**ode.js (JavaScript runtime environment). It allows developers to build full-stack web applications using a single programming language: JavaScript/TypeScript.

### Q2: What is the role of Node.js in this project?
**Answer:** Node.js executes JavaScript on the server side using Google Chrome's V8 engine. It handles asynchronous, non-blocking I/O operations, allowing our Express server to serve multiple simultaneous API requests efficiently.

### Q3: What is Express.js and why is it used?
**Answer:** Express.js is a minimal and flexible Node.js web application framework. It simplifies routing, middleware integration, HTTP request/response handling, and JSON payload parsing.

### Q4: What is MongoDB and how does it store data?
**Answer:** MongoDB is a document-oriented NoSQL database. Instead of rows and tables like relational databases (MySQL/PostgreSQL), it stores data as flexible, JSON-like BSON (Binary JSON) documents organized into collections.

### Q5: What is Mongoose and why do we use it with MongoDB?
**Answer:** Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. MongoDB itself is schemaless, but Mongoose enforces schemas, validations, type-casting, query building, and document middleware at the application layer.

### Q6: What is a REST API?
**Answer:** REST (Representational State Transfer) is an architectural style for networked applications. It uses standard HTTP methods (`GET`, `POST`, `PUT`, `DELETE`) and stateless communication, exchanging data primarily in JSON format.

### Q7: What are HTTP status codes? Give examples from FreelanceScope.
**Answer:** HTTP status codes communicate the outcome of a client request:
- `200 OK`: Successful retrieval or update (e.g., getting project list).
- `201 Created`: New resource created (e.g., creating a project or change request).
- `400 Bad Request`: Validation failure (e.g., invalid email or missing title).
- `401 Unauthorized`: Missing or invalid JWT token.
- `403 Forbidden`: Authenticated user attempting to access another user's project.
- `404 Not Found`: Target resource does not exist.
- `500 Internal Server Error`: Unhandled server exception.

### Q8: What is the difference between `GET`, `POST`, `PUT`, and `DELETE`?
**Answer:**
- `GET`: Retrieves data without modifying server state (idempotent).
- `POST`: Submits new data to create a new resource on the server.
- `PUT`: Replaces or updates an existing resource.
- `DELETE`: Removes a specified resource from the database.

### Q9: What is React and why is it called a "Single Page Application" (SPA)?
**Answer:** React is a component-based frontend library for building user interfaces. It creates a Single Page Application because the browser loads a single HTML file (`index.html`), and React Router dynamically swaps views by updating the DOM in memory without full page reloads.

### Q10: What is Vite and why was it chosen over Create React App (CRA)?
**Answer:** Vite is a modern frontend build tool that leverages native ES modules (ESM) in development and Rollup for production. It offers near-instant server start, lightning-fast Hot Module Replacement (HMR), and much smaller build sizes than deprecated CRA.

### Q11: What is JSON Web Token (JWT)?
**Answer:** JWT is an open standard (RFC 7519) for securely transmitting information between parties as a compact, URL-safe JSON object. It consists of three parts separated by dots: Header, Payload, and Signature (`header.payload.signature`).

### Q12: Where is the JWT token stored on the client side in FreelanceScope?
**Answer:** It is stored in the browser's `localStorage` under the key `fs_token` and automatically included in the `Authorization: Bearer <token>` header of every outgoing Axios request.

### Q13: What is password hashing and why do we use bcrypt?
**Answer:** Password hashing is a one-way mathematical function that converts plain-text passwords into irreversible character strings. We use `bcryptjs` because it incorporates cryptographic salt (random bytes) and work factors (adaptive hashing rounds) to defeat rainbow table and brute-force attacks.

### Q14: What is CORS and why is it needed?
**Answer:** CORS (Cross-Origin Resource Sharing) is a browser security mechanism that blocks web pages on one origin (e.g., `http://localhost:5173`) from making requests to a different origin (e.g., `http://localhost:5000`). We configure the `cors` package in Express to explicitly whitelist our frontend URL.

### Q15: What is the difference between SQL and NoSQL databases?
**Answer:** SQL databases are relational, table-based, with fixed predefined schemas and strict foreign key constraints. NoSQL databases like MongoDB are non-relational, document-based, horizontally scalable, and store hierarchical data naturally.

---

## Part 2: Project-Specific Architecture & Workflows (Questions 16 – 35)

### Q16: What is "Scope Creep" in software engineering?
**Answer:** Scope creep is the uncontrolled, undocumented expansion of project features and deliverables after the project price, scope, and deadline have already been agreed upon.

### Q17: What is the differentiating feature of FreelanceScope?
**Answer:** The strict separation of the **Original Scope Baseline** from **Change Requests**. FreelanceScope snapshots initial deliverables into an immutable `originalScopeSnapshot` when locked, and records any subsequent requests in a separate `ChangeRequest` collection with individual cost, time, and approval tracking.

### Q18: What happens when a user clicks "Lock Scope"?
**Answer:** The backend queries all deliverables currently associated with the project, creates a deep copy snapshot into `project.originalScopeSnapshot`, and records the exact timestamp in `project.scopeLockedAt`. This preserves the baseline agreement permanently.

### Q19: What are the lifecycle states of a Change Request?
**Answer:**
- `Pending`: Newly submitted request awaiting client or freelancer review. Not counted in approved budget.
- `Approved`: Formally accepted. Additional cost is added to the project's approved extra budget, and a decision note and timestamp are recorded.
- `Rejected`: Declined feature request. Preserved in the audit history with a rejection reason, without altering project deliverables.

### Q20: Why do we not automatically add approved change requests to original deliverables?
**Answer:** To maintain legal and contractual clarity. If approved changes were merged into original deliverables, it would become impossible to distinguish what was included in the initial \$1,000 contract versus what was billed as additional \$300 change requests.

### Q21: What is the purpose of the `originalScopeSnapshot` array in the Project model?
**Answer:** It acts as an immutable contractual baseline. Even if original deliverable statuses change during development, the snapshot records exactly what items, descriptions, and revision allowances were agreed upon at the date of locking.

### Q22: What is the `ActivityLog` collection used for?
**Answer:** It provides an automated audit trail. Whenever a project is created, scope locked, deliverable added, change request submitted, approved, or rejected, an immutable log entry with a timestamp and user ID is recorded.

### Q23: How does FreelanceScope calculate overall project progress?
**Answer:** In `dashboardController.js`, progress is calculated dynamically as:
$$\text{Progress} = \left(\frac{\text{Completed Deliverables}}{\text{Total Deliverables}}\right) \times 100$$
If total deliverables is zero, progress defaults safely to 0%.

### Q24: What information is captured when a Change Request is approved or rejected?
**Answer:** Four critical audit fields are recorded:
1. `status`: Set to `Approved` or `Rejected`.
2. `decisionBy`: The ObjectId of the user making the decision.
3. `decisionAt`: The exact date and time (`new Date()`).
4. `decisionNote`: An optional explanatory note explaining why the decision was made.

### Q25: How does the application handle Milestones?
**Answer:** Milestones track key target dates (e.g., "Design Signoff", "Beta Testing"). When a milestone status is updated to `Completed`, the backend automatically sets `completedAt = new Date()`. Overdue milestones are flagged if `dueDate < now` and status is not `Completed`.

### Q26: What happens when a Project is deleted?
**Answer:** The backend performs a cascading deletion to prevent orphaned data:
```javascript
await Deliverable.deleteMany({ projectId: project._id });
await ChangeRequest.deleteMany({ projectId: project._id });
await Milestone.deleteMany({ projectId: project._id });
await ActivityLog.deleteMany({ projectId: project._id });
```

### Q27: How does FreelanceScope enforce multi-tenant user isolation?
**Answer:** Every project query filters strictly by `{ owner: req.user._id }`. If User B attempts to access `/api/projects/:id` belonging to User A, the query returns `null`, and the controller returns a `404 Not Found` to prevent attackers from even learning that the project ID exists.

### Q28: What is the purpose of `express-validator` in this project?
**Answer:** It provides declarative validation middleware before controller execution. It sanitizes inputs (trimming, email normalization) and checks constraints (e.g., budget $\ge 0$, valid ISO dates, minimum password length).

### Q29: What happens if input validation fails in an Express route?
**Answer:** The `handleValidationErrors` middleware catches validation failures via `validationResult(req)` and immediately halts execution, returning an HTTP `400 Bad Request` with an array of specific field error messages:
```json
{
  "message": "Validation failed",
  "errors": [{ "field": "clientEmail", "message": "Valid client email is required" }]
}
```

### Q30: How is centralized error handling implemented in Express?
**Answer:** Express recognizes error-handling middleware by its 4-parameter signature: `(err, req, res, next)`. In `errorHandler.js`, we intercept:
- `CastError` (invalid MongoDB ObjectIds) -> 400 Bad Request.
- Code `11000` (duplicate unique fields like email) -> 400 Bad Request.
- `ValidationError` (Mongoose schema errors) -> 400 Bad Request.
- All other errors default to status 500.

### Q31: How does the frontend handle token persistence across page refreshes?
**Answer:** In `AuthContext.tsx`, an initial `useEffect` hook runs on app startup. It checks `localStorage.getItem('fs_token')`. If present, it calls `GET /api/auth/me` to revalidate the user's session and restore state without requiring re-login.

### Q32: What is an Axios Interceptor and how is it used here?
**Answer:** Interceptors intercept HTTP requests or responses before they are handled by `then` or `catch`. We use:
- **Request Interceptor**: Injects `Authorization: Bearer <token>` into outgoing request headers.
- **Response Interceptor**: Formats backend error messages into readable JavaScript `Error` objects for display in UI toasts.

### Q33: How does `ProtectedRoute.tsx` protect private pages?
**Answer:** `ProtectedRoute` checks `useAuth()`. If `loading` is true, it displays a loading spinner. If `user` is null, it renders `<Navigate to="/login" replace />`, preventing unauthorized access to the dashboard and project pages.

### Q34: What is the difference between embedded documents and referenced documents in Mongoose?
**Answer:**
- **Embedded Document**: Stored directly inside the parent document (e.g., `originalScopeSnapshot` inside `Project`). Best for data that is tightly coupled and rarely queried independently.
- **Referenced Document**: Stored in a separate collection with an `ObjectId` reference (e.g., `ChangeRequest` references `Project`). Best for scalable, independently queryable data.

### Q35: Why does the User model have `select: false` on the password field?
**Answer:** To guarantee security. When queries like `User.find()` or `User.findById()` are executed, Mongoose automatically strips the password hash from the retrieved document, preventing accidental exposure in API responses.

---

## Part 3: Deep Technical & Viva Defense Questions (Questions 36 – 50)

### Q36: Why do we use `dotenv` in the backend?
**Answer:** `dotenv` loads sensitive configuration settings (like `PORT`, `MONGODB_URI`, and `JWT_SECRET`) from a `.env` file into `process.env`. This prevents hardcoding credentials in source code repositories.

### Q37: What is salt in password hashing?
**Answer:** Salt is random cryptographic data added to a password input before hashing. It ensures that two users with identical passwords will have completely different hashes, preventing rainbow table lookups.

### Q38: What does `timestamps: true` do in Mongoose schemas?
**Answer:** It tells Mongoose to automatically create and manage two fields: `createdAt` (ISO date when document was inserted) and `updatedAt` (ISO date when document was last modified).

### Q39: What is the purpose of database indexing? Give an example from FreelanceScope.
**Answer:** Indexing speeds up document search queries by creating a separate pointer structure (like an index in a textbook). In `Deliverable.js`, we define:
```javascript
deliverableSchema.index({ projectId: 1, status: 1 });
```
This compound index enables $O(\log N)$ fast queries when listing deliverables for a specific project.

### Q40: What is the difference between `authentication` and `authorization`?
**Answer:**
- **Authentication**: Verifying *who* you are (e.g., verifying email and password in `POST /api/auth/login`).
- **Authorization**: Verifying *what* you have permission to do (e.g., verifying that the logged-in user is the owner of a project before allowing deletion or change approval).

### Q41: What does `req.user = user` do in the auth middleware?
**Answer:** Once `auth.js` verifies the JWT token, it fetches the user from the database and attaches the user document to Express's `req` object. Any downstream controller can then access `req.user._id` without re-verifying the token.

### Q42: What is the purpose of `express.urlencoded({ extended: true })`?
**Answer:** It parses incoming requests with URL-encoded payloads (often from traditional HTML form submissions) using the `qs` library.

### Q43: How do we prevent unauthorized users from editing another user's change requests?
**Answer:** In `changeRequestController.js`:
```javascript
if (!request.owner || request.owner.toString() !== req.user._id.toString()) {
  return res.status(403).json({ message: 'Not authorized' });
}
```
If the IDs do not match, the request is blocked with HTTP `403 Forbidden`.

### Q44: What is the purpose of `runValidators: true` in `findOneAndUpdate`?
**Answer:** By default, Mongoose only validates data on `save()` and `create()`. Passing `{ runValidators: true }` ensures that update operations also validate against schema constraints (e.g., budget cannot be negative).

### Q45: What is the difference between `req.params`, `req.query`, and `req.body`?
**Answer:**
- `req.params`: Route URL parameters (e.g., `:id` in `/api/projects/123`).
- `req.query`: Query string parameters (e.g., `?status=Pending` in `/api/changes?status=Pending`).
- `req.body`: Payload data sent in the HTTP request body (e.g., JSON in POST/PUT).

### Q46: What is the purpose of `lucide-react` in the frontend?
**Answer:** It is a lightweight, tree-shakeable icon library providing clean SVG icons (such as folders, checkmarks, lock icons, and clock indicators) without bloating the frontend bundle.

### Q47: What is Tailwind CSS and how does it work?
**Answer:** Tailwind is a utility-first CSS framework. Instead of writing custom CSS classes in separate files, developers compose designs directly in JSX using utility classes (e.g., `flex items-center justify-between p-4 bg-slate-50`).

### Q48: How does React's `useEffect` hook work in `ProjectDetailPage.tsx`?
**Answer:** `useEffect` triggers side effects like fetching project data from the REST API after the component mounts. Passing `[id]` in its dependency array ensures it refetches data whenever the project route parameter changes.

### Q49: What is the purpose of `Modal.tsx` and how does it improve UX?
**Answer:** A modal displays focused action dialogs (such as approving/rejecting change requests with a note) as an overlay on top of the current screen, preventing context switching and preserving user state.

### Q50: How does FreelanceScope ensure responsive design across devices?
**Answer:** Tailwind's mobile-first responsive breakpoints (`sm:`, `md:`, `lg:`, `xl:`) are used. For example, on mobile phones the sidebar transforms into an overlay slide-out menu toggled by a hamburger button, while on desktops it remains fixed.

---

## Part 4: 10 Advanced Technical Questions (Examiner Challenge Level)

### Q51: How does MongoDB handle data persistence and durability?
**Answer:** MongoDB uses the WiredTiger storage engine with write-ahead journaling (WAL). Writes are written to an in-memory journal and committed to disk periodically (default every 100ms or on checkpoint), ensuring ACID compliance at the single-document level and crash recovery.

### Q52: What is the difference between Stateful and Stateless authentication?
**Answer:**
- **Stateful (Sessions)**: Server creates a session in memory/database and sends a Session ID cookie to the client. The server must look up session state on every request, making horizontal scaling harder.
- **Stateless (JWT)**: The server verifies the token cryptographically using `JWT_SECRET` without needing a database lookup for session state, making it ideal for distributed microservices and REST APIs.

### Q53: Can an attacker modify the payload of a JWT token on the client?
**Answer:** An attacker can decode and modify the payload (e.g., changing their user ID), but the signature check on the server will fail because the attacker does not possess the server's private `JWT_SECRET`. `jwt.verify()` throws a `JsonWebTokenError`, and the request is rejected with 401.

### Q54: What is the difference between a shallow copy and a deep copy in JavaScript? How does this apply to `lockScope`?
**Answer:**
- **Shallow Copy**: Copies object references. Modifying a nested object in the copy also modifies the original.
- **Deep Copy**: Copies actual primitive values into newly allocated memory.
In `lockScope`, we map each deliverable into a new snapshot object, ensuring that subsequent edits or deletions to the active `Deliverable` documents do not alter the saved `originalScopeSnapshot`.

### Q55: How does the event loop in Node.js work?
**Answer:** Node.js runs on a single-threaded event loop based on `libuv`. It offloads blocking I/O operations (like database queries and file access) to a thread pool. When the operation completes, its callback or resolved Promise is queued into the microtask queue and executed on the main thread without blocking incoming HTTP requests.

### Q56: Why did you use `express-validator` at the route level instead of relying solely on Mongoose schema validation?
**Answer:** Separation of concerns and fail-fast performance. `express-validator` validates HTTP requests at the gateway before they reach controllers or database queries, saving database connections. Mongoose provides a second layer of defense directly at the database layer.

### Q57: How would you scale FreelanceScope if it reached 100,000 active freelancers?
**Answer:**
1. Implement Redis caching for frequent read operations (such as dashboard stats).
2. Configure MongoDB replica sets with read preference directed to secondary nodes.
3. Deploy stateless Express instances behind an Nginx or AWS Application Load Balancer.
4. Add rate limiting (`express-rate-limit`) to prevent API abuse.

### Q58: What is a MongoDB ObjectId composed of?
**Answer:** A 12-byte BSON ObjectId consists of:
- 4-byte timestamp (seconds since Unix epoch).
- 5-byte random value unique to the machine and process.
- 3-byte incrementing counter initialized to a random value.
This guarantees global uniqueness across distributed database clusters.

### Q59: Why did you use `select: false` instead of simply `delete user.password` in the controller?
**Answer:** Defense in depth. If a developer forgets to delete `password` in a new controller, `select: false` guarantees that Mongoose will not load the password field from MongoDB into memory in the first place, completely eliminating the risk of accidental exposure.

### Q60: How does FreelanceScope protect against NoSQL Injection attacks?
**Answer:**
1. Express JSON body parser strictly parses JSON types rather than raw strings.
2. `express-validator` validates that inputs match expected string formats.
3. Mongoose schemas cast and validate query parameters against defined types (e.g., rejecting objects with `$gt` or `$ne` operators passed where strings or ObjectIds are expected).

