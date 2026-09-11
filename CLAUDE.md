# HB-IMIS

Integrated Management Information System for HOPE Worldwide Bangladesh. NGO platform covering
beneficiaries, education, co-curricular activities, school health, vocational training, HR,
administration, procurement, inventory, assets, finance, and reporting.

Full specification: `docs/SPEC.md`. Build sequence and task ledger: `docs/BUILD_PLAN.md` and
`docs/TASKS.md`. Read the relevant SPEC section before implementing a module — do not invent
requirements.

## Stack

TypeScript (strict) · Next.js App Router · React · Tailwind + shadcn/ui · Supabase (PostgreSQL,
Auth, Storage) · Drizzle ORM for schema and migrations · Zod for validation · React Hook Form ·
TanStack Table · Recharts · next-intl · Vitest · Playwright · pgTAP.

## Commands

```bash
pnpm dev              # dev server
pnpm build            # production build
pnpm typecheck        # tsc --noEmit
pnpm lint
pnpm test             # vitest unit tests
pnpm test:rls         # pgTAP row-level-security policy tests
pnpm test:e2e         # playwright
pnpm db:generate      # generate migration from schema changes
pnpm db:migrate       # apply migrations
pnpm db:seed          # seed master data
pnpm supabase start   # local Supabase stack
```

Run `pnpm typecheck && pnpm test && pnpm test:rls` before saying a task is complete.

## Non-negotiable rules

1. **One central database.** `project_id` is a column, never a separate schema or database.
   Cross-project reporting depends on this.
2. **Beneficiary is the anchor.** Students, trainees, activity participants, and health subjects
   reference `beneficiaries`. Never copy personal fields (name, DOB, guardian, address) into
   another table.
3. **Master data is data.** Courses, activities, classes, budget heads, dropout reasons, and
   every other list live in database tables with CRUD screens. Never hard-code them as TypeScript
   enums or literal unions.
4. **RLS on every table.** Authorization is enforced in Postgres, not only in the UI. A new table
   without a policy and a passing pgTAP test is an incomplete task.
5. **Audit critical mutations.** Beneficiaries, students, trainees, attendance, assessments,
   certificates, employees, all finance and procurement tables: the audit row is written in the
   same transaction as the change.
6. **Soft delete only.** `deleted_at` on every table. No `DELETE` statements against financial,
   administrative, or beneficiary records.
7. **Derived values are computed, never entered.** Attendance %, totals, grades, stock balances,
   budget utilisation, indicator achievement.
8. **Free tier only.** Every service used must be on a free plan. No paid hosting, no paid
   domains, no paid APIs. Flag it rather than assuming a paid tier is acceptable.

## Layout

```
app/(auth)/           app/(app)/<module>/       app/api/v1/<resource>/
components/{ui,forms,tables,charts,layout}
lib/{auth,permissions,db,validation,export,import,i18n,ids,audit,format}
db/{schema,migrations,seeds,policies}
tests/{unit,e2e,rls}
docs/
```

## Conventions

- Tables: `snake_case`, plural. Every table has `id uuid`, `created_at`, `updated_at`,
  `created_by`, `updated_by`, `deleted_at`, and `project_id` where the record is project-scoped.
- Human-readable IDs live in a separate `code` column and are generated only by `lib/ids`, using
  the `sequences` table under `SELECT ... FOR UPDATE`. Never `MAX(code)+1`.
- One Zod schema per entity in `lib/validation`, used by both the form and the server handler.
  Client validation is never trusted on its own.
- Money is `numeric(14,2)`. Dates are `date` for calendar facts, `timestamptz` for events.
  Timezone is `Asia/Dhaka`.
- No hard-coded date formats, currency symbols, or user-facing strings. Formatting goes through
  `lib/format`; strings go through `next-intl` message catalogues (`en`, `bn`).
- List screens use the shared `DataTable`; mutations go through the `withAudit()` wrapper.

## Definition of done

A task is done when: migration committed · RLS policy written and pgTAP test passing · Zod schema
shared between form and handler · audit trigger attached if the table is critical · mobile layout
verified at 375px · unit test for business rules · strings in message catalogues · typecheck,
lint, and tests green.

## Working style

- Read `docs/TASKS.md`, pick the next unchecked task, and mark it `[x]` when it passes its
  verification. One task per session where possible.
- Use plan mode for anything touching the schema, permissions, or an approval workflow.
- Prefer asking over guessing on business rules. Open questions live in `docs/SPEC.md` Appendix H;
  if a task depends on an unanswered one, stop and say so rather than inventing an answer.
- Do not add dependencies without saying why. Do not restructure directories mid-task.
- Health records, guardian contacts, employee files, and vendor bank details are classified
  sensitive — see `.claude/rules/security.md` before touching them.
