# Design - Sairam Event Tracker

This is the canonical design reference for the current codebase. It replaces
older migration notes and page-specific update logs.

## Product Shape

Sairam Event Tracker is an internal, login-first operational tool. The primary
job is to make institutional event data easy to import, clean, edit, search,
audit, and summarize.

The application supports:

- Event registry across institutional units
- SDG goal tagging
- Participant, beneficiary, hour, and spend tracking
- Excel import from legacy sheets
- Unit-specific spreadsheet views
- Blood donation yearly metrics
- Dashboard summaries
- Admin user and master-data management

## Information Architecture

| Area | Route | Notes |
| --- | --- | --- |
| Login | `/login` | Custom email/password auth |
| Dashboard | `/dashboard` | Aggregates events, SDGs, years, units, and donor metrics |
| All Events | `/events` | Standard CRUD table with filters and pagination |
| Event Create/Edit/View | `/events/new`, `/events/[id]`, `/events/[id]/edit` | Canonical event workflow |
| Unit Sheets | `/events/innovation-ecosystem`, `/events/nss`, `/events/uba`, `/events/household-survey` | Dense spreadsheet-style pages with inline editing and import |
| Imports | `/imports` | Global workbook import and batch history |
| Blood Donation | `/metrics/blood-donation` | Yearly metric entry and summary |
| Users | `/admin/users` | Admin-only user and unit-access management |
| Masters | `/admin/masters` | Units and SDG goal reference data |

The root route redirects authenticated users to `/dashboard` and anonymous users
to `/login`.

## Layout System

The app uses the Next.js App Router under `src/app`.

- `(auth)` contains public authentication pages.
- `(protected)` contains authenticated pages wrapped by `ProtectedLayout`.
- `api` contains App Router route handlers.
- The main shell is provided by `src/components/shared/Layout.tsx`.
- Auth state is provided by `src/components/shared/AuthProvider.tsx`.

The protected layout uses a fixed sidebar with collapsible desktop behavior and
a mobile overlay. Navigation visibility is role-filtered.

## Visual Direction

The UI should feel like an internal administrative tracker: dense, restrained,
scannable, and optimized for repeated work.

Current visual foundation:

| Token | Value | Usage |
| --- | --- | --- |
| Page background | `#f8f9fa` | App background |
| Text primary | `#1f2937` | Headings, primary text |
| Text secondary | `#4b5563` / `#6b7280` | Labels and supporting text |
| Border | `#d1d5db` | Inputs, tables, panels |
| Header background | `#f3f4f6` | Table headers |
| Row hover | `#f9fafb` | Table rows |
| Primary action | `#2563eb` / Tailwind blue | Active nav, links, key buttons |
| Success | `#10b981` | Success states |
| Error | `#ef4444` | Errors and destructive states |
| Warning | `#f59e0b` | Warnings |

The global CSS imports Gabarito and maps it as the Tailwind sans font. The root
layout also registers Geist font variables, but the active body font is the
global sans stack from `src/app/globals.css`.

## Typography

Base UI text is compact.

| Size | Usage |
| --- | --- |
| `12px` | Sheet headers, compact labels, compact buttons |
| `13px` | Default body, form, and table text |
| `14px` | Panel titles and secondary headings |
| `18px` | Unit sheet page headings |
| `24px` | Standard page headings and metric values |
| `32px+` | Large dashboard or metric emphasis where space allows |

Use medium or semibold weights for labels and table headers. Avoid oversized
display type outside page-level headings or metric cards.

## Components

Shared primitives live in `src/components/ui/index.tsx`.

- `Button`
- `Input`
- `Select`
- `Textarea`
- `Card`
- `CardHeader`
- `CardContent`
- `Badge`
- `Table`, `Thead`, `Tbody`, `Th`, `Td`
- `LoadingSpinner`
- `EmptyState`
- `Alert`
- `ProgressBar`

The shared component layer still uses some generic blue/slate defaults and
larger card radii. The unit sheet pages add a denser table treatment directly
in page code. When extending the UI, prefer moving repeated styles back into
shared components instead of duplicating page-local patterns.

## Tables

There are two table modes.

Standard admin tables:

- Use shared `Table`, `Th`, and `Td` primitives.
- Good for event lists, users, imports, metrics, and master data.
- Favor simple pagination and concise actions.

Spreadsheet unit tables:

- Use compact `12px` text and sticky headers.
- Use horizontal scrolling with stable column widths.
- Support inline cell editing on click.
- Keep filters, stats, pagination, and import controls fixed above the table.
- Preserve dense row height so large imported sheets remain usable.

## Forms

Event forms are grouped by user task:

- Basic information
- Date and location
- SDG goals
- Participation
- Impact
- References

Numeric input is parsed before submission. URLs allow blank values. SDG goals
support multiple selection with an optional primary goal.

## Auth And Permissions

Authentication is custom email/password with JWT cookies.

| Role | Access |
| --- | --- |
| `ADMIN` | Full records, users, masters, imports, metrics |
| `MASTER` | Records, imports, metrics, dashboard; no user administration |
| `UNIT_USER` | Assigned unit records and dashboard scope |

Authorization is enforced in server route handlers and services. Unit users are
restricted by `UserUnitAccess`.

## Data Design

The canonical event model is intentionally not a one-to-one copy of Excel.

`Event` stores:

- Event code, title, description
- Unit
- Event date, start/end dates, year
- Activity type and status
- Student, faculty, external, and total participant counts
- Beneficiary text and count
- Hours per event, total hours, amount spent
- Location and reference links
- Source sheet and source row for imported data
- Created/updated audit users and timestamps

`EventGoal` maps events to `SDGGoal` and marks the primary goal when known.

`ProgramYearMetric` stores non-event yearly values such as blood donation
metrics. This keeps aggregate-only data out of the event registry.

## Import Design

There are two import paths.

Global import:

- Route: `/imports`
- API: `/api/imports`
- Parser: `src/modules/imports/parsers/excel.ts`
- Mapper: `src/modules/imports/mappers/index.ts`
- Service: `src/modules/imports/services/index.ts`
- Records import batches and row-level errors.

Unit import:

- Routes: unit sheet pages
- API: `/api/unit-events/[unit]/import`
- Uses the first worksheet and the fixed template column order.
- Supports Innovation Ecosystem, NSS, UBA, and Household Survey and SIRD.

Template generation:

- Dynamic API: `/api/unit-events/[unit]/template`
- Static script: `npm run template:generate`
- Static output: `public/innovation-ecosystem-template.xlsx`

Future consolidation should move the unit-specific import route onto the shared
parser/mapper path so validation and error reporting are consistent.

## Dashboard Design

The dashboard summarizes:

- Total events
- Total participants
- Total beneficiaries
- Total hours engaged
- Events by unit
- Events by year
- Events by SDG goal
- Latest blood donation donor metrics

The aggregation service is `src/modules/dashboard/services/index.ts`.

## API Design

Route handlers return a common response shape through shared helpers:

```ts
{
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

Paginated event responses also include:

```ts
{
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  }
}
```

Route handlers validate request data with Zod where available and delegate
business rules to domain services.

## Engineering Boundaries

Use the existing domain module pattern:

```text
src/modules/<domain>/
  validators
  services
  repositories
  mappers/parsers where needed
```

Keep route handlers thin:

- Authenticate
- Parse route params and request body
- Validate
- Call service/repository layer
- Return shared response shape

Keep database access inside repositories or narrowly scoped services.

## Current Design Debt

- The four unit sheet pages duplicate most of the same component logic.
- Global import and unit import use different parsing and error-reporting paths.
- Shared UI components and compact sheet UI are not fully unified.
- `Card` defaults to `rounded-xl`, while the intended design standard is tighter
  `4px` to `8px` radii.
- Inline edit of SDG goals is not fully wired through the current event update
  schema from the sheet pages.

These are known cleanup targets, not blockers for the current documentation
state.
