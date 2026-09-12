-- Smoke test proving the pgTAP harness is wired end-to-end via `supabase test db`.
-- Real RLS/permission tests land per-table starting P1-04/P1-05 (.claude/rules/security.md).
BEGIN;
SELECT plan(1);

SELECT pass('pgTAP harness wired');

SELECT * FROM finish();
ROLLBACK;
