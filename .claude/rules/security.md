---
paths:
  - "db/policies/**"
  - "lib/permissions/**"
  - "lib/auth/**"
  - "app/api/**"
  - "tests/rls/**"
---

# Authorization and sensitive data

## Two independent layers, always both

1. **Application guard** (`lib/permissions`): checks the route's declared capability
   (`module:action`) before any query runs. Fast fail, clear 403.
2. **Row-Level Security**: the real boundary. Every table has policies. A bug in layer 1 is caught
   by layer 2 and vice versa. Never rely on one alone, and never "temporarily" disable RLS.

## Canonical policy shape

```sql
create policy <table>_select on <table> for select
  using (
    deleted_at is null
    and auth_has('<module>:read')
    and (auth_is_org_wide() or project_id = any(auth_project_ids()))
  );
```

No `for delete` policy exists on any table. Deletion is a soft-delete `UPDATE`, gated by its own
capability.

## Capability naming

`module:action` where action is one of `read`, `create`, `update`, `delete`, `approve`, `export`,
`configure`. Export is always separate from read: being able to see a list never implies being
able to download it.

## Scope

Scope comes from `user_project_scopes`. An empty scope set on an organisation-wide role means all
projects; a non-empty set restricts. Teachers and trainers are narrowed further through
`class_subject_teachers` and `batches.trainer_id`.

## Sensitivity classes

- `confidential`: `health_records` observations, employee documents, vendor bank and tax fields.
  Requires an extra capability (`health:read_detail`, `hr:read_file`, `vendor:read_financial`).
  Individual health record reads are audited — reads, not just writes.
- `restricted`: guardian phone numbers, exact addresses, photos of minors. Masked in list views
  for roles without `*:read_contact`.
- Never include confidential columns in a generic export or a search result.

## Every new table or policy needs a pgTAP test

At minimum: a scoped role cannot read another project's rows; a role without the capability gets
zero rows rather than an error containing data; a soft-deleted row is invisible. Add to
`tests/rls/`. `pnpm test:rls` must pass before the task is done.

## Never

- Put the Supabase service-role key anywhere reachable from the client bundle.
- Write a "just for now" bypass, an admin backdoor, or a query that runs with elevated rights to
  make a report work. If a report needs wider data, the user needs wider scope.
- Log personal data, health data, or tokens.
