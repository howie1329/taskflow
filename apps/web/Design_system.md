# Design System — ChatGPT-Inspired Dark UI
> For use with **shadcn/ui** + **Tailwind CSS v3+**
> Feed this file to Codex as context for consistent styling decisions.

---

## 1. Core Philosophy

- **Ultra-minimal chrome** — the interface disappears; the content leads
- **Flat depth** — no hard shadows, no raised cards; depth comes from subtle background-color layering
- **Monochromatic palette** — near-black surfaces with muted borders; a single green accent for interactive elements
- **Compact density** — tight but breathable; nothing feels cramped or spacious
- **Content-width prose** — messages never stretch full-width; capped at ~680px for readability

---

## 2. Color Tokens

Add these to your `tailwind.config.ts` under `theme.extend.colors` and as CSS variables in `globals.css`.

### CSS Variables (`globals.css`)

```css
:root {
  /* Backgrounds */
  --bg-base: #212121;         /* main canvas / sidebar */
  --bg-surface: #2f2f2f;      /* input area, dropdowns */
  --bg-elevated: #3a3a3a;     /* hover states, selected items */
  --bg-overlay: #1a1a1a;      /* modals, popovers */

  /* Borders */
  --border-subtle: #383838;   /* dividers, card outlines */
  --border-input: #4a4a4a;    /* input outlines */

  /* Text */
  --text-primary: #ececec;    /* main content */
  --text-secondary: #8e8ea0;  /* labels, metadata, placeholders */
  --text-tertiary: #5a5a72;   /* disabled, hints */

  /* Accent — ChatGPT green */
  --accent: #10a37f;
  --accent-hover: #0d8c6d;
  --accent-foreground: #ffffff;

  /* Code blocks */
  --code-bg: #1e1e1e;
  --code-border: #333333;
  --code-inline-bg: rgba(255,255,255,0.08);

  /* Destructive */
  --destructive: #ef4444;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
}
```

### Tailwind Config

```ts
// tailwind.config.ts
colors: {
  base:      'var(--bg-base)',
  surface:   'var(--bg-surface)',
  elevated:  'var(--bg-elevated)',
  overlay:   'var(--bg-overlay)',
  border: {
    subtle: 'var(--border-subtle)',
    input:  'var(--border-input)',
  },
  text: {
    primary:   'var(--text-primary)',
    secondary: 'var(--text-secondary)',
    tertiary:  'var(--text-tertiary)',
  },
  accent: {
    DEFAULT:    'var(--accent)',
    hover:      'var(--accent-hover)',
    foreground: 'var(--accent-foreground)',
  },
}
```

---

## 3. Typography

```css
/* globals.css */
body {
  font-family: 'Söhne', ui-sans-serif, system-ui, -apple-system, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--bg-base);
  -webkit-font-smoothing: antialiased;
}
```

> ChatGPT uses **Söhne** (Klim Type). Best open-source fallback: **DM Sans** or **Geist Sans**.
> Add to your project: `npm install geist` or use the Google Fonts DM Sans import.

### Type Scale

| Token         | Size   | Weight | Use case                        |
|---------------|--------|--------|---------------------------------|
| `text-xs`     | 11px   | 400    | Metadata, timestamps, hints     |
| `text-sm`     | 13px   | 400    | Sidebar labels, secondary text  |
| `text-base`   | 15px   | 400    | Chat message body               |
| `text-md`     | 16px   | 500    | Input text, subheadings         |
| `text-lg`     | 18px   | 600    | Page titles, model name         |
| `text-xl`     | 22px   | 600    | Empty state headline            |
| `code`        | 13px   | 400    | Monospace: `JetBrains Mono`     |

---

## 4. Spacing & Layout

ChatGPT uses a **fixed sidebar + scrollable main** layout.

```
┌──────────────┬──────────────────────────────────┐
│  Sidebar     │  Chat Area                        │
│  260px fixed │  flex-1, max-w-[760px] mx-auto    │
│              │                                   │
│              │  [Messages scroll here]           │
│              │                                   │
│              │  ┌────── Input Bar ─────────────┐ │
│              │  │ Fixed to bottom, same width  │ │
│              │  └──────────────────────────────┘ │
└──────────────┴──────────────────────────────────┘
```

### Key Measurements

| Element              | Value                   |
|----------------------|-------------------------|
| Sidebar width        | `260px`                 |
| Message max-width    | `680px`                 |
| Message padding      | `px-4 py-3` (16px/12px) |
| Input bar padding    | `p-3` outer, `px-4 py-3` inner |
| Section spacing      | `gap-1` in sidebar, `gap-4` between messages |
| Icon size (toolbar)  | `16px` / `w-4 h-4`     |
| Border radius input  | `rounded-2xl` (16px)    |

---

## 5. Component Specs

### 5.1 Sidebar

```tsx
// Structure
<aside className="w-[260px] h-screen flex flex-col bg-base border-r border-border-subtle">
  {/* Top: New Chat button */}
  <div className="flex items-center justify-between px-3 py-3">
    <Logo />
    <IconButton icon={<SidebarToggle />} />
  </div>

  {/* Nav links: New Chat, Search, Images, Apps... */}
  <nav className="px-2 space-y-0.5">
    <SidebarItem icon={<PenSquare />} label="New chat" />
    <SidebarItem icon={<Search />} label="Search chats" />
  </nav>

  {/* Chat history list */}
  <div className="flex-1 overflow-y-auto px-2 mt-4 space-y-0.5">
    <p className="text-xs text-text-tertiary px-2 py-1">Your chats</p>
    {chats.map(chat => <SidebarChatItem key={chat.id} {...chat} />)}
  </div>

  {/* Bottom: User profile */}
  <div className="px-3 py-3 border-t border-border-subtle">
    <UserProfile />
  </div>
</aside>
```

**SidebarItem styling:**
```tsx
<button className="
  w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm
  text-text-secondary hover:text-text-primary hover:bg-elevated
  transition-colors duration-150
">
```

**Active/selected state:**
```
bg-elevated text-text-primary
```

---

### 5.2 Input Bar

This is the most important component — keep it minimal.

```tsx
<div className="sticky bottom-0 px-4 pb-4 pt-2 bg-gradient-to-t from-base via-base to-transparent">
  <div className="max-w-[680px] mx-auto">
    <div className="
      flex flex-col gap-2 rounded-2xl border border-border-input
      bg-surface px-4 py-3 shadow-lg shadow-black/20
    ">
      <textarea
        className="
          w-full bg-transparent text-text-primary placeholder:text-text-secondary
          text-[15px] leading-relaxed resize-none outline-none
          min-h-[24px] max-h-[200px]
        "
        placeholder="Ask anything"
        rows={1}
      />
      <div className="flex items-center justify-between">
        {/* Left: attachment, thinking toggle */}
        <div className="flex items-center gap-2">
          <ToolbarButton icon={<Plus />} />
          <ThinkingToggle />
        </div>
        {/* Right: voice, send */}
        <div className="flex items-center gap-2">
          <ToolbarButton icon={<Mic />} />
          <SendButton />
        </div>
      </div>
    </div>
    <p className="text-center text-xs text-text-tertiary mt-2">
      AI can make mistakes. Check important info.
    </p>
  </div>
</div>
```

**Send button (active):**
```tsx
<button className="
  w-8 h-8 rounded-full bg-text-primary text-base
  flex items-center justify-center
  hover:bg-text-secondary transition-colors
  disabled:opacity-30
">
  <ArrowUp size={16} />
</button>
```

---

### 5.3 Chat Messages

```tsx
// User message
<div className="flex justify-end px-4">
  <div className="
    max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-sm
    bg-elevated text-text-primary text-[15px] leading-relaxed
  ">
    {content}
  </div>
</div>

// Assistant message
<div className="flex gap-3 px-4">
  <AssistantAvatar />  {/* 24px circle with model icon */}
  <div className="flex-1 max-w-[680px] text-[15px] leading-relaxed text-text-primary">
    <MessageContent />
    {/* Action bar: copy, regenerate, thumbs */}
    <MessageActions className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
  </div>
</div>
```

**Message action buttons:**
```tsx
<button className="
  p-1.5 rounded-md text-text-tertiary
  hover:text-text-secondary hover:bg-elevated
  transition-colors
">
```

---

### 5.4 Code Blocks

```tsx
<div className="rounded-xl border border-code-border overflow-hidden my-3">
  <div className="
    flex items-center justify-between
    bg-[#1e1e1e] px-4 py-2 border-b border-code-border
  ">
    <span className="text-xs text-text-tertiary font-mono">{language}</span>
    <CopyButton />
  </div>
  <pre className="bg-[#1e1e1e] px-4 py-3 overflow-x-auto">
    <code className="text-[13px] font-mono leading-relaxed text-text-primary">
      {code}
    </code>
  </pre>
</div>
```

**Inline code:**
```tsx
<code className="
  px-1.5 py-0.5 rounded-md text-[13px] font-mono
  bg-white/[0.08] text-text-primary
">
```

---

### 5.5 Model Selector (Header Dropdown)

```tsx
// Trigger — shown in top header
<button className="
  flex items-center gap-1.5 text-lg font-semibold text-text-primary
  hover:text-text-secondary transition-colors
">
  ChatGPT 5.4 Thinking
  <ChevronDown size={16} className="text-text-tertiary" />
</button>

// Dropdown panel
<div className="
  w-[360px] rounded-xl border border-border-subtle bg-overlay
  shadow-2xl shadow-black/40 overflow-hidden
">
  {/* Search */}
  <div className="px-3 pt-3 pb-2 border-b border-border-subtle">
    <input className="
      w-full px-3 py-2 rounded-lg bg-surface text-sm
      text-text-primary placeholder:text-text-secondary outline-none
    " placeholder="Search models..." />
  </div>

  {/* Filter tabs */}
  <div className="flex gap-2 px-3 py-2 border-b border-border-subtle">
    {['All','Cerebras','Groq','OpenRouter'].map(tab => (
      <button className="
        px-3 py-1 text-xs rounded-full
        text-text-secondary hover:text-text-primary hover:bg-elevated
        data-[active=true]:bg-elevated data-[active=true]:text-text-primary
        transition-colors
      ">{tab}</button>
    ))}
  </div>

  {/* Model list */}
  <div className="max-h-[300px] overflow-y-auto py-1">
    {models.map(model => (
      <ModelRow key={model.id} {...model} />
    ))}
  </div>
</div>
```

**ModelRow:**
```tsx
<button className="
  w-full flex items-center gap-3 px-4 py-2.5
  hover:bg-elevated transition-colors
  data-[selected=true]:bg-elevated
">
  <ProviderIcon className="w-5 h-5 shrink-0" />
  <div className="flex-1 text-left">
    <p className="text-sm text-text-primary">{model.name}</p>
    <p className="text-xs text-text-tertiary">{model.pricing} · {model.context}</p>
  </div>
  {selected && <Check size={14} className="text-accent shrink-0" />}
</button>
```

---

### 5.6 Empty State

```tsx
<div className="flex flex-col items-center justify-center h-full gap-6">
  <h1 className="text-[22px] font-semibold text-text-primary">
    Where should we begin?
  </h1>
  {/* Optionally: suggested prompt chips */}
  <div className="flex flex-wrap gap-2 justify-center max-w-[480px]">
    {suggestions.map(s => (
      <button className="
        px-4 py-2 rounded-full border border-border-subtle
        text-sm text-text-secondary hover:text-text-primary hover:bg-elevated
        transition-colors
      ">{s}</button>
    ))}
  </div>
</div>
```

---

## 6. shadcn/ui Overrides

Add these to your `components.json` or override in `globals.css`:

```css
/* Override shadcn defaults to match this design system */

/* Button */
.btn-primary {
  @apply bg-accent text-accent-foreground hover:bg-accent-hover rounded-lg px-4 py-2 text-sm font-medium;
}

/* Input / Textarea */
[data-slot="input"] {
  @apply bg-surface border-border-input text-text-primary placeholder:text-text-secondary rounded-xl;
}

/* DropdownMenuContent */
[data-radix-popper-content-wrapper] [role="menu"] {
  @apply bg-overlay border-border-subtle text-text-primary rounded-xl shadow-2xl;
}

/* DropdownMenuItem */
[role="menuitem"] {
  @apply text-text-secondary hover:text-text-primary hover:bg-elevated rounded-lg;
}

/* ScrollArea */
[data-radix-scroll-area-viewport] {
  @apply scrollbar-thin scrollbar-track-transparent scrollbar-thumb-elevated;
}
```

---

## 7. Motion & Interaction Principles

| Interaction          | Behavior                                                      |
|----------------------|---------------------------------------------------------------|
| Sidebar items        | `transition-colors duration-150` — instant feel              |
| Message stream       | Characters appear with no animation (raw streaming)           |
| Message actions      | Fade in on message hover: `opacity-0 group-hover:opacity-100 transition-opacity duration-200` |
| Dropdown open        | Scale from 95% → 100%, fade: `animate-in zoom-in-95 fade-in-0 duration-150` |
| Send button          | Instant state flip (disabled → enabled) on input change       |
| Page load            | No dramatic entry animations — content appears immediately    |

---

## 8. Scrollbar Styling

```css
/* globals.css */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: var(--bg-elevated);
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover { background: var(--border-input); }
```

---

## 9. Accessibility Notes

- All icon-only buttons must have `aria-label`
- Focus rings: `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-base`
- Color contrast: `--text-primary` on `--bg-surface` passes AA (5.2:1)
- Don't rely on color alone — use icons + text for model selection states

---

## 10. What to Avoid

| ❌ Don't                                      | ✅ Do instead                               |
|----------------------------------------------|---------------------------------------------|
| White or light backgrounds                   | Stick to the dark token scale               |
| Drop shadows on cards                        | Use background-color layering for depth     |
| Rounded corners > 24px on containers         | `rounded-2xl` max for panels                |
| Bold accent colors on every element          | Reserve `--accent` for primary CTA only     |
| Borders on message bubbles                   | Background color difference is enough       |
| Full-width assistant messages                | Cap at `max-w-[680px]`                      |
| Visible scrollbars in sidebar                | Thin, subtle `6px` scrollbar only           |
| Heavy font weights in body copy              | `font-normal` (400) for message text        |
