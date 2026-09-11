---
description: Add a database table end to end — Drizzle schema, migration, RLS policies, pgTAP tests, Zod schema, and audit trigger. Use when a task requires a new table or a significant column change.
argument-hint: "[table-name]"
---

Add the table `$ARGUMENTS` completely. Partial work here is the most common source of security
holes in this project, so all seven steps happen in one task.

1. **Read the spec.** Find the table in `docs/SPEC.md` §9 and use its listed columns. If it is not
   in §9, ask before inventing a shape.
2. **Drizzle schema** in `db/schema/`. Include the standard columns from `.claude/rules/database.md`
   plus `project_id` if the record is project-scoped. Foreign keys to master tables, never enums.
3. **Migration**: `pnpm db:generate`, then read the emitted SQL line by line before applying it.
4. **Indexes**: every foreign key, every report filter column, unique on `code`.
5. **RLS policies** in `db/policies/`: select, insert, update. No delete policy. Use the canonical
   shape in `.claude/rules/security.md`. Add the stricter capability check if any column is
   confidential.
6. **pgTAP tests** in `tests/rls/`: scoped role blocked from another project, missing capability
   returns zero rows, soft-deleted row invisible.
7. **Zod schema** in `lib/validation/`, and attach the audit trigger if the table is on the
   critical list in `CLAUDE.md`.

Then run `pnpm db:migrate && pnpm test:rls` and report what passed.
