# HB-IMIS

Integrated Management Information System for HOPE Worldwide Bangladesh.

## Start here

1. `CLAUDE.md` — project rules and conventions (Claude Code loads this every session)
2. `docs/BUILD_PLAN.md` — how the build runs: sessions, verification, phase order
3. `docs/TASKS.md` — the ledger; run `/next-task` in Claude Code to work the next item
4. `docs/SPEC.md` — the full requirements, traceable to the client SRS

## Build

```bash
pnpm install
npx supabase start
pnpm db:migrate && pnpm db:seed
pnpm dev
```
