# OmniCore — Implementation Plan

> **Living document. All deviations must be approved by both developers before code is written.**
> See [Deviation Process](#deviation-process) and [Deviation Log](#deviation-log).

---

## Product Context

OmniCore is a multi-role B2B SaaS portal for managing community gym facilities in RWAs and corporate campuses. Scoped for a hackathon demo — focus on demo quality, not production completeness.

---

## Roles in Scope (Only These Two)

| Role | Access |
|---|---|
| **CF Admin** | Full read/write. Owns onboarding, trainers, payroll, assets, service requests, pricing. |
| **RWA Admin** | Mostly read-only. Sees footfall dashboard, trainer attendance, asset status, service requests. Can create requests. |

**Out of scope (do not build):**
- Operator role
- Asset Manager role as standalone login
- Invoicing, GST, late fees, PDF generation
- Production authentication
- Full external integration plumbing

---

## Tech Stack (Locked — No Changes Without Both Devs Approving)

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16, App Router | Server components, clean routing, shadcn/ui compatible |
| Language | TypeScript (strict) | Type safety across DB ↔ API ↔ UI |
| Styling | Tailwind CSS v4 | Utility-first, v4 CSS-based config, co-located with components |
| UI Primitives | Radix UI (shadcn pattern) | Accessible, unstyled, composable |
| ORM | Prisma 5 (not v7) | v7 broke SQLite adapter — v5 is stable for hackathon |
| Database | SQLite (dev), Postgres-compatible schema | Zero setup locally, upgradeable |
| Validation | Zod | Schema-first validation, shared between API and forms |
| Testing | Vitest + React Testing Library | Fast, ESM-native, compatible with Next.js |
| E2E | Playwright (Phase 7) | Critical happy paths only |
| Fonts | DM Sans (body), DM Mono (metrics), Syne (headings) | Premium ops feel |
| Theme | Dark only | No light mode toggle needed for hackathon |

---

## Entities (Prisma Schema — Authoritative)

```
Center
  ├── ResidentialDetails
  ├── MyGateConfig
  ├── CenterModule[]          ← which modules are enabled per center
  ├── ServiceConfig[]         ← pricing per service offered
  ├── EquipmentAsset[]
  ├── CenterTrainerMapping[]
  ├── TrainerAttendance[]
  ├── FootfallEvent[]
  ├── ServiceRequest[]
  └── PTSession[]

Trainer
  ├── CenterTrainerMapping[]
  ├── TrainerAttendance[]
  └── PTSession[]
```

**String-typed fields (SQLite has no native enums — validated via Zod + TypeScript constants in `lib/constants/enums.ts`):**

| Field | Valid values |
|---|---|
| Center.status | `ACTIVE` \| `ONBOARDING` \| `INACTIVE` |
| Trainer.trainerType | `FULLTIME` \| `PT` |
| TrainerAttendance.source | `MYGATE` \| `OTP` \| `MANUAL` |
| TrainerAttendance.status | `PRESENT` \| `ABSENT` \| `LATE` |
| EquipmentAsset.condition | `GOOD` \| `FAIR` \| `POOR` |
| ServiceRequest.status | `OPEN` \| `ASSIGNED` \| `IN_PROGRESS` \| `RESOLVED` |
| ServiceRequest.priority | `LOW` \| `MEDIUM` \| `HIGH` \| `CRITICAL` |
| CenterModule.moduleKey | `TRAINERS` \| `ASSETS` \| `VENDING_MACHINES` \| `BRANDING` \| `MYGATE` |

---

## Onboarding Flow (Multi-Step — Conditional)

The onboarding is a **dynamic multi-step flow** where later steps depend on which modules are selected in Step 2.

```
Step 1 — Gym & Society Details
  • Gym/center name
  • Society/RWA name
  • Sq ft of gym
  • Total residential units
  • Address, City, Pincode
  • Contact person name, phone, email

Step 2 — Select Modules (checkboxes)
  • Trainers               → enables Steps 3a
  • Asset Management       → enables Step 3b
  • Vending Machines       → enables Step 3c
  • Branding               → enables Step 3d
  • MyGate Integration     → enables Step 3e (footfall + trainer attendance)

Steps 3a–3e — Conditional (only shown if module was selected in Step 2)
  3a. Trainer Setup        → map initial trainers, set schedules
  3b. Asset Setup          → tag initial equipment inventory
  3c. Vending Machines     → machine IDs, locations
  3d. Branding             → logo, display name, colors
  3e. MyGate Config        → society ID, API key, webhook URL

Final Step — Review & Confirm
  • Summary of all entered data
  • Submit saves center as ONBOARDING status
  • CF Admin can return and complete remaining steps later
```

**Key rule:** Draft saving at every step. Center is created in `ONBOARDING` status. Steps can be completed out of order or resumed later.

---

## Asset Status Rules (Business Logic — Locked)

```
nextServiceDue > 30 days away  →  GREEN  (condition: GOOD)
nextServiceDue 7–30 days away  →  AMBER  (condition: FAIR)
nextServiceDue < 7 days or overdue  →  RED  (condition: POOR)
```

Implemented in: `lib/constants/enums.ts → computeAssetStatus()`

---

## Service Request Workflow

```
OPEN → ASSIGNED → IN_PROGRESS → RESOLVED
```

- CF Admin can move between any status
- RWA Admin can only create (OPEN) and view

---

## Phases & Status

| Phase | Description | Status |
|---|---|---|
| **0** | Foundation: scaffold, Prisma schema, seed, Vitest, app shell, role switcher | ✅ Done |
| **1** | Shared components: StatCard, StatusBadge, DataTable, Timeline, Stepper | 🔄 In Progress |
| **2** | Onboarding flow: dynamic multi-step with module selection | ⬜ Pending |
| **3** | CF Admin overview: center grid, detail view, quick actions | ⬜ Pending |
| **4** | RWA Admin dashboard: footfall, attendance, assets, service requests | ⬜ Pending |
| **5** | Trainer operations: roster, attendance table, PT payroll preview, CSV export | ⬜ Pending |
| **6** | Asset operations: inventory, service status, service request workflow | ⬜ Pending |
| **7** | MyGate stubs + live footfall SSE stream simulation | ⬜ Pending |

---

## Folder Structure (Authoritative)

```
/app
  /cf-admin/
    layout.tsx              ← CF Admin shell (sidebar + main)
    page.tsx                ← CF Admin landing / overview
    /onboarding/
      page.tsx              ← Onboarding entry (center list + new center CTA)
      /[centerId]/
        page.tsx            ← Dynamic step form for a center
    /trainers/
    /assets/
    /service-requests/
    /payroll/
  /rwa-admin/
    layout.tsx              ← RWA Admin shell
    page.tsx                ← RWA Admin dashboard
    /attendance/
    /assets/
    /service-requests/
  /api/
    /footfall/
      /stream/route.ts      ← SSE endpoint (Phase 7)
    /webhooks/
      /mygate/route.ts      ← MyGate webhook stub (Phase 7)

/components
  /ui/                      ← Radix-based primitives (Button, Badge, Card, etc.)
  /shared/
    Sidebar.tsx
    StatCard.tsx
    StatusBadge.tsx
    DataTable.tsx
    Timeline.tsx
  /onboarding/
    OnboardingShell.tsx     ← Stepper wrapper
    StepGymDetails.tsx
    StepModuleSelection.tsx
    StepTrainerSetup.tsx
    StepAssetSetup.tsx
    StepMyGateConfig.tsx
    StepReview.tsx
  /dashboard/               ← RWA Admin dashboard widgets
    FootfallCard.tsx
    LiveFeed.tsx
    UtilizationWidget.tsx
    PeakHeatmap.tsx

/lib
  /constants/
    navigation.ts           ← Nav items per role
    enums.ts                ← Domain enums + business logic functions
  /validations/             ← Zod schemas per entity (Phase 2+)
  /db/
    client.ts               ← Prisma singleton

/prisma
  schema.prisma             ← Source of truth for data model
  seed.ts                   ← Demo data

/tests
  /unit/                    ← Vitest unit tests
  /e2e/                     ← Playwright E2E (Phase 7)
```

---

## Seed Data Provided

| Entity | Count | Notes |
|---|---|---|
| Centers | 3 | 2 ACTIVE (with MyGate), 1 ONBOARDING (no MyGate) |
| Trainers | 5 | 3 FULLTIME, 2 PT |
| Assets | 8 | 1 RED (overdue), 1 AMBER (due soon), rest GREEN |
| Service Requests | 4 | 1 OPEN/CRITICAL, 1 IN_PROGRESS, 1 ASSIGNED, 1 RESOLVED |
| Footfall Events | 33 | Simulated last 24h for Prestige + Brigade |
| PT Sessions | 42 | Last 30 days across Prestige + Brigade |
| Trainer Attendance | 21 records | Last 7 days, 1 absent trainer seeded |

---

## Key Decisions Made (Both Devs Must Read)

| # | Decision | Rationale | Date |
|---|---|---|---|
| 1 | Downgraded Prisma v7 → v5 | v7 broke SQLite with new adapter requirement; v5 is stable | 2026-04-09 |
| 2 | No native enums in schema | SQLite in Prisma 5 doesn't support enums; using String fields + TypeScript constants | 2026-04-09 |
| 3 | URL-based role routing | `/cf-admin/*` and `/rwa-admin/*` — clean separation, back-button works, easy to test | 2026-04-09 |
| 4 | No auth middleware | Role is determined purely by URL prefix for hackathon; real auth comes later | 2026-04-09 |
| 5 | Dynamic onboarding steps | Steps 3+ conditional on module selection in Step 2 — avoids showing irrelevant forms | 2026-04-09 |
| 6 | CenterModule model added | Tracks which modules (Trainers, Assets, MyGate, etc.) are enabled per center | 2026-04-09 |

---

## Deviation Process

> A **deviation** is any change to:
> - Folder structure defined above
> - Entity names or relationships in the Prisma schema
> - Tech stack choices
> - Phase scope or sequencing
> - Business rules (asset status thresholds, service request workflow, role permissions)

### Process
1. Developer proposing a deviation writes it in the **Deviation Log** below (draft status)
2. Other developer reviews and either approves or requests changes
3. Only after both mark `APPROVED` does code get written
4. The relevant section of PLAN.md is updated to reflect the approved change

### How to record a deviation
Add an entry to the Deviation Log table below.

---

## Deviation Log

| # | Date | Proposed By | Change Description | Status | Dev 1 | Dev 2 |
|---|---|---|---|---|---|---|
| — | — | — | No deviations yet | — | — | — |

---

## Test Coverage Requirements

| Area | Minimum | Tool |
|---|---|---|
| Business logic (asset status, payroll calc) | 100% | Vitest |
| Form validation (Zod schemas) | All schemas | Vitest |
| Sidebar nav per role | All nav items | Vitest + RTL |
| Onboarding step progression | All paths | Vitest + RTL |
| CF Admin vs RWA Admin route access | Happy path | Playwright |
| Onboarding end-to-end | Happy path | Playwright |

---

## Demo Script (Hackathon)

1. Open as **CF Admin**
2. Show center grid (3 centers, different statuses)
3. Start new center onboarding → select modules → conditional steps appear
4. Switch to **RWA Admin** (one click) — layout shifts, menu collapses, READ ONLY badge appears
5. Show live footfall dashboard with check-in feed
6. Switch back to **CF Admin** → open a service request → change status
7. Show PT payroll preview for a trainer
8. Show asset inventory with RED/AMBER/GREEN status badges

---

## Running Locally

```bash
# Install
npm install

# Database setup (first time)
npx prisma migrate dev

# Seed demo data
npm run db:seed

# Dev server
npm run dev

# Tests
npm test

# Reset + reseed
npm run db:reset
```

---

*Last updated: 2026-04-09 by mkn*
