---
paths:
  - "app/**/*.tsx"
  - "components/**/*.tsx"
---

# UI rules

## Mobile first for field screens

These five are designed at 375px first and must be usable one-handed on a mid-range Android phone
on a slow connection: record attendance (class, activity session, training batch) · add activity
session · photo upload · approve/reject · dashboard summary.

Attendance entry: the roster loads with everyone defaulted to Present and the user taps only the
exceptions. The whole roster submits in one request — never one request per person. Hold draft
state locally so a dropped connection does not lose the entry.

## Shared components, not bespoke ones

Every list screen uses the shared `DataTable` (filter, sort, paginate, export). Every form uses
React Hook Form with the entity's Zod schema from `lib/validation`. If a screen needs behaviour
the shared component lacks, extend the shared component rather than forking it — there are ~95
screens and they must behave identically.

## Data access

Reads happen in Server Components. Do not fetch permission-sensitive rows into a client component
and filter them in the browser. Strip confidential columns server-side with an allow-list; do not
rely on the UI not rendering them.

## Strings and formatting

No hard-coded user-facing text — everything goes through `next-intl` catalogues with an `en` key
and a `bn` key. No hard-coded date formats or currency symbols — use `lib/format`, which reads the
configured format from settings. Bangla text must render in both the UI and generated PDFs.

## Accessibility and layout

WCAG 2.1 AA as the working standard: keyboard navigable, visible focus, 4.5:1 contrast, labelled
inputs. Touch targets at least 44px. Single-column forms below 768px. Tables collapse to stacked
cards below 640px.

## Tailwind

Core utility classes only. No arbitrary values where a scale value exists. Component variants go
through the shadcn/ui pattern, not through conditional class-string concatenation scattered in
JSX.
