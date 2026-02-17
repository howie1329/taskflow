---
name: planning-docs-scout
description: Scan a codebase for helpful Markdown docs (feature specs, implementation notes, ADRs, READMEs, and UI/design guidelines) before creating an implementation plan. Use at the start of any planning phase, before breaking down tasks, and whenever a feature name is known and you want to find matching docs (e.g., files named like the feature).
---

# Planning Docs Scout

## Workflow (run before planning)

1. If you are about to create/update a plan, do this first (before calling any plan tool).
2. Extract 3–10 keywords from the user request (feature name, module names, UI surface, page names).
3. Run the scout script from the repo root:
   - `python3 scripts/docs_scout.py --feature "keyword one" --feature "keyword two"`
4. Open and read the top results in this order:
   - `AGENTS.md` (root + nearest to touched directories)
   - Feature-matched docs (same-name and close-name matches)
   - UI/design docs (design system, components, styling, accessibility)
   - Architecture/ADR/roadmap docs
5. Convert findings into plan constraints:
   - Required conventions (framework, language, folder structure, patterns)
   - UI rules (components, tokens, spacing, typography, a11y)
   - Integration contracts (APIs, schemas, routes, events)
   - “Do not change” areas and known pitfalls
6. If you find no relevant docs, state that explicitly and proceed with a conservative plan (minimal changes, align with existing patterns).

## What to report back (concise)

- **Docs to read next**: 5–12 file paths with a 1-line reason each
- **UI guidance**: component library + styling rules + any a11y requirements
- **Plan constraints**: bullets that must shape the implementation plan

## Local validation (no external deps)

- `python3 scripts/validate_skill.py`
