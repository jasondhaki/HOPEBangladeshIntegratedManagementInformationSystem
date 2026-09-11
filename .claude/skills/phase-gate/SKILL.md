---
description: Run the phase exit checklist before closing a build phase. Use when all tasks in a phase are ticked and the user asks to close the phase or move to the next one.
argument-hint: "[phase number 1-6]"
disable-model-invocation: true
context: fork
---

Run the exit review for Phase $ARGUMENTS.

1. Confirm every task for this phase in `docs/TASKS.md` is ticked. List any that are not and stop
   if there are any.
2. Read the phase's exit criteria in `docs/SPEC.md` §54 and check each one against the actual
   code and tests. For each criterion, state pass or fail and name the file or test that proves it.
3. Run the full suite: `pnpm typecheck && pnpm lint && pnpm test && pnpm test:rls && pnpm test:e2e`.
4. Check coverage of the cross-cutting obligations for tables added this phase: RLS policy exists,
   pgTAP test exists, audit trigger attached where required, soft delete respected, no hard-coded
   master data, no hard-coded strings.
5. Check the acceptance criteria in `docs/SPEC.md` §58 that this phase was supposed to satisfy and
   report their status.
6. Produce a short written report: what shipped, what is proven by tests, what is deferred, and
   any risk carried into the next phase. Do not start the next phase.
