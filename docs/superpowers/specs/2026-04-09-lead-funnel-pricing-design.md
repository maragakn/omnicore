# Lead Funnel, Pricing & RWA-led Onboarding — Design Spec

**Date:** 2026-04-09  
**Status:** Approved  
**Scope:** Phase 3 — replaces CF-Admin-led onboarding with a two-sided lead funnel and per-module pricing

---

## 1. Problem Statement

The current onboarding wizard is CF Admin-facing, which means CF Admin must manually enter all society details. This is the wrong UX: the RWA Admin knows their own society, sq ft, households, and which services they want. CF Admin's job is commercial — pricing, approval, and activation — not data entry.

Additionally there is no pricing model, no equipment recommendation, and no sign-off mechanism.

---

## 2. Solution Overview

Replace the single-role wizard with a two-sided lead funnel:

```
CF Admin creates Lead → invites RWA Admin (magic link)
RWA Admin fills wizard  → CF Admin reviews + sets pricing
CF Admin sends Quote   → RWA Admin accepts
Center auto-creates    → CF Admin activates
```

---

## 3. Funnel States

| State | Actor | Trigger |
|---|---|---|
| `INVITED` | CF Admin | Creates lead, copies invite link |
| `FORM_SUBMITTED` | RWA Admin | Completes wizard via magic link |
| `QUOTE_SENT` | CF Admin | Configures pricing, sends quote |
| `ACCEPTED` | RWA Admin | Signs off on quote |
| `ACTIVE` | CF Admin | Flips center to live |
| `REJECTED` | RWA Admin | Rejects quote (returns to CF Admin) |

---

## 4. Data Model

### 4.1 New Models

#### `Lead`
```prisma
model Lead {
  id                String    @id @default(cuid())
  societyName       String
  contactName       String
  contactEmail      String
  contactPhone      String?
  status            String    @default("INVITED")
  inviteToken       String    @unique
  inviteExpiresAt   DateTime
  formData          String?   // JSON snapshot of RWA Admin's wizard submission
  centerId          String?   @unique
  center            Center?   @relation(fields: [centerId], references: [id])
  quote             Quote?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

#### `Quote`
```prisma
model Quote {
  id          String          @id @default(cuid())
  leadId      String          @unique
  lead        Lead            @relation(fields: [leadId], references: [id])
  status      String          @default("DRAFT")
  notes       String?
  sentAt      DateTime?
  acceptedAt  DateTime?
  lineItems   QuoteLineItem[]
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}
```

#### `QuoteLineItem`
```prisma
model QuoteLineItem {
  id           String  @id @default(cuid())
  quoteId      String
  quote        Quote   @relation(fields: [quoteId], references: [id])
  moduleKey    String
  pricingType  String
  oneTimeFee   Int?    // in paise
  monthlyFee   Int?    // in paise
  takeRatePct  Float?  // e.g. 8.5
}
```

#### `ServicePricingConfig`
```prisma
model ServicePricingConfig {
  id                String  @id @default(cuid())
  moduleKey         String  @unique
  pricingType       String
  defaultOneTimeFee Int?
  defaultMonthlyFee Int?
  defaultTakeRatePct Float?
}
```

#### `EquipmentRecommendation`
```prisma
model EquipmentRecommendation {
  id           String @id @default(cuid())
  sizeCategory String // SMALL | MEDIUM | LARGE
  items        String // JSON: [{ name, quantity }]
}
```

### 4.2 Modified Models

- `Center`: no structural changes — created on quote acceptance with status `ONBOARDING`
- `Lead.formData` (added above) stores the RWA Admin's full wizard submission as JSON. The real `Center` record is only created on quote acceptance, keeping the funnel clean.

---

## 5. Module Pricing Types

| Module | Pricing Type | Inputs |
|---|---|---|
| `TRAINERS` | `MONTHLY` | `monthlyFee` |
| `ASSETS` | `ONE_TIME` | `oneTimeFee` (equipment purchase; servicing as a sub-module is a future scope) |
| `VENDING_MACHINES` | `ONE_TIME_PLUS_TAKE_RATE` | `oneTimeFee` + `takeRatePct` |
| `MYGATE` | `MONTHLY` | `monthlyFee` |
| `BRANDING` | `ONE_TIME` | `oneTimeFee` |

Module cards shown to RWA Admin display the **payment type label only** — no amounts:
- `Monthly rate`
- `One-time setup`
- `One-time installation + monthly revenue share`

---

## 6. Equipment Recommendation Logic

Computed at CF Admin review time from `formData.gymSqFt` and `formData.totalUnits`:

```
SMALL  → gymSqFt < 1000  OR  totalUnits < 200
MEDIUM → gymSqFt 1000–2500  OR  totalUnits 200–500
LARGE  → gymSqFt > 2500  OR  totalUnits > 500
```

Seeded recommendations per category (stored in `EquipmentRecommendation`):

| Category | Equipment |
|---|---|
| SMALL | 2× Treadmill, 1× Upright Cycle, 1× Dumbbell Rack (5–25kg) |
| MEDIUM | 4× Treadmill, 2× Cycle, 2× Elliptical, Full Free Weight Rack, 3× Resistance Machines |
| LARGE | Full commercial cardio suite, Full resistance suite, Functional training zone, Boxing station |

Displayed as a collapsible informational panel on the CF Admin lead review screen. Not editable — CF Admin uses it to inform pricing decisions.

---

## 7. URL Structure

### CF Admin
| Route | Purpose |
|---|---|
| `/cf-admin/leads` | Lead pipeline table with status chips |
| `/cf-admin/leads/new` | Create lead form + generate invite link |
| `/cf-admin/leads/[id]` | Review submitted form + equipment recommendation |
| `/cf-admin/leads/[id]/quote` | Quote builder — set pricing per module, send |
| `/cf-admin/pricing` | Manage default rate card (`ServicePricingConfig`) |

### RWA Admin
| Route | Purpose |
|---|---|
| `/rwa-admin/setup/[token]` | Magic link landing → onboarding wizard (moved from CF Admin) |
| `/rwa-admin/quote/[token]` | View quote line items → Accept / Reject |

### Existing routes (unchanged)
| Route | Purpose |
|---|---|
| `/cf-admin/onboarding` | Active + onboarding centers list |
| `/cf-admin/onboarding/[id]` | Center detail (post-activation) |

---

## 8. Component Changes

### 8.1 Moved / Modified
- `OnboardingShell` → moves to `/rwa-admin/setup/[token]` context, reads token from URL
- `ModuleSelector` cards → add `paymentTypeLabel` prop derived from `ServicePricingConfig`
- `/cf-admin/onboarding/new` → **removed**, replaced by `/cf-admin/leads/new`

### 8.2 New Components
- `LeadPipelineTable` — sortable table with status column and quick action buttons
- `LeadReviewPanel` — shows form submission summary + equipment recommendation card
- `QuoteBuilder` — per-module pricing inputs, dynamically renders based on `pricingType`
- `QuoteLineItemRow` — single module row in quote builder and quote review
- `QuoteSummaryCard` — RWA Admin's read-only quote view with totals
- `PricingConfigTable` — CF Admin rate card editor

### 8.3 New API Routes
| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/leads` | Create lead, generate token |
| `GET` | `/api/leads/[id]` | Get lead + form data + equipment recommendation |
| `POST` | `/api/leads/[id]/submit` | RWA Admin submits wizard form |
| `POST` | `/api/leads/[id]/quote` | CF Admin creates/updates quote |
| `POST` | `/api/leads/[id]/quote/send` | CF Admin sends quote (status → QUOTE_SENT) |
| `POST` | `/api/leads/[id]/quote/accept` | RWA Admin accepts → creates Center |
| `POST` | `/api/leads/[id]/quote/reject` | RWA Admin rejects |
| `GET` | `/api/leads/token/[token]` | Validate invite token, return lead |
| `GET` | `/api/pricing` | Get all ServicePricingConfig |
| `PUT` | `/api/pricing/[moduleKey]` | Update default pricing for a module |

---

## 9. Zod Validation Schemas

```typescript
// Lead creation
CreateLeadSchema: { societyName, contactName, contactEmail, contactPhone? }

// Wizard form submission (same as current OnboardingPayloadSchema minus center creation)
LeadFormSubmitSchema: { name, code, address, city, pincode, capacity, gymSqFt?,
  rwaName, totalUnits, contactPersonName, contactPersonPhone, contactPersonEmail,
  selectedModules, trainerIds?, myGateSocietyId?, myGateApiKey?, displayName? }

// Quote line item
QuoteLineItemSchema: { moduleKey, pricingType, oneTimeFee?, monthlyFee?, takeRatePct? }

// Quote creation
CreateQuoteSchema: { notes?, lineItems: QuoteLineItemSchema[] }
```

---

## 10. TDD Test Plan

### Unit tests
- `deriveEquipmentCategory(gymSqFt, totalUnits)` → SMALL | MEDIUM | LARGE boundary cases
- `computeQuoteTotals(lineItems)` → correct summation of one-time and monthly fees
- `generateInviteToken()` → returns unique URL-safe string
- `isTokenExpired(expiresAt)` → boundary cases

### Component tests
- `QuoteBuilder` renders correct input fields per `pricingType`
- `ModuleSelector` shows correct payment type label per module
- `QuoteSummaryCard` displays correct totals given line items
- `LeadPipelineTable` renders status chips and action buttons

### API integration tests
- `POST /api/leads` → creates lead, returns token
- `POST /api/leads/[id]/submit` → validates token, stores formData
- `POST /api/leads/[id]/quote/accept` → creates Center + ResidentialDetails + CenterModules

---

## 11. Seed Data

Add to `prisma/seed.ts`:
- `ServicePricingConfig` for all 5 modules with sensible defaults
- `EquipmentRecommendation` for SMALL, MEDIUM, LARGE
- 2–3 sample leads in different funnel states for demo

---

## 12. Hackathon Scope

Invite email is **stubbed** — CF Admin sees the invite URL in the UI and copies it manually. No actual email sending required for the demo.

Demo path:
1. CF Admin: `/cf-admin/leads/new` → create lead → copy invite link
2. Open invite link → RWA Admin fills wizard (modules show payment type labels)
3. CF Admin: `/cf-admin/leads/[id]` → review submission + see equipment recommendations
4. CF Admin: `/cf-admin/leads/[id]/quote` → set pricing → send quote
5. RWA Admin: `/rwa-admin/quote/[token]` → review quote → Accept
6. Center appears in `/cf-admin/onboarding` with `ONBOARDING` status
