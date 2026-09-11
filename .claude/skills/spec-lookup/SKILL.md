---
description: Pull the relevant part of docs/SPEC.md into context for a topic or section number, instead of reading the whole 47-page spec. Use before implementing anything, or when the user asks what the spec says about something.
argument-hint: "[topic or section number]"
---

Find what `docs/SPEC.md` says about: $ARGUMENTS

1. Grep `docs/SPEC.md` for the section heading or topic keywords. The spec is organised as
   §14–41 functional modules, §42–52 cross-cutting engines, §53–60 delivery, §61–70 operations,
   Appendices A–H.
2. Read the matching section and any section it cross-references.
3. Summarise the requirements that bear on the current task: fields, states, rules, and the
   Done-when line. Quote the Done-when exactly.
4. Flag any related open question from Appendix H that would change the implementation.

Do not paraphrase loosely — the spec is the contract with the client, and details like minimum
attendance thresholds, approval order, and consent gating are load-bearing.
