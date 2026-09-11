---
paths:
  - "db/**/*.ts"
  - "db/**/*.sql"
  - "lib/db/**/*.ts"
---

# Database rules

## Schema changes

- Every schema change is a Drizzle migration committed to `db/migrations/`. Never change schema
  through the Supabase dashboard on staging or production.
- Generate with `pnpm db:generate`, review the emitted SQL by hand, then `pnpm db:migrate`.
  A generated migration you have not read is not reviewed.
- Migrations are forward-only and must be safe to run against a database with data in it:
  add-column-nullable → backfill → set-not-null, never a destructive single step.

## Every table gets

`id uuid primary key default gen_random_uuid()` · `created_at timestamptz not null default now()` ·
`updated_at timestamptz not null default now()` (trigger-maintained) · `created_by uuid references users(id)` ·
`updated_by uuid references users(id)` · `deleted_at timestamptz` · `project_id uuid` where the
record is project-scoped.

Plus: an index on every foreign key, an index on every column used as a report filter, and a
unique index on `code` where the table has one.

## Forbidden

- TypeScript enums or literal unions for anything a HOPE administrator should be able to add.
  Courses, activities, classes, categories, dropout reasons, statuses: all are rows.
- `DELETE` against beneficiaries, students, trainees, employees, attendance, assessments,
  certificates, or any finance/procurement/asset/inventory table. Set `deleted_at`.
- Storing derived values. Age comes from DOB. Attendance % comes from the attendance rows. Stock
  comes from the transaction ledger. Budget balance comes from the expense rows.
- Personal fields duplicated outside `beneficiaries` or `employees`.

## Integrity lives in the database

These are constraints and triggers, not just application checks:
unique beneficiary/employee/course/certificate codes · DOB not in the future · end date ≥ start
date · marks within 0..full_marks · no attendance without an active enrolment covering that date ·
no negative stock without the override capability · no expense above an approved budget head
without the special-approval path · `prepared_by <> approved_by` unless the actor holds
`approval:self_approve`.

See `docs/SPEC.md` §10.3 and Appendix G for the full list.
