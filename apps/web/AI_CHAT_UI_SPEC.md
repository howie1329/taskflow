# AI Chat UI Specification

## Project Scope

- **Page**: `/app/chat` (new chat landing) + `/app/chat/[threadId]` (selected conversation)
- **Type**: UI-only implementation (no Convex backend)
- **Pattern**: Route-per-thread with left rail (thread list) + main panel (landing or conversation)
- **Mock Data**: Local React state with realistic thread structures

## Design Principles (Match Existing App)

- All borders `rounded-none` (consistent with Tasks/Inbox/Projects/Notes)
- Typography: `text-xs` for meta, `text-sm` for content, `font-medium` for headers
- Spacing: `gap-4`, `p-3`/`p-4` patterns matching other pages
- Colors: Use theme tokens (`--muted`, `--border`, `--accent`, etc.)
- Empty states: `Empty` component with `border-dashed`
- Mobile-first with route-driven navigation

## Implementation Notes (Current Code)

- Left rail state is managed in `app/app/chat/components/chat-shell.tsx` using mock thread data.
- Thread editing, pinning, and deletion are implemented against local state only.
- `/app/chat` creates temporary thread IDs (prefixed with `temp-`) and routes to `/app/chat/[threadId]`.
- Conversation content is mocked via `app/app/chat/components/mock-data.ts`.

## Layout Architecture

### Desktop (md+): 2-Pane Split

```
┌─────────────────────────────────────────────────────────┐
│  Left Rail (340px, border-r)   │  Main Panel (flex-1)   │
│                                │                        │
│  [New chat]                    │  [New Chat Landing]    │
│  Search: [________] [X]        │  ──────────────────    │
│                                │  Scope: All workspace ▼│
│  📌 Pinned (2)                 │                        │
│    ├─ Thread A          2h    │  Plan my day           │
│    └─ Thread B         1d     │  Create a project plan │
│                                │  Find overdue tasks    │
│  Recent                        │                        │
│    ├─ Thread C         3h     │  ──────────────────    │
│    ├─ Thread D         1d     │  [Composer             │
│    └─ Thread E         2d     │   pinned bottom        │
│                                │                        │
│  [Projects Grouping]           │                        │
│                                │                        │
└─────────────────────────────────────────────────────────┘
```

### Mobile (< md): Route-driven Navigation

**Route `/app/chat`:**

```
┌─────────────────────────┐
│ AI Chat              [] │
│                         │
│ [New chat +]            │
│ Search: [________] [X]  │
│                         │
│ 📌 Pinned               │
│ ┌ Thread A ───────┐   │
│ │ snippet...   2h >│   │
│ └───────────────────┘   │
│                         │
│ Recent                  │
│ ┌ Thread B ───────┐   │
│ │ ...          1d >│   │
│ └───────────────────┘   │
└─────────────────────────┘
```

**Route `/app/chat/[threadId]`:**

```
┌─────────────────────────┐
│ [←] Thread Title   [⋯] │
│                         │
│ [Message 1            ] │
│ [Message 2            ] │
│                         │
│ [Message N            ] │
│                         │
│ ────────────────────────│
│ [Composer              ] │
└─────────────────────────┘
```

## Routes Specification

### `/app/chat` — New Chat Landing

- **Purpose**: Starting point for new conversations
- **UI**: Scope control, prompt chips, anchored composer
- **Left Rail**: Shows thread list with "New chat" button active
- **Behavior**: Selecting a thread navigates to `/app/chat/[threadId]`

### `/app/chat/[threadId]` — Thread View

- **Purpose**: View and continue existing conversation
- **UI**: Conversation log, scroll behavior, composer
- **Left Rail**: Highlights active thread; other threads clickable
- **Behavior**:
  - Invalid threadId → show not-found state with CTA to `/app/chat`
  - Browser back/forward works naturally

## Data Models (Mock)

### ChatThread

```typescript
interface ChatThread {
  id: string;
  title: string;
  snippet: string; // last message preview
  updatedAt: number;
  createdAt: number;
  pinned: boolean;
  scope: ChatScope;
  messageCount: number;
}
```

### ChatScope

```typescript
type ChatScope =
  | { type: "all" }
  | { type: "project"; projectId: string; projectName: string };
```

### ChatProject (for grouping/filtering)

```typescript
interface ChatProject {
  id: string;
  title: string;
  icon: string; // emoji
  threadCount: number;
}
```

### ChatMessage (for thread view)

```typescript
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  attachments?: { filename: string; type: string }[];
}
```

## Left Rail Specification

### Structure

```
┌─────────────────────────────┐
│ [New chat +]                │
│                             │
│ [🔍 Search threads...  ] [X]│
│                             │
│ ── 📌 Pinned ─────────────  │
│    Thread A           2h    │
│    Thread B           1d    │
│                             │
│ ── Recent ───────────────── │
│    Thread C           3h    │
│    Thread D           1d    │
│    Thread E           2d    │
│                             │
│ ── By Project ───────────── │
│    ▼ Website Redesign       │
│      Thread in project  4h  │
│                             │
└─────────────────────────────┘
```

### Components

- **New chat button**: Full-width, `Button variant="default"`
- **Search**: `InputGroup` with left search icon, clear button on right when query present
- **Section headers**: `text-xs font-medium text-muted-foreground` with optional count badge
- **Thread rows**: `rounded-none border` container with hover/focus states

### Thread Row Styling

```
┌────────────────────────────────────────────┐
│ Thread Title                        2h    │
│ Last message snippet...              [⋯]  │
│                                            │
│ (Active state: bg-accent border-primary)  │
│ (Hover state: hover:bg-accent/50)         │
└────────────────────────────────────────────┘
```

- Title: `text-sm font-medium` (or "Untitled chat" in muted)
- Snippet: `text-xs text-muted-foreground line-clamp-1`
- Time: `text-xs text-muted-foreground tabular-nums`
- Actions: `⋯` button reveals dropdown (rename, pin, delete) - UI only

### Thread Row Interactions (UI-only)

- Click row → Navigate to `/app/chat/[threadId]`
- Active row (matches current route) → distinct background/border
- Context menu button (right side) → Dropdown with:
  - Pin/Unpin
  - Rename (opens inline input or dialog)
  - Delete (opens confirmation dialog)

## Main Panel: New Chat Landing

### Layout

```
┌─────────────────────────────────────────────┐
│                                             │
│          Talk to your workspace             │
│                                             │
│  Scope: All workspace ▼                     │
│                                             │
│  ─── Plan ───────────────────────────────── │
│  [Plan my day] [Prioritize backlog]         │
│                                             │
│  ─── Create ─────────────────────────────── │
│  [Create project plan] [Draft task list]    │
│                                             │
│  ─── Find/Explain ───────────────────────── │
│  [Find tasks about ___] [What's overdue?]   │
│                                             │
│                                             │
│ ────────────────────────────────────────────│
│ [Message Taskflow...              ] [Send] │
└─────────────────────────────────────────────┘
```

### Components

- **Headline**: `text-xl font-medium` centered
- **Scope control**: `Combobox` component
  - Default: "All workspace" with globe/workspace icon
  - Project options: icon + project name
  - Selection updates placeholder and prompt context
- **Prompt chips**: Grouped by intent using `Suggestions` component
  - 2–3 groups: Plan, Create, Find/Explain
  - 2–4 chips per group
  - Click fills composer and focuses textarea (does not auto-send)
- **Composer**: Full-width `PromptInput` anchored to bottom
  - Sticky with `border-t bg-background/80 backdrop-blur`
  - Textarea with auto-grow (`max-h-48 min-h-16`)
  - Attachments support (UI only)
  - Send button with disabled state when empty
  - Placeholder: "Message Taskflow..." (or changes based on scope)

### Prompt Chip Groups

**Plan**

- "Plan my day"
- "Break this into tasks"
- "Prioritize my backlog"

**Create**

- "Create a project plan"
- "Draft a task list"
- "Write a note summary"

**Find/Explain**

- "Find tasks about..."
- "What's overdue?"
- "Summarize project status"

## Main Panel: Thread View

### Layout

```
┌─────────────────────────────────────────────┐
│ Thread Title                     [Scope ▼] │
│                                             │
│ ────────────────────────────────────────────│
│                                             │
│ 👤 User message content                     │
│                                             │
│ 🤖 Assistant response                       │
│    with longer text that wraps             │
│    across multiple lines                    │
│                                             │
│ ────────────────────────────────────────────│
│ [Continue conversation...       ] [Send]   │
└─────────────────────────────────────────────┘
```

### Components

- **Header**: Thread title + scope indicator
- **Conversation**: `Conversation` component with `ConversationContent`
  - Messages use `Message` component (existing)
  - Auto-scroll to bottom on load and new messages
  - Scroll-to-bottom button when scrolled up
- **Composer**: Same as landing but scoped to thread

## Empty States

### No Threads Yet

```
┌─────────────────────────────────────────────┐
│ [Empty icon]                                │
│ No conversations yet                        │
│ Start a new chat to talk to your workspace  │
│ [New chat]                                  │
└─────────────────────────────────────────────┘
```

### No Search Results

```
│ [Search icon]                               │
│ No threads match "query"                    │
│ [Clear search]                              │
```

### Invalid Thread ID

```
│ [Alert icon]                                │
│ Conversation not found                      │
│ This conversation may have been deleted     │
│ [Start new chat →]                          │
```

## Responsive Behavior

### Breakpoints

- Mobile: `< md` (default Tailwind `md:`)
- Desktop: `md+`

### Desktop

- Fixed 340px left rail with `border-r`
- Main panel fills remaining space
- Independent scroll: rail scrolls separately from conversation
- Hover actions visible on thread rows

### Mobile

- Route `/app/chat`: Full-width thread list
- Route `/app/chat/[threadId]`: Full-screen conversation
- Header includes back button (←) to return to `/app/chat`
- Composer has safe-area padding (`pb-[env(safe-area-inset-bottom)]`)
- Sheet pattern NOT used; pure route navigation

## File Structure

```
apps/web/app/app/chat/
├── page.tsx              # Landing: /app/chat
├── [threadId]/
│   └── page.tsx          # Thread view: /app/chat/[threadId]
├── layout.tsx            # Shared chat shell (optional)
└── components/
    ├── chat-shell.tsx    # Left rail + main container
    ├── thread-list.tsx   # Pinned + Recent + Projects sections
    ├── thread-row.tsx    # Individual thread row
    ├── new-chat-landing.tsx  # Scope + chips + composer
    ├── thread-view.tsx   # Header + conversation + composer
    ├── prompt-chips.tsx  # Suggestion groups
    ├── scope-control.tsx # All workspace / Project selector
    └── empty-states.tsx  # No threads, no results, not found
```

## Shadcn Components to Use

From existing repo:

- `Button`, `Badge`, `Separator`
- `InputGroup`, `InputGroupInput`, `InputGroupAddon`, `InputGroupButton`
- `ScrollArea`, `ScrollBar`
- `Combobox` (for scope picker)
- `DropdownMenu` (for thread row actions)
- `Empty` (for empty states)
- `AlertDialog` (for delete confirmation)

From AI elements:

- `Conversation`, `ConversationContent`, `ConversationEmptyState`
- `Message`
- `PromptInput`, `PromptInputProvider`, `PromptInputTextarea`, `PromptInputSubmit`
- `Suggestions`, `Suggestion`

## Interactions (Local State)

### New Chat Flow

1. Navigate to `/app/chat`
2. Left rail shows "New chat" highlighted/active
3. Main panel shows landing with scope + chips + composer
4. Click chip → fills composer + focuses textarea
5. Type + Enter or click Send → creates mock thread + navigates to `/app/chat/[newThreadId]`

### Thread Selection

1. Click thread row → navigate to `/app/chat/[threadId]`
2. Main panel switches to conversation view
3. Load mock messages for that thread
4. Scroll to bottom of conversation
5. Composer ready for continuation

### Search

- Filters thread list in real-time (UI only)
- Matches on title + snippet
- Case-insensitive
- Clear button resets
- "No results" state when empty

### Thread Actions (UI-only)

- Pin/Unpin: Moves thread between Pinned/Recent sections
- Rename: Opens inline edit or dialog
- Delete: Shows `AlertDialog` confirmation, removes from mock state

## Success Criteria

- [ ] Routes `/app/chat` and `/app/chat/[threadId]` work
- [ ] Desktop: 2-pane split layout with independent scroll
- [ ] Mobile: Route-driven navigation with back affordance
- [ ] Left rail: New chat, search, Pinned + Recent sections
- [ ] Thread rows: hover states, active highlight, actions menu
- [ ] New chat landing: Scope control + grouped prompt chips + composer
- [ ] Thread view: Header, conversation log, composer
- [ ] Empty states: No threads, no search results, invalid threadId
- [ ] Responsive behavior correct at all breakpoints
- [ ] Visual style matches existing app (rounded-none, text sizing, colors)
- [ ] No TypeScript errors, no broken imports

---

**Status**: UI implemented with mock state (no Convex persistence yet)
**Next**: Replace mock threads/messages with Convex-backed conversations
