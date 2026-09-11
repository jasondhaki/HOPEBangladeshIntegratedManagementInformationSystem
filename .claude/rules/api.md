---
paths:
  - "app/api/**/*.ts"
  - "app/**/actions.ts"
---

# API and server action rules

- Every handler validates its input with the entity's Zod schema from `lib/validation` — the same
  schema the form uses. Re-validate on the server even when the client already did.
- Every handler checks a capability through `lib/permissions` before querying.
- Every mutation goes through `withAudit()` so the change and its audit row share one transaction.
  If the audit write fails, the change rolls back.
- Error responses use one envelope: `{ error: { code, message, field?, details? } }`. No stack
  traces, no raw Postgres errors, no personal data in messages.
- List endpoints accept the universal filter grammar (project, location, programme, activity, date
  range, gender, age group, course, batch, academic year, department, status) with server-side
  pagination. Never return an unbounded result set.
- Anything the UI can do is available under `/api/v1/*`. The web app is the first consumer, not the
  only one — the future mobile app and integrations depend on this.
- Bulk endpoints exist for attendance and assessment entry. One roster, one request.
- Long exports and reports run as background jobs and return a job id plus a download link, not a
  blocking response.
- The public certificate verification endpoint (`/verify/<token>`) is unauthenticated, rate
  limited, and returns only: valid/invalid, trainee name, course, batch, completion date, issuing
  authority. Nothing else, ever.
