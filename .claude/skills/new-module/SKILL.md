---
description: Build a functional module from its spec section — screens, fields, states, validation rules, and acceptance check. Use when a task covers a whole module such as beneficiaries, attendance, procurement, or certificates.
argument-hint: "[module-name or SPEC section number]"
---

Build the module described in `docs/SPEC.md` §$ARGUMENTS.

Work in this order and show the plan before writing code:

1. **Read the whole spec section**, including its Fields, States, Rules, Outputs, and Done-when.
   The Done-when line is your acceptance test — quote it back before starting.
2. **Data**: any tables this module needs that do not exist yet go through `/new-table` first.
3. **Validation**: Zod schema per entity in `lib/validation`, encoding the module's rules from the
   spec, not just field types.
4. **Server layer**: route handlers or server actions under the module path, capability-checked,
   audited, using the universal filter grammar for lists.
5. **Screens**: list (shared `DataTable`), detail, create/edit form. Mobile-first if it is one of
   the five field screens named in `.claude/rules/ui.md`.
6. **Strings**: `en` and `bn` keys for everything user-facing.
7. **Tests**: unit tests for each rule in the spec's Rules list; an E2E test for the primary
   journey; RLS tests for any new table.
8. **Verify against Done-when** and report explicitly whether each part of it passes.

If the spec section names a workflow with states, implement it as an explicit state machine with
audited transitions — not as a free-text status field.
