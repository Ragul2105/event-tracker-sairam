# Sairam Event Tracker

Internal event tracking and reporting system for Sri Sairam institutions.

The app tracks unit-wise events, SDG goal mapping, participants, beneficiaries,
hours engaged, amount spent, Excel imports, blood donation yearly metrics, and
role-based access for administrative users.

## Stack

- Next.js 16.2 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma 7 with PostgreSQL
- Custom email/password authentication with JWT cookies
- XLSX-based Excel parsing and template generation

## Core Features

- Custom login, logout, refresh, and current-user session APIs
- Role-based access for `ADMIN`, `MASTER`, and `UNIT_USER`
- Multi-unit access mapping for unit users
- Event CRUD with canonical event fields and SDG goal tagging
- Spreadsheet-style unit pages for Innovation Ecosystem, NSS, UBA, and Household Survey and SIRD
- Global Excel import with import batch history and row-level errors
- Unit-specific Excel import and template flow
- Blood donation yearly metric module
- Dashboard summaries by unit, year, SDG goal, participants, beneficiaries, hours, and donors
- Admin user management and master-data views

## Project Structure

```text
src/app
  (auth)/login                 Login page
  (protected)                  Authenticated UI routes
  api                          App Router route handlers

src/components
  shared                       Auth provider and main shell layout
  ui                           Shared UI primitives

src/modules
  auth                         Login/session services, repositories, validators, middleware
  events                       Event validation, services, repositories
  imports                      Excel parser, mappers, import services, import repositories
  metrics                      Blood donation metric repositories and validators
  dashboard                    Dashboard aggregation service
  masters                      Units and SDG goal lookups
  users                        User administration services and repositories
  shared                       API response helpers, shared types, app errors

src/lib
  env                          Runtime environment access
  jwt                          JWT signing and verification
  logger                       Lightweight server logger
  prisma                       Prisma client with pg adapter

prisma
  schema.prisma                Database schema
  seed.ts                      Seed users, units, and SDG goals

scripts
  generate-template.js         Static Innovation Ecosystem Excel template generator
```

## Environment

Create `.env` with the database and token values:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_SECRET="change-me"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_SECRET="change-me-too"
REFRESH_TOKEN_EXPIRES_IN="30d"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

`DIRECT_URL` is optional for the app, but useful for Prisma commands when your
database setup needs a direct connection.

## Setup

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

Seeded credentials:

```text
admin@sairam.edu.in / admin123
master@sairam.edu.in / master123
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Next.js dev server |
| `npm run build` | Generate Prisma client and build Next.js |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push Prisma schema to the database |
| `npm run db:migrate` | Create and apply a Prisma migration |
| `npm run db:seed` | Seed base users, units, and SDG goals |
| `npm run db:studio` | Open Prisma Studio |
| `npm run template:generate` | Regenerate the static Innovation Ecosystem template |

## Main Routes

| Route | Purpose |
| --- | --- |
| `/login` | Sign in |
| `/dashboard` | Summary metrics |
| `/events` | All events table |
| `/events/new` | Create event |
| `/events/[id]` | Event detail |
| `/events/[id]/edit` | Edit event |
| `/events/innovation-ecosystem` | Compact unit sheet |
| `/events/nss` | Compact unit sheet |
| `/events/uba` | Compact unit sheet |
| `/events/household-survey` | Compact unit sheet |
| `/imports` | Global Excel import and history |
| `/metrics/blood-donation` | Blood donation yearly metrics |
| `/admin/users` | Admin user management |
| `/admin/masters` | Units and SDG goals |

## API Surface

- `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/refresh`
- `/api/events`, `/api/events/[id]`
- `/api/imports`, `/api/imports/[batchId]`
- `/api/unit-events/[unit]/import`
- `/api/unit-events/[unit]/template`
- `/api/dashboard/summary`
- `/api/metrics/blood-donation`, `/api/metrics/blood-donation/[id]`
- `/api/masters/units`, `/api/masters/sdg-goals`
- `/api/users`, `/api/users/[id]`

## Data Model

The canonical schema is centered on:

- `User`, `UserUnitAccess`, `AuthSession`
- `Unit`, `SDGGoal`
- `Event`, `EventGoal`
- `ImportBatch`, `ImportRowError`
- `ProgramYearMetric`

Event records keep the original source sheet and row when imported, while SDG
goals are stored through the `EventGoal` join table. Blood donation values are
stored as yearly program metrics instead of normal event records.

## Documentation

Canonical project docs:

- `README.md` for setup, structure, and operations
- `DESIGN.md` for product, UI, and architecture design
- `prd.md` for product requirements and scope
