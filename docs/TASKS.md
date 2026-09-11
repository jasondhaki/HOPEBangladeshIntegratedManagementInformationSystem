# HB-IMIS Task Ledger

Source of truth for build progress. Invoke `/next-task` to work the first unchecked item.

**Conventions**

- `- [ ]` not started · `- [x]` done and verified · `⛔` blocked, with the reason on the same line
- Every task names its spec section. Read that section before implementing — `/spec-lookup <n>`.
- Tick a box only after `pnpm typecheck && pnpm lint && pnpm test && pnpm test:rls` passes **and**
  the spec section's Done-when line holds. Add one indented line under the task saying what was
  built and where it lives.
- Blocked on an unanswered client question? Mark `⛔` and point at the Appendix H item. Do not
  invent the rule.

---

## Phase 0 — Foundation setup

- [x] **P0-01** Scaffold Next.js App Router + TypeScript strict + pnpm · SPEC §4
  - Built: `package.json` (pnpm scripts `dev`/`build`/`start`/`lint`/`typecheck`), `tsconfig.json`
    (strict), `next.config.ts`, `eslint.config.mjs`, `app/layout.tsx`, `app/page.tsx`,
    `app/globals.css`. Next.js pinned to 15.x and ESLint to 9.x (not the just-released 16.x/10.x
    latest) to match SPEC §4.1's version targets and `eslint-config-next`'s peer range.
    `pnpm typecheck && pnpm lint && pnpm build` all green; root page verified rendering via
    `pnpm dev`. Test harness (`pnpm test` / `test:rls`) intentionally not wired yet — that's P0-04.
- [ ] **P0-02** Tailwind + shadcn/ui + base theme tokens · SPEC §4
- [ ] **P0-03** Drizzle + local Supabase stack + `db:generate` / `db:migrate` / `db:seed` scripts · SPEC §4.4
- [ ] **P0-04** Vitest + Playwright + pgTAP harness wired to pnpm scripts · SPEC §57
- [ ] **P0-05** GitHub Actions CI: typecheck → lint → unit → migration dry-run → RLS → build · SPEC §7
- [ ] **P0-06** App shell, navigation, shared `DataTable`, form primitives · SPEC §5.5
- [ ] **P0-07** `lib/format` (date, currency, number) + `next-intl` scaffold with `en`/`bn` · SPEC §47
- [ ] **P0-08** `lib/ids` sequence generator with `SELECT … FOR UPDATE` · SPEC §10.1
- [ ] **P0-09** `audit_logs` table, generic audit trigger, `withAudit()` wrapper · SPEC §46

---

## Phase 1 — Identity, structure, beneficiary anchor

- [ ] **P1-01** `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `user_project_scopes` · SPEC §9.8
- [ ] **P1-02** Supabase Auth, session context, JWT claims (`caps`, `project_ids`, `org_wide`) · SPEC §13.2
- [ ] **P1-03** `lib/permissions` guard layer + capability catalogue seeded from the §12 matrix · SPEC §12
- [ ] **P1-04** RLS helper functions + canonical policy pattern applied to existing tables · SPEC §13.3
- [ ] **P1-05** pgTAP harness + the eight baseline denial tests · SPEC §13.5
- [ ] **P1-06** Organisation, departments, projects, locations, donors · SPEC §14
- [ ] **P1-07** Master data engine: generic CRUD for all lists, deactivate-not-delete, usage counts · SPEC §15
- [ ] **P1-08** `beneficiaries` + `guardians` + duplicate detection (exact / trigram / weak) · SPEC §16, §10.2
- [ ] **P1-09** Beneficiary 360° profile with permission-filtered tabs and timeline · SPEC §17
- [ ] **P1-10** Global search: tsvector + trigram, permission-filtered in the query · SPEC §48
- [ ] **P1-11** Dashboard shell, role routing, quick actions · SPEC §35.1
- [ ] **P1-GATE** `/phase-gate 1` — acceptance criteria #1, #2, #3 · SPEC §54, §58

---

## Phase 2 — Programme delivery

- [ ] **P2-01** Academic years, classes, subjects, schools, teacher assignments · SPEC §19
- [ ] **P2-02** Primary education: students, enrolment, status, dropout reasons · SPEC §18
- [ ] **P2-03** Secondary education: grading scales, GPA, school continuation · SPEC §20
- [ ] **P2-04** Roll-forward / promotion wizard, prior years read-only · SPEC §19
- [ ] **P2-05** Attendance engine: polymorphic table, percentage + eligibility computation · SPEC §42
- [ ] **P2-06** Attendance entry UI: mobile-first, default-present, one-request roster submit · SPEC §42, §5.5
- [ ] **P2-07** Co-curricular activities, enrolment, sessions, session photos · SPEC §21
- [ ] **P2-08** School health: activities, restricted records, read-auditing · SPEC §22
- [ ] **P2-09** Course master + training batches, capacity and completion guards · SPEC §24
- [ ] **P2-10** Trainees (linked to beneficiaries) and trainers · SPEC §25.1, §25.2
- [ ] **P2-11** Training schedule, calendar, conflict detection · SPEC §25.4
- [ ] **P2-12** Assessment engine: configurable components, auto attendance component, snapshotting · SPEC §28, §44
- [ ] **P2-13** Exams and results for education, publication gate · SPEC §18, §20
- [ ] **P2-14** Certificates: eligibility trigger, numbering, PDF, QR token · SPEC §26
- [ ] **P2-15** Public `/verify/<token>` page — rate limited, minimal payload, revocation aware · SPEC §26
- [ ] **P2-16** Employment follow-up + auto-scheduled 3/6/12-month tasks · SPEC §27
- [ ] **P2-GATE** `/phase-gate 2` — acceptance criteria #4–#9 · SPEC §54, §58

---

## Phase 3 — Reporting, monitoring, media (MVP boundary)

- [ ] **P3-01** Reporting engine: universal filter grammar + query builder under RLS · SPEC §45
- [ ] **P3-02** Renderers: PDF with embedded Bangla Unicode font, Excel, CSV · SPEC §45, §47
- [ ] **P3-03** Appendix D reports 1–9 · SPEC Appendix D
- [ ] **P3-04** Appendix D reports 10–18 · SPEC Appendix D
- [ ] **P3-05** Background export jobs + download links + export logging · SPEC §45.3, §50.2
- [ ] **P3-06** Project activities register, target vs achievement · SPEC §23
- [ ] **P3-07** Indicators, targets, achievement computation, disaggregation · SPEC §32
- [ ] **P3-08** Photo library: upload, resize, EXIF strip, consent gating, thumbnails · SPEC §29, §43
- [ ] **P3-09** Stories: draft → review → approved → published, consent required · SPEC §30
- [ ] **P3-10** Monthly report production + data-completeness checklist · SPEC §31
- [ ] **P3-11** Report lifecycle state machine, lock after final, audited reopen · SPEC §31.3
- [ ] **P3-12** Configurable donor and regulatory templates (JSON sections) · SPEC §34
- [ ] **P3-13** Dashboards: programme + management, drill-down, charts, materialised views · SPEC §35
- [ ] **P3-GATE** `/phase-gate 3` — acceptance criteria #10–#12; **MVP complete** · SPEC §55, §58

---

## Phase 4 — Administration and HR

- [ ] **P4-01** Employees, designations, employee documents with expiry · SPEC §36.1
- [ ] **P4-02** HR attendance: manual, monthly bulk, biometric-import contract · SPEC §36.2
- [ ] **P4-03** Leave types, applications, recommendation → approval, balances · SPEC §36.3
- [ ] **P4-04** Performance appraisals · SPEC §36.4
- [ ] **P4-05** Vendors with confidential financial fields · SPEC §37.5
- [ ] **P4-06** Purchase requests + approval thresholds (`approval_levels`) · SPEC §37.2, §37.3
- [ ] **P4-07** Quotations, comparative statement, purchase approval, PO · SPEC §37.2
- [ ] **P4-08** Goods receipt → auto inventory transaction / auto asset draft · SPEC §37.2
- [ ] **P4-09** Inventory ledger, derived balances, negative-stock guard, reorder alerts · SPEC §38
- [ ] **P4-10** Assets: register, transfer, maintenance, disposal, QR tags · SPEC §39
- [ ] **P4-11** Document management: versioning, access levels, signed URLs, expiry alerts · SPEC §41
- [ ] **P4-12** Administrative requests (generic lifecycle) · SPEC §37.4
- [ ] **P4-13** Admin and HR dashboards · SPEC §35.2
- [ ] **P4-GATE** `/phase-gate 4` · SPEC §54

---

## Phase 5 — Finance

- [ ] **P5-01** Fiscal years, budget heads, bank accounts · SPEC §40
- [ ] **P5-02** Budgets bound to project → programme → activity → budget head · SPEC §40.1
- [ ] **P5-03** Expenses with mandatory supporting documents above threshold · SPEC §40.2
- [ ] **P5-04** Approval state machine + self-approval block · SPEC §40.3, §51
- [ ] **P5-05** Vouchers, payments, advances with adjustment and ageing · SPEC §40.4
- [ ] **P5-06** Income / donor receipts · SPEC §40.4
- [ ] **P5-07** Budget threshold alerts (80/95/100%) via notification rules · SPEC §40.1, §49
- [ ] **P5-08** Accounts dashboard + financial reports · SPEC §35.2, Appendix D #15
- [ ] **P5-GATE** `/phase-gate 5` · SPEC §54

---

## Phase 6 — Advanced (conditional — do not start before Phases 1–5 are live)

- [ ] **P6-01** Notification channel adapters (email / SMS / WhatsApp) · SPEC §49, §6.3
- [ ] **P6-02** Offline data entry and sync · SPEC §54
- [ ] **P6-03** AI staging tables, read-only `ai_query` role, human-approval gate · SPEC §6.2
- [ ] **P6-04** External API integrations · SPEC §6.1
- [ ] **P6-05** Mobile application · SPEC §54

---

## Cross-phase tracks

- [ ] **X-01** Notification engine core: rules table, `pg_cron` evaluation, in-app centre · SPEC §49
- [ ] **X-02** Import templates + validation + duplicate preview + 24h rollback · SPEC §50.1
- [ ] **X-03** Data migration: source inventory, field mapping, trial imports · SPEC §59
- [ ] **X-04** Data migration: production import + reconciliation sign-off · SPEC §59.4
- [ ] **X-05** Backup, retention, and a demonstrated restore drill (acceptance #13) · SPEC §62
- [ ] **X-06** Security test pass: direct object reference, privilege escalation, export bypass, rate limits · SPEC §57
- [ ] **X-07** Performance pass: 50k beneficiaries / 1M attendance rows seeded, targets met · SPEC §51.1
- [ ] **X-08** UAT scenario pack and defect triage · SPEC §60.1
- [ ] **X-09** Training materials: manuals, role cards (en + bn), five screen recordings · SPEC §60.2
- [ ] **X-10** Documentation deliverables 1–7 · SPEC §65
- [ ] **X-11** Go-live cutover, hypercare, parallel monthly report reconciliation · SPEC §60.3

---

## Blocked on client answers

Nothing may be invented here. Each links to `docs/SPEC.md` Appendix H.

- ⛔ Activity name **KAB vs CAB** — blocks master data seed (P1-07) · Appendix H #1
- ⛔ Beneficiary ID location codes and any existing numbering to preserve — blocks P1-08 · Appendix H #5, #6
- ⛔ Grading scale and pass marks per level — blocks P2-03 · Appendix H #10
- ⛔ Minimum attendance % per course and assessment weights — blocks P2-12, P2-14 · Appendix H #13, #14
- ⛔ Regulatory and donor report formats (real samples needed) — blocks P3-12 · Appendix H #17, #18, #19
- ⛔ Approval thresholds and minimum quotation count — blocks P4-06 · Appendix H #22, #23
- ⛔ Whether statutory accounting is in scope or integrated — blocks all of Phase 5 · Appendix H #25
- ⛔ Data residency requirement — blocks production hosting choice · Appendix H #29
