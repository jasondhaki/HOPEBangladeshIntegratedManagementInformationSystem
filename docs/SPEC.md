---
title: "HB-IMIS — Master Implementation & Technical Blueprint"
subtitle: "HOPE Bangladesh Integrated Management Information System"
author: "Prepared for HOPE Worldwide Bangladesh · Version 2.0 · Traceable to SRS v1.0 (Sections 1–104)"
date: "September 2026"
---

# 0. How to Read This Document

This blueprint replaces the earlier *Master Implementation Plan*. It is written to be
executable: every section is either something you build, something you configure, or
something you sign off. It is traceable — each functional area carries a reference to the
SRS section it satisfies, written as `[SRS §n]`.

**Document map**

| Part | Sections | Who uses it |
|---|---|---|
| A. Strategy | 0–3 | HOPE management, project sponsor |
| B. Architecture & Stack | 4–7 | Developer, architect |
| C. Data Model | 8–10 | Developer, DBA |
| D. Security & RBAC | 11–13 | Developer, Super Admin |
| E. Functional Specification | 14–41 | Developer, module owners, UAT testers |
| F. Cross-Cutting Engines | 42–52 | Developer |
| G. Delivery Plan | 53–60 | Everyone |
| H. Operations & Contract | 61–70 | HOPE management, developer |
| I. Appendices | A–H | Developer |

---

# 1. What Was Missing From The Previous Plan

The earlier plan (`myplan.pdf`) was directionally correct — the stack choice, the golden
architectural rule, and the six-phase shape all survive into this version. What it lacked was
depth and coverage. Below is an honest gap analysis, because knowing *what* was missing is
the fastest way to understand *why* this document is structured the way it is.

### 1.1 Modules that were absent entirely

The SRS defines 28 core modules `[SRS §7]`. The previous plan named roughly 12. These were
missing and are now fully specified:

| # | Missing module | SRS ref | Now covered in |
|---|---|---|---|
| 1 | School Health Management | §17 | §22 |
| 2 | Certificate Management + QR verification | §26 | §26 |
| 3 | Employment / Post-training Follow-up | §27 | §27 |
| 4 | Trainer Management | §22 | §25 |
| 5 | Training Schedule + conflict detection | §23 | §25.4 |
| 6 | Photo Management with consent metadata | §31 | §29 |
| 7 | Story / Case Study Management with approval workflow | §32 | §30 |
| 8 | Output & Indicator Tracking | §30 | §32 |
| 9 | Donor & Regulatory configurable reporting | §34, §35 | §34 |
| 10 | Procurement 9-stage workflow | §42 | §37 |
| 11 | Vendor Management | §43 | §37.5 |
| 12 | Inventory with stock formula | §44 | §38 |
| 13 | Asset transfer & disposal workflows | §46, §47 | §39 |
| 14 | Document Management with versioning | §52 | §41 |
| 15 | Global permission-aware Search | §56 | §48 |
| 16 | Notification engine | §57 | §49 |
| 17 | Data Import (Excel/CSV) with dedupe | §65 | §50 |
| 18 | Data Export with role control | §66 | §50.4 |
| 19 | Audit Trail | §61 | §46 |
| 20 | System Configuration | §80 | §52 |
| 21 | Leave Management workflow | §39 | §36.3 |
| 22 | Performance Appraisal | §40 | §36.4 |
| 23 | Academic Year Management | §13 | §19 |

### 1.2 Specification depth that was absent

- **No data model.** "Finalize the ER diagram" was listed as a next step rather than done. This
  document ships a complete entity model with keys, relationships, and ID formats (§8–10).
- **No permission matrix.** Nine roles were named but never mapped to read/write/approve/delete
  against each module. Section 12 is that matrix.
- **No field-level specifications.** Modules were named, not defined. Sections 14–41 give fields,
  states, validations, screens, and per-module acceptance criteria.
- **No MVP boundary.** `[SRS §86]` defines a 12-module Version 1 for constrained budget. This is
  now an explicit, contractually usable scope line (§55).
- **No acceptance criteria mapping.** `[SRS §87]` lists 15 criteria. Section 58 maps each to the
  test that proves it.
- **No report catalogue.** `[SRS §54]` lists 18 named management reports. Appendix D specifies
  all of them: filters, columns, formats.
- **No non-functional targets.** Performance, scalability, backup frequency, retention — all
  named in the SRS as deliverables, all previously unquantified. Section 51 and §62 quantify them.
- **No localization plan.** Bangla Unicode, BDT / Taka currency formatting, and configurable date formats
  `[SRS §81, §82]` were not addressed. Section 47 addresses them.
- **No migration design.** The "500 students" example `[SRS §65]` was mentioned but no template,
  no dedupe logic, no rollback. Section 59 designs it.
- **No commercial/contract track.** `[SRS §92–95]` — source code ownership, hosting cost,
  maintenance SLA, change-request classification — are contractual obligations on the developer.
  Sections 66–69 handle them.
- **No risk register, no testing plan, no training plan, no documentation deliverables.**

### 1.3 Stack decisions that needed correcting

The previous plan proposed Next.js + Supabase + Vercel. The framework and database choices are
sound and are retained. Three corrections are made:

1. **Vercel's free tier is not licensed for commercial use.** This is an NGO deployment for a
   client organisation. Section 4.6 sets out a free-tier-compliant hosting path and the
   production options HOPE should budget for.
2. **No file/object storage strategy existed**, despite the system being photo-heavy
   `[SRS §31, §72]`. Section 43 specifies it.
3. **RLS was named but not designed.** Row-Level Security without a designed scope model
   silently fails open or locks admins out. Section 13 designs the policies.

---

# 2. Executive Summary

HOPE Worldwide Bangladesh runs education, co-curricular, school health, and technical/vocational
programmes across multiple projects and locations, with Program, HR, Administration, and
Accounts & Finance departments `[SRS §1]`. Information currently lives in registers, Excel files,
and departmental documents.

**HB-IMIS** is a single web application, backed by a single central relational database, that
replaces those scattered records. It is not an accounting package and not a student database — it
is an integrated NGO Management Information System combining programme management, beneficiary
management, education, vocational training, HR, administration, inventory, asset, finance,
reporting, and management dashboards `[SRS §101]`.

**The system in one line:**

> One Organization → Multiple Projects → Multiple Programs → Multiple Activities → **One Central
> Beneficiary Database** `[SRS §3]`

**Delivery shape:** six phases over approximately six months, with a defined Minimum Viable
Product available for production use at the end of Phase 3. Every phase ends with a demo, a
signed exit checklist, and a deployed increment — not a document.

**The three non-negotiables:**

1. A beneficiary is entered **once** and is thereafter linked, never re-typed `[SRS §3, §67]`.
2. There is **one database**, filtered by project/location/programme — never one database per
   project `[SRS §99]`.
3. Master data (projects, courses, activities, budget heads) is **configurable by HOPE staff**,
   not hard-coded, so new courses and activities never require redevelopment `[SRS §8, §84]`.

---

# 3. System Vision and Architectural Golden Rules

## 3.1 The beneficiary-anchored model

A single child in Mirpur may attend Primary Education, play Football, train in Karate, take
Drawing, and receive a School Health screening `[SRS §3]`. That is five participation records —
and exactly **one** beneficiary record. Later, the same person may enrol in Tailoring & Dress
Making, complete it, receive a certificate, and be followed up at 3, 6, and 12 months `[SRS §69]`.
Every one of those events hangs off the same `beneficiary_id`.

```
                    BENEFICIARY  (the anchor)
                          |
      +-------------------+-------------------+------------------+
      |                   |                   |                  |
   STUDENT            TRAINEE         ACTIVITY PARTICIPANT   HEALTH SUBJECT
 (education)        (vocational)       (co-curricular)      (school health)
      |                   |                   |                  |
      +--------- ATTENDANCE ---- ASSESSMENT ---- CERTIFICATE -----+
                                                      |
                                              EMPLOYMENT FOLLOW-UP
                                                      |
                                          PROJECT INDICATORS → REPORTS
```

## 3.2 The seven architectural rules

| # | Rule | Consequence if broken |
|---|---|---|
| R1 | One central database; project is a **column**, never a schema or a separate DB `[SRS §99]` | Cross-project reporting becomes impossible |
| R2 | Beneficiary is the single source of personal identity; students/trainees/participants are **roles**, not copies `[SRS §67]` | Duplicate people, inflated beneficiary counts, broken donor reporting |
| R3 | All operational lists come from **master data tables**, never from hard-coded enums in code `[SRS §8]` | Every new course needs a developer |
| R4 | Every mutation of a critical record writes an **audit row** `[SRS §61]` | No accountability, failed acceptance criterion #14 |
| R5 | Financial and administrative records are **soft-deleted only** `[SRS §61]` | Irrecoverable loss; audit gap |
| R6 | Authorisation is enforced at the **database** (RLS), not only in the UI `[SRS §60, §63]` | A crafted API request bypasses every UI check |
| R7 | Reports are **generated from operational data**, never hand-entered `[SRS §33, §70]` | The system becomes another place to re-type numbers |

## 3.3 What "configurable" actually means here

HOPE must be able to do all of the following **without a developer** `[SRS §5, §80, §84]`:

- Add or deactivate a project, location, department
- Add a new co-curricular activity (e.g. a new sport) or a new vocational course
- Open a new academic year or fiscal year and roll classes forward
- Define a new indicator with a target
- Create a budget head and an expense category
- Define approval levels and thresholds
- Edit a report template's sections and header
- Create a user, assign a role, and scope that role to projects

Anything on that list that requires a code change is a design defect.

---

# 4. Technology Stack — Decisions and Justifications

Constraint applied throughout: **every tool, service, and host in the development stack is used
on a free tier.** Where a production deployment for HOPE would require a paid service, that is
called out explicitly as a cost HOPE budgets for `[SRS §93]`, not a cost absorbed by development.

## 4.1 Stack at a glance

| Layer | Choice | Version target | Free tier? |
|---|---|---|---|
| Language | TypeScript (strict) | 5.x | Yes (OSS) |
| Framework | Next.js — App Router, Server Components, Route Handlers | 15.x | Yes (OSS) |
| Runtime | Node.js LTS | 20/22 LTS | Yes |
| UI | React 19 + Tailwind CSS + shadcn/ui (Radix primitives) | — | Yes |
| Icons | lucide-react | — | Yes |
| Forms | React Hook Form + Zod resolver | — | Yes |
| Validation (shared) | Zod — one schema reused client, server, and API | — | Yes |
| Database | PostgreSQL via Supabase | 15/16 | Free tier (500 MB) |
| ORM / query | Supabase JS client + Postgres RLS; Drizzle ORM for typed queries & migrations | — | Yes |
| Auth | Supabase Auth (email + password, session cookies) | — | Yes |
| Authorization | Postgres RLS + application guard layer | — | Yes |
| File storage | Supabase Storage (S3-compatible) | — | Free tier (1 GB) |
| Charts | Recharts | — | Yes |
| Tables/grids | TanStack Table | — | Yes |
| Data fetching/cache | TanStack Query (client islands) + Next.js cache | — | Yes |
| PDF export | React-PDF (`@react-pdf/renderer`) server-side | — | Yes |
| Excel/CSV export | SheetJS (`xlsx`) / `papaparse` | — | Yes |
| Excel/CSV import | `papaparse` + SheetJS + Zod row validation | — | Yes |
| QR codes | `qrcode` (generation) | — | Yes |
| Dates | `date-fns` + `date-fns-tz` (Asia/Dhaka) | — | Yes |
| i18n | `next-intl` (en / bn) | — | Yes |
| Background jobs | Supabase `pg_cron` + scheduled Route Handlers | — | Yes |
| Email (future) | Resend free tier / SMTP | — | Free tier |
| Testing | Vitest (unit), Playwright (E2E), pgTAP (RLS policies) | — | Yes |
| Error monitoring | Sentry free tier | — | Free tier |
| CI | GitHub Actions (public/free minutes) | — | Yes |
| Source control | GitHub | — | Yes |
| Design | Figma free tier | — | Yes |

## 4.2 Why Next.js

- Server Components let heavy, permission-sensitive queries run on the server; the browser never
  receives rows the user cannot see. This matters for a system holding minors' and health data
  `[SRS §63]`.
- One codebase serves desktop, tablet, and mobile browsers — the SRS requires all five form
  factors `[SRS §58]`.
- Route Handlers give a real HTTP API surface, satisfying the "API layer" in the proposed
  architecture `[SRS §4]` and the requirement that future integrations be possible `[SRS §74]`.
- Server-side rendering keeps first paint fast on the low-bandwidth connections field staff use
  `[SRS §83]`.

## 4.3 Why PostgreSQL / Supabase

- The domain is **deeply relational**: beneficiary → enrolment → attendance → assessment →
  certificate → follow-up → indicator → report. A document database would force joins into
  application code and make organisation-wide reporting slow and error-prone.
- Row-Level Security lets rule R6 be enforced in the database itself. A Project Coordinator
  restricted to Jamgara is restricted there even if a bug in the UI asks for Mirpur.
- Supabase bundles Auth, Storage, and Postgres on a single free tier, which keeps the
  development stack inside the free-tier constraint.
- Views and materialised views give dashboard aggregates without duplicating data.

**Honest limitation:** the Supabase free tier provides roughly 500 MB of database space, 1 GB of
file storage, and pauses projects after ~7 days of inactivity. That is sufficient for development,
UAT, and a pilot with a few thousand records. It is **not** a production posture for an
organisation storing years of photos. Production sizing is in §4.6 and §62.

## 4.4 Why Drizzle alongside Supabase

Supabase's client is excellent for RLS-aware CRUD. Drizzle adds two things the project needs:

1. **Versioned SQL migrations in the repository** — the schema becomes reviewable, diffable, and
   reproducible across dev/staging/production. This is also the deliverable behind "database
   documentation" `[SRS §91]`.
2. **Type-safe complex queries** for reports and dashboards, where hand-written SQL strings would
   otherwise drift from the schema.

Rule: **all schema changes go through a migration file. No changes through the Supabase dashboard
in staging or production.**

## 4.5 Explicitly rejected alternatives

| Rejected | Why |
|---|---|
| Firebase / Firestore | Non-relational; cross-entity reporting and indicator aggregation would be painful and expensive |
| Laravel / PHP + MySQL | Viable and common in BD, but loses shared TypeScript types across client/server and the RLS model |
| Separate DB per project | Directly forbidden `[SRS §99]` |
| Headless CMS for reports | Report templates are structured data, not content; belongs in Postgres |
| Custom JWT auth from scratch | Reinventing session security on a system holding minors' data is unjustifiable risk |
| MongoDB | Same as Firebase; plus weaker constraint enforcement for data-validation rules `[SRS §64]` |

## 4.6 Hosting strategy under the free-tier constraint

| Environment | Host | Free tier status | Notes |
|---|---|---|---|
| Local dev | Docker + Supabase CLI local stack | Free | Full offline development |
| Preview / UAT | Cloudflare Pages + Workers, or Netlify | Free, commercial use permitted | Build previews per branch |
| Database (dev/UAT) | Supabase free project | Free | 500 MB cap |
| Production (recommended to HOPE) | See below | **Budgeted by HOPE** | |

**Important licensing note.** Vercel's Hobby (free) plan prohibits commercial use. HB-IMIS is
built for an organisation, so Vercel Hobby is not an appropriate production host. Free tiers that
do permit commercial deployment include **Cloudflare Pages/Workers** and **Netlify**; a
self-hosted Node server on **Oracle Cloud Always Free** is another option with more control and
no cold starts.

**Production options to present to HOPE** `[SRS §93]` — the SRS requires the developer to give
estimated monthly hosting cost, backup cost, storage cost, server location, and recovery plan:

| Option | Shape | Indicative monthly | Server location |
|---|---|---|---|
| A. Managed cloud | Supabase Pro + Cloudflare/Netlify paid tier | Low tens of USD | Singapore region (nearest to BD) |
| B. Self-managed VPS | Single VPS running Docker: Next.js + Postgres + MinIO + Caddy | Low tens of USD | Singapore / local BD provider |
| C. Local/on-premise | HOPE-owned server + VPN | Hardware capex | Dhaka office |

Recommendation: **Option A for launch**, with Option B as the exit path if HOPE wants full data
residency. In all options, **HOPE holds the root account credentials** and therefore
administrative ownership of its data `[SRS §93]`. Quote actual current prices at contract time —
do not commit to the indicative figures above.

## 4.7 Repository and code structure

```
hb-imis/
├─ app/
│  ├─ (auth)/login, /reset-password
│  ├─ (app)/
│  │   ├─ dashboard/                  # role-routed dashboards §35
│  │   ├─ beneficiaries/              # §17, §18
│  │   ├─ education/{primary,secondary,academic-years}
│  │   ├─ activities/                 # co-curricular §20, §21
│  │   ├─ health/                     # §22
│  │   ├─ vocational/{courses,batches,trainees,trainers,schedule}
│  │   ├─ attendance/                 # §42 engine UI
│  │   ├─ assessments/  certificates/ follow-up/
│  │   ├─ projects/{activities,indicators}
│  │   ├─ media/{photos,stories}
│  │   ├─ hr/{employees,attendance,leave,appraisal}
│  │   ├─ admin/{procurement,vendors,inventory,assets,documents}
│  │   ├─ finance/{budgets,expenses,vouchers,payments,advances}
│  │   ├─ reports/                    # §45 engine
│  │   └─ settings/{master-data,users,roles,config,audit}
│  └─ api/                            # Route Handlers (typed, Zod-validated)
├─ components/{ui,forms,tables,charts,layout}
├─ lib/{auth,permissions,db,validation,export,import,i18n,ids,audit}
├─ db/{schema,migrations,seeds,policies}
├─ tests/{unit,e2e,rls}
└─ docs/{erd,api,runbook,user-manual}
```

**Conventions**

- Every table has a Zod schema in `lib/validation` used by both the form and the API handler —
  one definition, no drift.
- Every list screen uses the same `DataTable` component (filter, sort, paginate, export) so that
  the 18 report screens and 30+ list screens behave identically.
- Every mutation goes through a `withAudit()` wrapper that writes the audit row in the same
  transaction as the change.
- ID generation lives in `lib/ids` only — never inline.

# 5. Application Architecture

## 5.1 Layers

```
 Browser (desktop / tablet / Android / iOS)        [SRS §58]
        │  HTTPS only, secure httpOnly session cookie
        ▼
 Next.js Edge/Node runtime
   ├─ Server Components  → read queries, permission-filtered
   ├─ Server Actions     → form mutations, Zod-validated
   └─ Route Handlers     → /api/* JSON surface for future integrations  [SRS §74]
        │
        ▼
 Application guard layer  (lib/permissions)
   · resolves session → user → roles → project scope
   · denies before the query is issued (fast fail, clear error)
        │
        ▼
 PostgreSQL  (single central database)              [SRS §99]
   ├─ Row-Level Security policies      ← the real enforcement boundary
   ├─ Constraints, checks, unique keys ← data validation  [SRS §64]
   ├─ Triggers → audit_logs            ← audit trail      [SRS §61]
   ├─ Views / materialised views       ← dashboards, indicators
   └─ pg_cron                          ← notifications, scheduled rollups
        │
        ▼
 Object storage (photos, documents, certificates)   [SRS §31, §52]
```

## 5.2 Request lifecycle for a permission-sensitive read

1. Request arrives with session cookie; middleware resolves the Supabase session.
2. `getSessionContext()` loads `user_id`, `role_ids`, `scoped_project_ids`, `department_id`. This
   is cached per-request, never per-user-globally.
3. The guard layer checks the route's declared capability, e.g. `attendance:read`. Failure →
   403 before any query runs.
4. The query executes under the user's Postgres role/JWT claims, so RLS applies a second,
   independent filter.
5. Results render in a Server Component. Sensitive columns (health notes, guardian phone,
   salary-adjacent HR fields) are stripped by a column allow-list unless the capability permits.

**Defence in depth:** a bug in step 3 is caught by step 4. A misconfigured policy in step 4 is
caught by step 3. Neither alone is trusted.

## 5.3 Mutation lifecycle

1. Client form validated by Zod (instant feedback).
2. Server Action re-validates with the **same** Zod schema — client validation is never trusted.
3. Business-rule checks run: budget ceiling, attendance-vs-enrolment, stock non-negativity,
   duplicate ID `[SRS §64]`.
4. The write and its `audit_logs` row happen inside **one transaction**. If the audit write fails,
   the change rolls back.
5. Affected caches revalidated by tag (`revalidateTag('beneficiary:' + id)`).

## 5.4 Performance design

| Concern | Approach |
|---|---|
| Large lists (thousands of beneficiaries) | Server-side pagination, keyset where ordered by ID; never `SELECT *` |
| Dashboard aggregates | Materialised views refreshed on schedule + on-demand after month close |
| Attendance entry on mobile | Optimistic UI, batched submit of a whole class/session in one request |
| Photos | Stored at original + generated thumbnail; lists load thumbnails only |
| Report generation | Streamed; long reports queued and downloaded, not held in a request |
| Search | Postgres `tsvector` GIN index + trigram index on names/IDs |

## 5.5 Mobile-first rules `[SRS §58]`

The following screens are designed **mobile-first** and must be fully usable one-handed on a
mid-range Android phone on a 3G connection:

- Record attendance (class, activity session, training batch)
- Add activity session / field data entry
- Photo upload with caption + consent flag
- Approve / reject a pending item
- Dashboard summary cards

Everything else is responsive but may be optimised for tablet and desktop. Targets: interactive
in under 3 seconds on 3G for the five screens above; touch targets ≥ 44 px; forms in single
column below 768 px; tables collapse to stacked cards below 640 px.

---

# 6. API and Integration Design

## 6.1 Principles

- Every capability the UI uses is available as a versioned JSON endpoint under `/api/v1/*`. The
  UI is simply the first consumer. This is what makes the future mobile app `[SRS §59]`, future
  AI features `[SRS §73]`, and future integrations with email/Workspace/M365/WhatsApp/SMS/cloud
  storage/accounting/HR systems `[SRS §74]` possible without redesign.
- Auth on the API: session cookie for the web app; **scoped API keys** (hashed, revocable,
  per-integration, with capability + project scope) for machine consumers.
- Errors use a single envelope: `{ error: { code, message, field?, details? } }`.
- All list endpoints accept the same filter grammar (§45.2) so reports, exports, and the future
  mobile app share one mental model.

## 6.2 AI-readiness `[SRS §73]`

Future AI features (monthly report drafting, case-story drafting, email drafting, photo captions,
natural-language data questions) are **not** built in Phase 1–5, but the architecture accommodates
them:

- A read-only `ai_query` database role with access to reporting **views only** — never base tables.
- All AI-generated content is written to a staging table with `status = 'ai_draft'` and requires
  explicit human approval before it becomes a report, story, or email. This satisfies the rule
  that AI must not modify critical data without human approval `[SRS §73]`.
- Every AI action is audited with the prompt, model, and approver.

## 6.3 Webhooks / outbound (future)

Reserve `integration_endpoints` and `integration_events` tables from day one so that notification
channels (email, SMS, WhatsApp) `[SRS §57]` can be attached later without schema surgery. Phase 1
implements in-system notifications only, exactly as the SRS allows.

---

# 7. Environments, DevOps and CI/CD

| Environment | Purpose | Data | Who accesses |
|---|---|---|---|
| Local | Development | Seeded fake data | Developer |
| Staging / UAT | HOPE testing | Anonymised or synthetic | HOPE UAT team |
| Production | Live | Real | All authorised users |

**Rules**

- Production and staging schemas change **only** via migration files merged to `main`.
- No real beneficiary data in staging. If a production snapshot is needed for debugging, it is
  anonymised first (names, phones, guardian details, photos scrubbed) — mandated by the privacy
  requirement around children and health data `[SRS §63]`.
- Secrets live in environment variables, never in the repository. A committed key is treated as
  compromised and rotated.

**CI pipeline (GitHub Actions, free tier)**

1. Typecheck (`tsc --noEmit`) → 2. Lint → 3. Unit tests (Vitest) → 4. Migration dry-run against a
throwaway Postgres → 5. RLS policy tests (pgTAP) → 6. Build → 7. Playwright E2E on preview →
8. Deploy preview. `main` deploys to staging; a tagged release deploys to production after
manual approval.

**Release discipline:** semantic version tags, a `CHANGELOG.md`, and a one-page release note per
deployment for HOPE — which feeds directly into the change-request process `[SRS §95]`.

---

# 8. Data Model — Conventions

These conventions apply to every table without exception.

| Convention | Rule |
|---|---|
| Primary key | `id uuid default gen_random_uuid()` |
| Human-readable key | Separate `code` column (e.g. `HOPE-MIR-2026-0001`), unique, indexed |
| Timestamps | `created_at`, `updated_at` (trigger-maintained), both `timestamptz` |
| Provenance | `created_by`, `updated_by` → `users.id` `[SRS §61]` |
| Soft delete | `deleted_at timestamptz null`; all app queries filter it; hard delete forbidden on financial/admin/beneficiary records `[SRS §61]` |
| Scope columns | `project_id`, `location_id` on every operational table — this is what makes one central database work `[SRS §99]` |
| Lookups | Foreign keys to master tables, **never** free-text enums in application code `[SRS §8]` |
| Status columns | Constrained to values held in a `statuses` master table per domain |
| Money | `numeric(14,2)`, currency code column defaulting to `BDT` `[SRS §82]` |
| Dates | `date` for calendar facts; `timestamptz` for events; app timezone `Asia/Dhaka` |
| Text search | `search_vector tsvector` generated column on people tables |
| Attachments | Polymorphic `documents` table keyed by `(entity_type, entity_id)` `[SRS §52]` |

**Naming:** `snake_case`, plural table names, `*_id` for FKs, junction tables named
`parent_child` (e.g. `batch_trainees`).

---

# 9. Entity Catalogue

This is the ER model in tabular form, grouped as the SRS groups it `[SRS §68]`. Columns listed
are the significant ones; every table also carries the conventions from §8.

## 9.1 Organization

| Table | Key columns | Notes |
|---|---|---|
| `organizations` | name, logo, address, contact | Single row initially; kept for future multi-org |
| `departments` | name, code | Program, HR, Administration, Accounts & Finance `[SRS §5]` |
| `projects` | code, name, donor_id, coordinator_id, start_date, end_date, target_beneficiaries, budget_total, status | `[SRS §28]` |
| `locations` | name, project_id, address, district, upazila | Configurable `[SRS §5]` |
| `programs` | name, program_area (education / co-curricular / school-health / vocational) | `[SRS §5]` |
| `donors` | name, contact, reporting_period, template_id | `[SRS §35]` |
| `project_programs` | project_id, program_id | Which programmes run in which project |

## 9.2 People

| Table | Key columns | Notes |
|---|---|---|
| `beneficiaries` | code, name, name_bn, gender, dob, age (generated), address, project_id, location_id, education_level, enrollment_date, status, photo_path, consent_status, remarks | **Anchor entity** `[SRS §9]` |
| `guardians` | beneficiary_id, name, relation, occupation, phone, nid_masked | Separate table avoids duplication `[SRS §9]` |
| `students` | beneficiary_id, code, level (primary/secondary), school_id, class_id, section, academic_year_id, admission_date, previous_school, status, dropout_reason_id | Role of a beneficiary `[SRS §11, §12]` |
| `trainees` | beneficiary_id (nullable), code, course_id, batch_id, enrollment_date, previous_occupation, education, status, employment_status | `[SRS §21]` |
| `employees` | code, name, designation_id, department_id, project_id, joining_date, contract_type, contract_end, contact, emergency_contact, qualification, experience, status | `[SRS §37]` |
| `trainers` | employee_id (nullable), code, name, expertise, qualification, experience_years, contract_status, contact | May be staff or contracted `[SRS §22]` |
| `schools` | name, type, address, project_id | Referenced by students `[SRS §11, §12]` |

## 9.3 Program & delivery

| Table | Key columns | Notes |
|---|---|---|
| `academic_years` | name, start_date, end_date, is_current | `[SRS §13]` |
| `classes` | name, level, order_no | Class 1–5, 6–10, configurable `[SRS §12]` |
| `subjects` | name, class_id, full_marks, pass_marks | |
| `class_subject_teachers` | class_id, subject_id, employee_id, academic_year_id | Teaching assignment |
| `activities` | name, activity_type_id, program_id, description, active | Karate, Swimming, Football, Cricket, KAB, Scout, Drawing, Singing, Dancing, Guitar, Tabla `[SRS §14]` |
| `activity_sessions` | activity_id, project_id, location_id, session_date, start_time, end_time, instructor_id, participant_group, description, outcome, remarks | `[SRS §15]` |
| `activity_enrollments` | activity_id, beneficiary_id, enrolled_on, status | Who belongs to an activity |
| `courses` | code, name, category_id, duration_days, total_hours, curriculum, objectives, min_attendance_pct, assessment_method, certificate_required, active | `[SRS §19]` |
| `batches` | code, course_id, project_id, location_id, start_date, end_date, trainer_id, capacity, schedule, status | `[SRS §20]` |
| `batch_trainees` | batch_id, trainee_id, enrolled_on, status | |
| `training_sessions` | batch_id, session_date, topic, trainer_id, hours | Basis of training attendance |
| `enrollments` | beneficiary_id, enrollable_type, enrollable_id, start_date, end_date, status | Unified participation ledger |
| `attendance` | attendable_type (class / activity_session / training_session), attendable_id, person_type, person_id, date, status (present/absent/late/excused), recorded_by, remarks | One engine, all domains §42 |
| `assessments` | assessable_type, assessable_id, person_id, assessment_type_id, component scores, total, grade, gpa, remarks, assessed_by | `[SRS §25]` |
| `assessment_components` | course_id / subject_id, name, weight | Written 30 / Practical 50 / Attendance 20 `[SRS §25]` |
| `exams` | academic_year_id, class_id, name, start_date, end_date | |
| `results` | exam_id, student_id, subject_id, marks, grade, promotion_status | `[SRS §11, §12]` |
| `certificates` | code, trainee_id, batch_id, course_id, issue_date, completion_date, result, issuing_authority, qr_token, revoked_at | `[SRS §26]` |
| `followups` | trainee_id, followup_period (3/6/12), followup_date, outcome_status, employer, occupation, business_type, employment_start, income_range_id, remarks | `[SRS §27]` |
| `health_activities` | type, project_id, location_id, activity_date, conducted_by, description | `[SRS §17]` |
| `health_records` | health_activity_id, beneficiary_id, height, weight, vision, observation, referral, followup_date | **Restricted access** `[SRS §17, §63]` |

## 9.4 Project monitoring

| Table | Key columns | Notes |
|---|---|---|
| `project_activities` | code, project_id, program_id, name, activity_date, location_id, target, achievement, participants, responsible_id, cost, output, outcome, remarks | `[SRS §29]` |
| `indicators` | project_id, program_id, name, unit, definition, baseline, calculation_rule | `[SRS §30]` |
| `indicator_targets` | indicator_id, period (month/quarter/year), target_value | |
| `indicator_achievements` | indicator_id, period, achieved_value, source (auto/manual), computed_at | Auto-computed where possible |
| `photos` | file_path, thumb_path, project_id, activity_id, program_id, beneficiary_id, taken_on, location_id, caption, consent_status, uploaded_by | `[SRS §31]` |
| `stories` | title, beneficiary_id, project_id, program_id, story_date, background, intervention, change_outcome, quote, photo_id, consent_status, author_id, status | Draft→Review→Approved→Published `[SRS §32]` |
| `reports` | type, period_start, period_end, project_id, template_id, status, generated_at, submitted_by, approved_by, payload jsonb | `[SRS §33, §71]` |
| `report_templates` | name, type, donor_id, sections jsonb, editable | Editable without redeploy `[SRS §34, §35]` |

## 9.5 HR

| Table | Key columns |
|---|---|
| `employee_attendance` | employee_id, date, status, in_time, out_time, remarks `[SRS §38]` |
| `leave_types` | name, annual_quota, carry_forward, paid `[SRS §39]` |
| `leave_applications` | employee_id, leave_type_id, from_date, to_date, days, reason, status, recommended_by, approved_by |
| `leave_balances` | employee_id, leave_type_id, year, entitled, taken, balance |
| `appraisals` | employee_id, period_start, period_end, objectives, achievement, strengths, development_areas, supervisor_comments, rating, development_plan, status `[SRS §40]` |
| `employee_documents` | employee_id, document_id, type, expiry_date |
| `designations` | name, grade |

## 9.6 Administration

| Table | Key columns |
|---|---|
| `vendors` | code, name, business_name, contact, address, category_id, tax_info, bank_info, active `[SRS §43]` |
| `purchase_requests` | code, project_id, requested_by, request_date, purpose, status `[SRS §42]` |
| `purchase_request_items` | request_id, item_name, category_id, quantity, unit, estimated_cost |
| `quotations` | request_id, vendor_id, quote_date, total, document_id |
| `comparative_statements` | request_id, prepared_by, recommended_vendor_id, justification, approved_by |
| `purchase_orders` | code, request_id, vendor_id, po_date, total, delivery_date, status |
| `goods_receipts` | po_id, received_date, received_by, remarks |
| `bills` | po_id, bill_no, bill_date, amount, document_id, status |
| `inventory_items` | code, name, category_id, unit, reorder_level `[SRS §44]` |
| `inventory_transactions` | item_id, project_id, location_id, txn_type (opening/purchase/transfer/issue/consumption/return/adjustment), quantity, txn_date, reference, remarks |
| `inventory_balances` | item_id, location_id, period, opening, received, issued, adjustment, closing (view or materialised) |
| `assets` | code, name, category_id, serial_no, purchase_date, purchase_value, project_id, location_id, assigned_to, condition, warranty_until, disposal_status `[SRS §45]` |
| `asset_transfers` | asset_id, from_location, to_location, from_person, to_person, request_date, status, approved_by `[SRS §46]` |
| `asset_maintenance` | asset_id, maintenance_date, type, cost, vendor_id, next_due |
| `asset_disposals` | asset_id, identified_by, reason, approval_status, disposal_date, method, proceeds `[SRS §47]` |
| `admin_requests` | type, requested_by, description, status | Generic administrative request `[SRS §41]` |

## 9.7 Finance

| Table | Key columns |
|---|---|
| `fiscal_years` | name, start_date, end_date, is_current |
| `budget_heads` | code, name, parent_id, category `[SRS §49]` |
| `budgets` | project_id, program_id, activity_id, budget_head_id, fiscal_year_id, approved_amount, revised_amount `[SRS §49]` |
| `expenses` | voucher_no, expense_date, project_id, program_id, activity_id, budget_head_id, description, amount, payment_method, document_id, prepared_by, approved_by, status `[SRS §50]` |
| `vouchers` | code, type (debit/credit/journal), date, total, narration, status |
| `payments` | expense_id, payment_date, method, bank_account_id, cheque_no, amount, status |
| `advances` | employee_id, project_id, amount, purpose, issue_date, adjusted_amount, status |
| `advance_adjustments` | advance_id, expense_id, amount, date |
| `incomes` | source, donor_id, project_id, receipt_date, amount, reference |
| `bank_accounts` | name, bank, branch, account_no_masked, project_id |

## 9.8 Security and system

| Table | Key columns |
|---|---|
| `users` | auth_user_id, employee_id, email, name, status, last_login_at `[SRS §6]` |
| `roles` | code, name, description |
| `permissions` | code (`module:action`), module, description |
| `role_permissions` | role_id, permission_id |
| `user_roles` | user_id, role_id |
| `user_project_scopes` | user_id, project_id, location_id (nullable) | Drives RLS §13 |
| `audit_logs` | entity_type, entity_id, action, actor_id, at, old_values jsonb, new_values jsonb, ip, user_agent `[SRS §61]` |
| `notifications` | user_id, type, title, body, entity_ref, read_at, created_at `[SRS §57]` |
| `settings` | key, value jsonb, scope | Date format, currency, thresholds `[SRS §80, §82]` |
| `approval_levels` | entity_type, level_no, role_id, threshold_amount `[SRS §51, §80]` |
| `documents` | entity_type, entity_id, file_path, name, category_id, version, owner_id, access_level, uploaded_at `[SRS §52]` |
| `import_jobs` | file_name, template, status, total_rows, ok_rows, error_rows, report_path `[SRS §65]` |
| `master_*` lookups | `dropout_reasons`, `income_ranges`, `asset_categories`, `inventory_categories`, `expense_categories`, `activity_types`, `course_categories`, `assessment_types`, `document_categories`, `statuses` `[SRS §8]` |

---

# 10. Key Relationships, ID Schemes and Integrity Rules

## 10.1 Identifier formats `[SRS §9, §20]`

| Entity | Format | Example |
|---|---|---|
| Beneficiary | `HOPE-{LOC}-{YYYY}-{NNNN}` | `HOPE-MIR-2026-0001` |
| Student | `STU-{LOC}-{YYYY}-{NNNN}` | `STU-MIR-2026-0042` |
| Trainee | `TRN-{LOC}-{YYYY}-{NNNN}` | `TRN-MIR-2026-0117` |
| Batch | `{COURSE}-{LOC}-{YYYY}-{NN}` | `JUTE-MIR-2026-01` |
| Employee | `EMP-{YYYY}-{NNN}` | `EMP-2026-014` |
| Certificate | `CERT-{COURSE}-{YYYY}-{NNNN}` | `CERT-JUTE-2026-0009` |
| Voucher | `V-{FY}-{NNNNN}` | `V-2026-00231` |
| Purchase request | `PR-{YYYY}-{NNNN}` | `PR-2026-0056` |
| Asset | `AST-{CATEGORY}-{NNNN}` | `AST-SEW-0031` |
| Project activity | `PA-{PROJECT}-{YYYY}-{NNNN}` | `PA-JAM-2026-0087` |

Implementation: a `sequences` table with `(scope_key, next_value)` updated inside the same
transaction as the insert, under `SELECT ... FOR UPDATE`. This guarantees uniqueness under
concurrency — a plain `MAX(code)+1` will collide when two coordinators enrol simultaneously.
Uniqueness of beneficiary IDs is acceptance criterion #3 `[SRS §87]`, so it gets a unique index
**and** a concurrency test.

## 10.2 The non-duplication rule, enforced

Before a new beneficiary is saved, the system runs a **duplicate candidate check** and shows
matches for confirmation `[SRS §9, §65]`:

- Exact: same name + same DOB + same guardian phone → block, offer to open the existing record.
- Strong: trigram similarity on name ≥ 0.6 **and** same DOB → warn, require an explicit
  "This is a different person" confirmation which is logged.
- Weak: same guardian phone, different name → informational notice.

The same routine runs during Excel import (§59), producing a duplicates worksheet rather than
silently creating twins.

## 10.3 Referential and business integrity `[SRS §64]`

| Rule | Enforcement |
|---|---|
| No duplicate beneficiary / employee / course IDs | Unique index + pre-save check |
| No attendance for a non-enrolled person | Trigger validating an active enrolment covering the date |
| No invalid dates (DOB in future, end before start) | Check constraints |
| Phone number format (BD: `01[3-9]XXXXXXXX`) | Zod + check constraint |
| No negative stock without authorisation | Trigger on `inventory_transactions`; override requires `inventory:override` capability and writes a reason |
| No expense above approved budget without approval | Trigger comparing cumulative expense to `budgets.approved_amount`; over-limit forces status `pending_special_approval` |
| Marks within 0–full marks | Check constraint against `subjects.full_marks` |
| Certificate only when attendance ≥ course minimum and assessment passed | Trigger + application guard |
| A user cannot approve their own transaction | Trigger comparing `prepared_by` and `approved_by` unless the user holds `approval:self_approve` `[SRS §51]` |
| Academic-year immutability | Once an academic year is closed, its results become read-only `[SRS §13]` |

---

# 11. User Roles

Nine roles, exactly as the SRS defines them `[SRS §6]`. Roles are data, not code — the Super
Administrator can create additional roles and compose them from the permission catalogue.

| # | Role | Scope | Core responsibility |
|---|---|---|---|
| 1 | Super Administrator | Organisation-wide | Users, roles, master data, configuration, audit logs |
| 2 | Management | Organisation-wide, mostly read | Dashboards, performance, budget utilisation, KPIs |
| 3 | Program Manager | All projects (or assigned set) | Beneficiaries, education, activities, vocational, attendance, assessment, programme reports |
| 4 | Project Coordinator | **Assigned project/location only** | Beneficiaries, students, trainees, attendance, activities, results, photos, project reports |
| 5 | Teacher / Trainer / Instructor | **Assigned classes/batches only** | Attendance, assessment, remarks, schedule, activity submission |
| 6 | HR User | Organisation-wide HR data | Employees, HR attendance, leave, contracts, training, appraisal |
| 7 | Admin User | Organisation-wide admin data | Procurement, assets, inventory, vendors, documents, admin requests |
| 8 | Accounts User | Organisation-wide finance data | Budget, income, expense, payment, voucher, advance, financial reports |
| 9 | Data Entry User | Assigned project | Enter/update authorised programme data only |

**Hard limits on Data Entry User** `[SRS §6.9]`: cannot delete critical records, cannot approve
transactions, cannot change financial records, cannot manage users. These are enforced by the
absence of the corresponding capabilities — not by hiding buttons.

**Management read-only posture** `[SRS §6.2]`: Management sees everything at summary level with
drill-down, and holds no write capability on operational data. This is deliberate and should be
confirmed at the validation workshop.

---

# 12. Permission Matrix

Capabilities are named `module:action`, where action ∈ {`read`, `create`, `update`, `delete`,
`approve`, `export`, `configure`}. The matrix below is the **default seed**; the Super
Administrator can adjust it at runtime `[SRS §6.1]`.

Legend — **R** read · **C** create · **U** update · **D** delete (soft) · **A** approve ·
**X** export · **F** configure · **—** no access · **S** scoped to assignment

| Module | Super Admin | Mgmt | Prog Mgr | Proj Coord | Teacher/Trainer | HR | Admin | Accounts | Data Entry |
|---|---|---|---|---|---|---|---|---|---|
| Dashboard | R | R | R | R S | R S | R | R | R | R S |
| Organization / Projects | RCUDF | R | R | R S | — | R | R | R | — |
| Master data | RCUDF | R | R | — | — | — | — | — | — |
| Beneficiaries | RCUDX | R | RCUX | RCU S | R S | — | — | — | RCU S |
| Beneficiary 360° | R | R | R | R S | R S | — | — | — | R S |
| Students / Education | RCUDX | R | RCUX | RCU S | R S | — | — | — | RCU S |
| Academic year | RCUDF | R | R | — | — | — | — | — | — |
| Co-curricular activities | RCUDX | R | RCUX | RCU S | RCU S | — | — | — | RCU S |
| School health | RCUDX | R agg | R | R S | — | — | — | — | — |
| Vocational courses | RCUDF | R | RCU | R S | R S | — | — | — | — |
| Batches / Trainees | RCUDX | R | RCUX | RCU S | R S | — | — | — | RCU S |
| Trainers | RCUD | R | RCU | R S | — | R | — | — | — |
| Training schedule | RCUD | R | RCU | RCU S | R S | — | — | — | — |
| Attendance | RCUDX | R | RCUX | RCU S | RCU S | — | — | — | RCU S |
| Assessment / Results | RCUDX | R | RCUX | RCU S | RCU S | — | — | — | R S |
| Certificates | RCUDA X | R | RCA | R S | — | — | — | — | — |
| Employment follow-up | RCUDX | R | RCUX | RCU S | — | — | — | — | RCU S |
| Project activities | RCUDX | R | RCUX | RCU S | C S | — | — | — | RCU S |
| Indicators / targets | RCUDF | R | RCU | R S | — | — | — | — | — |
| Photos | RCUDX | R | RCUX | RCU S | C S | — | — | — | RCU S |
| Stories | RCUDA | R | RCUA | RCU S | — | — | — | — | RC S |
| Reports (programme) | RCUAX | RX | RCUAX | RC S X | — | — | — | — | — |
| Donor / regulatory reports | RCUAFX | RX | RCUX | — | — | — | — | R | — |
| HR — employees | RCUDX | R agg | — | — | — | RCUDX | — | — | — |
| HR — leave | RCUDA | R agg | A own team | A own team | — | RCUDA | — | — | — |
| HR — appraisal | RCUD | R agg | RCU own team | — | — | RCUDX | — | — | — |
| Procurement | RCUDA X | R | C | C S | — | — | RCUDA X | R | — |
| Vendors | RCUDX | R | — | — | — | — | RCUDX | R | — |
| Inventory | RCUDX | R | R | R S | R S | — | RCUDX | R | C S |
| Assets | RCUDA X | R | R | R S | — | — | RCUDA X | R | — |
| Budgets | RCUDF | R | R | R S | — | — | — | RCUDX | — |
| Expenses / vouchers | RCUDA X | R | C | C S | — | — | C | RCUDA X | — |
| Payments / advances | RCUDA | R | — | — | — | — | — | RCUDA X | — |
| Documents | RCUDX | R | RCU | RCU S | R S | RCU | RCUD | RCU | C S |
| Users / roles | RCUDF | — | — | — | — | — | — | — | — |
| Audit logs | R | R | — | — | — | — | — | — | — |
| System configuration | RCUDF | — | — | — | — | — | — | — | — |
| Global search | R | R | R | R S | R S | R S | R S | R S | R S |

**"R agg"** means aggregate/summary visibility only — no individual records. Management sees HR
headcount and leave summaries, not individual employee files; and sees school-health
participation counts, not individual health observations `[SRS §17, §63]`.

**Export is a separate capability** `[SRS §66]`. A user who can read a list does not automatically
get to export it.

---

# 13. Authorization Enforcement: RLS and Scope

## 13.1 The scope model

Three orthogonal dimensions decide access:

```
ACCESS = CAPABILITY (what action)  ×  SCOPE (which projects/locations)  ×  SENSITIVITY (which columns)
```

- **Capability** comes from `role_permissions` (§12).
- **Scope** comes from `user_project_scopes`. An empty scope set on an organisation-wide role
  (Super Admin, Management, HR, Admin, Accounts) means "all projects". A non-empty set restricts.
  Teachers/Trainers get a finer scope through `class_subject_teachers` and `batches.trainer_id`.
- **Sensitivity** is a per-column classification: `normal`, `restricted` (guardian contact, exact
  address, photos of minors), `confidential` (health records, vendor bank details, HR documents).

## 13.2 How the claims reach Postgres

On login, the session JWT carries `user_id`, `role_codes[]`, `project_ids[]`, and
`is_org_wide boolean`. Helper SQL functions read them:

```sql
create function auth_project_ids() returns uuid[] language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true)::jsonb -> 'project_ids', 'null'),
    '[]'::jsonb
  )::text::uuid[];
$$;

create function auth_has(cap text) returns boolean language sql stable as $$
  select current_setting('request.jwt.claims', true)::jsonb -> 'caps' ? cap;
$$;

create function auth_is_org_wide() returns boolean language sql stable as $$
  select coalesce((current_setting('request.jwt.claims', true)::jsonb ->> 'org_wide')::boolean, false);
$$;
```

## 13.3 Canonical policy pattern

Every scoped operational table gets the same four policies:

```sql
alter table beneficiaries enable row level security;

create policy beneficiaries_select on beneficiaries for select
  using (
    deleted_at is null
    and auth_has('beneficiaries:read')
    and (auth_is_org_wide() or project_id = any(auth_project_ids()))
  );

create policy beneficiaries_insert on beneficiaries for insert
  with check (
    auth_has('beneficiaries:create')
    and (auth_is_org_wide() or project_id = any(auth_project_ids()))
  );

create policy beneficiaries_update on beneficiaries for update
  using (
    auth_has('beneficiaries:update')
    and (auth_is_org_wide() or project_id = any(auth_project_ids()))
  );

-- No delete policy at all: deletion is a soft-delete UPDATE, gated separately.
```

Health records get a stricter variant requiring `health:read_detail`, so a Project Coordinator can
see that a screening happened without seeing the observation `[SRS §17, §63]`.

## 13.4 Teacher/trainer narrow scope

```sql
create policy attendance_teacher_scope on attendance for all
  using (
    auth_has('attendance:update')
    and (
      auth_is_org_wide()
      or (attendable_type = 'class' and attendable_id in (
            select class_id from class_subject_teachers
            where employee_id = auth_employee_id()
              and academic_year_id = current_academic_year()))
      or (attendable_type = 'training_session' and attendable_id in (
            select ts.id from training_sessions ts
            join batches b on b.id = ts.batch_id
            where b.trainer_id = auth_trainer_id()))
    )
  );
```

## 13.5 Testing the policies

RLS is the single highest-risk area in this build. It gets its own test suite (pgTAP), run in CI,
covering at minimum:

1. Project Coordinator A cannot read, update, or export beneficiaries of Project B.
2. Teacher cannot record attendance for a class they are not assigned to.
3. Data Entry User cannot update any `expenses` row (no capability at all).
4. A user without `health:read_detail` selecting `health_records` gets zero rows, not an error
   containing data.
5. Management holds no write capability anywhere on operational tables.
6. A soft-deleted row is invisible to every role except audit review.
7. Nobody can approve a record where `prepared_by = self` without `approval:self_approve`.
8. Export endpoints reject users lacking `*:export` even when they can read.

This directly satisfies the security-testing requirement `[SRS §88]` and acceptance criterion #2
`[SRS §87]`.

# PART E — FUNCTIONAL SPECIFICATION

Each module below follows the same structure: **Purpose → Screens → Fields → States → Rules →
Outputs → Done-when.** "Done-when" is the checklist used at phase exit and during UAT.

---

# 14. Organization, Departments, Projects and Locations

**Purpose** `[SRS §5, §28]` — establish the structural skeleton every other record hangs from,
and make it editable by HOPE without code changes.

**Screens:** Organization profile · Department list · Project list · Project detail · Location
list · Donor list.

**Project fields** `[SRS §28]`: project ID (auto), name, location(s), project coordinator,
start date, end date, donor, target beneficiaries, programmes included, total budget, status
(planned / active / on-hold / closed).

**Rules**

- Projects and locations can be added, edited, or **deactivated** — never hard-deleted, because
  historical records reference them `[SRS §5]`.
- Deactivating a project hides it from new-entry dropdowns but keeps all history visible in
  reports.
- A project must have at least one location before beneficiaries can be enrolled against it.
- Assigning a Project Coordinator automatically creates their `user_project_scopes` row.

**Done-when:** an administrator creates a new project and location, assigns a coordinator, and
that coordinator sees only the new project on next login — with no deployment.

---

# 15. Master Data Management

**Purpose** `[SRS §8]` — everything the SRS lists as master data is a table with a CRUD screen,
so that new activities and courses never require redevelopment `[SRS §84]`.

**Managed lists:** projects · locations · departments · programmes · activities · activity types ·
courses · course categories · classes · subjects · training batches · staff designations · budget
heads · expense categories · asset categories · inventory categories · vendors · academic years ·
fiscal years · dropout reasons · income ranges · assessment types · document categories · leave
types · statuses · approval levels.

**Common behaviour for every master list**

| Feature | Behaviour |
|---|---|
| Add / edit | Modal form, Zod-validated, audited |
| Deactivate | `active = false`; disappears from pickers, stays in history |
| Reorder | `order_no` controls display order (e.g. Class 1 … Class 10) |
| Usage count | Shows how many records reference it before deactivation |
| Import | CSV import for bulk seeding |
| Protection | Cannot deactivate an item currently referenced by an open record |

**Done-when:** a Super Admin adds a new co-curricular activity ("Chess") and a new vocational
course, and both appear in enrolment, session, and reporting screens immediately.

---

# 16. Beneficiary Management

**Purpose** `[SRS §9]` — the central module. Every human HOPE serves has exactly one record here.

**Screens:** Beneficiary list (filter: project, location, gender, age band, status, programme) ·
Add/Edit beneficiary · Duplicate-check dialog · Beneficiary 360° (§17) · Bulk import (§59).

**Fields** `[SRS §9]`

| Group | Fields |
|---|---|
| Identity | Beneficiary ID (auto), name, name in Bangla, gender, date of birth, age (computed) |
| Location | Address, district, upazila, project, location |
| Guardian | Guardian name, relation, occupation, contact number (repeatable) |
| Contact | Own phone (if any), alternate contact |
| Programme | Education level, enrolment date, current status |
| Media | Photo, consent for photo use |
| Other | Remarks, referral source, disability indicator (optional, restricted) |

**Status values:** active · inactive · completed · transferred · dropped out · deceased · other.

**Rules**

- Beneficiary ID uniqueness is a hard index plus a concurrency-safe sequence (§10.1) —
  acceptance criterion #3 `[SRS §87]`.
- Duplicate detection runs before save (§10.2).
- Personal information is stored **once**; students, trainees, and activity participants reference
  it and never copy it `[SRS §9]`.
- Age is derived from DOB, never stored as a typed number that goes stale.
- Guardian contact numbers are classified `restricted` — masked for roles lacking
  `beneficiaries:read_contact`.
- Changing project/location writes a transfer record, preserving history.

**Done-when:** the same child can be enrolled in Primary Education, Football, Karate, Drawing, and
a School Health screening with one beneficiary record and zero re-typing `[SRS §3]`.

---

# 17. Beneficiary 360° Profile

**Purpose** `[SRS §10]` — one screen showing a beneficiary's complete history with HOPE.

**Layout:** header card (photo, ID, name, age, gender, project, location, status) + tabbed panels:

| Tab | Contents | Source |
|---|---|---|
| Basic | Demographics, guardian, contact, consent | `beneficiaries`, `guardians` |
| Education | Enrolments, class, school, academic years, promotion history | `students`, `results` |
| Co-curricular | Activities joined, sessions attended, instructor remarks | `activity_enrollments`, `attendance` |
| Vocational | Courses, batches, dates, status | `trainees`, `batch_trainees` |
| Attendance | Cross-programme attendance %, monthly trend | attendance engine §42 |
| Assessment | Exam results, training assessments, grades | `assessments`, `results` |
| Certificates | Issued certificates with download/verify link | `certificates` |
| Health | Screenings and observations — **restricted** | `health_records` |
| Follow-up | Employment outcomes at 3/6/12 months | `followups` |
| Media | Photos and stories, consent-filtered | `photos`, `stories` |
| Timeline | Chronological feed of every event | union view |
| Audit | Who changed this record and when (admin only) | `audit_logs` |

**Rules**

- Tabs the user lacks capability for are not rendered at all.
- The Health tab shows "N screenings recorded" without detail unless
  `health:read_detail` is held `[SRS §63]`.
- The timeline is the demo centrepiece: it is the visible proof that the anchor model works.

**Done-when:** opening one beneficiary shows education, co-curricular, vocational, attendance,
assessment, certificate, health, follow-up, and media in a single screen `[SRS §10]`.

---

# 18. Primary Education Module

**Purpose** `[SRS §11]` — manage primary students, their academics, and their status.

**Screens:** Student list · Student profile · Class roster · Enrolment form · Marks entry ·
Promotion screen · Dropout register.

**Student fields:** Student ID, Beneficiary ID (link), name, gender, DOB, guardian, address,
school, class, section, academic year, admission date, previous school, current status.

**Academic fields:** subjects, teacher, examination, marks, grade, remarks, promotion status.

**Status values** `[SRS §11]`: active · completed · transferred · dropped out · graduated · other.
Dropout requires a reason selected from the `dropout_reasons` master list.

**Rules**

- A student record **must** link to a beneficiary. Creating a student for a person not yet in the
  system opens the beneficiary form first.
- A student belongs to exactly one class per academic year.
- Marks cannot exceed the subject's full marks.
- Promotion is a batch operation on a class roster, and produces a new student-year record rather
  than overwriting the previous one — history is preserved `[SRS §13]`.

**Outputs:** Student Enrolment Report, Student Attendance Report, Class Result Sheet, Dropout
Analysis, Gender/Age Demographics.

**Done-when:** a class of students can be enrolled, taught, marked, promoted, and the previous
year's results remain readable.

---

# 19. Academic Year Management

**Purpose** `[SRS §13]` — bind students, classes, subjects, teachers, attendance, exams, and
results to a year, and keep history accessible forever.

**Screens:** Academic year list · Create year · Roll-forward wizard · Close year.

**Roll-forward wizard** — the single most labour-saving screen in the education module:

1. Select source year and target year.
2. Choose classes to promote; the system proposes promotions from the previous result set.
3. Mark repeaters, transfers, dropouts, graduates.
4. Carry forward class-subject-teacher assignments (editable).
5. Preview → confirm → create all new-year student records in one transaction.

**Rules**

- Exactly one academic year is `is_current` at a time; new records default to it.
- Closing a year makes its results, attendance, and promotions read-only. Reopening requires
  Super Admin and is audited.
- All education reports take academic year as a filter, defaulting to current.

**Done-when:** Academic Year 2027 is created, students roll forward, and 2026 results remain
viewable and exportable but not editable.

---

# 20. Secondary Education Module

**Purpose** `[SRS §12]` — support secondary students, typically Classes 6–10, with configurable
class definitions.

**Adds over primary:** GPA calculation alongside grade, school continuation tracking, public-exam
registration fields, subject groups (science/humanities/business) where applicable.

**Fields:** student profile, school, class, subjects, attendance, exam, marks, grade/GPA,
promotion, school continuation status, dropout, academic remarks `[SRS §12]`.

**Rules**

- Grade and GPA rules are **configuration**, not code: a `grading_scales` master defines
  mark-range → grade → grade-point, so a change in national policy is a settings edit.
- School continuation is tracked term by term so that "still in school" is a reportable indicator
  rather than an assumption.

**Done-when:** HOPE can add "Class 11" through configuration with no code change `[SRS §12]`.

---

# 21. Co-Curricular Activity and Session Management

**Purpose** `[SRS §14, §15, §16]` — one framework covering Sports (Karate, Swimming, Football,
Cricket), Leadership (KAB, Scout), Arts/Culture (Drawing, Singing, Dancing), and Music (Guitar,
Tabla), extensible to future activities.

> **Open item for the validation workshop:** the SRS lists this activity as "CAB" in §1 and "KAB"
> in §14 and §100. Confirm the correct name before seeding master data (Appendix H).

**Screens:** Activity list · Activity detail · Enrolment (add participants from beneficiaries) ·
Session list · Record session (mobile-first) · Activity attendance report.

**Session fields** `[SRS §15]`: activity, project, location, date, time, instructor, participant
group, number of participants, attendance, activity description, outcome, photo, remarks.

**Attendance behaviour** `[SRS §16]` — daily, session-wise, and monthly views, with:

```
Attendance % = (Present Sessions ÷ Total Sessions) × 100
```

computed by the engine in §42, never typed in.

**Reports** `[SRS §16]`: student-wise · activity-wise · project-wise · monthly · gender-wise.

**Rules**

- Adding a participant to an activity requires an existing beneficiary — no new personal data
  entry at activity level `[SRS §3]`.
- The instructor sees only their own activities and sessions.
- A session can be recorded offline-tolerantly: the form holds state locally and submits the whole
  roster in one request, so a dropped connection does not lose 35 ticks.
- Photos attached to a session flow into the photo library and become selectable for monthly
  reports `[SRS §72]`.

**Done-when:** a football session with 35 participants at Jamgara on a given date is recorded on a
phone in under two minutes, and appears in the monthly report and the participants' 360° profiles.

---

# 22. School Health Module

**Purpose** `[SRS §17]` — record basic school health activity while protecting sensitive
information.

**Screens:** Health activity list · Record health activity · Screening entry · Referral tracker ·
Awareness session log.

**Fields:** health activity type, screening date, project, location, conducted by, student
participation list, basic measurements (height, weight, vision), health observation, referral
made (yes/no, referred to), follow-up date, awareness session topic and attendance.

**Access rules — the strictest in the system** `[SRS §17, §63]`

| Role | Sees |
|---|---|
| Super Admin | Everything |
| Program Manager | Everything within scope |
| Project Coordinator | That a screening occurred; participant list; **not** observations |
| Teacher/Trainer | Nothing |
| Management | Counts and coverage percentages only |
| Others | Nothing |

- Health tables carry a stricter RLS policy requiring `health:read_detail` (§13.3).
- Every read of an individual health record is written to `audit_logs` — reads, not just writes.
  This is unusual and deliberate: it is health data about minors.
- Health data is excluded from general exports unless the exporter holds both
  `health:read_detail` and `health:export`.

**Done-when:** a coordinator can confirm a screening happened and see who attended, while the
observation text is provably inaccessible to them (proved by an RLS test, not a hidden button).

---

# 23. Project Management and Project Activities

**Purpose** `[SRS §28, §29]` — the monitoring spine that connects programme delivery to targets,
cost, and reporting.

**Project activity fields** `[SRS §29]`: activity ID, project, programme, activity name, date,
location, target, actual achievement, participants, responsible person, cost, output, outcome,
photo, report, remarks.

**Screens:** Project dashboard · Activity register · Add/edit activity · Activity calendar ·
Achievement vs target view.

**Rules**

- `achievement %` is computed, never entered.
- Cost entered here is the *programme* view; the authoritative financial figure remains the linked
  expense voucher (§40). Where both exist, reports show the finance figure and flag variance.
- Activities feed indicators (§32) through a mapping table, so one activity can contribute to
  several indicators.
- Photos and stories attach here and become available to monthly reports `[SRS §72]`.

**Done-when:** a coordinator logs an activity with target 100 / achieved 92, and the project
dashboard shows 92% without anyone calculating it `[SRS §30]`.

---

# 24. Vocational Education — Course Master and Batch Management

**Purpose** `[SRS §18, §19, §20]` — run all eight current courses and any future ones.

**Seeded courses** `[SRS §18]`: Professional IT Support · RMG Machine Operator · Tailoring & Dress
Making · Block & Batik · Screen Printing · Diversified Jute Product Making · Hand Stitching ·
Food Processing.

**Course master fields** `[SRS §19]`: course ID, course name, category, duration, total hours,
curriculum, training objectives, minimum attendance requirement, assessment method, certificate
requirement, active/inactive.

**Batch fields** `[SRS §20]`: batch ID (e.g. `JUTE-MIR-2026-01`), course, project, location, start
date, end date, trainer, capacity, enrolled trainees, schedule, training status (planned /
running / completed / cancelled).

**Rules**

- Enrolment is blocked above capacity unless overridden by a Program Manager, and the override is
  logged with a reason.
- A batch cannot be marked complete while sessions remain unrecorded.
- `min_attendance_pct` from the course drives certificate eligibility (§26) — it is not re-entered
  per batch.
- Changing a course's assessment structure does not retroactively alter completed batches;
  assessment component weights are snapshotted onto the batch at creation.

**Done-when:** a new course is created and a batch opened, enrolled, scheduled, and completed
entirely through the UI.

---

# 25. Trainees, Trainers, Schedule and Training Attendance

## 25.1 Trainee management `[SRS §21]`

**Fields:** trainee ID, beneficiary ID (where applicable), name, gender, DOB/age, address,
contact, education, previous occupation, course, batch, enrolment date, attendance, assessment,
result, certificate, current employment status.

**Rules**

- A trainee who is an existing beneficiary is **linked**, not re-entered. A trainee who is new to
  HOPE creates a beneficiary record in the same flow `[SRS §3, §67]`.
- Trainee status: enrolled · active · completed · dropped · failed · certified.
- Employment status is maintained by the follow-up module (§27), not typed here.

## 25.2 Trainer management `[SRS §22]`

**Fields:** trainer ID, name, expertise, qualification, experience, course(s), project, contact,
contract status, assigned batches, training history, performance evaluation.

**Rules**

- A trainer may be an employee (linked to `employees`) or externally contracted.
- Contract expiry feeds the notification engine `[SRS §57]`.
- Training history is derived from batches, not maintained by hand.

## 25.3 Training attendance `[SRS §24]`

Trainers record attendance from a phone or computer. The system computes: total classes, present,
absent, attendance %, **eligible for assessment**, **eligible for certificate**.

Eligibility is a live computation against `courses.min_attendance_pct`, shown on the roster with a
clear badge, so trainers know before assessment day who is at risk.

## 25.4 Training schedule `[SRS §23]`

**Screens:** calendar (month/week/day), filterable by course, trainer, room, time, batch, project.

**Conflict detection** — the system warns (and requires confirmation) when:

- the same trainer is scheduled for two sessions at overlapping times;
- the same room/location is double-booked;
- a trainee is enrolled in two batches whose sessions overlap;
- a session falls outside its batch's start/end dates or on a configured holiday.

**Done-when:** attempting to double-book a trainer produces a clear warning naming the conflicting
session `[SRS §23]`.

---

# 26. Certificate Management

**Purpose** `[SRS §26]` — issue verifiable certificates to trainees who qualify.

**Fields:** certificate number, trainee name, course, batch, completion date, result, issuing
authority, issue date, QR token, revoked flag.

**Issue workflow**

```
Batch completed → System lists eligible trainees
   (attendance ≥ course minimum  AND  assessment passed)
        → Program Manager reviews and approves
        → Certificate numbers generated
        → PDF rendered with QR code
        → Available for download / bulk print
```

**QR verification** `[SRS §26]` — the SRS calls this a future enhancement; it is cheap to build
correctly now and expensive to retrofit, so the **data model and public verification page ship in
Phase 2**:

- Each certificate stores a random, non-guessable `qr_token` (not the certificate number).
- The QR encodes `https://<host>/verify/<qr_token>`.
- The public page is unauthenticated and shows **only**: valid/invalid, trainee name, course,
  batch, completion date, issuing authority. No contact details, no address, no photo.
- Revoked certificates show as revoked with the revocation date.
- Verification hits are rate-limited and logged.

**Rules**

- A certificate cannot be issued to an ineligible trainee — enforced by trigger, not by UI.
- Re-issue creates a new certificate linked to the original; the original is marked superseded,
  never deleted.

**Done-when:** a third party scans the QR on a printed certificate and sees an authentic/not
authentic answer `[SRS §26]`, and acceptance criterion #9 passes `[SRS §87]`.

---

# 27. Employment and Post-Training Follow-Up

**Purpose** `[SRS §27]` — measure whether training changed lives, which is what donors actually
fund.

**Follow-up periods:** 3, 6, and 12 months after completion.

**Fields:** outcome status (employed · self-employed · business started · job seeking · further
training · not working), employer, occupation, business type, employment start date, income range,
follow-up date, interviewer, remarks.

**Rules**

- When a trainee is certified, the system **schedules three follow-up tasks automatically** at
  +3/+6/+12 months and raises notifications when they fall due `[SRS §57]`.
- Income is captured as a **range** from a master list, not a precise figure — this is both more
  reliable in the field and less sensitive to hold.
- Each period stores its own record; the trainee's current employment status is derived from the
  most recent one.
- Follow-up completion rate is itself a dashboard metric — a follow-up system nobody completes is
  worthless, so the system surfaces the gap.

**Outputs:** Employment Follow-up Report, Employment Outcome of Graduates chart `[SRS §55]`,
course-wise placement rate, gender-disaggregated outcomes.

**Done-when:** certifying a batch creates follow-up tasks that appear on coordinators' dashboards
at the right times.

---

# 28. Assessment and Result Management

**Purpose** `[SRS §25, §11, §12]` — one configurable assessment framework for both academic exams
and vocational assessment.

**Assessment types:** written · practical · oral · assignment · final assessment.

**Configurable scoring** `[SRS §25]` — e.g. Written 30 + Practical 50 + Attendance/Participation
20 = 100. Weights live in `assessment_components` per course (or per subject for education), and
are snapshotted per batch so historical results stay reproducible.

**Screens:** assessment setup (per course/subject) · marks entry grid (keyboard-optimised, mobile
card view) · result publication · grade sheet · re-assessment.

**Rules**

- The attendance/participation component is **auto-filled** from the attendance engine and
  read-only. This removes the most common source of inconsistency.
- Total and grade are computed; only component scores are entered.
- Results have a publish step: draft results are visible to the trainer/teacher only; published
  results appear on the 360° profile and in reports.
- Editing a published result requires `assessment:update` plus a reason, and is audited with old
  and new values `[SRS §61]`.

**Done-when:** an assessment can be configured with different weights per course, entered, and
published, and totals match the configuration exactly.

---

# 29. Photo Management

**Purpose** `[SRS §31]` — a searchable organisational photo library with metadata and consent.

**Attachable to:** project, activity, activity session, programme, date, location, beneficiary
(where appropriate) `[SRS §31]`.

**Metadata:** caption, caption in Bangla, date taken, photographer/uploader, tags, consent status,
usage restriction (internal only / donor report / public).

**Consent handling — mandatory, not optional**

- Every photo carries a consent field. Photos of identifiable minors without recorded consent are
  flagged and **excluded from donor and public report selection** by default.
- The beneficiary record carries an overall photo-consent flag; a mismatch between the two raises
  a warning at selection time.
- Consent status is filterable so HOPE can audit its own library.

**Technical**

- Upload from phone camera; client-side resize before upload to survive slow connections.
- Stored original + thumbnail; EXIF location stripped on upload (a geotagged photo of a child's
  school is a privacy risk).
- Storage is the main cost driver over time — quotas and retention are in §62.

**Done-when:** a photo uploaded from a session is findable by project + month + activity, and a
non-consented photo cannot be pulled into a donor report.

---

# 30. Story / Case Study Management

**Purpose** `[SRS §32]` — capture beneficiary success stories in a structured, approvable form.

**Fields:** story title, beneficiary, project, programme, date, background, intervention,
change/outcome, quote, photo, consent status, author, approval status.

**Workflow** `[SRS §32]`

```
Draft ──submit──► Review ──approve──► Approved ──publish──► Published / Reported
   ▲                 │
   └──── return ─────┘   (with reviewer comments)
```

**Rules**

- Only Approved stories can be selected into a monthly or donor report `[SRS §72]`.
- Consent is required before a story naming a beneficiary can be approved.
- Reviewer comments are retained with the version history.
- Stories link to the beneficiary's 360° profile, and the beneficiary link is hidden from roles
  without beneficiary read access.

**Done-when:** a coordinator drafts a story, a Program Manager returns it with comments, the
coordinator revises, it is approved, and it appears in the August monthly report selector.

# 31. Monthly Report Production and Report Lifecycle

**Purpose** `[SRS §33, §70, §71, §72]` — generate the monthly programme report **from entered
data**, not by re-typing numbers, and move it through a controlled approval lifecycle.

## 31.1 Report content `[SRS §33]`

| Section | Auto-populated content |
|---|---|
| Education | Primary enrolment, secondary enrolment, attendance %, results |
| Co-curricular | Activities run, sessions held, participants, attendance |
| Vocational | Courses, batches, enrolment, completion, attendance, results |
| School health | Sessions, participants (counts only) |
| Stories | Selected approved stories |
| Photos | Selected consented photos |
| Indicators | Target vs achievement vs % |
| Narrative | Free text written by staff |

## 31.2 The eight-step workflow `[SRS §70]`

```
1 Project staff enter daily activities
2 Teachers / trainers enter attendance
3 Coordinators review data                (data-completeness checklist shown)
4 Program Manager verifies
5 System aggregates                       (one click, all figures computed)
6 Monthly report generated                (narrative + photos + stories added)
7 Management reviews
8 Final report exported / submitted       (PDF / Excel)
```

## 31.3 Report status machine `[SRS §71]`

```
Draft ──► Submitted ──► Reviewed ──► Approved ──► Final
            │  ▲                         
            └──┴── Returned for correction
```

After **Final**, editing is blocked. A correction requires a Super Admin to reopen, which is
audited and stamps a revision number on the report.

## 31.4 The data-completeness checklist

Before a coordinator can submit, the system shows what is missing for the period:

- sessions recorded but attendance not entered
- batches with unrecorded sessions
- activities without achievement figures
- follow-ups overdue
- expenses in draft

This turns the monthly scramble into a visible checklist — the single biggest day-to-day
time saving the system offers.

**Done-when:** August 2026's report is produced end-to-end from operational data, with selected
photos and one approved story, and exported to PDF `[SRS §72]`; acceptance criterion #10 passes.

---

# 32. Indicator and Output Tracking

**Purpose** `[SRS §30]` — let each project define what it is measured on, and compute achievement
automatically.

**Definition fields:** indicator name, unit, definition/description, project, programme,
disaggregation (gender, age band, location), baseline, calculation rule, data source.

**Targets:** per period (monthly / quarterly / annual), per project.

**Calculation rules** — each indicator maps to one of:

| Rule type | Example |
|---|---|
| Count of records matching a filter | "Trainees completing tailoring training" = count of `trainees` where course = Tailoring and status = completed |
| Sum of a column | "Total training hours delivered" |
| Ratio of two counts | "Completion rate" = completed ÷ enrolled |
| Manual entry | Qualitative indicators, entered with evidence attached |

**Worked example** `[SRS §30]`

```
Indicator : Number of trainees completing tailoring training
Target    : 100
Achieved  : 92   (computed)
Achievement % : 92%
```

**Rules**

- Achievement is recomputed on demand and cached per period; the computation timestamp is shown so
  nobody reports a stale figure.
- Disaggregation is computed alongside the headline number, because donors ask for it.
- Manual indicators require an evidence document attachment.

**Done-when:** defining a new indicator with a target produces a live achievement figure on the
project dashboard with no code change.

---

# 33. Project Monitoring and Review

**Purpose** — bring §23, §31, and §32 together into the view a Program Manager actually uses.

**Screens:** project scorecard (indicators, targets, achievement, budget utilisation, beneficiary
counts) · variance view (activities behind target) · monthly review pack · project comparison.

**Project comparison** is the payoff of the one-database rule `[SRS §99]`: side-by-side
enrolment, attendance, completion, and budget utilisation across all projects, on one screen,
filterable by programme and period. This is impossible under per-project databases, which is
precisely why the SRS forbids them.

---

# 34. Regulatory and Donor Reporting

**Purpose** `[SRS §34, §35]` — support external reporting formats that change without warning.

**Design principle:** a report template is **data**, not code.

`report_templates.sections` holds a JSON definition:

```json
{
  "name": "Donor X Quarterly",
  "period": "quarter",
  "header": { "logo": true, "org_name": true, "project_name": true },
  "sections": [
    { "type": "kpi_grid", "indicators": ["ind_uuid_1", "ind_uuid_2"] },
    { "type": "table", "source": "trainee_completion",
      "columns": ["course","enrolled","completed","female","male"],
      "filters": { "project_id": "$project", "period": "$period" } },
    { "type": "narrative", "key": "progress_summary", "max_words": 500 },
    { "type": "photo_grid", "max": 6, "require_consent": true },
    { "type": "story", "max": 2, "status": "approved" }
  ]
}
```

**Capabilities**

- Donor-specific indicators, reporting periods, output definitions, beneficiary categories, and
  budget heads `[SRS §35]` are all mapped per donor.
- A template can be cloned and edited by a Super Admin — a changed government or donor format is a
  configuration task, not a redevelopment `[SRS §34]`.
- Export to PDF, Excel, CSV `[SRS §53]`, with Bangla Unicode rendering `[SRS §81]`.

**Done-when:** a Super Admin adds a section to a donor template and regenerates last quarter's
report in the new shape, without a deployment.

---

# 35. Dashboards and Analytics

**Purpose** `[SRS §36, §75–79]` — role-appropriate dashboards with drill-down.

## 35.1 Main dashboard `[SRS §36, §97]`

Cards: total projects · total beneficiaries · total students · total trainees · active courses ·
staff · activities · budget. Quick actions: Add Beneficiary · Add Student · Add Trainee · Record
Attendance · Add Activity · Create Report · Purchase Request `[SRS §97]`.

Sections: Education (enrolment, attendance, completion, dropout) · Vocational (enrolled,
completed, passed, certified, employment follow-up) · Activities (sessions, participants,
attendance) · Finance (total budget, expenditure, remaining, utilisation %).

## 35.2 Role dashboards

| Dashboard | Contents | SRS |
|---|---|---|
| Program | Students, trainees, active projects, attendance, training completion, co-curricular participation, education results, employment outcomes | §78 |
| Admin | Pending purchase requests, pending approvals, inventory alerts, asset status, maintenance due, vendor activity, document expiry | §75 |
| HR | Total employees, department-wise, new employees, contract expiry, leave summary, attendance, training, appraisal status | §76 |
| Accounts | Total budget, total expenditure, remaining, project-wise utilisation, expense category, pending payments, advances, monthly expenditure trend | §77 |
| Management | Organization → Project → Program → Output → Outcome → Budget, with drill-down | §79 |

## 35.3 Management drill-down `[SRS §79]`

```
Vocational Training: 420 trainees
   └─ by Project   → Mirpur 180 · Jamgara 140 · Savar 100
        └─ by Course  → Tailoring 62 · Jute 48 · IT Support 40 ...
             └─ by Batch  → JUTE-MIR-2026-01 ...
                  └─ by Trainee → individual 360° profile
```

Every number on every dashboard is clickable down to the underlying rows the user is permitted to
see.

## 35.4 Charts `[SRS §55]`

Bar, pie, line, KPI cards, trend analysis. Standard set: Training Completion by Course · Students
by Project · Monthly Attendance Trend · Budget Utilisation by Project · Employment Outcome of
Graduates.

**Technical:** aggregates come from materialised views refreshed on a schedule and after month
close, so dashboards stay fast as data grows `[SRS §83]`.

---

# 36. HR Management

## 36.1 Employee records `[SRS §37]`

**Fields:** employee ID, name, designation, department, project, joining date, contract type,
contract end date, contact, emergency contact, qualification, experience, employment status,
documents.

**Rules:** employee documents (contract, NID copy, certificates) carry expiry dates that feed
notifications `[SRS §57]`. Employee files are `confidential` — visible to HR and Super Admin only;
Management sees aggregates `[SRS §63]`.

## 36.2 HR attendance `[SRS §38]`

Methods: manual daily entry, monthly bulk entry, and a documented import path for future biometric
integration (an `attendance_imports` table and a device-agnostic CSV contract, so the future
device does not force a schema change).

Reports: employee-wise · department-wise · monthly · late/absence summary.

## 36.3 Leave management `[SRS §39]`

```
Leave Application → Supervisor Recommendation → Approval → HR Record
```

- Leave types and annual quotas are configurable master data.
- Balance = entitled + carried forward − taken − pending, computed automatically.
- Overlapping leave applications are blocked.
- Rejections require a reason; every transition is audited.

## 36.4 Performance appraisal `[SRS §40]`

Fields: appraisal period, objectives, achievement, strengths, areas for development, supervisor
comments, final rating, development plan.

Workflow: self-assessment → supervisor assessment → review meeting → final rating → acknowledged
by employee. Ratings come from a configurable scale.

**Done-when:** an employee applies for leave on a phone, their supervisor recommends, HR approves,
and the balance updates without manual arithmetic.

---

# 37. Administration and Procurement

## 37.1 Administrative functions `[SRS §41]`

Office management · documents · vendors · procurement · assets · inventory · maintenance · service
providers · administrative requests.

## 37.2 The procurement workflow `[SRS §42]`

```
Purchase Request → Approval → Quotation Collection → Comparative Statement
  → Purchase Approval → Purchase Order → Delivery → Bill → Payment
```

Every stage records **date, responsible person, and status** `[SRS §42]`.

| Stage | Captured | Gate |
|---|---|---|
| Purchase Request | Items, quantity, estimated cost, purpose, project, budget head | Budget availability check |
| Approval | Approver, date, decision, comments | Threshold-based approval level `[SRS §80]` |
| Quotation Collection | ≥ 3 quotations where policy requires; vendor, amount, attached document | Minimum-quotation rule configurable |
| Comparative Statement | Side-by-side comparison, recommendation, justification | Recommender ≠ approver |
| Purchase Approval | Final approver, selected vendor | Cannot approve own request `[SRS §51]` |
| Purchase Order | PO number, terms, delivery date | Auto-generated document |
| Delivery / Goods Receipt | Received date, quantity, condition, receiver | Feeds inventory/asset automatically |
| Bill | Bill number, amount, document | Matched against PO; variance flagged |
| Payment | Method, date, reference | Creates the finance voucher (§40) |

**Integration rules that stop double entry**

- Goods receipt of a consumable **creates the inventory receipt transaction** automatically.
- Goods receipt of a capital item **creates the asset record** in draft, pre-filled from the PO.
- Payment **creates the expense/voucher** in finance, pre-filled and linked, rather than requiring
  Accounts to re-type it.

## 37.3 Approval configuration `[SRS §51, §80]`

`approval_levels` defines, per entity type: level number, approving role, and amount threshold.
Example: purchase requests up to BDT 10,000 → Admin User; up to 100,000 → Program Manager;
above → Management. HOPE edits these thresholds in settings.

**Universal rule:** a user cannot approve their own transaction unless explicitly authorised by
policy `[SRS §51]` — enforced by trigger (§10.3).

## 37.4 Administrative requests `[SRS §41]`

A generic request type (vehicle, maintenance, office supply, service) with the same
submit → recommend → approve → close lifecycle, so new request types need no new code.

## 37.5 Vendor management `[SRS §43]`

Fields: vendor ID, name, business name, contact, address, category, tax information, bank
information, active/inactive, purchase history.

**Sensitive financial information has restricted access** `[SRS §43]`: bank and tax fields are
classified `confidential` and visible only to Accounts and Super Admin; account numbers are stored
masked in list views and revealed only on an audited detail view.

**Done-when:** a purchase request flows through all nine stages, produces an asset record and a
finance voucher without re-entry, and the audit log shows every actor and timestamp.

---

# 38. Inventory Management

**Purpose** `[SRS §44]` — track training materials and supplies accurately per location.

**Categories:** training materials · fabric · thread · jute · printing materials · stationery ·
IT accessories · office supplies (extensible master list).

**Transaction types:** opening stock · purchase · transfer · issue · consumption · return ·
adjustment · closing stock.

**The governing formula** `[SRS §44]`

```
Closing Stock = Opening + Received − Issued ± Adjustment
```

**Design decision:** stock is **never stored as a mutable number**. It is always derived from the
transaction ledger, with a materialised period balance for speed. This makes every stock figure
explainable — you can always show the transactions that produced it, which is what an auditor
asks for.

**Rules**

- Negative stock is blocked; an override requires `inventory:override` and a mandatory reason,
  both audited `[SRS §64]`.
- Issues must specify project, location, and purpose (batch/activity where applicable), so
  consumption can be attributed to programmes.
- Transfers between locations create a paired out/in transaction in one transaction block.
- Reorder levels drive low-inventory notifications `[SRS §57]`.
- Period close locks transactions for that period; adjustments after close require Super Admin.

**Outputs:** stock ledger, stock position by location, consumption by project/course, low-stock
report, period movement report `[SRS §54]`.

---

# 39. Asset Management

**Purpose** `[SRS §45, §46, §47]` — maintain a reliable asset register through the full lifecycle.

**Fields:** asset ID, asset name, category, serial number, purchase date, purchase value, project,
location, assigned person, condition, warranty, maintenance, disposal status. Typical assets:
sewing machine, computer, printer, furniture, cutting machine `[SRS §45]`.

**Transfer** `[SRS §46]`

```
Asset Transfer Request → Approval → New Location / Responsible Person
```

Full transfer history is retained and shown as a timeline on the asset record.

**Disposal** `[SRS §47]`

```
Identification → Approval → Disposal → Record Update
```

The asset record is **retained after disposal** with `disposal_status` set — the historical record
survives `[SRS §47]`. Disposal captures method, date, approver, and proceeds.

**Maintenance:** scheduled and ad-hoc maintenance with cost, vendor, and next-due date; upcoming
maintenance and expiring warranties raise notifications `[SRS §57]`.

**Additional features:** printable asset tags with QR codes for physical verification; an annual
physical-verification worksheet (export → count → import discrepancies).

**Outputs:** Asset Register `[SRS §54]`, asset movement history, depreciation-ready schedule (if
HOPE's policy requires), disposal register.

---

# 40. Accounts and Finance

**Purpose** `[SRS §48, §49, §50, §51]` — budget control and expenditure tracking tied to
programmes, not a general ledger replacement.

> **Scope clarification for the workshop:** HB-IMIS is a **budget and expenditure monitoring**
> system, not a double-entry accounting package. If HOPE requires statutory books (trial balance,
> balance sheet), the right answer is integration with the existing accounting system via API
> `[SRS §74]`, not rebuilding it. This must be settled before Phase 5 (Appendix H).

## 40.1 Budget management `[SRS §49]`

Budgets bind to the chain:

```
Project → Program → Activity → Budget Head
```

**Worked example** `[SRS §49]`

```
Training Materials
Approved Budget : BDT 100,000
Spent           : BDT  72,000
Balance         : BDT  28,000
Utilisation     : 72%
```

Alerts fire at configurable thresholds (default 80%, 95%, 100%) and when expenditure would exceed
the approved limit `[SRS §49]`.

## 40.2 Expense management `[SRS §50]`

**Fields:** voucher number, date, project, programme, activity, budget head, description, amount,
payment method, supporting document, prepared by, approved by, status.

**Rules**

- A supporting document is **mandatory** above a configurable amount.
- The budget-ceiling trigger blocks over-budget expenses from reaching `approved` without a
  special approval path `[SRS §64]`.
- Expenses link to the project activity they fund, so programme cost and finance cost reconcile.

## 40.3 The approval state machine `[SRS §51]`

```
Draft → Submitted → Recommended → Approved → Paid → Closed
                          │
                          └──► Rejected (with reason, returnable to Draft)
```

Every transition records actor, timestamp, and comments. Financial records are never hard-deleted
`[SRS §61]`; a cancelled voucher is marked cancelled with a reason.

## 40.4 Payments, advances, income

- **Payments:** method, bank account, cheque/reference number, date; links to the expense.
- **Advances:** issued to staff for field activities, with adjustment against subsequent expenses
  and an outstanding-advance ageing report.
- **Income:** donor receipts recorded against project and fiscal year, giving the funds-received
  vs funds-spent picture.

**Outputs:** Budget Utilisation Report `[SRS §54]`, expense register, project-wise expenditure,
expense by category, pending payments, advance ageing, monthly expenditure trend `[SRS §77]`.

---

# 41. Document Management

**Purpose** `[SRS §52]` — attach documents to the records they belong to, with control.

**Attachable to:** purchase documents, quotations, contracts, certificates, reports, approval
letters, asset documents, employee files, beneficiary consent forms.

**Document fields** `[SRS §52]`: file name, category, date, owner, related record, version, access
permission, expiry date (where applicable).

**Rules**

- Versioning: uploading a replacement creates version *n+1*; previous versions remain retrievable.
- Access permission per document: inherits the parent record's sensitivity by default, overridable
  upward (never downward).
- Allowed types and size limits are configurable; uploads are virus-scanned where the host
  supports it, and content-type is verified server-side rather than trusting the extension.
- Expiring documents (contracts, licences, registrations) raise notifications `[SRS §57]`.
- Documents are stored in object storage with **signed, short-lived URLs** — never public paths.
  A leaked link expires; a public bucket does not.

**Done-when:** a contract uploaded against a vendor is versioned, restricted to Admin and Accounts,
and its expiry appears on the Admin dashboard 30 days ahead.

# PART F — CROSS-CUTTING ENGINES

These are built **once** and reused by every module. Building them per module is the single most
common way NGO MIS projects overrun.

---

# 42. Attendance Engine

**Purpose** `[SRS §16, §24, §38]` — one engine serving class attendance, co-curricular session
attendance, vocational training attendance, and HR attendance.

**Polymorphic model**

```
attendance(
  attendable_type  -- 'class' | 'activity_session' | 'training_session' | 'employee_day'
  attendable_id
  person_type      -- 'student' | 'beneficiary' | 'trainee' | 'employee'
  person_id
  date, status, recorded_by, recorded_at, remarks
)
```

**Statuses:** present · absent · late · excused · holiday.

**Computations, all derived — never typed**

```
Attendance %        = Present ÷ Total Sessions × 100          [SRS §16]
Eligible for assessment = Attendance % ≥ course.min_attendance_pct
Eligible for certificate= Eligible for assessment AND assessment passed
```

**Entry UX (mobile-first)**

- Roster loads with everyone defaulted to Present; the user taps only the exceptions. In practice
  this is a 3-tap operation for a 35-person session instead of 35 taps.
- The whole roster submits in **one** request; partial submission is impossible.
- Draft state is held in local storage, so a lost connection mid-entry loses nothing.
- Once submitted, editing within 48 hours is allowed with an audit entry; beyond that requires
  `attendance:update_locked`.

**Guards**

- No attendance for a non-enrolled person `[SRS §64]`.
- No duplicate attendance for the same person, attendable, and date (unique index).
- No attendance on a future date or a configured holiday.

**Reports** `[SRS §16]`: student-wise · activity-wise · project-wise · monthly · gender-wise ·
low-attendance exception list (feeds notifications).

**Done-when:** one engine serves all four attendance domains and acceptance criterion #7 passes
`[SRS §87]`.

---

# 43. Media and File Storage

**Purpose** — one storage service for photos `[SRS §31]`, documents `[SRS §52]`, certificates, and
report exports.

| Concern | Decision |
|---|---|
| Store | Supabase Storage (S3-compatible); migratable to any S3 provider or MinIO if HOPE self-hosts |
| Buckets | `photos`, `documents`, `certificates`, `exports`, `imports` — all **private** |
| Access | Signed URLs, 10-minute expiry, generated server-side after a permission check |
| Naming | `{bucket}/{project_id}/{yyyy}/{mm}/{uuid}.{ext}` — never original filenames |
| Images | Client-side resize to max 1600 px before upload; server generates a 300 px thumbnail |
| EXIF | GPS and device metadata stripped on upload |
| Validation | Server-side MIME sniffing; extension alone is not trusted |
| Limits | Configurable per type (default 5 MB images, 10 MB documents) |
| Orphans | Nightly job removes files with no owning record |

**Storage growth planning** — the realistic cost driver. At ~400 KB per stored photo pair and
~300 photos/month across projects, that is roughly 1.5 GB/year, plus documents. This exceeds a
free tier within the first year, which is why §62 sets a retention and archival policy rather
than pretending storage is free.

---

# 44. Assessment and Scoring Engine

Shared by education (§18, §20) and vocational (§28).

- Component definitions with weights, validated to total 100.
- Attendance component auto-sourced from §42.
- Grade derivation from a configurable `grading_scales` table (mark range → grade → grade point).
- Snapshotting: the component structure in force when a batch or exam was created is stored with
  it, so recalculating a 2026 result in 2029 gives the 2026 answer.
- Result publication gate, with audited post-publication edits.

---

# 45. Reporting Engine

**Purpose** `[SRS §53, §54]` — one engine behind all 18 named management reports (Appendix D) plus
ad-hoc queries.

## 45.1 Architecture

```
Report definition (JSON)  →  Query builder  →  RLS-filtered SQL  →  Result set
        → Renderer: HTML (screen) | PDF | Excel | CSV | Print   [SRS §53]
```

## 45.2 Universal filter grammar `[SRS §53]`

Every report and list accepts the same filters: project · location · programme · activity · date
range · gender · age group · course · batch · academic year · department · status. Filters are
composable and shareable as a URL, so "my monthly view" is a bookmark.

## 45.3 Rules

- Reports **always** execute under the requesting user's permissions. There is no privileged
  report path — a scoped coordinator's "all projects" report returns their projects only.
- Export is a separate capability from read `[SRS §66]`.
- Every export is logged (who, what, when, which filters) — this is how HOPE demonstrates control
  over personal data.
- Large exports run as background jobs and are delivered as a download link, so the browser never
  times out.
- Every rendered report carries: generation timestamp, generating user, filter summary, and page
  numbers. An undated report on someone's desk is a liability.
- Bangla Unicode renders correctly in PDF and Excel — this requires embedding a Unicode Bangla
  font in the PDF pipeline and is tested explicitly `[SRS §81]`.

**Done-when:** acceptance criteria #11 and #12 pass — data can be filtered and reports exported
`[SRS §87]`.

---

# 46. Audit Trail

**Purpose** `[SRS §61]` — know who did what, when, and what changed.

**Captured for every critical record:** who created, who modified, what changed, date/time,
previous value, new value `[SRS §61]`, plus IP address and user agent.

**Implementation:** a generic `audit()` trigger attached to every critical table, writing
`old_values`/`new_values` as JSONB diffs (only changed keys, to keep the table compact).

**Covered tables:** beneficiaries, students, trainees, employees, attendance, assessments,
results, certificates, all finance tables, all procurement tables, assets, inventory, users,
roles, permissions, settings, report status transitions, and **health record reads**.

**Rules**

- Financial and administrative records are never permanently deleted `[SRS §61]`; deletion is a
  status change and is itself audited.
- Audit logs are append-only: no UPDATE or DELETE grant exists for any application role.
- The audit viewer supports filtering by user, entity, action, and date, and is readable by Super
  Admin and Management only.
- Retention: audit logs are retained for the life of the system, archived annually to cold storage
  after 3 years.

**Done-when:** acceptance criterion #14 passes — audit logs work for critical operations
`[SRS §87]`.

---

# 47. Localization, Date, Number and Currency

**Purpose** `[SRS §81, §82]`

| Requirement | Implementation |
|---|---|
| English and Bangla interface | `next-intl`; all UI strings in message catalogues from day one — **no hard-coded strings anywhere** |
| Version 1 primary language | English, with the Bangla catalogue scaffolded and switchable per user `[SRS §81]` |
| Bangla content fields | `name_bn`, `caption_bn`, `description_bn` on user-facing content tables |
| Bangla Unicode in reports | Embedded Unicode Bangla font in the PDF renderer; Excel exports use UTF-8 with BOM |
| Date display | Configurable format in settings (default `dd/MM/yyyy`); stored as ISO, never as a formatted string |
| Timezone | `Asia/Dhaka` throughout; timestamps stored as `timestamptz` |
| Currency | BDT with the Taka symbol, `numeric(14,2)`, thousands separators per locale `[SRS §82]` |
| No hard-coded formatting | All formatting flows through `lib/format`, driven by settings `[SRS §82]` |

**Rule:** a single hard-coded date format or currency symbol anywhere in the codebase is a review
failure. This is cheap to enforce on day one and extremely expensive to retrofit.

---

# 48. Global Search

**Purpose** `[SRS §56]` — one search box that finds anything the user is allowed to see.

**Searchable:** Beneficiary ID, Student ID, Trainee ID, Employee ID, name (English and Bangla),
phone, project, course, batch `[SRS §56]`.

**Implementation**

- Postgres full-text (`tsvector`, GIN) for names and text, plus `pg_trgm` for fuzzy/partial
  matching — essential for transliterated Bangla names where spelling varies.
- Results grouped by entity type with a permission filter applied **in the query**, so a
  coordinator never even learns that a beneficiary in another project exists `[SRS §56]`.
- Keyboard shortcut, recent searches, and direct navigation on exact ID match.

---

# 49. Notification Engine

**Purpose** `[SRS §57]` — in-system notifications in Version 1, with channels added later.

**Triggers** `[SRS §57]`: pending approvals · low inventory · expiring contracts · upcoming
training · missing monthly reports · low attendance · budget threshold · follow-up due · document
renewal due.

**Design**

- A `notification_rules` table defines: trigger type, condition parameters, target role or user,
  frequency. Adding "notify at 90% budget" is a configuration change.
- Scheduled evaluation via `pg_cron` (daily at 06:00 Asia/Dhaka) plus event-driven notifications on
  state transitions.
- Delivery: in-app notification centre with unread badge and a daily digest.
- Channel abstraction (`channel: in_app | email | sms | whatsapp`) exists from day one with only
  `in_app` implemented, so adding email or SMS later is a provider adapter, not a redesign
  `[SRS §57, §74]`.
- Anti-noise: notifications deduplicate per rule per entity per day. A system that cries wolf gets
  ignored, which is worse than no system.

---

# 50. Data Import and Export

## 50.1 Import `[SRS §65]`

The concrete requirement: HOPE holds an Excel file of roughly 500 students that must be imported
`[SRS §65]`.

**Flow**

```
1 Download template        (per entity, with headers, sample row, and a validation sheet)
2 Upload filled file       (.xlsx / .csv)
3 Parse + validate         row-by-row against the same Zod schema the forms use
4 Preview report           → valid rows | errors | duplicate candidates
5 Fix and re-upload  OR  import valid rows only
6 Commit                   in one transaction, with an import job record
7 Rollback available       for 24 hours, by import job
```

**Detected before import** `[SRS §65]`: duplicate records (using §10.2 logic), missing mandatory
fields, invalid data (dates, phone formats, unknown master-data values).

**Templates provided:** beneficiaries · students · trainees · employees · assets · inventory
opening stock · budget lines · vendors.

**Rules**

- Every imported row records its source file and row number, so a bad figure can always be traced
  back to the spreadsheet cell it came from.
- Master data values must already exist — the importer will not silently create a new course
  because of a typo. Unknown values become errors with a suggested match.
- Import requires an explicit `*:import` capability and is fully audited.

## 50.2 Export `[SRS §66]`

Excel · CSV · PDF, role-controlled, logged, with the same filter grammar as reports (§45.2).

---

# 51. Non-Functional Requirements

## 51.1 Performance targets `[SRS §83]`

| Scenario | Target |
|---|---|
| Dashboard first paint (desktop, broadband) | < 1.5 s |
| List screen, 50 rows with filters | < 1 s server time |
| Attendance roster load (40 people, 3G mobile) | < 3 s |
| Attendance submission (whole roster) | < 1.5 s |
| Monthly report generation (one project) | < 10 s |
| Organisation-wide report (all projects, 1 year) | < 60 s, backgrounded if longer |
| Global search | < 500 ms |

## 51.2 Scale targets `[SRS §83, §84]`

Designed for: 20+ projects · 50,000+ beneficiaries · 2,000,000+ attendance rows · 10+ years of
history · 100 concurrent users, 30 of them writing.

Concretely this means: indexes on every foreign key and every filter column; monthly partitioning
of `attendance` and `audit_logs` when they pass ~5 million rows; no unbounded `SELECT`; and
materialised aggregates for dashboards.

## 51.3 Security requirements `[SRS §60]`

| Requirement | Implementation |
|---|---|
| Secure login | Supabase Auth, email + password, lockout after 5 failed attempts |
| Password hashing | bcrypt via Auth provider; passwords never stored or logged by the app |
| Password policy | Minimum 10 characters, complexity check, forced change on first login |
| Role-based access | §12, §13 |
| Session management | httpOnly, Secure, SameSite=Lax cookies; 8-hour idle timeout; server-side revocation |
| HTTPS | Enforced; HSTS; HTTP redirected |
| Database security | RLS on every table; least-privilege DB roles; no shared admin credentials |
| Backup | §62 |
| Audit trail | §46 |
| Restricted sensitive data | Column-level sensitivity classes (§13.1) |
| Additional | CSRF protection on mutations, rate limiting on auth and public verification endpoints, security headers (CSP, X-Frame-Options), dependency scanning in CI, no secrets in client bundles |

## 51.4 Data privacy `[SRS §63]`

Special care for children/minors, health information, contact information, financial information,
and employee information — **users see only what their role requires**.

Practical measures:

- Minors' photos require recorded consent before any external use (§29).
- Health observations are `confidential` and read-audited (§22).
- Guardian phone numbers are masked in list views for roles without `read_contact`.
- Exports of personal data are logged with the exporting user and filter set.
- A written data-protection note accompanies the system, covering what is collected, who can see
  it, how long it is kept, and how to request correction — HOPE should adopt this as policy.

## 51.5 Availability and browser support

- Target 99% monthly availability during Bangladesh working hours; a planned maintenance window
  outside 08:00–20:00 Asia/Dhaka.
- Browsers: last two versions of Chrome, Edge, Firefox, Safari; Android Chrome; iOS Safari
  `[SRS §58]`.
- Graceful degradation: a clear offline banner and retry rather than a silent failure.

## 51.6 Accessibility

WCAG 2.1 AA as the working standard: keyboard navigation throughout, visible focus states, 4.5:1
contrast, labelled form controls, and screen-reader-sensible table markup. Field staff use a wide
range of devices and eyesight; this is not decoration.

---

# 52. System Configuration

**Purpose** `[SRS §80]` — everything an administrator must be able to change without a developer.

| Configurable | Where |
|---|---|
| Academic year | Master data §19 |
| Fiscal year | Master data |
| Project, location | Master data §14 |
| Course, activity | Master data §15 |
| User roles and permissions | §11, §12 |
| Approval levels and thresholds | §37.3 |
| Report templates | §34 |
| Indicator definitions | §32 |
| Notification rules | §49 |
| Date format, currency, language default | §47 |
| Grading scales | §44 |
| Attendance lock window | §42 |
| File type and size limits | §43 |
| Budget alert thresholds | §40.1 |
| Organisation profile, logo, report header | §14 |

**Guardrail:** configuration changes are audited, and destructive ones (deactivating a project,
changing a grading scale, editing approval thresholds) show an impact preview — "this affects 412
records" — before confirmation.

# PART G — DELIVERY PLAN

---

# 53. Delivery Methodology and Governance

**Approach:** two-week sprints inside six phases `[SRS §85]`. Every sprint ends with a deployed
increment on staging and a 30-minute demo to the relevant HOPE users. Every phase ends with a
signed exit checklist.

**Governance**

| Forum | Cadence | Participants | Output |
|---|---|---|---|
| Sprint demo | Fortnightly | Developer + module owners | Feedback list, triaged |
| Phase gate | End of each phase | Developer + Program lead + sponsor | Signed exit checklist |
| Change board | As needed | Sponsor + developer | Classification and estimate `[SRS §95]` |
| UAT standup | Daily during UAT | UAT team | Defect list |

**Definition of Done for any feature**

1. Schema migration committed and applied on staging.
2. RLS policy written **and** tested for every new table.
3. Zod schema shared by form and API.
4. Audit trigger attached where the table is critical.
5. Mobile layout verified at 375 px width.
6. Unit tests for business rules; E2E test for the primary happy path.
7. Bangla-ready strings (no hard-coded literals).
8. Documented in the user manual section for that module.
9. Demoed and accepted by the module owner.

**Scope realism — read this before signing a date.** The full 28-module system specified in the
SRS is genuinely large: it spans programme, education, vocational, HR, administration, procurement,
inventory, asset, finance, and reporting. Six months is achievable for the MVP (§55) plus reporting
and a meaningful subset of administration, with a small experienced team. Delivering *all* of
Phases 1–6 to production quality in six months with a single developer is not realistic, and it is
better for HOPE to hear that now than in month five. The recommended posture is: **fix the
quality bar and the phase order; let the later phases float on date.** Phases 1–3 give HOPE a
system it can genuinely run programmes on; Phases 4–5 replace the administrative and financial
spreadsheets; Phase 6 is explicitly optional.

---

# 54. Phased Implementation Plan

The six phases follow the SRS `[SRS §85]` exactly, with content, exit criteria, and the risk each
phase retires.

## Phase 1 — Foundation

**Goal:** the skeleton every later phase plugs into. Nothing user-visible is impressive here, and
skipping it is how these projects fail.

| Workstream | Contents |
|---|---|
| Discovery | Requirement Validation Workshop `[SRS §102]`; collect existing Excel/register formats; confirm forms, fields, roles, approval workflows, reports |
| Design | ER diagram `[SRS §103 Doc 1]`; role & permission matrix `[SRS §103 Doc 2]`; screen-by-screen UI spec for key screens `[SRS §103 Doc 3]`; technical architecture `[SRS §103 Doc 7]` |
| Build | Repo, CI, environments; auth and session; users, roles, permissions, RLS framework; organisation, departments, projects, locations, donors; master data screens; **central beneficiary database**; beneficiary 360° shell; base dashboard; audit trigger framework; i18n scaffold; file storage service |

**Exit criteria**

- A Super Admin can create a project, location, user, and role, and the scoping demonstrably works.
- A beneficiary can be created, found by search, and opened in a 360° view.
- The RLS test suite passes for at least three roles.
- Migrations run cleanly from an empty database.

**Retires the risk of:** a wrong data model discovered in month four.

## Phase 2 — Core Programmes

| Workstream | Contents |
|---|---|
| Education | Academic years, classes, subjects, schools; primary and secondary student management; enrolment; promotion/roll-forward; dropout tracking |
| Co-curricular | Activity master, enrolment, session recording, session attendance |
| Vocational | Course master, batches, trainees, trainers, schedule with conflict detection, training attendance |
| Shared | **Attendance engine**, **assessment engine**, certificate generation with QR verification |
| School health | Health activities, restricted health records |

**Exit criteria**

- One child demonstrably appears in education, two co-curricular activities, and a health screening
  from a single beneficiary record — the SRS's own worked example `[SRS §3]`.
- Attendance percentages compute correctly against hand-checked figures.
- A certificate is issued to an eligible trainee and verifies by QR; an ineligible trainee cannot
  be certified.
- Acceptance criteria #4–#9 pass `[SRS §87]`.

## Phase 3 — Reporting and Monitoring

| Workstream | Contents |
|---|---|
| Reporting engine | Filter grammar, PDF/Excel/CSV renderers, Bangla Unicode, background exports |
| Reports | The 18 named management reports (Appendix D) |
| Monthly reporting | Aggregation, completeness checklist, 8-step workflow, status lifecycle |
| Monitoring | Project activities, indicators, targets, achievement computation |
| Media | Photo library with consent, story workflow, photo-into-report selection |
| Dashboards | Programme and management dashboards with drill-down |
| Templates | Configurable regulatory and donor templates |

**Exit criteria**

- The previous month's report generates entirely from operational data and exports to PDF with
  Bangla text rendering correctly.
- Management drill-down reaches an individual trainee from a headline number.
- Acceptance criteria #10–#12 pass.

**→ End of Phase 3 is the recommended first production go-live (MVP, §55).**

## Phase 4 — Administration and HR

Employees, HR attendance, leave workflow, appraisals; administrative requests; vendors;
procurement 9-stage workflow; inventory ledger; asset register with transfer, maintenance, and
disposal; document management with versioning; admin and HR dashboards.

**Exit criteria:** a purchase request completes all nine stages and automatically produces an
asset record and an inventory receipt; a leave application completes its workflow and updates the
balance.

## Phase 5 — Finance

Fiscal years, budget heads, budgets bound to project/programme/activity; expenses with supporting
documents; the approval state machine; vouchers, payments, advances, income; budget alerts;
accounts dashboard; financial reports.

**Exit criteria:** an expense exceeding its budget head is blocked from routine approval; the
budget utilisation figure reconciles with the expense register to the taka.

## Phase 6 — Advanced (optional / on demand)

Mobile application preparation, offline data entry and sync `[SRS §59]`, AI framework readiness
`[SRS §73]`, external API integrations `[SRS §74]`, biometric HR attendance.

**This phase is explicitly conditional.** None of it should be committed to before Phases 1–5 are
in production and stable.

---

# 55. Minimum Viable Product

`[SRS §86]` — if budget or time is constrained, Version 1 contains exactly these twelve:

| # | Module | Phase delivered |
|---|---|---|
| 1 | User Management | 1 |
| 2 | Project Management | 1 |
| 3 | Beneficiary Management | 1 |
| 4 | Student Management | 2 |
| 5 | Education | 2 |
| 6 | Co-Curricular | 2 |
| 7 | Vocational Training | 2 |
| 8 | Attendance | 2 |
| 9 | Assessment | 2 |
| 10 | Certificate | 2 |
| 11 | Basic Reporting | 3 |
| 12 | Dashboard | 1 (shell) → 3 (full) |

**This is the contractual scope line.** Everything beyond it — HR, procurement, inventory, asset,
finance, donor templates, AI, mobile app — is a separately scoped phase. Writing this boundary
into the contract protects both sides from the most common failure in NGO MIS projects: an
ever-expanding Version 1 that never ships.

---

# 56. Indicative Timeline

Aligned to the SRS's suggested six-month structure `[SRS §96]`, expressed as sprints. Dates are
indicative and to be fixed after the validation workshop.

| Month | Sprint | Focus | Key deliverable |
|---|---|---|---|
| 1 | S1 | Requirement Validation Workshop; existing formats collected; ER diagram; role matrix | Documents 1, 2, 7 `[SRS §103]` |
| 1 | S2 | Repo, CI, environments, auth, RBAC, RLS framework, UI system | Login + role-scoped shell |
| 2 | S3 | Organisation, projects, locations, master data | Configurable master data live |
| 2 | S4 | Beneficiary database, duplicate detection, 360° shell, search, import template | Central beneficiary DB |
| 3 | S5 | Academic years, primary + secondary education, promotion | Education module |
| 3 | S6 | Co-curricular activities, sessions, attendance engine | Attendance working on mobile |
| 4 | S7 | Vocational: courses, batches, trainees, trainers, schedule | Vocational module |
| 4 | S8 | Assessment engine, certificates + QR, school health | Acceptance criteria #4–#9 |
| 5 | S9 | Reporting engine, 18 reports, export formats | Report engine |
| 5 | S10 | Monthly reporting workflow, indicators, photos, stories, dashboards | **MVP feature-complete** |
| 6 | S11 | Data migration, UAT round 1, defect fixes, training materials | UAT sign-off |
| 6 | S12 | Security + performance testing, backup/restore drill, training, go-live | **Production launch (MVP)** |

**Phases 4–6** (HR, Administration, Procurement, Inventory, Asset, Finance, Advanced) follow as a
separately scheduled block of roughly 3–4 months after MVP stabilisation. Attempting to compress
them into month 5–6 alongside UAT is the fastest route to a system nobody trusts.

---

# 57. Testing and Quality Assurance

`[SRS §88]` requires functional, UAT, security, performance, and backup/recovery testing.

| Type | Scope | Tooling | Gate |
|---|---|---|---|
| Unit | Business rules: attendance %, eligibility, stock formula, budget ceiling, ID generation, grade derivation | Vitest | CI blocks merge |
| Integration | API handlers with a real Postgres | Vitest + testcontainers | CI |
| **RLS / permission** | Every role × every sensitive table (§13.5) | pgTAP | CI blocks merge |
| E2E | Critical journeys (below) | Playwright | CI on preview |
| Functional | Every module tested against its Done-when | Manual script | Phase gate |
| UAT | Real HOPE workflows with real staff | Scripted scenarios | Go-live gate |
| Security | Unauthorised access, permission bypass, login security, data access `[SRS §88]` | Manual + automated | Go-live gate |
| Performance | Realistic volume: 50k beneficiaries, 1M attendance rows `[SRS §88]` | k6 / seeded dataset | Go-live gate |
| Backup / recovery | Demonstrated restore `[SRS §88]` | Documented drill | Go-live gate |
| Accessibility | Keyboard + contrast on core screens | axe | Phase gate |

**Critical E2E journeys** (automated, run every build)

1. Login → role-scoped dashboard.
2. Create beneficiary → duplicate warning → save → find in search → open 360°.
3. Enrol student → record class attendance → enter marks → publish result → promote.
4. Create batch → enrol trainees → record training attendance → assess → issue certificate →
   verify by QR.
5. Record activity session with 35 participants from a mobile viewport.
6. Generate monthly report → attach photo and story → submit → approve → export PDF.
7. Coordinator of Project A attempts to read Project B data → denied (negative test).
8. Purchase request → approval → PO → receipt → asset created → payment → voucher.

**Security test checklist** `[SRS §88]`

- Direct object reference: change an ID in a URL and confirm denial, not data.
- Privilege escalation: a Data Entry User calling an approval endpoint directly.
- Export bypass: reading a list then hitting the export endpoint without `*:export`.
- Session fixation and logout revocation.
- SQL injection (parameterised queries throughout) and stored XSS in free-text fields.
- Rate limiting on login and on the public certificate verification page.
- Confirm no service-role key is present in any client bundle.

---

# 58. Acceptance Criteria Traceability

`[SRS §87]` — the software is accepted only if all fifteen pass. Each maps to a specific test.

| # | Criterion | Proven by |
|---|---|---|
| 1 | Users can log in securely | E2E #1; security test (lockout, HTTPS, session) |
| 2 | Role-based permissions work | pgTAP RLS suite; E2E #7 |
| 3 | Beneficiary IDs are unique | Unique index; concurrency test creating 100 simultaneous beneficiaries |
| 4 | Students can be enrolled | E2E #3 |
| 5 | Trainees can be enrolled | E2E #4 |
| 6 | Activities can be created | E2E #5; master-data test adding a new activity |
| 7 | Attendance can be recorded | E2E #3, #4, #5; attendance-% unit tests |
| 8 | Assessments can be recorded | E2E #3, #4; weighted-scoring unit tests |
| 9 | Certificates can be generated | E2E #4; ineligible-trainee negative test; QR verification test |
| 10 | Monthly reports can be generated | E2E #6; figures reconciled against hand-computed control set |
| 11 | Data can be filtered | Filter-grammar tests across all 18 reports |
| 12 | Reports can be exported | PDF/Excel/CSV export tests incl. Bangla Unicode |
| 13 | Data backup works | Documented restore drill into a clean environment (§62) |
| 14 | Audit logs work for critical operations | Trigger tests on every audited table; before/after value check |
| 15 | Works on desktop and mobile browsers | Playwright across desktop + mobile viewports; manual device check on Android and iOS |

**Recommendation:** attach this table to the contract as the acceptance schedule. It converts
"is it finished?" from an argument into a checklist.

---

# 59. Data Migration

**Purpose** `[SRS §65, §102]` — move existing registers and Excel files into HB-IMIS without
importing the mess.

## 59.1 Sequence

```
1  Inventory of existing sources   (which Excel files, which registers, who owns each)
2  Field mapping per source        (source column → target field, with transformation rules)
3  Template issued to HOPE         (one workbook per entity, with validation)
4  HOPE cleans data in the template (this step is HOPE's, and it takes longer than expected)
5  Trial import into staging       (full validation report returned)
6  Correction cycle                (repeat 4–5 until the error list is empty or accepted)
7  Production import               (in a single transaction, with a job record)
8  Reconciliation                  (counts and control totals signed off by HOPE)
9  Freeze the old files            (read-only; single source of truth becomes HB-IMIS)
```

## 59.2 Migration order

Master data → locations/projects → employees → **beneficiaries** → students → trainees → batches →
historical attendance (optional, summarised) → assets → inventory opening balances → budgets.

Beneficiaries must precede students and trainees, because the anchor must exist before its roles.

## 59.3 Historical data policy

Importing years of historical attendance row-by-row is usually poor value. Recommended default:
import **current-year detail** plus **prior-year summaries** (totals per student per month), and
keep the original files archived as documents. This should be an explicit decision at the
workshop, not a silent one.

## 59.4 Reconciliation controls

| Control | Check |
|---|---|
| Row counts | Source rows = imported + rejected + merged duplicates |
| Beneficiary count | Matches HOPE's own headline figure per project, or the variance is explained |
| Gender split | Matches source |
| Duplicate merges | Each merge listed and signed off individually |
| Spot check | 20 random records compared field-by-field against the source |

Nothing goes live until HOPE signs the reconciliation sheet. An import that quietly creates 40
duplicate children poisons every report for years.

---

# 60. UAT, Training and Go-Live

## 60.1 User Acceptance Testing `[SRS §89]`

HOPE nominates representatives from Management, Program, HR, Administration, and Accounts. They
test using **actual operational scenarios**, not abstract test cases. The developer corrects
identified issues before final deployment `[SRS §89]`.

**Scenario pack:** enrol a real class · record a week of real attendance · run a real batch through
to certification · produce last month's real report and compare it to the manually produced one ·
process a real purchase request · apply for leave · record a real expense.

**Defect triage:** Blocker (stops go-live) · Major (fix before go-live) · Minor (fix in first
maintenance window) · Enhancement (goes to change control, §69).

## 60.2 Training `[SRS §90]`

| Audience | Content | Duration |
|---|---|---|
| Super Admin | Full administration: users, roles, master data, configuration, templates, backups, audit | 2 days |
| Department users (HR, Admin, Accounts) | Module-specific workflows and approvals | 1 day each |
| Project Coordinators | Beneficiary entry, activities, attendance, project reporting, photo/story | 1 day |
| Teachers / Trainers | Attendance and assessment on a phone | Half day |
| Management | Dashboards, drill-down, report review and approval | Half day |

Materials `[SRS §90]`: user manual, quick reference cards (one page per role, printable, in Bangla
and English), and short screen-recorded video tutorials for the five highest-frequency tasks.

**Train the trainer:** identify two internal champions per department who become first-line
support. This is what keeps adoption alive after the developer's warranty period ends.

## 60.3 Go-live

**Cutover plan**

1. Freeze source files (T−2 days).
2. Final production import and reconciliation sign-off (T−1).
3. Production smoke test: login per role, create one record, generate one report (T−0 morning).
4. Go-live announcement with quick reference cards distributed.
5. Hypercare: daily check-in for the first two weeks, weekly for the next six.

**Rollback:** for the first month, the previous Excel process is kept in parallel for the monthly
report only. If the first monthly report cannot be reconciled, the parallel run covers HOPE while
the discrepancy is resolved. Parallel running ends when one full monthly cycle reconciles.

**Go/no-go checklist:** all 15 acceptance criteria passed · backup restore demonstrated · security
test closed · reconciliation signed · training delivered · support contact published · rollback
plan agreed.

# PART H — OPERATIONS, COMMERCIAL AND RISK

---

# 61. Operations and Support Runbook

**Daily:** automated backup verification alert; error-monitoring review; failed-job check.
**Weekly:** storage usage; slow-query review; open defect list; notification-rule noise check.
**Monthly:** refresh materialised views after month close; review audit log for anomalous access;
dependency and security updates; capacity review.
**Quarterly:** restore drill into a clean environment; permission review (has anyone accumulated
access they no longer need?); performance regression run.

**Runbook contents (delivered as `docs/runbook.md`):** how to restore a backup · how to reset a
user's password · how to reopen a closed academic year · how to roll back an import · how to add a
new report template · what to do if storage is full · escalation contacts.

---

# 62. Backup, Retention and Disaster Recovery

`[SRS §62]` requires daily automatic database backup, weekly secondary backup, monthly long-term
archive, and a clear explanation of backup location, frequency, retention, and restoration.

| Layer | Frequency | Retention | Location |
|---|---|---|---|
| Database — automated snapshot | Daily | 7 days | Managed provider (Singapore region) |
| Database — logical dump (`pg_dump`) | Daily | 30 days | Separate object storage bucket |
| Database — secondary off-provider copy | Weekly | 12 weeks | Independent cloud/HOPE-controlled storage |
| Database — long-term archive | Monthly | 7 years | Cold storage, encrypted |
| File storage (photos, documents) | Weekly incremental | 12 months | Separate bucket |
| Configuration & migrations | Every commit | Forever | Git |

**Restoration procedure** (documented, drilled quarterly, and demonstrated at acceptance —
criterion #13 `[SRS §87]`):

1. Provision a clean database instance.
2. Restore the most recent verified dump.
3. Apply migrations to the current version if restoring an older dump.
4. Restore file storage for the same point in time.
5. Run the smoke-test script (login, read, write, report).
6. Record RTO/RPO achieved.

**Targets:** RPO ≤ 24 hours (≤ 1 hour if point-in-time recovery is enabled on a paid tier);
RTO ≤ 4 hours for full restore.

**Retention policy (recommended to HOPE for adoption):** operational data retained for the life of
the organisation's need; personal data of beneficiaries who have exited reviewed after 7 years;
photos of minors without consent purged annually; audit logs archived after 3 years; exports
purged from the `exports` bucket after 30 days.

**Point to raise with HOPE:** backup storage and cold archive are the ongoing costs most often
forgotten in NGO software budgets. They are small, but they must be budgeted explicitly `[SRS §93]`.

---

# 63. Security Operations

- **Access reviews** quarterly: every user, role, and project scope confirmed by the Super Admin.
- **Offboarding**: a documented checklist — deactivate user, revoke sessions, reassign owned
  records, retain audit history.
- **Incident response**: detect → contain → assess scope (which personal data) → notify HOPE
  management within 24 hours → remediate → written post-incident note. Given that the system holds
  data about minors, an incident is a governance matter, not just a technical one.
- **Key rotation**: API keys and service credentials rotated annually or immediately on suspicion.
- **Dependency hygiene**: automated vulnerability alerts; security patches applied within 14 days
  (24 hours for critical).

---

# 64. Training Deliverables

Covered operationally in §60.2. The deliverable artefacts are: user manual (English + Bangla
quick-reference), administrator manual, five screen-recorded tutorials, role-specific one-page
cards, and a training attendance record so HOPE knows who has been trained.

---

# 65. Documentation Deliverables

`[SRS §91]` — all seven are contractual deliverables:

| # | Document | Form |
|---|---|---|
| 1 | User Manual | Markdown + PDF, per module, screenshots |
| 2 | Administrator Manual | Configuration, master data, users, templates, backups |
| 3 | Database Documentation | ER diagram + data dictionary generated from the schema |
| 4 | API Documentation | OpenAPI spec + rendered reference for `/api/v1/*` |
| 5 | System Architecture Documentation | This blueprint's Parts B–D, maintained as `docs/architecture.md` |
| 6 | Backup / Restore Documentation | §62 + the drill log |
| 7 | Deployment Documentation | Environment setup, migration procedure, release process |

All documentation lives in the repository so it versions with the code. Documentation that lives
only in someone's inbox is documentation that is already wrong.

---

# 66. Source Code, Data Ownership and Handover

`[SRS §92]` requires these points to be settled **before** the development contract is signed. The
recommended positions:

| Question | Recommended position |
|---|---|
| Who owns the source code? | HOPE owns the delivered source, with a perpetual licence to modify. Developer retains rights to generic, non-HOPE-specific libraries |
| Who owns the database? | HOPE |
| Who owns uploaded organisational data? | HOPE, unconditionally |
| Where is the system hosted? | On accounts **owned by HOPE**, with the developer granted access — not the reverse |
| Can HOPE change developers later? | Yes. Guaranteed by: full source in a HOPE-owned Git repository, documented schema, standard open-source stack, no proprietary lock-in |
| Is source code delivered? | Yes, continuously, not as a one-time zip at the end |
| Third-party licences | All dependencies are permissively licensed open source; a licence inventory is delivered |
| After the maintenance period? | HOPE retains everything and may self-maintain or appoint another vendor |

**Practical handover package:** Git repository transfer, cloud account ownership transfer,
environment variable inventory, admin credential handover with forced rotation, and a two-hour
handover walkthrough recorded.

---

# 67. Hosting Proposal

`[SRS §93]` requires the developer to propose hosting options and state estimated monthly hosting
cost, backup cost, storage cost, security measures, server location, and recovery plan.

**Options** (detail in §4.6): managed cloud · single VPS · on-premise. **Recommended: managed
cloud** at launch — it gives automated backups, TLS, and high availability without HOPE employing
a sysadmin.

**Cost lines HOPE should budget** (quote live figures at contract time):

| Line | Notes |
|---|---|
| Application hosting | Free tier viable for pilot; paid tier for production traffic and no cold starts |
| Database | Grows with record count; the first paid tier covers years of HB-IMIS data |
| Object storage | Grows with photos — the fastest-growing line; see §43 |
| Backup / archive storage | Small but ongoing |
| Domain name | Annual; HOPE should own the registration |
| Error monitoring | Free tier sufficient initially |
| **Total** | Realistically low tens of USD per month at MVP scale |

**Server location:** nearest region (Singapore) for latency from Bangladesh. If HOPE or a donor
requires data residency in Bangladesh, that forces the VPS or on-premise option — this must be
established **before** Phase 1, because it changes the hosting architecture.

**Security measures:** TLS/HSTS, encryption at rest, private storage buckets with signed URLs,
RLS, least-privilege database roles, automated backups, audit logging, dependency scanning.

**HOPE retains administrative ownership and control of its organisational data** `[SRS §93]` —
all cloud accounts are registered to HOPE.

---

# 68. Maintenance and Support

`[SRS §94]` — to be defined in the contract. Recommended terms:

| Item | Recommendation |
|---|---|
| Warranty period | 3 months from go-live; defects in delivered scope fixed free |
| Bug fixing | Included in warranty and in any maintenance retainer |
| Response time | Critical (system down / data loss risk): 4 working hours. Major (module unusable): 1 working day. Minor: 5 working days |
| Resolution target | Critical: 1 working day. Major: 5 working days. Minor: next release |
| Maintenance fee | Annual retainer, typically a percentage of build cost, covering bug fixes, security updates, dependency upgrades, backup monitoring, and a defined support-hours allowance |
| Server maintenance | Included if HOPE uses the recommended managed hosting |
| Security updates | Included; critical patches within 24 hours |
| Backup monitoring | Included; monthly verification report to HOPE |
| Feature enhancements | Charged separately per §69 |

**Support channel:** a single named contact, an email/ticket address, and a published escalation
path. Support requests routed through individual WhatsApp messages disappear; insist on the ticket
address.

---

# 69. Change Request Management

`[SRS §95]` — every post-implementation request is classified before any work starts:

| Class | Definition | Handling |
|---|---|---|
| **Bug** | Existing approved functionality does not work as specified | Fixed under warranty/maintenance at no charge |
| **Minor change** | Small modification — a field, a label, a filter, a report column | Absorbed into the support-hours allowance, or quoted if it exceeds it |
| **Major enhancement** | New functionality requiring design and development | Written estimate of cost and time **before** work begins `[SRS §95]` |

**Process:** request logged → classified by the developer → HOPE agrees classification → for major
enhancements, a written estimate → sponsor approval → scheduled into a release.

**Why this matters:** the difference between "the attendance report should also show gender"
(minor) and "add a payroll module" (major) is obvious to everyone until money is involved. Writing
the classification down in advance is what keeps the relationship intact.

---

# 70. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | Requirements shift after the workshop | High | High | Fixed MVP scope line (§55); change control (§69); configurable master data absorbs most "new" requests |
| 2 | Existing Excel data is dirty (duplicates, missing DOB, inconsistent names) | **Very high** | High | Validation-first import (§59); HOPE owns the cleaning step; explicit reconciliation sign-off |
| 3 | Field staff don't adopt the system; data entry lags | High | **Critical** | Mobile-first attendance (3 taps); training + champions; completeness checklist makes gaps visible to managers |
| 4 | Six-month timeline proves optimistic for all 28 modules | High | Medium | Phase order is fixed, later phases float (§53); MVP ships at month 6 |
| 5 | Unreliable internet at project locations | Medium | High | Lightweight pages, local draft state, batched submission; offline sync deferred to Phase 6 `[SRS §59]` |
| 6 | RLS misconfiguration exposes data across projects | Medium | **Critical** | Defence in depth (§5.2); pgTAP suite in CI; negative E2E test; quarterly access review |
| 7 | Sensitive data about minors or health exposed | Low | **Critical** | Column sensitivity classes; read-auditing on health; consent gating on photos; anonymised staging data |
| 8 | Free-tier limits hit during UAT or after launch | Medium | Medium | Storage and DB monitoring (§61); paid-tier migration path documented; HOPE-owned accounts |
| 9 | Key-person dependency on a single developer | Medium | High | Everything in Git; documentation as a deliverable; standard stack; no bespoke frameworks |
| 10 | Scope creep into full double-entry accounting | Medium | High | Scope clarification in §40; integrate rather than rebuild `[SRS §74]` |
| 11 | Hosting/data-residency requirement discovered late | Low | High | Settle at the workshop (Appendix H) before Phase 1 architecture is fixed |
| 12 | Report formats change mid-project (donor or regulator) | Medium | Medium | Templates are data, not code (§34) |
| 13 | Storage cost growth from photos | Medium | Medium | Resize on upload, thumbnails, retention policy (§62) |
| 14 | Backup never actually tested | Low | **Critical** | Restore drill is an acceptance criterion (#13) and a quarterly operation |

---

# APPENDICES

## Appendix A — Identifier Formats

See §10.1. All IDs are generated by `lib/ids` against a `sequences` table under row lock. Format
strings are configuration, so HOPE can change a prefix without a code change — existing IDs are
never retrospectively altered.

## Appendix B — Status Values and State Machines

| Entity | States |
|---|---|
| Beneficiary | active · inactive · completed · transferred · dropped out · deceased · other |
| Student | active · completed · transferred · dropped out · graduated · other `[SRS §11]` |
| Trainee | enrolled · active · completed · dropped · failed · certified |
| Batch | planned · running · completed · cancelled |
| Project | planned · active · on-hold · closed |
| Attendance | present · absent · late · excused · holiday |
| Story | draft · review · approved · published `[SRS §32]` |
| Report | draft · submitted · returned for correction · reviewed · approved · final `[SRS §71]` |
| Expense / voucher | draft · submitted · recommended · approved · rejected · paid · closed `[SRS §51]` |
| Purchase request | draft · submitted · approved · quotation · compared · PO issued · delivered · billed · paid · closed `[SRS §42]` |
| Leave | applied · recommended · approved · rejected · cancelled `[SRS §39]` |
| Asset | in use · in store · under maintenance · transferred · disposed `[SRS §45, §47]` |
| Certificate | issued · superseded · revoked |
| Follow-up outcome | employed · self-employed · business started · job seeking · further training · not working `[SRS §27]` |

## Appendix C — Master Data to Seed at Launch

**Departments** `[SRS §5]`: Program · HR · Administration · Accounts & Finance

**Programme areas** `[SRS §5]`: Education · Co-Curricular · School Health · Technical/Vocational

**Co-curricular activities** `[SRS §14]`
Sports: Karate · Swimming · Football · Cricket
Leadership: KAB *(confirm name — see Appendix H)* · Scout
Arts/Culture: Drawing · Singing · Dancing
Music: Guitar · Tabla

**Vocational courses** `[SRS §18]`: Professional IT Support · RMG Machine Operator · Tailoring &
Dress Making · Block & Batik · Screen Printing · Diversified Jute Product Making · Hand Stitching ·
Food Processing

**Classes** `[SRS §11, §12]`: Class 1–5 (primary) · Class 6–10 (secondary), extensible

**Inventory categories** `[SRS §44]`: training materials · fabric · thread · jute · printing
materials · stationery · IT accessories · office supplies

**Asset categories** `[SRS §45]`: sewing machine · computer · printer · furniture · cutting
machine · other equipment

**Assessment types** `[SRS §25]`: written · practical · oral · assignment · final assessment

**Follow-up periods** `[SRS §27]`: 3 months · 6 months · 12 months

**Roles** `[SRS §6]`: the nine in §11

## Appendix D — Report Catalogue

All eighteen reports named in `[SRS §54]`, each built on the engine in §45, each accepting the
universal filter set, each exportable to PDF/Excel/CSV/Print `[SRS §53]`.

| # | Report | Key columns | Primary filters |
|---|---|---|---|
| 1 | Monthly Program Report | Section-wise aggregates + narrative + photos + stories | Month, project, programme |
| 2 | Monthly Project Report | Activities, targets, achievement, participants, cost | Month, project |
| 3 | Student Enrolment Report | Student, class, school, gender, age, admission date, status | Academic year, project, class, gender |
| 4 | Student Attendance Report | Student, sessions held, present, absent, attendance % | Month, class, project |
| 5 | Training Enrolment Report | Course, batch, trainee, gender, enrolment date | Course, batch, project, period |
| 6 | Training Completion Report | Batch, enrolled, completed, dropped, completion % | Course, project, period |
| 7 | Training Attendance Report | Trainee, classes, present, %, eligibility flag | Batch, course |
| 8 | Assessment Report | Trainee/student, components, total, grade, pass/fail | Batch, exam, course |
| 9 | Certificate Report | Certificate no., trainee, course, batch, issue date, status | Course, period |
| 10 | Employment Follow-up Report | Trainee, course, period, outcome, employer, income range | Course, follow-up period, project |
| 11 | Activity Report | Activity, sessions, participants, attendance, location | Activity, month, project |
| 12 | Beneficiary Demographic Report | Counts by age band, gender, location, programme | Project, period |
| 13 | Gender Report | Gender disaggregation across every programme | Project, programme, period |
| 14 | Project Indicator Report | Indicator, target, achieved, %, disaggregation | Project, period |
| 15 | Budget Utilisation Report | Budget head, approved, spent, balance, utilisation % | Project, fiscal year, budget head |
| 16 | Inventory Report | Item, opening, received, issued, adjustment, closing | Location, period, category |
| 17 | Asset Register | Asset ID, name, category, location, assigned, condition, value | Project, location, category |
| 18 | HR Report | Employee, designation, department, contract status, attendance, leave | Department, project, period |

## Appendix E — API Surface (illustrative)

```
POST   /api/v1/auth/session
GET    /api/v1/beneficiaries            ?project&location&gender&age_band&status&q&page
POST   /api/v1/beneficiaries
GET    /api/v1/beneficiaries/{id}/profile        # 360° aggregate
POST   /api/v1/beneficiaries/check-duplicate
GET    /api/v1/students | /trainees | /employees
POST   /api/v1/attendance/bulk                   # whole roster, one call
GET    /api/v1/attendance/summary       ?scope&period
POST   /api/v1/assessments/bulk
POST   /api/v1/certificates/issue                # batch-level, eligibility-checked
GET    /verify/{qr_token}                        # public, rate-limited, minimal payload
GET    /api/v1/indicators/{id}/achievement       ?period
POST   /api/v1/reports/generate                  # returns job id
GET    /api/v1/reports/{job}/download
POST   /api/v1/imports                           # returns validation report
GET    /api/v1/notifications
GET    /api/v1/audit                   ?entity&actor&from&to
```

Every endpoint: Zod-validated input, RLS-enforced output, capability-checked, audited on mutation.

## Appendix F — Screen Inventory (summary)

Approximately 95 screens across: auth (3) · dashboards (6) · organisation & master data (14) ·
beneficiary (5) · education (10) · co-curricular (6) · school health (4) · vocational (12) ·
assessment & certificates (6) · follow-up (3) · project monitoring & indicators (6) · media (4) ·
reporting (8) · HR (8) · administration & procurement (10) · inventory (4) · assets (5) ·
finance (9) · documents (2) · settings, users, audit (8).

This count is the basis for effort estimation. Roughly 60 of these screens fall inside the MVP.

## Appendix G — Data Validation Rules

Consolidated from `[SRS §64]` and extended:

1. Duplicate beneficiary IDs — blocked (unique index + pre-save check)
2. Duplicate employee IDs, course IDs, certificate numbers — blocked
3. Invalid dates — DOB not in future; end ≥ start; session date within batch window
4. Invalid phone numbers — BD mobile format validated
5. Negative stock without authorisation — blocked; override audited
6. Expense above approved budget without approval — blocked from routine approval path
7. Attendance for non-enrolled students — blocked
8. Marks outside 0..full marks — blocked
9. Assessment component weights not summing to 100 — blocked at configuration time
10. Certificate for a trainee below minimum attendance — blocked
11. Self-approval of own transaction — blocked unless explicitly permitted
12. Enrolment beyond batch capacity — blocked without override
13. Deactivating master data still in active use — blocked with usage count shown
14. Overlapping leave applications — blocked
15. Editing a finalised report or closed academic year — blocked without Super Admin reopen

## Appendix H — Open Questions for the Requirement Validation Workshop

`[SRS §102]` — these must be answered before Phase 1 design is frozen. Nothing here is a blocker
to starting; everything here is a blocker to guessing.

**Structure and naming**

1. Is the leadership activity **KAB** or **CAB**? The SRS uses both `[SRS §1 vs §14, §100]`.
2. Current list of active projects and locations, with coordinator names.
3. Exact department structure and reporting lines.
4. Which programmes run in which projects today?

**People and identity**

5. Confirm the Beneficiary ID format and the location codes to use (`MIR`, `JAM`, …).
6. Is there an existing beneficiary numbering scheme to preserve or map?
7. Are trainees always beneficiaries, or can an external trainee exist with no beneficiary record?
8. What guardian information is legally required, and what consent is already collected?

**Education**

9. Which classes does HOPE actually run, primary and secondary?
10. Grading scale and pass marks, per level.
11. Which exams are held, and on what calendar?
12. Standard list of dropout reasons.

**Vocational**

13. Minimum attendance percentage per course for certification.
14. Assessment component weights per course — is 30/50/20 universal or course-specific?
15. Who is the certificate issuing authority, and is a signature image required?
16. Is QR verification wanted in Version 1 (recommended) or deferred?

**Reporting**

17. Which authority receives regulatory reports, and in what format? Sample needed.
18. Which donors, with what indicators, periods, and templates? Samples needed.
19. Current monthly report template — a real recent example, not a blank form.
20. Who approves a monthly report, and in what order?

**HR, Admin, Finance**

21. Leave types, quotas, and carry-forward rules.
22. Approval thresholds by amount for purchase requests and expenses.
23. Minimum number of quotations required by policy.
24. Chart of budget heads and expense categories currently in use.
25. **Does HOPE need statutory accounting in HB-IMIS, or integration with an existing package?**
26. Existing asset register and inventory opening balances — in what form?

**Data and hosting**

27. Full inventory of existing Excel files and registers, with owners.
28. How much history must be migrated in detail versus summary?
29. Is there a data-residency requirement (data must stay in Bangladesh)?
30. Who will hold the cloud account ownership, and who is the named Super Administrator?

**Policy**

31. Photo consent process for minors — what exists today?
32. Data-protection policy — does one exist, or should this project draft one?
33. Retention: how long should beneficiary records be kept after exit?

---

# Closing Note

The objective, in the SRS's own words, is to move from *Paper + Excel + Separate Files* to *One
Integrated Digital System*, where information is entered once and reused across implementation,
monitoring, management, finance, reporting, donor communication, and organisational learning
`[SRS §104]`.

Three things decide whether that happens, and none of them is the choice of framework:

1. **The beneficiary anchor holds.** If duplicates creep in, every number HOPE reports becomes
   arguable. Sections 16, 10.2, and 59 exist to prevent that.
2. **Field staff can enter data in seconds, on a phone, on bad internet.** If attendance entry is
   painful, it will be done at month-end from memory, and the system becomes an expensive
   spreadsheet. Sections 5.5 and 42 exist to prevent that.
3. **Reports are generated, not typed.** The moment a number is hand-entered into a report, the
   system has failed at its actual job. Sections 31, 32, and 45 exist to prevent that.

Build those three well, and the remaining 25 modules are ordinary work.

*— End of Master Implementation & Technical Blueprint, Version 2.0*
