# Notes Page UI Specification

## Project Scope

- **Page**: `/app/notes`
- **Type**: UI-only implementation (no Convex backend)
- **Grouping**: Projects-first (no separate notebooks/folders)
- **Mock Data**: Local React state with realistic project/note structures

## Design Principles (Match Existing App)

- All borders `rounded-none` (consistent with Tasks/Inbox/Projects)
- Typography: `text-xs` for meta, `text-sm` for content, `font-medium` for headers
- Spacing: `gap-4`, `p-3`/`p-4` patterns matching Tasks/Inbox pages
- Colors: Use theme tokens (`--muted`, `--border`, `--accent`, etc.)
- Empty states: `Empty` component with `border-dashed`
- Mobile-first sheet pattern: bottom `Sheet` for editor (like TaskDetailsSheet)

## Implementation Notes (Current Code)

- Notes data lives in local component state with URL param syncing for `note`, `project`, `view`, and `q`.
- Project list and note list are mocked in the page module for now.
- Editor save state is simulated client-side (no persistence).

## Layout Architecture

### Desktop (md+): 2-Pane Split

```
┌─────────────────────────────────────────────────────────┐
│  Left Pane (350px, border-r)   │  Right Pane (flex-1)   │
│                                │                        │
│  Header: "Notes" + New btn     │  [Empty or Editor]     │
│  Controls: Project + Search    │                        │
│  Tabs: By Project | Recent |   │  Title Input           │
│          Pinned                │  Project Badge + Time  │
│                                │  Full-height Textarea  │
│  ┌─ Project A (3) ─┐           │  [Pin] [Move] [Delete] │
│  │ Note 1          │           │                        │
│  │ Note 2          │           │                        │
│  └─ No Project ────┘           │                        │
│    Note 3                      │                        │
└─────────────────────────────────────────────────────────┘
```

### Mobile (< md): Single View + Sheet

```
Full-screen List View
┌─────────────────────────┐
│ Header: Notes + New     │
│ Project: [All ▼]        │
│ Search: [________] [X]  │
│ [By Project] [Recent]   │
│                         │
│ ▼ Project A             │
│ ┌ Note 1 ───────────┐   │
│ │ Title            >│   │
│ │ snippet...  2h   │   │
│ └───────────────────┘   │
│                         │
│ ▼ No Project            │
│ ┌ Note 3 ───────────┐   │
│ └───────────────────┘   │
└─────────────────────────┘

Tap Note → Opens Bottom Sheet (85vh)
┌─────────────────────────┐
│ [X] Title Input         │
│ [Project] 2h ago        │
│                         │
│ [Full textarea        ] │
│ [                     ] │
│ [                     ] │
│                         │
│ [Pin] [Move] [Delete]   │
└─────────────────────────┘
```

## Data Models (Mock)

### Project

```typescript
interface MockProject {
  _id: string;
  title: string;
  icon: string; // emoji or icon name
  color?: string; // optional accent
}
```

### Note

```typescript
interface MockNote {
  _id: string;
  projectId: string | "__none__"; // "__none__" = no project
  title: string;
  content: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}
```

## List Modes

### 1. By Project (Default)

- Group notes by their `projectId`
- Sections: Each project + "No Project"
- Within each section: pinned first, then by `updatedAt` desc
- Section header: icon + project name + count badge

### 2. Recent

- Flat list, all notes sorted by `updatedAt` desc
- No grouping, just chronological

### 3. Pinned

- Flat list, only `pinned: true` notes
- Sorted by `updatedAt` desc

## Controls Specification

### Header Row

- Left: `text-sm text-muted-foreground` helper text: "Organize your thoughts"
- Right: `New note` button (`Button size="sm" className="h-8"`)
  - Creates "Untitled" note in current project scope
  - Auto-selects and focuses title input

### Filter Row

- Project Select (`Select` component):
  - Options: "All projects" (default), each project (icon + title), "No project"
  - Width: `w-48` or auto
- Search Input (`InputGroup`):
  - Left addon: Search icon
  - Clear button (X) appears when query present
  - Placeholder: "Search notes..."
  - Filters on title + content

### View Tabs (`Tabs` with `variant="line"`)

- Tabs: "By project", "Recent", "Pinned"
- Active tab has underline indicator (existing pattern)
- Badge counts on each tab optional (show in parentheses)

## Note Row Specification

### Structure

```
┌────────────────────────────────────────────────┐
│ 📌 (pin icon if pinned)                        │
│ Title or "Untitled"                    [⋯]    │
│ First line of content...          2 hours ago │
└────────────────────────────────────────────────┘
```

### Styling

- Container: `rounded-none border border-border p-3`
- Hover: `hover:bg-accent/50 hover:border-foreground/20`
- Selected: `bg-accent border-foreground/40` (distinct from hover)
- Transition: `transition-all duration-200`

### Content

- Title: `text-sm font-medium` (or "Untitled" in muted)
- Snippet: `text-xs text-muted-foreground` line-clamp-1
- Time: `text-xs text-muted-foreground tabular-nums` (relative time)

### Hover Actions (Desktop Only)

- Pin/Unpin icon button (top-right)
- More actions (⋯) dropdown: Move to project, Delete
- Actions reveal on hover: `opacity-0 group-hover:opacity-100`

## Editor Specification

### Desktop: Right Pane

#### Empty State

- Use `Empty` component:
  - Icon: `FileTextIcon` or `NoteIcon`
  - Title: "Select a note"
  - Description: "Choose a note from the list or create a new one"
  - CTA button: "Create note" (only if in "All" or valid project scope)

#### Editor UI

```
┌────────────────────────────────────────────────┐
│ [Title Input                                   ]│
│ [Project Badge] [Updated 2 hours ago]  [Pin ⋮ ✕]│
├────────────────────────────────────────────────┤
│                                                │
│ [                                              │
│  Full-height textarea                          │
│  for note content...                           │
│                                                │
│ ]                                              │
│                                                │
└────────────────────────────────────────────────┘
```

### Components

- **Title**: `Input` with `text-sm font-medium`, placeholder "Note title"
- **Meta row**: `Badge variant="outline"` for project, `text-xs` timestamp
- **Body**: `Textarea` with `flex-1 min-h-0 resize-none`
  - Auto-grow or fixed height with scroll
- **Actions** (top-right):
  - Pin/Unpin: `Button variant="ghost" size="icon-sm"`
  - Move: Dropdown to change project
  - Delete: With confirmation (alert dialog pattern)

### Mobile: Bottom Sheet

- Trigger: Tapping any note in list
- Sheet: `side="bottom"`, `className="h-[85vh]"`
- Same editor UI wrapped in `SheetContent`
- Close button or swipe down to dismiss
- Back button to return to list (on mobile, we might want a back arrow)

## Interactions (Local State Only)

### Create Note

1. Click "New note" button
2. Create mock note: `{ _id: random, projectId: currentFilter, title: "", content: "", pinned: false, createdAt: now, updatedAt: now }`
3. Add to state, select it
4. Focus title input
5. If no project selected, default to "**none**"

### Edit Note

- Title/content edits update local state immediately
- Update `updatedAt` on each change (or debounced)
- Visual "Saved" indicator optional (can be static for MVP)

### Pin/Unpin

- Toggle `pinned` boolean
- Re-sorts list immediately (pinned first)
- Visual pin icon appears on note row and in editor

### Move Note

- Dropdown: list of all projects + "No project"
- Changes `projectId` in state
- Note moves to new section in "By project" view

### Delete Note

- Confirm with `AlertDialog` (pattern from Inbox)
- Remove from state
- Select next logical note (next in list, or previous, or none)

### Search

- Filters notes by `title.includes(query)` or `content.includes(query)`
- Case-insensitive
- Works within current view mode (By project shows grouped results, Recent/Pinned show flat filtered)
- Clear button resets query

### Project Filter

- "All projects": shows all notes (grouped by project)
- Specific project: shows only that project's notes (still grouped, but single section)
- "No project": shows only unassigned notes

## Responsive Behavior

### Breakpoints

- Mobile: `< md` (default Tailwind `md:` breakpoint)
- Desktop: `md+`

### Mobile Specific

- Hide right pane completely
- List takes full width
- Editor opens in `Sheet`
- Simplified note rows (may hide hover actions, use tap for menu)
- Filter controls may stack vertically

### Desktop Specific

- Fixed 350px left pane (or use resizable later)
- Right pane fills remaining space
- Hover actions visible on note rows
- Editor always visible when note selected

## Shadcn Components Needed (Optional Enhancements)

- **Phase 1**: Use existing components only (Button, Input, Textarea, Select, Tabs, Sheet, Badge, DropdownMenu, Empty, AlertDialog)
- **Phase 2+** (optional):
  - `@shadcn/resizable` for draggable pane width
  - `@shadcn/scroll-area` if native overflow needs styling help
  - `@shadcn/command` for Cmd+K notes palette (future)

## File Structure Plan

### Phase 1 (Single File)

`apps/web/app/app/notes/page.tsx` - Everything in one file, similar to `projects/page.tsx`

### Phase 2 (Extracted Components)

```
apps/web/components/notes/
├── notes-shell.tsx       # Layout + responsive logic
├── notes-sidebar.tsx     # Left pane (filters + list)
├── notes-list.tsx        # List rendering by mode
├── note-row.tsx          # Individual note row
├── note-editor.tsx       # Right pane editor
└── note-sheet.tsx        # Mobile sheet wrapper
```

## Mock Data Examples

### Projects

```typescript
const mockProjects = [
  { _id: "p1", title: "Website Redesign", icon: "🎨" },
  { _id: "p2", title: "Q1 Planning", icon: "📊" },
  { _id: "p3", title: "Personal", icon: "🏠" },
];
```

### Notes

```typescript
const mockNotes = [
  {
    _id: "n1",
    projectId: "p1",
    title: "Color palette ideas",
    content: "Consider using a blue-grey primary with orange accents...",
    pinned: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    updatedAt: Date.now() - 1000 * 60 * 30, // 30 min ago
  },
  {
    _id: "n2",
    projectId: "p1",
    title: "Typography research",
    content: "Look into Inter and Geist as options...",
    pinned: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    _id: "n3",
    projectId: "__none__",
    title: "Random idea",
    content: "What if we added voice notes?",
    pinned: false,
    createdAt: Date.now() - 1000 * 60 * 60,
    updatedAt: Date.now() - 1000 * 60 * 60,
  },
];
```

## Success Criteria

- [ ] Page matches visual style of Tasks/Inbox/Projects exactly
- [ ] Desktop: functional 2-pane layout with project-scoped lists
- [ ] Mobile: list + sheet pattern works smoothly
- [ ] All list modes work (By project, Recent, Pinned)
- [ ] Create, edit, pin, move, delete all functional (local state)
- [ ] Search filters notes correctly
- [ ] Empty states use correct component and messaging
- [ ] Hover actions match app patterns
- [ ] No TypeScript errors, no broken imports

---

**Status**: Phase 0 Complete - Specification Locked
**Next**: Phase 1 - Page Skeleton Implementation
