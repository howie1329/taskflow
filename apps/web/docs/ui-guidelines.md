# UI Guidelines

These guidelines define the default UI direction for `apps/web`.

## Product Goals

- Minimal by default
- Calm, readable hierarchy
- Progressive disclosure for advanced controls
- Fast scanability
- Consistency over one-off styling

## Layout Patterns

### App Shell

- Use stable frame regions: sidebar or rail plus page content.
- Keep navigation location and page title obvious.
- Avoid stacking unnecessary cards around primary workflows.

### Toolbars

- Group search, filters, tabs, and secondary actions in one compact strip.
- Keep desktop controls single-row where possible.
- Collapse secondary controls on mobile behind sheets or menus.

### Lists and Rows

- Favor subtle hover and active states over heavy borders.
- Keep rows readable first and actionable second.
- Reveal secondary actions on hover or focus instead of showing noisy button bars at all times.

### Chat Surfaces

- Keep conversation content centered for readability.
- Let the conversation lead and make execution details expandable.
- Keep the composer visually anchored near the bottom.
- Treat model, mode, and scope controls as secondary to the message input.

### Notes Surfaces

- Desktop notes should feel like a list-plus-editor workspace, not a grid of cards.
- Mobile should favor browsing first and editing in a focused overlay or panel.
- Project grouping should remain the default mental model unless product behavior changes.

## Visual Direction

- Prefer low-chrome interfaces with subtle surface separation.
- Use background layering and spacing before adding more borders or shadows.
- Keep typography roles predictable:
  - page heading
  - section heading
  - body copy
  - meta/helper text

## Interaction Rules

- One primary action per region.
- Destructive actions require confirmation.
- Use inline or local feedback before reaching for toasts.
- Keep advanced AI detail hidden by default and reveal it intentionally.

## Accessibility Rules

- Keyboard-first navigation for interactive surfaces
- Visible focus states on all actionable elements
- Semantic HTML for structure and controls
- Avoid icon-only meaning when text is needed for clarity

## Working Rule

If a historical design spec disagrees with this file, use this file and archive the older spec instead of maintaining two active design documents.
