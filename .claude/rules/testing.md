---
paths:
  - "tests/**"
  - "**/*.test.ts"
  - "**/*.spec.ts"
---

# Testing rules

## What gets a test

- **Unit (Vitest)**: every derived value and business rule — attendance %, certificate
  eligibility, weighted assessment scoring, grade derivation, closing stock, budget ceiling,
  ID generation under concurrency, duplicate detection.
- **RLS (pgTAP)**: every table with a policy. See `.claude/rules/security.md`.
- **E2E (Playwright)**: the eight critical journeys in `docs/SPEC.md` §57, run on both a desktop
  and a 375px mobile viewport.

## Write the negative test too

For every permission feature, assert the denial: Project Coordinator A cannot read Project B;
a Data Entry User cannot reach an approval endpoint; a user without `*:export` is refused even
though they can read the list. A passing positive test proves nothing about the boundary.

## Rules

- Tests use seeded fixtures, never production or real beneficiary data.
- No test asserts on a hard-coded ID that a seed might renumber — look records up by `code`.
- A flaky test is a failing test. Fix the race, do not add a retry.
- When fixing a bug, write the test that reproduces it first.
