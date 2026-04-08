# Product UI Design System — Dense, Precision App UI

> **Purpose**: Reusable reference for visual and interaction decisions on any product surface (web, desktop shell, mobile, or design handoff).  
> **Use as**: human documentation, design review checklist, or pasted context for AI-assisted UI work.  
> **Stack**: **Agnostic.** Implement tokens with your platform’s primitives (CSS variables, design tokens JSON, Swift/Android theme, Figma variables, etc.). Optional web notes appear in *Implementation* callouts.

---

## How to use this document

- **Tokens** (colors, type, space, radius, motion) are named for **meaning**, not appearance—so the same names work in light/dark and across platforms.
- **Rules** state *what* to enforce; *how* you wire them (Tailwind, styled-components, SwiftUI, etc.) is up to your codebase.
- For AI tasks, paste the **AI instructions** section (end of doc) and point to your project’s actual token file or theme module if you have one.

**H3 Ink — global CSS / shared theme:** There is **no intention** to change **global or shared theme colors** (for example `packages/ui` CSS variables) to match the reference HSL values in this document. Those values illustrate **semantic roles** and plausible relationships for reviews and new work. In this monorepo, the **existing** palette remains the source of truth for actual color literals; apply this document’s **rules** (semantic naming, layering, contrast, one accent, usage) using those existing tokens unless product **explicitly** approves a palette migration.

---

## 0. Philosophy

- **Precision over decoration.** Every pixel is intentional. If you can remove it, remove it.
- **Both modes are first-class.** Light and dark are equally polished. Neither is an afterthought.
- **Density with breathing room.** Pack information tightly, but give the eye a place to rest.
- **Speed is a feature.** Animations are short (roughly 100–200ms for primary interactions). Nothing lingers.
- **Systematic consistency.** If a value isn’t part of the agreed system, it shouldn’t appear in the UI without a deliberate exception.

---

## 1. Typography

### Typefaces

- Prefer **one sans family** for UI and **one monospace family** for code, IDs, and technical values.
- Load fonts **once** at app or document root (bundler, native font registration, or design system)—avoid scattering ad-hoc imports or duplicate webfont requests.
- *Example families*: Geist, Inter, system UI stack—choose per brand; consistency matters more than the exact name.

### Type scale (reference sizes)

Use this as a **ratio guide**. Map each step to your design tool or code tokens (`text-xs`, `Type.caption`, etc.).

| Token   | Size | Line height | Letter spacing | Typical use              |
| ------- | ---- | ----------- | -------------- | ------------------------ |
| 2xs     | 10px | 1.4         | +0.02em        | Rare micro-labels        |
| xs      | 11px | 1.5         | default        | Meta, timestamps         |
| sm      | 13px | 1.5         | default        | Body UI, dense tables    |
| base    | 14px | 1.6         | default        | Default body             |
| md      | 15px | 1.5         | default        | Slightly emphasized body |
| lg      | 17px | 1.4         | -0.01em        | Section titles           |
| xl      | 20px | 1.3         | -0.01em        | Page titles              |
| 2xl     | 24px | 1.25        | -0.02em        | Hero / major headings    |
| 3xl     | 30px | 1.2         | -0.02em        | Marketing / large display|
| 4xl     | 38px | 1.1         | -0.03em        | Marketing only           |

### Typography rules

- Default UI body: **sm**, **normal** weight, **secondary/muted** text color token.
- Controls (buttons, nav, tabs): **sm**, **medium** weight.
- Headings: **semibold** (or equivalent), **tight** tracking.
- ALL CAPS labels: **2xs**, **medium**, **wide** letter spacing—use sparingly.
- Monospace: code, IDs, version strings, technical values only.
- No gradient text or heavy text shadows in **application** chrome; reserve those for marketing if at all.

*Implementation (web)*: expose `--font-sans` and `--font-mono` on `:root` and reference them in your global styles or utility config.

---

## 2. Color system

### Principles

- Store colors as **semantic tokens** (e.g. `surface`, `foreground-muted`, `primary`), not as raw hex in components.
- **One set of token names**; light and dark (or other themes) **reassign values** under the same names.
- HSL (or OKLCH) **without** the `hsl()` wrapper in variables is a common web pattern for alpha support: components consume `hsl(var(--token) / opacity)`.

**H3 Ink:** The tables below are **reference examples**, not a mandate to retune global CSS. Do not interpret them as instructions to overwrite shared theme files.

### Semantic roles (light / dark reference values)

Below, **HSL components only** (e.g. `240 6% 10%`)—adapt to your token pipeline. Comments show approximate hex for communication.

**Light — backgrounds (shallow → deep elevation)**

| Token              | Light HSL        | Note        |
| ------------------ | ---------------- | ----------- |
| background         | `0 0% 100%`      | App canvas  |
| background-subtle  | `0 0% 98%`       | Page tint   |
| surface            | `0 0% 96%`       | Cards       |
| surface-raised     | `0 0% 93%`       | Elevated    |
| overlay            | `240 5% 90%`     | Hover/selected |

**Light — text**

| Token               | Light HSL   |
| ------------------- | ----------- |
| foreground          | `240 6% 10%` |
| foreground-muted    | `240 4% 46%` |
| foreground-subtle   | `240 3% 68%` |

**Light — borders & inputs**

| Token         | Light HSL   |
| ------------- | ----------- |
| border        | `240 5% 88%` |
| border-strong | `240 5% 78%` |
| input         | match border |

**Light — accent**

| Token            | Light HSL      |
| ---------------- | -------------- |
| primary          | `237 56% 57%`  |
| primary-foreground | `0 0% 100%` |
| primary-subtle   | `237 56% 95%`  |

**Light — system / destructive**

| Token                  | Light HSL     |
| ---------------------- | ------------- |
| destructive            | `0 72% 51%`   |
| destructive-foreground | `0 0% 100%`   |
| success                | `158 55% 42%` |
| warning                | `35 90% 48%`  |
| info                   | `214 80% 52%` |

Also define tokens your UI kit expects for **card**, **popover**, **secondary**, **muted**, **accent**, **ring** (focus), each with foreground pairs—mirror the same structure as your component library’s theme contract.

**Dark** — repeat the same **names** with adjusted values (example dark canvas `240 7% 7%`, muted text `240 4% 56%`, slightly lighter primary for contrast on dark, etc.). Design light and dark **together**.

### Color usage rules

- Consume only **semantic** tokens in UI code (`bg-surface`, `Color.surface`, etc.)—never one-off hex in feature code.
- **Background layering** (shallow → deep): `background` → `background-subtle` → `surface` → `surface-raised` → `overlay`.
- **Success / warning / destructive / info**: status and feedback only—not decorative fills.
- **One primary accent** per view; avoid multiple competing accent-colored elements.

*Implementation (web)*: define `:root` and `.dark` (or `[data-theme="dark"]`) with the same variable names; map them to utilities or components in one place.

---

## 3. Spacing

Base unit: **4px**. All spacing should be **multiples of 4** (or your design tool’s equivalent grid).

| Step | px  | Typical use                          |
| ---- | --- | ------------------------------------ |
| 0.5× | 2   | Icon nudge, micro gaps               |
| 1×   | 4   | Dense internal padding               |
| 1.5× | 6   | Compact badge / chip               |
| 2×   | 8   | Button vertical, list row padding    |
| 3×   | 12  | Button horizontal, input padding     |
| 4×   | 16  | Card padding, section gaps           |
| 5×   | 20  | Comfortable card padding           |
| 6×   | 24  | Section spacing                      |
| 8×   | 32  | Page padding                         |
| 10×  | 40  | Large section breaks                 |

Avoid one-off values like `7px` or `11px` unless documented as an exception.

---

## 4. Border radius

- **Base radius**: **6px** (single token, e.g. `--radius`).
- Derive smaller/larger steps from the base, e.g.  
  **sm** = base − 2px, **md** = base, **lg** = base + 2px, **xl** = base + 6px, **full** = pill.

**Application**

- Buttons, inputs: **md**
- Cards, dropdowns, sheets: **lg**
- Modals, command palettes: **xl**
- Badges: **sm** or **full**

Do not mix radius sizes within the same visual component group.

---

## 5. Elevation

- Prefer **layered backgrounds + borders** for in-app depth.
- **Shadows** only for elements that truly float (dropdowns, popovers, modals).

Example shadow tokens (tune per theme):

- **sm**: subtle lift for small floats  
- **md**: dropdowns, tooltips  
- **lg**: modals, large overlays  
- Dark theme often needs **stronger** shadow opacity for the same perceived separation.

Surface cards: **border** only, no shadow.

---

## 6. Motion & animation

### Durations (reference)

| Token   | Duration | Use                    |
| ------- | -------- | ---------------------- |
| fast    | 100ms    | Hover, press, color     |
| normal  | 150ms    | Default transitions    |
| slow    | 200ms    | Panels, larger moves    |
| slower  | 300ms    | Sparingly               |

### Easing (reference)

- **Snap**: `cubic-bezier(0.16, 1, 0.3, 1)` — crisp UI motion  
- **Spring** (light): `cubic-bezier(0.34, 1.56, 0.64, 1)` — subtle overshoot

### Rules

- Every interactive control has **hover** and/or **active** feedback—not a completely static appearance.
- Animate **specific properties** (opacity, transform, colors)—avoid blanket “animate everything.”
- **Enter** slightly slower than **exit** for overlays when both exist.
- Respect **reduced motion**: disable or shorten non-essential animation when the user prefers reduced motion (`prefers-reduced-motion`, platform accessibility settings).

---

## 7. Component patterns (specifications)

Describe implementations using your stack’s tokens. Below: **intent** and **measurements**.

### Buttons

- **Primary**: filled primary background, primary foreground text; hover slightly darker/lighter or lower opacity; **md** radius; height **32px** default (also support **28px** compact, **36px** comfortable); horizontal padding **12px**; label **sm**, **medium**.
- **Secondary**: surface background, border, foreground; hover raises surface / strengthens border.
- **Ghost**: transparent; muted text; hover uses **overlay** background and full foreground.
- **Destructive (soft)**: low-contrast destructive tint background, destructive text; hover increases tint.

### Inputs

- Background **background**, border **input**, text **foreground**, placeholder **foreground-subtle**; **md** radius; height **32px** default; horizontal padding **12px**; **sm** text.
- Focus: visible ring using **ring** token (or platform focus style).
- Error: **destructive** border and subdued destructive ring.

### Cards

- **Static**: **card** background, **border**, **lg** radius, padding **16px**, **card-foreground** text.
- **Interactive**: same + hover to **surface-raised** (or equivalent), cursor pointer, **fast** color transition.
- **Floating** (popover/modal shell): **popover** background, **xl** radius, **md** shadow (stronger in dark).

### Badges / tags

- **sm** radius or pill; padding ~**4px × 2px** vertical/horizontal scale; **xs** text, **medium** weight.
- Variants: neutral **overlay** + muted text; primary/success/warning/destructive use **10%** tint backgrounds with matching text tokens where supported.

### Nav item (sidebar)

- Row height **32px**, horizontal padding **12px**, **sm** text; default **muted**; hover **overlay** + full foreground; active **medium** weight, **foreground**, **overlay** background.

### Dividers

- Horizontal: top border **border**, vertical margin from spacing scale.  
- Vertical: left border **border**, horizontal margin, stretch to fill row.

### Empty state

- Centered column; vertical padding **64px** class equivalent; icon ~**32px**, **foreground-subtle**; title **sm** **medium**; description **sm** **muted**, max width ~**20rem**.

---

## 8. Iconography

- Use **one icon family** per product for consistency (e.g. Lucide, SF Symbols, Material Symbols).
- Default **stroke** weight ~**1.5** (or platform default that reads similarly).
- Sizes: **14** inline dense, **16** default UI, **18** sidebar / prominent, **20** empty states.
- Default color: **muted**; **foreground** on hover/active when part of a control.
- Icon + label: **6px** gap (1.5× base unit).
- Icon-only controls: accessible **name** / **label** (ARIA, content description, Tooltip).

---

## 9. Layout

### Sidebar + main (common app shell)

- Full viewport height; canvas **background**.
- Sidebar: fixed width ~**224px** (adjust only on spacing grid); **subtle** background; **border** on main-edge; column layout.
- Main: flex grow, scroll vertically; inner content **max-width** + horizontal padding from scale (e.g. **32px** horizontal, **24px** vertical).

### Content max-widths (reference)

- Reading-heavy: ~**672px**
- Forms / settings: ~**560px**
- Dashboards / mixed: ~**896px**
- Wide tables: full width

### Z-index scale (conceptual)

Define a **small fixed ladder** and reuse names project-wide, e.g. base → raised → dropdown → sticky header → modal → toast → tooltip. Avoid arbitrary large numbers.

---

## 10. Theming

- Support **light**, **dark**, and ideally **system** default.
- Toggle by setting a **class or data attribute** on the document root (web) or theme object (native)—not scattered per-widget.
- When switching theme, optionally **disable transitions** for one frame to avoid flashes.
- Use semantic tokens so **most** UI needs **no** per-mode color branches; reserve mode-specific rules for shadows, images, or maps.

---

## 11. Integrating a component library

If you use Material, shadcn/ui, Chakra, SwiftUI, Compose, etc.:

1. Map this doc’s **semantic names** to the library’s theme API or CSS variables.
2. Replace generated palettes with your **Section 2** values while keeping the library’s **required** token names.
3. Keep **radius**, **spacing**, and **motion** tokens aligned with Sections 3–6 so custom and stock components match.

---

## 12. Do / don’t

| Do | Don’t |
| -- | ----- |
| Semantic color/spacing/radius tokens | Hardcoded hex or raw values in feature UI |
| Design light and dark together | Dark-only with light as an afterthought |
| Single font loading strategy | Duplicate or scattered font imports |
| Layered surfaces + borders for in-app depth | Heavy shadows on every card |
| Explicit property animations + short durations | Long, vague, or “animate all” |
| Respect reduced motion | Ignore system accessibility settings |
| Grid-aligned spacing | Random pixel gaps |
| One icon system, consistent sizes | Mixed icon families |
| Consistent radius per component type | Mixed radii in one component family |
| One strong accent per view | Many competing accent colors |

---

## 13. AI coding instructions

Paste and adapt bracketed placeholders to your repo:

```
Use [PATH_OR_NAME_TO_THEME_TOKENS] as the source of truth for styling.

Non-negotiable rules:

1. COLORS — Use semantic tokens only (e.g. surface, foreground-muted, border, primary).
   Do not hardcode hex/rgb in feature code. One token set should work across light/dark
   via theme switching. Do not change global shared CSS/theme color definitions to match
   Section 2 reference HSLs unless the user explicitly asks for a palette migration; treat
   the project’s existing theme as the source of truth for color values.

2. TYPOGRAPHY — Respect the type scale and weights: UI labels vs body vs headings.
   Load fonts in one place per platform conventions.

3. THEMES — Every screen must be coherent in light AND dark (or your supported themes).
   Prefer semantic tokens over per-mode color forks except for shadows/media.

4. SPACING — Use the agreed spacing grid (e.g. 4px base). Avoid arbitrary one-off values.

5. MOTION — Short interactions (~100–200ms); animate specific properties; honor reduced motion.

6. ICONS — Single icon set; consistent sizes; accessible names for icon-only controls.

7. RADIUS — Apply the radius ladder consistently (controls vs cards vs modals).

8. COMPONENTS — Match the component specifications in the design reference (buttons,
   inputs, cards, nav) unless the task explicitly changes them.
```

---

## Inspiration

- Linear-style **dense, precise** product UI: neutral surfaces, single accent, fast motion, strong type hierarchy.

If you keep project-specific mood boards, link or name them in your own README; this file stays **portable**.
