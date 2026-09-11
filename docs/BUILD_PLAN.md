# HB-IMIS — Build Plan for Claude Code

**What this is:** the operating manual for building HB-IMIS with Claude Code. It tells you and
Claude *how* to work: session structure, what to load into context, how each task is verified, and
the order everything gets built in.

**What this is not:** the requirements. Those live in `docs/SPEC.md` (47 pages, traceable to the
client's SRS §1–104). This document never restates a requirement — it points at the section.

**The three documents and their jobs**

| File | Job | Read by |
|---|---|---|
| `CLAUDE.md` | Facts Claude needs in every session: stack, commands, rules, conventions | Loaded automatically, every session |
| `docs/SPEC.md` | What to build, in detail | On demand, one section at a time |
| `docs/BUILD_PLAN.md` | How to build it: sessions, order, verification | You, and Claude at phase boundaries |
| `docs/TASKS.md` | The ledger: what is done, what is next | Every session, via `/next-task` |

---

## 1. Day 0 — Bootstrap

Do this once, in order. Steps 1–4 are yours; Claude takes over from step 5.

### 1.1 Install and verify

```bash
# install Claude Code (see https://code.claude.com/docs/en/setup for current instructions)
claude --version
claude doctor          # checks install, auth, and config health
```

### 1.2 Create the repo and drop in the config bundle

```bash
mkdir hb-imis && cd hb-imis && git init
# copy in: CLAUDE.md, docs/, .claude/
git add -A && git commit -m "chore: project charter, spec, and Claude Code config"
```

The bundle gives you:

```
CLAUDE.md                      project memory, loaded every session
docs/SPEC.md                   the requirements
docs/BUILD_PLAN.md             this file
docs/TASKS.md                  the task ledger
.claude/settings.json          permissions + format-on-edit hook
.claude/rules/database.md      loads when Claude touches db/
.claude/rules/security.md      loads when Claude touches policies, permissions, or api/
.claude/rules/ui.md            loads when Claude touches .tsx files
.claude/rules/api.md           loads when Claude touches handlers
.claude/rules/testing.md       loads when Claude touches tests
.claude/skills/next-task/      /next-task   — run the next ledger item
.claude/skills/new-table/      /new-table   — table end-to-end, nothing skipped
.claude/skills/new-module/     /new-module  — module from its spec section
.claude/skills/phase-gate/     /phase-gate  — phase exit review
.claude/skills/spec-lookup/    /spec-lookup — pull the right spec section into context
.claude/agents/rls-auditor.md  adversarial authorization reviewer
.claude/agents/spec-auditor.md spec-conformance reviewer
```

**Why rules are separate from CLAUDE.md.** CLAUDE.md loads in full on every session and should stay
under ~200 lines — long files get followed less reliably and cost context on every turn. The
`.claude/rules/` files carry a `paths:` frontmatter, so the database rules only enter context when
Claude opens something under `db/`. That keeps the always-on memory small and the specific guidance
close to the work.

### 1.3 Free accounts to create first

All on free tiers, per the project constraint: GitHub · Supabase (a project for dev, a second for
UAT) · Cloudflare Pages or Netlify for previews · Sentry. Put every key in `.env.local`, which is
gitignored and denied to Claude in `.claude/settings.json`.

### 1.4 Run `/init` once, then fix it

```bash
claude
> /init
```

`/init` inspects the repo and proposes improvements to the existing `CLAUDE.md`. Take anything it
finds that is genuinely derived from the code (real scripts, real paths) and **discard** anything
that duplicates `docs/SPEC.md`. CLAUDE.md is for facts Claude cannot derive from the code; the spec
is for requirements.

### 1.5 First real session — scaffold

```
> I'm starting HB-IMIS from an empty repo. Read CLAUDE.md and docs/TASKS.md.
> Do task P0-01 through P0-05 only: scaffold the Next.js app with TypeScript strict,
> Tailwind, shadcn/ui, Drizzle, Supabase local, Vitest, Playwright, and the pnpm scripts
> listed in CLAUDE.md. Plan first.
```

Stop when `pnpm typecheck && pnpm test` runs green on an empty project. That is the moment the
whole rest of the plan becomes verifiable.

---

## 2. The session loop

One task per session, four phases. This is the single highest-leverage habit in the whole build.

```
 EXPLORE  →  PLAN  →  IMPLEMENT  →  VERIFY  →  /clear
```

**Explore.** `/spec-lookup <topic>` pulls only the relevant spec section into context. Ask Claude
to read the existing code it will touch. Do not let it start writing during this phase.

**Plan.** Switch to plan mode (Shift+Tab cycles permission modes) for anything touching schema,
permissions, approval workflows, or money. Read the plan properly — this is where a wrong data
model gets caught for the price of thirty seconds, instead of three days later.

**Implement.** Let it work. Interrupt early if it drifts; a course correction at 20% costs far
less than a rewrite at 100%.

**Verify.** `pnpm typecheck && pnpm lint && pnpm test && pnpm test:rls`. Then the task's own
Done-when line from the spec. Claude marks the ledger.

**Clear.** `/clear` before the next task. A fresh context on a new task beats a stale context every
time, and the ledger plus CLAUDE.md carry everything that needed carrying.

### Give Claude a way to verify its own work

This is the difference between an agent that converges and one that plausibly wanders. For this
project the verification surfaces are:

| Kind of work | How Claude checks itself |
|---|---|
| Schema | `pnpm db:migrate` against a clean local Supabase |
| Authorization | `pnpm test:rls` — pgTAP, includes denial cases |
| Business rules | `pnpm test` — unit tests written from the spec's Rules list |
| Screens | `pnpm test:e2e`, desktop and 375px viewports |
| Types | `pnpm typecheck` |
| A module as a whole | The spec section's **Done-when** line |

Write the test before or alongside the code, not after the fact as a formality. For anything with a
computed value — attendance %, stock balance, weighted assessment, budget utilisation — hand Claude
a small table of worked examples and let it make them pass.

---

## 3. Context discipline

The context window is the real budget on a project this size. Four mechanisms, used for different
things:

| Mechanism | Loads | Use for |
|---|---|---|
| `CLAUDE.md` | Every session, always | Stack, commands, the eight non-negotiable rules, layout |
| `.claude/rules/*.md` with `paths:` | When Claude opens a matching file | Detailed conventions per area |
| Skills (`/new-table`, `/new-module`) | Only when invoked | Multi-step procedures |
| Subagents | Separate context, returns a summary | Investigation, review, anything high-volume |

**Rules of thumb**

- If you find yourself typing the same correction twice, it belongs in `CLAUDE.md` or a rule file.
- If it is a procedure rather than a fact, it belongs in a skill.
- If it is 40 pages of requirements, it belongs in `docs/SPEC.md` and gets pulled in one section at
  a time via `/spec-lookup`. Never paste the whole spec into a prompt.
- Watch `/context`. When the session is mostly old file reads, `/clear` and restart the task with
  what you learned.
- `/compact` preserves a summary but loses detail. Prefer finishing the task and clearing.

**Subagents earn their keep here.** Use them for:

- *Investigation*: "use the Explore agent to find everywhere `attendance` is queried" — the search
  noise stays out of your main context.
- *Review*: `@rls-auditor` after any policy change, `@spec-auditor` at the end of a module. Both
  are read-only and adversarial by design; a reviewer that shares the implementer's context shares
  the implementer's blind spots.
- *Parallel work*: git worktrees let two sessions run on separate branches without stepping on each
  other. Sensible pairs: education module and vocational module; reporting engine and HR. Never
  parallelise two tasks that both change the schema.

---

## 4. Prompting patterns for this project

**Weak → strong**

| Weak | Strong |
|---|---|
| "Build the beneficiary module" | "`/new-module 16`. Read the spec section fully, including the duplicate-detection rules in §10.2, before planning." |
| "Add attendance" | "Implement the attendance engine per §42. It is polymorphic across class, activity_session, training_session, employee_day — one table, not four. Start with the schema and the percentage unit tests." |
| "Make it secure" | "`@rls-auditor` — review the policies added in this branch for scope bypass and confidential-column leakage." |
| "Fix the report" | "The Training Completion Report (Appendix D #6) returns rows from other projects for a scoped coordinator. Write a failing pgTAP test first, then fix." |
| "Also add HR while you're at it" | (don't — one task per session) |

**Always include**: the spec section number, the verification command, and whether you want plan
mode. **Never include**: "use best practices", "make it production-ready", or a second unrelated
task.

**Course-correct early.** If the plan names four files and you expected two, stop it there. If it
starts inventing a business rule the spec did not specify, stop it and check Appendix H — the
answer may genuinely not exist yet, and inventing one creates rework when the client answers.

**When it goes wrong**: `/rewind` restores files to an earlier checkpoint. For anything a background
subagent wrote, use git instead — those edits sit outside session checkpoints. Commit often enough
that `git reset` is always an option.

---

## 5. Git and release discipline

- One branch per task: `feat/p2-14-attendance-engine`. Squash-merge to `main`.
- Commit at every green verification, not at the end of a session.
- `main` deploys to the UAT environment. Tagged releases deploy to production, after `/phase-gate`.
- Every PR gets `@rls-auditor` if it touches policies and `@spec-auditor` if it closes a module
  task. The bundled `/code-review` skill is a useful third pass before merge.
- Never commit `.env.local`, a service-role key, or real beneficiary data. If one lands in a
  commit, treat the key as compromised and rotate it — rewriting history is not enough.

---

## 6. Build sequence

Six phases, following `docs/SPEC.md` §54. Each phase below lists its sessions, the spec sections
they draw on, and the gate that closes the phase. Task ids match `docs/TASKS.md`.

### Phase 0 — Foundation setup (P0)

| Session | Work | Spec | Verify |
|---|---|---|---|
| P0-01..05 | Scaffold: Next.js + TS strict, Tailwind, shadcn/ui, Drizzle, Supabase local, Vitest, Playwright, pnpm scripts, CI workflow | §4, §7 | `pnpm typecheck && pnpm test` green |
| P0-06 | Base layout, theme, shared `DataTable`, form primitives | §5.5, ui rules | Storybook-free visual check at 375px and 1440px |
| P0-07 | `lib/format` (dates, currency, numbers) + `next-intl` scaffold with `en`/`bn` | §47 | Unit tests for BDT and date formatting |
| P0-08 | `lib/ids` sequence generator | §10.1 | Concurrency test: 100 parallel inserts, no collisions |
| P0-09 | Audit framework: `audit_logs` table, generic trigger, `withAudit()` | §46 | Trigger test showing old/new values |

**Gate:** an empty but correct skeleton. Do not skip P0-08 and P0-09 — retrofitting IDs and audit
across 40 tables later is the most expensive mistake available in this project.

### Phase 1 — Identity, structure, and the beneficiary anchor (P1)

| Session | Work | Spec |
|---|---|---|
| P1-01 | `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `user_project_scopes` | §9.8, §11 |
| P1-02 | Supabase Auth wiring, session context, JWT claims (`caps`, `project_ids`, `org_wide`) | §13.2 |
| P1-03 | `lib/permissions` guard layer + capability catalogue seed | §12 |
| P1-04 | RLS helper functions and the canonical policy pattern | §13.3 |
| P1-05 | pgTAP harness + the eight baseline denial tests | §13.5 |
| P1-06 | Organisation, departments, projects, locations, donors | §14 |
| P1-07 | Master data engine: generic CRUD screens for all ~25 lists | §15 |
| P1-08 | **`beneficiaries` + `guardians`** with duplicate detection | §16, §10.2 |
| P1-09 | Beneficiary 360° profile shell with permission-filtered tabs | §17 |
| P1-10 | Global search (tsvector + trigram), permission-filtered | §48 |
| P1-11 | Dashboard shell, role routing, quick actions | §35.1 |

**Gate (`/phase-gate 1`):** a Super Admin creates a project, location, and coordinator; the
coordinator logs in and sees only that project; a beneficiary is created, deduplicated, found by
search, and opened in a 360° view. Acceptance criteria #1, #2, #3 pass.

This phase is the one to slow down on. Everything else attaches to it.

### Phase 2 — Programme delivery (P2)

| Session | Work | Spec |
|---|---|---|
| P2-01 | Academic years, classes, subjects, schools, teacher assignments | §19 |
| P2-02 | Primary education: students, enrolment, status, dropout reasons | §18 |
| P2-03 | Secondary education: GPA, grading scales, continuation | §20 |
| P2-04 | Roll-forward / promotion wizard | §19 |
| P2-05 | **Attendance engine** (polymorphic) + percentage computation | §42 |
| P2-06 | Attendance entry UI, mobile-first, one-request roster submit | §42, §5.5 |
| P2-07 | Co-curricular activities, enrolment, sessions | §21 |
| P2-08 | School health, restricted records, read-auditing | §22 |
| P2-09 | Courses and batches | §24 |
| P2-10 | Trainees and trainers | §25.1, §25.2 |
| P2-11 | Training schedule with conflict detection | §25.4 |
| P2-12 | **Assessment engine**, configurable weights, snapshotting | §28, §44 |
| P2-13 | Exams and results for education | §18, §20 |
| P2-14 | Certificates: eligibility gate, PDF, QR token | §26 |
| P2-15 | Public `/verify/<token>` page, rate limited, minimal payload | §26 |
| P2-16 | Employment follow-up + auto-scheduled 3/6/12-month tasks | §27 |

**Gate (`/phase-gate 2`):** one beneficiary appears in education, two co-curricular activities, and
a health screening from a single record. An ineligible trainee cannot be certified; an eligible one
verifies by QR. Acceptance criteria #4–#9 pass.

### Phase 3 — Reporting, monitoring, media (P3)

| Session | Work | Spec |
|---|---|---|
| P3-01 | Reporting engine: filter grammar, query builder | §45 |
| P3-02 | Renderers: PDF (Bangla Unicode font embedded), Excel, CSV | §45, §47 |
| P3-03 | Reports 1–9 of Appendix D | Appendix D |
| P3-04 | Reports 10–18 of Appendix D | Appendix D |
| P3-05 | Background export jobs + download links | §45.3 |
| P3-06 | Project activities register | §23 |
| P3-07 | Indicators, targets, achievement computation | §32 |
| P3-08 | Photo library: upload, resize, EXIF strip, consent gating | §29, §43 |
| P3-09 | Stories with draft→review→approved→published workflow | §30 |
| P3-10 | Monthly report production + completeness checklist | §31 |
| P3-11 | Report lifecycle state machine and lock-after-final | §31.3 |
| P3-12 | Configurable donor/regulatory templates (JSON sections) | §34 |
| P3-13 | Dashboards: programme, management, drill-down, charts | §35 |

**Gate (`/phase-gate 3`):** last month's report generates entirely from operational data, exports to
PDF with Bangla rendering correctly, and management drill-down reaches an individual trainee.
Acceptance criteria #10–#12 pass.

**→ This is the MVP boundary (`docs/SPEC.md` §55).** Stop here, migrate data, run UAT, and go live
before starting Phase 4. Shipping something the client uses beats carrying four more half-built
modules.

### Phase 4 — Administration and HR (P4)

Employees · HR attendance · leave workflow · appraisals · administrative requests · vendors ·
procurement's nine stages · inventory ledger · assets with transfer, maintenance, disposal ·
document management with versioning · admin and HR dashboards. Spec §36–§39, §41.

**Gate:** a purchase request completes all nine stages and automatically produces an asset record
and an inventory receipt; a leave application updates the balance without manual arithmetic.

### Phase 5 — Finance (P5)

Fiscal years · budget heads · budgets bound to project/programme/activity · expenses with
mandatory supporting documents · the approval state machine · vouchers, payments, advances,
income · budget alerts · accounts dashboard. Spec §40.

**Gate:** an expense exceeding its budget head is blocked from routine approval; budget utilisation
reconciles with the expense register exactly.

### Phase 6 — Advanced (P6, conditional)

Offline sync, mobile app, AI drafting scaffolding, external integrations, biometric HR attendance.
Spec §6.2, §54. Do not commit to any of this until Phases 1–5 are in production and stable.

### Cross-phase tracks

These run alongside and are in the ledger as `X-` tasks: data migration (§59), UAT scenario pack
(§60.1), training materials (§60.2), documentation deliverables (§65), backup and restore drill
(§62).

---

## 7. The tasks ledger

`docs/TASKS.md` is the source of truth for progress. Rules:

- Claude ticks a box only after the verification passes, and writes one line saying what was built.
- Add a task rather than expanding an existing one. A task that grew a second goal should have been
  two tasks.
- Blocked tasks get a `⛔` and a one-line reason, usually a pointer to an Appendix H question.
- Review the ledger yourself weekly. If Claude ticked something you would not have, that is
  information about your prompts, not just about the code.

---

## 8. Anti-patterns specific to this build

Watch for these; they are the ways this particular project goes wrong.

1. **A TypeScript union where a table belongs.** `type Course = 'tailoring' | 'jute' | ...` looks
   tidy and breaks the client's core requirement that new courses need no developer. Any list HOPE
   might extend is a table.
2. **A second copy of a person.** A trainee row with its own `name` and `dob` columns. Every
   duplicate person corrupts every beneficiary count in every donor report, permanently.
3. **A stored balance.** Stock, attendance percentage, budget remaining. Derive them; store only
   the ledger.
4. **A permission check only in the UI.** Hiding a button is not authorization. If there is no RLS
   policy and no pgTAP test, it is not done.
5. **A report that runs with elevated rights** so the numbers "look right" for a coordinator.
6. **Attendance entry that posts one request per student.** It will be used on 3G by a trainer with
   35 people in front of them.
7. **Hard-coded `dd/MM/yyyy` or `৳`.** The client explicitly requires configurable formatting.
8. **Health data leaking into a generic export or the global search index.**
9. **Building Phase 4 and 5 before Phase 3 is in the client's hands.**
10. **Inventing a business rule the client has not answered.** Appendix H exists precisely so these
    get asked rather than assumed.

---

## 9. Handover

The client contract requires source, documentation, and account ownership to end up with HOPE
(`docs/SPEC.md` §65–§66). Two implications for how you work:

- Documentation is generated from the repo as you go, not written in the last week. `docs/` holds
  the user manual, admin manual, data dictionary, API reference, runbook, and deployment guide.
  Add to them in the same task that adds the feature.
- Cloud accounts (Supabase, hosting, domain) should be registered to HOPE from the start, with you
  granted access. Migrating accounts at handover is painful; starting them in the right place is
  free.

Before handover, run a fresh-clone test: clone the repo into a clean directory, follow the
deployment doc exactly, and confirm the system comes up. If it does not, the documentation is
wrong, not the reader.
