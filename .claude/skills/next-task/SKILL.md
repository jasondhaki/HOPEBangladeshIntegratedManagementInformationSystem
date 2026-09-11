---
description: Start the next unchecked task from docs/TASKS.md — reads the task, pulls the matching SPEC section, plans, implements, verifies, and ticks the box. Use when the user says "next task", "continue the build", or names a task id like P2-14.
argument-hint: "[task-id] (optional — defaults to the first unchecked task)"
disable-model-invocation: true
---

## Current ledger state

!`grep -n "^- \[ \]" docs/TASKS.md | head -5`

## Steps

1. Pick the task: `$ARGUMENTS` if given, otherwise the first unchecked one above. State which task
   you picked and its SPEC reference before doing anything else.
2. Read the referenced section of `docs/SPEC.md` in full. Do not work from the one-line task
   description alone — the fields, states, and rules are in the spec.
3. Check the task's dependencies in `docs/TASKS.md`. If a dependency is unchecked, say so and stop.
4. Check `docs/SPEC.md` Appendix H. If this task depends on an unanswered open question, say which
   one and stop — do not invent the business rule.
5. Enter plan mode and present the plan: files to create or change, schema changes, policies,
   tests. Wait for approval.
6. Implement. Follow the Definition of Done in `CLAUDE.md`.
7. Verify: `pnpm typecheck && pnpm lint && pnpm test && pnpm test:rls`. If the task touched a
   screen, also check it renders at 375px.
8. Tick the box in `docs/TASKS.md` and write one line under the task saying what was built and
   where the main files live.
9. Stop. Do not start the next task in the same session.
