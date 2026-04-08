# Event Tracker PRD (Iteration 1 Skeleton)

## 1. Product Summary
Build a web-based **Event Tracker** for Sri Sairam institutions using **Next.js + Supabase Postgres + Prisma**.
The system should serve as the event equivalent of the existing MOU tracker: structured, searchable, role-based, import-friendly, and ready for future reporting.

Authentication should follow the same overall product experience as the reference tracker, but implemented here as **custom email/password authentication with JWT-based sessions**, not Supabase Auth.

This first iteration should **not attempt to solve every reporting problem**. Its goal is to create a **clean and extensible base system**:
- stable pages
- clear roles and access
- core event schema
- import-ready database design
- predictable CRUD flows
- reusable modules and shared utilities
- room for analytics, approvals, reports, and automation later

---

## 2. Context Observed
From the provided Excel, the source data is a mix of:
- event-wise records across units like `NSS`, `UBA`, `SCOUTS & GUIDES`, `Innovation ecosystem`, and `Household survey and SIRD`
- one special yearly summary sheet for `BLOOD DONATIONS`
- one `CONSOLIDATED SHEET` that appears to be a derived summary, not raw source data

### Important observation
The workbook is **not fully uniform**.
Some sheets are close to a common event structure, but some contain:
- different date formats
- extra fields like school/category labels
- dual SDG columns in some sheets
- inconsistent naming/spelling
- missing/null values

So the product should **not mirror Excel as-is**.
It should instead define a **canonical event structure** and map Excel rows into it.

---

## 3. Product Goal
Create a base platform that allows institutional teams to:
- manage event records centrally
- import legacy Excel data safely
- search and filter events quickly
- maintain clean program/unit-wise records
- support future dashboards and SDG reporting
- add advanced workflows later without redesigning the core schema
- reuse the same internal modules in other tracker-style products later

---

## 4. Reference Direction from the eMOU Tracker
The event tracker should borrow these structural ideas from the existing tracker:
- role-based access
- login-first internal workflow
- clean table-first management UI
- separate login and dashboard experience
- admin-facing management area
- import/export support
- searchable records
- future-friendly audit fields (`createdAt`, `updatedAt`, `createdBy`)

But this new product should be modeled for **event data**, not MoU data.

---

## 5. Locked Decisions From Clarification
The following are now confirmed and should be treated as fixed for iteration 1:

1. **Auth**: do **not** use Supabase Auth.
2. Use **normal email/password authentication** with **JWT token-based sessions**.
3. Keep the login/session flow aligned with the user experience of the reference tracker.
4. A single user can manage **multiple units**.
5. `BLOOD DONATIONS` **must be included in v1**.
6. The system should be built **modularly**, with strong reusability and debugging friendliness.

---

## 6. Iteration 1 Objective
Deliver the **skeleton of the system**, meaning:
- app structure
- route structure
- main database schema
- core user roles
- first-pass event CRUD
- bulk import foundation
- minimal dashboard summary
- blood donation yearly metrics in v1
- reusable service/repository/module boundaries
- clear separation between raw event data and derived reporting

This iteration should make future additions easy, such as:
- approvals
- document uploads
- detailed analytics
- unit-specific forms
- public reports
- yearly comparisons
- SDG trend dashboards

---

## 7. Scope for Iteration 1

### In scope
1. Custom email/password auth with JWT session flow
2. Role-based access control
3. Multi-unit user access mapping
4. Core event record management
5. Program/unit master setup
6. SDG goal tagging
7. Excel import foundation
8. Event list page with filters and search
9. Event create/edit/view flow
10. Basic dashboard counts
11. Blood donation yearly metric module
12. Audit metadata
13. Seed-ready base schema for future expansion
14. Modular architecture for reuse across projects

### Out of scope for Iteration 1
1. Complex analytics dashboards
2. Final polished reports and charts
3. Approval workflow
4. Email notifications
5. File/document upload workflow
6. Automated consolidated-sheet generation
7. Advanced deduplication intelligence
8. Public-facing portal
9. Mobile app
10. Fine-grained row-level workflow states beyond basic status

---

## 8. Proposed User Roles
Keep the first version aligned with the existing tracker mindset.

### 1. Admin
- full access to all records
- manage users and roles
- manage master data
- import/export data
- edit/delete any event
- manage any unit and any yearly metric

### 2. Master User
- manage all event records across units
- create/edit records
- import data
- view analytics/dashboard
- no user administration initially

### 3. Unit User / Coordinator
- create and edit records only for assigned unit(s)
- a single user may be mapped to multiple units
- view only permitted records
- cannot manage users

### Optional later
### 4. Viewer / Audit User
- read-only access for management/reporting teams

---

## 9. Product Modules

### A. Auth Module
- login page
- password verification
- JWT generation and validation
- refresh/session handling
- route protection
- role resolution

### B. Event Registry Module
- list events
- create event
- edit event
- view event details
- delete event (admin/master only)

### C. Master Data Module
- units/programs
- departments
- SDG goals
- activity types
- locations (optional in v1 as free text)

### D. Import Module
- upload Excel
- map sheet to program/unit
- preview rows
- validate rows
- import valid rows
- capture failed rows

### E. Dashboard Module
- total events
- total beneficiaries
- total participants
- total hours engaged
- totals by unit
- totals by year
- totals by SDG goal

### F. Blood Donation Metrics Module
- yearly donor metrics entry
- yearly donor metric import
- list and edit yearly blood donation aggregates
- keep separate from event CRUD

### G. Admin Module
- manage users
- assign roles
- assign multi-unit access
- manage active/inactive users

### H. Shared Core Module
This module is important for reusability across other future products.
It should hold:
- DTOs and types
- validators
- permission helpers
- error classes
- response helpers
- logging helpers
- date/number parsing utilities
- import mapping helpers

---

## 10. Architecture Principles
These principles should guide implementation from day one.

### 1. Modular by domain
Structure code by domain/module rather than by random utility buckets.
Examples:
- `auth`
- `events`
- `imports`
- `users`
- `masters`
- `metrics`
- `dashboard`

### 2. Separate layers clearly
Each module should ideally have:
- `types`
- `validators`
- `services`
- `repositories`
- `mappers`
- `api`
- `ui`

This separation improves:
- reuse in other projects
- easier debugging
- easier testing
- easier onboarding

### 3. Keep framework-specific logic thin
Next.js route handlers and pages should be thin.
Business logic should live in reusable services, not directly in pages or route handlers.

### 4. Keep import logic isolated
Excel parsing and normalization should live in dedicated import mappers and validators, so the same import engine can later be reused in other tracker products.

### 5. Prefer shared contracts
Input/output contracts, enums, and validation schemas should be centralized so both frontend and backend can reuse them.

---

## 11. Core Product Decisions

### Decision 1: Use one canonical `Event` model
All event-oriented sheets should map into one common event structure.
This keeps search, filters, reports, and future APIs much simpler.

### Decision 2: Include blood donation in v1, but keep it separate from event rows
`BLOOD DONATIONS` is yearly aggregate data, not row-wise event data like the other sheets.
It should be part of the product in iteration 1, but stored in a separate yearly metrics model such as `ProgramYearMetric`.

### Decision 3: Treat consolidated sheet as derived, not source
`CONSOLIDATED SHEET` should not be imported as primary data.
It should be recreated later from clean underlying event data.

### Decision 4: Use custom JWT auth, not Supabase Auth
Auth should use:
- email/password login
- password hashing
- JWT access token validation
- refresh/session persistence if needed
- route protection similar to the reference app flow

### Decision 5: Use many-to-many user-to-unit access
Since one user can manage multiple units, unit access should be modeled through a join table, not a single unit field on the user.

### Decision 6: Normalize only where it protects the future
For v1, normalize only the parts that matter structurally:
- users
- user unit access
- units
- events
- event SDG mapping
- import batches
- yearly program metrics

Avoid over-engineering everything else in iteration 1.

---

## 12. Canonical Event Fields (V1)
This is the base structure that most sheets can map into.

### Core identity
- `id`
- `eventCode` (system-generated, human-friendly)
- `title`
- `description` (optional)
- `unitId`
- `departmentId` (optional initially)

### Date and time
- `eventDate`
- `startDate` (optional)
- `endDate` (optional)
- `academicYear` / `calendarYear`

### Classification
- `activityType`
- `audienceType` (optional later)
- `mode` (`offline`, `online`, `hybrid`) optional in v1
- `status` (`draft`, `published`, `archived`)

### Participation counts
- `studentCount`
- `facultyCount`
- `externalCount`
- `totalParticipants`

### Impact counts
- `beneficiaryDescription`
- `beneficiaryCount`
- `hoursPerEvent`
- `totalHoursEngaged`
- `amountSpent`

### Location and references
- `locationText`
- `reportUrl`
- `socialUrl`
- `sourceSheet`
- `sourceRowNumber`

### Ownership / audit
- `createdById`
- `updatedById`
- `createdAt`
- `updatedAt`

---

## 13. Supporting Data Models

### 13.1 User
Purpose: login identity + app role + scope

Suggested fields:
- `id`
- `name`
- `email`
- `passwordHash`
- `role`
- `isActive`
- `createdAt`
- `updatedAt`

### 13.2 UserUnitAccess
Maps one user to one or more units.

Suggested fields:
- `id`
- `userId`
- `unitId`
- `createdAt`

### 13.3 AuthSession
Optional but recommended for better session control.
This helps with logout, token rotation, and later device/session management.

Suggested fields:
- `id`
- `userId`
- `refreshTokenHash`
- `expiresAt`
- `lastUsedAt`
- `createdAt`

### 13.4 Unit
Represents source verticals/program groups.

Initial seed values:
- `NSS`
- `UBA`
- `SCOUTS_AND_GUIDES`
- `INNOVATION_ECOSYSTEM`
- `HOUSEHOLD_SURVEY_SIRD`
- `BLOOD_DONATION`

Suggested fields:
- `id`
- `code`
- `name`
- `description`
- `isActive`

### 13.5 Department
Needed only if the institution wants department-based access later.
Can exist in schema from day one even if lightly used.

Suggested fields:
- `id`
- `code`
- `name`
- `isActive`

### 13.6 SDGGoal
Master table for SDG goals.

Suggested fields:
- `id`
- `goalNumber`
- `name`
- `shortLabel`

### 13.7 EventGoal
Join table between events and SDG goals.

Why this is important:
- some rows may map to one goal
- some sheets already hint at multiple SDG columns
- future reporting will become easier

Suggested fields:
- `id`
- `eventId`
- `sdgGoalId`
- `isPrimary`

### 13.8 ImportBatch
Tracks Excel imports.

Suggested fields:
- `id`
- `fileName`
- `uploadedById`
- `status`
- `totalRows`
- `successRows`
- `failedRows`
- `notes`
- `createdAt`

### 13.9 ImportRowError
Stores failed import rows for review.

Suggested fields:
- `id`
- `batchId`
- `sheetName`
- `rowNumber`
- `rawPayload`
- `errorMessage`

### 13.10 ProgramYearMetric
For non-event annual metrics like blood donation summary.

Suggested fields:
- `id`
- `unitId`
- `year`
- `metricType`
- `valueNumber`
- `metaJson`
- `sourceSheet`

Example usage for blood donation:
- camp donors
- regular donors
- total donors

---

## 14. Recommended Prisma Skeleton
This is not the final schema, but the right starting shape.

```prisma
model User {
  id             String           @id @default(cuid())
  name           String
  email          String           @unique
  passwordHash   String
  role           UserRole
  isActive       Boolean          @default(true)
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt

  createdEvents  Event[]          @relation("EventCreatedBy")
  updatedEvents  Event[]          @relation("EventUpdatedBy")
  importBatches  ImportBatch[]
  unitAccesses   UserUnitAccess[]
  authSessions   AuthSession[]
}

model UserUnitAccess {
  id        String   @id @default(cuid())
  userId    String
  unitId    String
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
  unit      Unit     @relation(fields: [unitId], references: [id])

  @@unique([userId, unitId])
}

model AuthSession {
  id               String   @id @default(cuid())
  userId           String
  refreshTokenHash String
  expiresAt        DateTime
  lastUsedAt       DateTime?
  createdAt        DateTime @default(now())

  user             User     @relation(fields: [userId], references: [id])
}

model Unit {
  id          String            @id @default(cuid())
  code        String            @unique
  name        String
  description String?
  isActive    Boolean           @default(true)

  events      Event[]
  metrics     ProgramYearMetric[]
  userAccesses UserUnitAccess[]
}

model Department {
  id        String   @id @default(cuid())
  code      String   @unique
  name      String
  isActive  Boolean  @default(true)

  events    Event[]
}

model Event {
  id                   String       @id @default(cuid())
  eventCode            String       @unique
  title                String
  description          String?
  unitId               String
  departmentId         String?
  eventDate            DateTime?
  startDate            DateTime?
  endDate              DateTime?
  year                 Int?
  activityType         String?
  status               EventStatus  @default(DRAFT)
  studentCount         Int?         @default(0)
  facultyCount         Int?         @default(0)
  externalCount        Int?         @default(0)
  totalParticipants    Int?         @default(0)
  beneficiaryText      String?
  beneficiaryCount     Int?
  hoursPerEvent        Decimal?
  totalHoursEngaged    Decimal?
  amountSpent          Decimal?
  locationText         String?
  reportUrl            String?
  socialUrl            String?
  sourceSheet          String?
  sourceRowNumber      Int?
  createdById          String
  updatedById          String?
  createdAt            DateTime     @default(now())
  updatedAt            DateTime     @updatedAt

  unit                 Unit         @relation(fields: [unitId], references: [id])
  department           Department?  @relation(fields: [departmentId], references: [id])
  createdBy            User         @relation("EventCreatedBy", fields: [createdById], references: [id])
  updatedBy            User?        @relation("EventUpdatedBy", fields: [updatedById], references: [id])
  goals                EventGoal[]
}

model SDGGoal {
  id          String     @id @default(cuid())
  goalNumber  Int
  name        String
  shortLabel  String?

  events      EventGoal[]

  @@unique([goalNumber])
}

model EventGoal {
  id         String   @id @default(cuid())
  eventId    String
  sdgGoalId  String
  isPrimary  Boolean  @default(false)

  event      Event    @relation(fields: [eventId], references: [id])
  sdgGoal    SDGGoal  @relation(fields: [sdgGoalId], references: [id])

  @@unique([eventId, sdgGoalId])
}

model ImportBatch {
  id           String        @id @default(cuid())
  fileName     String
  status       ImportStatus  @default(PENDING)
  totalRows    Int           @default(0)
  successRows  Int           @default(0)
  failedRows   Int           @default(0)
  notes        String?
  uploadedById String
  createdAt    DateTime      @default(now())

  uploadedBy   User          @relation(fields: [uploadedById], references: [id])
  rowErrors    ImportRowError[]
}

model ImportRowError {
  id           String       @id @default(cuid())
  batchId      String
  sheetName    String
  rowNumber    Int
  rawPayload   Json
  errorMessage String

  batch        ImportBatch  @relation(fields: [batchId], references: [id])
}

model ProgramYearMetric {
  id          String    @id @default(cuid())
  unitId      String
  year        Int
  metricType  String
  valueNumber Decimal
  metaJson    Json?
  sourceSheet String?

  unit        Unit      @relation(fields: [unitId], references: [id])
}

enum UserRole {
  ADMIN
  MASTER
  UNIT_USER
}

enum EventStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum ImportStatus {
  PENDING
  PROCESSING
  COMPLETED
  PARTIAL_SUCCESS
  FAILED
}
```

---

## 15. Auth Design for V1
Keep auth simple, internal, and reusable.

### Recommended flow
1. User logs in with email + password
2. Backend verifies password hash
3. Backend issues JWT access token
4. Backend also creates a refresh/session record if refresh tokens are used
5. Protected routes validate JWT and load role + unit scope
6. Logout invalidates stored session/refresh token

### Recommended implementation notes
- store passwords as hashes only
- prefer HTTP-only cookies for tokens if possible
- keep token verification inside reusable auth middleware/helpers
- keep auth repository/service independent from page code
- use the same auth module pattern later in other internal apps

---

## 16. Pages for Iteration 1

### 1. `/login`
Purpose:
- user login
- session creation
- role redirect

### 2. `/dashboard`
Purpose:
- top-level counts
- unit-wise summary cards
- quick links to events/import/admin

### 3. `/events`
Purpose:
- master event listing page
- search, filters, sort, pagination
- actions: view, edit, delete

Filters to include in v1:
- year
- unit
- SDG goal
- activity type
- status
- search by title/location

### 4. `/events/new`
Purpose:
- create a new event manually

### 5. `/events/[id]`
Purpose:
- view event details

### 6. `/events/[id]/edit`
Purpose:
- update existing event

### 7. `/imports`
Purpose:
- upload Excel
- show import history
- show validation result summary

### 8. `/imports/[batchId]`
Purpose:
- show import batch result
- failed rows
- mapping summary

### 9. `/admin/users`
Purpose:
- user creation and role assignment
- assign one or more units to a user
- activate/deactivate users

### 10. `/admin/masters`
Purpose:
- manage unit master
- manage SDG master
- manage activity type master if needed

### 11. `/metrics/blood-donation`
Purpose:
- manage yearly blood donation aggregate data separately

---

## 17. Core User Flows

### Flow 1: Login
1. User lands on login page
2. Auth validates credentials
3. App resolves role and unit scope
4. User is redirected to dashboard

### Flow 2: Create Event
1. User opens `/events/new`
2. User fills core event form
3. User selects unit and SDG goal(s)
4. User saves draft or publishes
5. Record appears in event list

### Flow 3: Edit Event
1. User opens event detail or list
2. User chooses edit
3. Allowed fields are updated
4. Audit fields are updated
5. Changes appear in dashboard/list

### Flow 4: Import Excel
1. User uploads workbook
2. System detects sheets
3. System maps known sheets to canonical models
4. System validates rows
5. System imports valid rows
6. System logs failed rows separately
7. User reviews batch summary

### Flow 5: Search and Filter
1. User opens event list
2. User filters by unit/year/goal/type
3. System returns matching records
4. User opens detail or exports later

### Flow 6: Admin User Setup
1. Admin opens users page
2. Admin creates user
3. Admin assigns role and one or more allowed units
4. User can then access only authorized pages/data

### Flow 7: Blood Donation Metrics Management
1. User opens yearly blood donation metrics page
2. User creates or imports year-wise metrics
3. System stores metric rows separately from event rows
4. Dashboard can later read these metrics independently

---

## 18. First-Pass Form Structure
The event form in iteration 1 should be simple and stable.

### Section A: Basic Info
- title
- unit
- department (optional)
- activity type
- status

### Section B: Date & Location
- event date
- start date
- end date
- year
- location

### Section C: SDG Mapping
- one or more SDG goals
- primary goal toggle

### Section D: Participation
- student count
- faculty count
- external count
- total participants

### Section E: Impact
- beneficiaries text
- beneficiary count
- hours per event
- total hours engaged
- amount spent

### Section F: References
- report URL
- social media URL
- notes/description

---

## 19. Import Strategy for V1
The import pipeline should be intentionally conservative.

### 19.1 What to import in V1
Import these as **event rows**:
- `Innovation ecosystem`
- `NSS`
- `UBA`
- `SCOUTS & GUIDES`
- `Household survey and SIRD`

Import this as **yearly metric rows**:
- `BLOOD DONATIONS`

Do **not** import this as source data:
- `CONSOLIDATED SHEET`

### 19.2 Import stages
1. upload file
2. parse workbook
3. identify sheet type
4. row normalization
5. validation
6. preview summary
7. commit import
8. store errors

### 19.3 Validation rules
Basic validation for V1:
- title required for event rows
- unit required
- at least one of `eventDate` or `year`
- participant counts must be numeric if provided
- beneficiary count must be numeric if provided
- URLs should be valid if provided
- imported rows should retain source sheet + row number
- blood donation metric rows must have year + metric values

### 19.4 Import behavior decisions
- allow partial success
- log row-level failures
- do not silently discard rows
- preserve raw row data in error logs
- support re-import after correction

---

## 20. API / Backend Skeleton
Use Next.js route handlers or server actions with Prisma.
Keep the backend modular.

### Suggested backend modules
- `auth`
- `users`
- `units`
- `events`
- `sdg-goals`
- `imports`
- `metrics`
- `dashboard`
- `shared`

### Suggested route skeleton
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `GET /api/dashboard/summary`
- `GET /api/events`
- `POST /api/events`
- `GET /api/events/:id`
- `PATCH /api/events/:id`
- `DELETE /api/events/:id`
- `POST /api/imports`
- `GET /api/imports/:id`
- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/:id`
- `GET /api/masters/units`
- `GET /api/masters/sdg-goals`
- `GET /api/metrics/blood-donation`
- `POST /api/metrics/blood-donation`
- `PATCH /api/metrics/blood-donation/:id`

---

## 21. Access Control Rules (V1)

### Admin
- full access to all pages and all records

### Master User
- access to dashboard, events, imports, and blood donation metrics
- manage all data except system users

### Unit User
- access only to assigned unit records
- can have more than one assigned unit
- create/edit records in own scope
- view dashboard filtered to own scope
- no access to other units unless explicitly assigned

This rule set is enough for v1.
Detailed approval chains can come later.

---

## 22. Dashboard Skeleton (V1)
Keep dashboard minimal but meaningful.

### Summary cards
- total events
- total beneficiaries
- total participants
- total hours engaged
- blood donation yearly highlight card

### Summary blocks
- events by unit
- events by year
- events by SDG goal
- blood donation yearly totals

### Not needed yet
- complex trend lines
- deep comparative analytics
- printable institutional reports

---

## 23. Non-Functional Expectations

### Performance
- event list should support pagination
- filters should be server-side
- imports should be batch-safe

### Data quality
- preserve audit trail
- preserve source mapping during import
- avoid denormalized design that blocks future reporting

### Maintainability
- use clean modules
- keep schema extensible
- avoid unit-specific hardcoding in core models
- keep business logic outside UI handlers
- keep repositories/services reusable in other projects

### Debuggability
- centralized error handling
- module-level logging
- trace import errors row by row
- keep parsing, validation, and persistence as separate steps

### Security
- protected routes
- role checks on every write API
- scoped queries for restricted users
- password hashing only, never plain password storage

---

## 24. Suggested Folder Skeleton

```text
app/
  (auth)/login/
  dashboard/
  events/
    page.tsx
    new/page.tsx
    [id]/page.tsx
    [id]/edit/page.tsx
  imports/
    page.tsx
    [batchId]/page.tsx
  admin/
    users/page.tsx
    masters/page.tsx
  metrics/
    blood-donation/page.tsx
  api/
    auth/
    dashboard/
    events/
    imports/
    users/
    masters/
    metrics/

modules/
  auth/
    api/
    services/
    repositories/
    validators/
    types/
  events/
    api/
    services/
    repositories/
    validators/
    mappers/
    types/
  imports/
    api/
    services/
    repositories/
    validators/
    mappers/
    parsers/
    types/
  users/
    api/
    services/
    repositories/
    validators/
    types/
  metrics/
    api/
    services/
    repositories/
    validators/
    mappers/
    types/
  dashboard/
    services/
    repositories/
    types/
  shared/
    auth/
    errors/
    utils/
    constants/
    validators/
    types/

components/
  dashboard/
  events/
  imports/
  admin/
  shared/

lib/
  prisma/
  jwt/
  logger/
  env/

prisma/
  schema.prisma
  seed.ts
```

---

## 25. Step-by-Step Build Plan for Copilot
This is the recommended implementation order.

### Phase 1: Project Foundation
1. initialize Next.js app with App Router
2. set up Supabase project and database environment variables
3. configure Prisma with Supabase Postgres
4. create modular folder structure
5. create initial Prisma schema
6. run first migration
7. seed units and SDG goals

### Phase 2: Auth + RBAC Foundation
8. build custom auth module with email/password login
9. add password hashing and JWT helpers
10. add auth session/refresh persistence if used
11. create user model and role mapping
12. create user-to-unit access mapping
13. add middleware/route protection
14. add permission helpers

### Phase 3: Event Core
15. create event Prisma model and relations
16. build event list page
17. build create event page
18. build event detail page
19. build edit event page
20. add server-side filtering and pagination

### Phase 4: Admin + Masters
21. create user management page
22. support assigning multiple units to one user
23. create master-data page for units/SDG/activity types
24. add active/inactive user support

### Phase 5: Import Foundation
25. build import upload page
26. parse workbook and detect sheets
27. build canonical row mappers per sheet type
28. build validation layer
29. create import batch logging
30. show failed row summary

### Phase 6: Blood Donation Metrics
31. create blood donation yearly metric model and page
32. build manual CRUD for yearly blood donation metrics
33. import blood donation rows into separate metric model
34. keep it isolated from main event CRUD

### Phase 7: Dashboard Base
35. add top-level dashboard counts
36. add totals by unit/year/SDG goal
37. add blood donation summary cards
38. connect dashboard filters to core event and metrics data

### Phase 8: Cleanup and Stabilization
39. improve empty states and loading states
40. add form validation polish
41. test role restrictions
42. test import edge cases
43. test unit-scope filtering for multi-unit users
44. prepare for iteration 2 features

---

## 26. Upcoming Iterations After the Skeleton
Once the base is stable, these should come next.

### Iteration 2
- approval workflow
- document uploads
- better dashboard charts
- export to Excel/CSV
- duplicate detection during import
- richer master data

### Iteration 3
- consolidated reporting engine
- year-over-year analytics
- SDG impact dashboards
- printable institutional reports
- notification/reminder system
- audit history UI

### Iteration 4+
- public showcase pages
- mobile optimization
- cross-campus multi-tenant support
- API integrations with institutional systems

---

## 27. Remaining Open Questions
These do not block the skeleton, but should be clarified before implementation gets too far.

1. Should JWT be stored in HTTP-only cookies, or do you want token storage handled another way?
2. Should department-level restriction exist in v1, or only unit-level restriction?
3. Should `SCOUTS & GUIDES` school/category-style fields be modeled in v1, or stored temporarily as notes/meta?
4. Do you want import-first development, or manual CRUD-first development?
5. Should the first release support edit/delete for imported rows, or keep imported data read-only until validated?
6. Will attachment upload be postponed fully, or should the schema reserve space for it now?

---

## 28. Final Recommendation
For the first iteration, the best possible base is:
- one clean `Event` model for all event-style sheets
- one separate `ProgramYearMetric` model for blood donation summary data
- one `EventGoal` join table for SDG flexibility
- one `UserUnitAccess` join table for multi-unit permissions
- one custom `Auth` module using email/password + JWT flow
- one `ImportBatch` pipeline for safe migration from Excel
- one modular domain structure so the same foundation can be reused in other tracker products

If this foundation is built correctly, the rest of the product can evolve without schema rework.

---

## 29. Copilot Prompt Starter
Use this when beginning implementation with Copilot:

> Build iteration 1 of an Event Tracker in Next.js App Router with Supabase Postgres and Prisma. Do not use Supabase Auth. Implement custom email/password authentication with JWT-based sessions, multi-unit user access, and a modular domain-based architecture. Create pages for login, dashboard, event listing, create/edit/view event, imports, admin users, admin masters, and blood donation yearly metrics. Use a canonical Event model, SDG goal join table, UserUnitAccess join table, import batch logging, and a separate ProgramYearMetric model for blood donation summary data. Keep the UI table-first, admin-friendly, and reusable across future internal tracker products. Implement only the core skeleton, not advanced analytics or approvals.
