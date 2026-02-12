# UI Guidelines (Web App)

These guidelines define how UI should be designed and reviewed in `apps/web`.

## Design Goals

- Minimal by default: remove chrome before adding chrome.
- Calm and readable: typography, spacing, and hierarchy do the work.
- Progressive disclosure: advanced controls are available, but not always visible.
- Fast scanability: every page should be understandable in a few seconds.
- Consistency over novelty: shared patterns beat one-off component styling.

## Core Layout Patterns

## App Shell

- Use stable frame regions: sidebar/rail + page content.
- Keep navigation location clear with active state and page title.
- Avoid deeply nested card stacks for primary workflows.

## Toolbar Strip

- Group filters/search/tabs in one compact surface.
- Keep controls single-row on desktop where possible.
- On mobile, collapse secondary controls behind sheets/menus.

## Lists and Rows

- Rows should feel clickable without heavy borders.
- Prefer subtle hover/active backgrounds over loud outlines.
- Show row actions on hover/focus to keep scan flow clean.

## Chat Surface Pattern

- Conversation content is centered (`max-w-3xl`) for readability.
- Assistant responses are plain-flow content with minimal framing.
- User messages are subtle right-aligned bubbles.
- Message actions are hover/focus affordances, not always-visible button bars.
- Tool calls / chain-of-thought defaults to collapsed summary, with details on demand.

## Composer Pattern

- Composer region stays visually anchored near bottom.
- Keep model/mode/scope selectors secondary and compact.
- Avoid duplicate controls in header/footer of the same composer.

## Typography and Spacing

- Use predictable roles:
  - Page heading
  - Section heading
  - Body copy
  - Meta copy (timestamps, counts, helper text)
- Prefer a tight spacing scale and reuse it:
  - close relationship: small gap
  - grouped section: medium gap
  - major section break: large gap
- Truncate only where needed and preserve access to full values.

## Interaction and Feedback

- One primary action per region.
- Destructive actions require confirmation.
- Prefer local, inline feedback for local actions.
- Keep toasts for cross-cutting outcomes.

## Accessibility Rules

- Keyboard-first navigation for every interactive surface.
- Visible focus rings on all actionable elements.
- Maintain semantic structure (`button`, `nav`, headings, list semantics).
- Avoid icon-only meaning where text is needed for clarity.

## Web UI Review Checklist

- Is the page intent obvious within 5 seconds?
- Is the primary action obvious and unique for the region?
- Are spacing and alignment consistent with neighboring pages?
- Are loading/empty/error states present and useful?
- Does keyboard navigation and focus visibility work?
- Does mobile preserve clarity without horizontal scrolling?
