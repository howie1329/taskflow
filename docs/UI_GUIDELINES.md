# UI Guidelines (Rewrite)

These guidelines define how Taskflow should feel and behave in the rewrite (`apps/web`).
They are concept-first (principles, patterns, decisions) and intentionally avoid prescribing specific colors.

## North Star

- Minimal by default: every element must justify its existence.
- Calm UI: low visual noise, strong hierarchy, and predictable interaction.
- Typography + spacing do the work; decoration is the exception.
- Progressive disclosure: advanced options are available, not omnipresent.
- Fast to scan: prioritize legibility, alignment, and consistent structure.

## Layout and Structure

### Page Frame

- Use a consistent page frame (app shell + content region) across the product.
- Keep a stable header/rail so content feels anchored during navigation.
- Prefer a small set of page templates (list, detail, dashboard, editor) instead of one-off layouts.

### Grid and Alignment

- Align to a shared grid; avoid "almost aligned" edges.
- Prefer fewer, stronger columns over many weak ones.
- When mixing cards and charts, align headings and baseline spacing so the page reads as a system.

### Spacing Rhythm

- Use a spacing rhythm (a small set of step sizes) and stick to it.
- Increase spacing to indicate new sections; reduce spacing to indicate tight relationships.
- Use whitespace as grouping before adding containers.

### Responsive Behavior

- Mobile-first: preserve clarity, not density.
- Collapse secondary panels and toolbars behind explicit controls (menu, sheet, tabs).
- Avoid horizontal scrolling for core flows.

## Information Hierarchy

- A page has one primary intent. Everything else is supporting.
- Within a region, limit to one primary action.
- Prefer explicit headings and labels over icon-only affordances.

## Typography (Primary UI Material)

### Roles

Use a small set of roles and keep them consistent:

- Page title: anchors location and intent.
- Section title: groups content within a page.
- Label: names inputs and key-value fields.
- Body: readable long-form content.
- Meta: secondary info (timestamps, counts, helper text).
- Data: numbers and metrics should be easy to compare.
- Mono: code-like content (ids, shortcuts, tokens) and technical values.

### Rules

- Use weight, size, and spacing to create hierarchy (not decorative treatments).
- Avoid all-caps for core UI; it reduces scannability.
- Truncation:
  - Prefer single-line truncation for dense tables/lists.
  - Prefer wrapping for titles in detail views.
  - Never truncate critical identifiers without a way to reveal full content (tooltip, copy button).

## Surfaces and Containers

### Layer Model

Think in layers, not boxes:

- Page: the background layer.
- Section: grouped content with clear heading.
- Container (optional): used when it improves scanability (e.g., dashboard tiles).
- Control: interactive elements (buttons, inputs, menus).

### Borders and Radius

- Rounded corners are the default across the app.
- Apply a consistent radius scale to all surfaces and controls.
- If a component needs stronger emphasis, increase contrast or spacing first, not radius.
- Avoid mixing sharp and rounded edges within the same region.

### Container Discipline

- Prefer dividers and spacing over heavy borders.
- Use containers for:
  - dashboards (repeating tiles),
  - grouped controls (filters),
  - focused reading regions (editor, detail panels).
- Avoid nested containers unless they materially clarify structure.

## Navigation

- Primary navigation lives in a stable rail/sidebar.
- Global utilities (search, command entry, profile) belong to a stable top region.
- "Where am I" should be obvious via selected nav state + page title.
- Use breadcrumbs only when users traverse deep hierarchies.

## Actions and Interaction

### Action Priority

- Primary action: one per region, visually and spatially prioritized.
- Secondary actions: present but quieter.
- Tertiary actions: hidden behind a menu when they are not frequent.

### Destructive Actions

- Destructive actions require confirmation.
- Confirmation copy must state the consequence in plain language.
- If recovery is possible, provide an undo path.

### Feedback

- Make system status visible without being noisy.
- Prefer inline feedback near the affected UI.
- Use toasts sparingly for cross-cutting outcomes (save, background job done).

## States

### Loading

- Use skeletons for structured content (lists, cards, tables) to preserve layout.
- Use spinners only for small, local actions.
- Avoid full-page blockers unless the entire page depends on one request.

### Empty

- Empty states should answer:
  - What is this?
  - Why is it empty?
  - What can I do next?
- Keep empty states small and calm; avoid illustration-heavy placeholders.

### Errors

- Errors should be specific and actionable.
- Prefer local errors near the field/control.
- Avoid generic "Something went wrong" without a recovery path.

## Forms

- Labels are always visible (no placeholder-only labeling).
- Helper text is optional; error text is not.
- Validate at the right time:
  - immediate validation for formatting constraints,
  - on-blur or on-submit for correctness and completeness.
- Disable submit only when necessary; always explain why an action is unavailable.

## Lists, Tables, and Density

- Lists are for scanning: clear leading text, consistent secondary lines, and stable actions.
- Tables are for comparison: align numbers, keep columns stable, and avoid wrapping numeric data.
- Offer density shifts only when it materially helps (e.g., a compact mode for power users).

## Icons

- Icons support text; they do not replace it unless the meaning is universally clear.
- Keep icon size and stroke consistent within a region.
- Do not introduce new icon metaphors for existing actions.

## Motion

- Motion is structural:
  - page transitions,
  - panel open/close,
  - list insert/remove.
- Keep durations short and easing predictable.
- Respect reduced-motion settings.

## Accessibility

- Keyboard-first: every interactive element must be reachable and operable.
- Focus states must be visible and not rely on color alone.
- Use semantic HTML first; add ARIA only when needed.
- Ensure hit targets are comfortable for touch.

## Implementation Notes (Rewrite)

- Prefer shared UI primitives over custom one-offs.
- Use variant systems (`cva`) to encode visual decisions once.
- Use `data-*` attributes and consistent props to keep styling predictable.
- Keep component APIs small and stable; move complexity into composition.

## UI Review Checklist

- Intent: is the primary purpose of the page obvious in 5 seconds?
- Hierarchy: is there one primary action per region?
- Alignment: are edges aligned and spacing consistent?
- States: loading, empty, and error states are covered.
- Accessibility: keyboard navigation and focus visibility work.
- Responsive: mobile layout remains clear and usable.
