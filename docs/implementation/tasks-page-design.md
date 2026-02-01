# Tasks Page Implementation Plan

**Status**: Ready for implementation  
**Last Updated**: 2026-02-01  
**Schema Version**: 1.0 (see convex-data-model.md)

## Overview

Implement a dual-view Tasks page for the Taskflow web app with persistence via Convex. The page supports two layouts:

- **Board View**: Classic Kanban with 4 status columns (Not Started, To Do, In Progress, Completed)
- **Today+Board View**: Split layout with a "Today" focus lane plus the standard board

Drag-and-drop interactions are deferred to Phase 4.

---

## Phase 1: Tasks UI (No Persistence)

**Goal**: Build the visual layout for both task views with in-memory switching.

### Components to Create/Modify

#### 1.1 Main Tasks Page

- **File**: `apps/web/app/app/tasks/page.tsx`
- **Changes**:
  - Convert to client component (`"use client"`)
  - Add view state (local React state)
  - Render view switcher (segmented control)
  - Conditionally render Board vs Today+Board layouts

```typescript
// View switcher using Tabs component
const [currentView, setCurrentView] = useState<"board" | "todayPlusBoard">("board");

// Toggle UI
<Tabs value={currentView} onValueChange={setCurrentView}>
  <TabsList>
    <TabsTrigger value="board">Board</TabsTrigger>
    <TabsTrigger value="todayPlusBoard">Today + Board</TabsTrigger>
  </TabsList>
</Tabs>
```

#### 1.2 Board View Component

- **File**: `apps/web/components/tasks/board-view.tsx` (new)
- **Layout**:
  ```
  ┌─────────────────────────────────────────────────────────────────┐
  │ NOT STARTED   TO DO        IN PROGRESS    COMPLETED             │
  │ [ + ]         [ + ]        [ + ]          [✓ Hide ▾]           │
  │ ┌─────────┐   ┌─────────┐  ┌─────────┐    ┌─────────┐          │
  │ │ Card    │   │ Card    │  │ Card    │    │ Card    │          │
  │ └─────────┘   └─────────┘  └─────────┘    └─────────┘          │
  └─────────────────────────────────────────────────────────────────┘
  ```
- **Features**:
  - 4 columns using CSS Grid or Flex
  - Column headers with count badges
  - "Add task" button per column (creates task with that status)
  - Task cards showing: title, priority dot, due date, project badge, tags
  - Click card to open details Sheet (placeholder in Phase 1)
  - Empty states for each column

#### 1.3 Today+Board View Component

- **File**: `apps/web/components/tasks/today-board-view.tsx` (new)
- **Layout**:
  ```
  ┌─────────────────────────────┬───────────────────────────────────┐
  │ TODAY (2026-02-01)  [ + ]   │ BOARD                             │
  │ ┌─────────────────────────┐ │ ┌──────────┐ ┌──────────┐        │
  │ │ Task 1                  │ │ │Not Start │ │To Do     │        │
  │ │ Task 2                  │ │ │In Prog   │ │Completed │        │
  │ └─────────────────────────┘ │ └──────────┘ └──────────┘        │
  └─────────────────────────────┴───────────────────────────────────┘
  ```
- **Features**:
  - Left pane: "Today" lane (40% width on desktop, full-width on mobile)
  - Right pane: Same 4-column board (60% width)
  - Today lane shows tasks with scheduledDate = today (mock data in Phase 1)
  - Mobile: Stack vertically or use tabs

#### 1.4 Task Card Component

- **File**: `apps/web/components/tasks/task-card.tsx` (new)
- **Design**:
  - Compact card with minimal styling
  - Title (truncate to 2 lines)
  - Footer row:
    - Priority indicator (dot: low/medium/high colors)
    - Due date pill (if set)
    - Scheduled date pill (if set)
    - Project name badge
    - Tag dots (first 3 tags)
  - Hover: show "..." menu button (actions deferred to Phase 4)
  - Click: open Task Details Sheet

#### 1.5 Task Details Sheet (Placeholder)

- **File**: `apps/web/components/tasks/task-details-sheet.tsx` (new)
- **Features**:
  - Right-side Sheet using `apps/web/components/ui/sheet.tsx`
  - Placeholder content showing task fields
  - Close button
  - Form structure (non-functional in Phase 1)

### Styling Guidelines

- Use existing design system components from `apps/web/components/ui/`
- Follow "sharp" aesthetic: `rounded-none` borders, no border-radius
- Color scheme:
  - Low priority: blue/gray
  - Medium priority: yellow/amber
  - High priority: red
- Column headers: sticky positioning for scroll
- Responsive breakpoints:
  - Mobile (< 768px): Single column or horizontal scroll
  - Tablet (768px - 1024px): 2x2 grid
  - Desktop (> 1024px): 4 columns

### Phase 1 Acceptance Criteria

- [ ] Board view renders 4 columns with mock tasks
- [ ] Today+Board view renders split layout with mock data
- [ ] View switcher toggles between layouts
- [ ] Task cards display all required metadata
- [ ] Clicking card opens details Sheet
- [ ] Empty states shown when no tasks
- [ ] Responsive on mobile/tablet/desktop
- [ ] No TypeScript or build errors

---

## Phase 2: Data + API (Convex Persistence)

**Goal**: Persist task view preference to Convex and load on page init.

### Database Schema Changes

#### 2.1 Update userPreferences Schema

- **File**: `apps/web/convex/schema.ts`
- **Add field** to `userPreferences` table:

```typescript
userPreferences: defineTable({
  userId: v.id("users"),
  defaultAIModel: v.string(),
  // NEW FIELD:
  taskDefaultView: v.optional(v.union(
    v.literal("board"),
    v.literal("todayPlusBoard")
  )),
}).index("by_user", ["userId"]),
```

### Convex Functions

#### 2.2 Update User Initialization

- **File**: `apps/web/convex/users.ts`
- **Function**: `ensureViewerInitialized`
- **Change**: Set `taskDefaultView: "board"` when creating preferences:

```typescript
const preferencesId = await ctx.db.insert("userPreferences", {
  userId,
  defaultAIModel: defaultModel?.modelId || "openai/gpt-4",
  taskDefaultView: "board", // NEW
});
```

#### 2.3 Update Preferences Mutation

- **File**: `apps/web/convex/preferences.ts`
- **Function**: `updateMyPreferences`
- **Changes**:
  - Accept partial updates (so you can update just `taskDefaultView`)
  - Add validation for `taskDefaultView` values
  - Support both `defaultAIModel` and `taskDefaultView` updates

```typescript
export const updateMyPreferences = mutation({
  args: {
    defaultAIModel: v.optional(v.string()),
    taskDefaultView: v.optional(
      v.union(v.literal("board"), v.literal("todayPlusBoard")),
    ),
  },
  handler: async (ctx, args) => {
    // ... validation ...
    const patch: Partial<Doc<"userPreferences">> = {};
    if (args.defaultAIModel !== undefined) {
      patch.defaultAIModel = args.defaultAIModel;
    }
    if (args.taskDefaultView !== undefined) {
      patch.taskDefaultView = args.taskDefaultView;
    }
    // ... apply patch ...
  },
});
```

### Frontend Integration

#### 2.4 Update Tasks Page to Load/Save View

- **File**: `apps/web/app/app/tasks/page.tsx`
- **Changes**:
  - Import `useViewer` hook
  - Load initial view from `viewer.preferences?.taskDefaultView ?? "board"`
  - On view change, call `api.preferences.updateMyPreferences({ taskDefaultView })`
  - Show loading state while preferences load

```typescript
const { viewer, isLoading } = useViewer();
const [currentView, setCurrentView] = useState<"board" | "todayPlusBoard">(
  "board",
);
const updatePreferences = useMutation(api.preferences.updateMyPreferences);

// Load saved preference
useEffect(() => {
  if (viewer?.preferences?.taskDefaultView) {
    setCurrentView(viewer.preferences.taskDefaultView);
  }
}, [viewer]);

// Persist on change
const handleViewChange = async (newView: "board" | "todayPlusBoard") => {
  setCurrentView(newView);
  await updatePreferences({ taskDefaultView: newView });
};
```

#### 2.5 Update useViewer Hook (if needed)

- **File**: `apps/web/components/settings/hooks/use-viewer.ts`
- **Ensure**: Hook exposes `taskDefaultView` in preferences return value

### Phase 2 Acceptance Criteria

- [ ] Schema updated with `taskDefaultView` field
- [ ] `npx convex codegen` runs without errors
- [ ] New preferences get `taskDefaultView: "board"`
- [ ] Tasks page loads saved view on refresh
- [ ] Switching views persists to database
- [ ] Preference persists across sessions
- [ ] Fallback to "board" when preference is missing

---

## Phase 3: Settings UI

**Goal**: Allow users to set default task view from Settings page.

### Settings Page Changes

#### 3.1 Update Preferences Tab

- **File**: `apps/web/components/settings/preferences-tab/preferences-tab.tsx`
- **Changes**:
  - Add "Tasks" section under "General Preferences"
  - Add "Default task view" selector using `Select` component
  - Display current value
  - Save on change with toast notification

```typescript
// In PreferencesTab
const [taskView, setTaskView] = useState(
  preferences?.taskDefaultView || "board",
);

const handleTaskViewChange = async (newView: "board" | "todayPlusBoard") => {
  setTaskView(newView);
  await updatePreferences({ taskDefaultView: newView });
  toast.success("Default task view updated");
};
```

#### 3.2 Selector Component

- **UI**: Use `apps/web/components/ui/select.tsx`
- **Options**:
  - "Board" (Kanban view)
  - "Today + Board" (Split view with focus lane)
- **Styling**: Match existing preferences form styling
- **Behavior**: Immediate save on selection change

### Phase 3 Acceptance Criteria

- [ ] Preferences tab shows "Tasks" section
- [ ] Default task view selector is present
- [ ] Current value displayed correctly
- [ ] Changing value persists to database
- [ ] Toast confirmation on success
- [ ] Error handling with toast on failure
- [ ] Selector matches design system styling

---

## Phase 4: Later Enhancements (Deferred)

**Note**: These features are not part of the current implementation plan but documented for future reference.

### Drag and Drop

- Implement Kanban drag-and-drop using dnd-kit or similar
- Drag between columns updates `status` field
- Drag within column updates `orderIndex`
- Today lane drag-and-drop for ordering

### Real Data Integration

- Connect to actual `tasks`, `projects`, `tags` Convex queries
- Implement task CRUD operations
- Real-time updates via Convex subscriptions
- Filter and search functionality

### Advanced Features

- Quick actions on task cards (complete, schedule, prioritize)
- Keyboard shortcuts
- Command palette integration
- Bulk operations
- Task templates

---

## Technical Dependencies

### Components Required

- `apps/web/components/ui/tabs.tsx` - View switcher
- `apps/web/components/ui/sheet.tsx` - Task details panel
- `apps/web/components/ui/select.tsx` - Settings selector
- `apps/web/components/ui/card.tsx` - Task cards
- `apps/web/components/ui/button.tsx` - Action buttons
- `apps/web/components/ui/badge.tsx` - Metadata badges
- `apps/web/components/ui/skeleton.tsx` - Loading states

### Convex Integration

- `apps/web/convex/schema.ts` - Schema definitions
- `apps/web/convex/users.ts` - User initialization
- `apps/web/convex/preferences.ts` - Preference mutations
- `apps/web/components/settings/hooks/use-viewer.ts` - User data hook

### Styling

- Tailwind CSS 4.x (existing setup)
- Existing color tokens and design system
- `cn()` utility from `apps/web/lib/utils.ts`

---

## Implementation Checklist

### Phase 1: UI

- [ ] Create `apps/web/components/tasks/board-view.tsx`
- [ ] Create `apps/web/components/tasks/today-board-view.tsx`
- [ ] Create `apps/web/components/tasks/task-card.tsx`
- [ ] Create `apps/web/components/tasks/task-details-sheet.tsx`
- [ ] Update `apps/web/app/app/tasks/page.tsx`
- [ ] Add mock data for visual testing
- [ ] Test responsive layouts
- [ ] Verify component imports work

### Phase 2: Persistence

- [ ] Update `apps/web/convex/schema.ts` with `taskDefaultView`
- [ ] Update `apps/web/convex/users.ts` initialization
- [ ] Update `apps/web/convex/preferences.ts` mutation
- [ ] Run `npx convex codegen`
- [ ] Update `apps/web/app/app/tasks/page.tsx` to load/save view
- [ ] Test persistence across refresh

### Phase 3: Settings

- [ ] Update `apps/web/components/settings/preferences-tab/preferences-tab.tsx`
- [ ] Add task view selector UI
- [ ] Wire up save functionality
- [ ] Test end-to-end (Settings change → Tasks page reflects)

### General

- [ ] Run `npm run lint` and fix any issues
- [ ] Test on mobile viewport
- [ ] Verify no console errors
- [ ] Accessibility check (keyboard navigation)

---

## File Structure

```
apps/web/
├── app/
│   └── app/
│       └── tasks/
│           └── page.tsx              # Main tasks page
├── components/
│   ├── tasks/
│   │   ├── board-view.tsx            # Kanban board layout
│   │   ├── today-board-view.tsx      # Today+Board split layout
│   │   ├── task-card.tsx             # Individual task card
│   │   └── task-details-sheet.tsx    # Task details panel
│   └── settings/
│       └── preferences-tab/
│           └── preferences-tab.tsx   # Updated preferences UI
├── convex/
│   ├── schema.ts                     # Updated with taskDefaultView
│   ├── users.ts                      # Updated initialization
│   └── preferences.ts                # Updated mutations
└── components/settings/hooks/
    └── use-viewer.ts                 # Hook for user data
```

---

## Schema Reference

### Task Model Fields (for UI reference)

Based on `docs/implementation/convex-data-model.md`:

**Core**: title, description, status, priority  
**Dates**: dueDate, scheduledDate, completionDate  
**Relationships**: projectId, tagIds, parentTaskId  
**Metadata**: estimatedDuration, actualDuration, energyLevel, context, source, orderIndex  
**AI**: aiSummary, aiContext, embedding  
**Tracking**: lastActiveAt, streakCount, difficulty, isTemplate

### User Preferences Schema

```typescript
{
  userId: Id<"users">,
  defaultAIModel: string,
  taskDefaultView?: "board" | "todayPlusBoard",  // NEW
}
```

---

## Questions & Decisions Log

**Q: Why "board" as default?**  
A: Board view is the most familiar Kanban pattern. Today+Board is power-user feature.

**Q: Why split Today+Board into a separate view?**  
A: Screen real estate. Split view works best on larger screens. Mobile users can use filters.

**Q: Why no drag-and-drop in Phase 1-3?**  
A: Reduce complexity. Can be added in Phase 4 without breaking existing functionality.

**Q: What if user has no preferences record?**  
A: Fall back to "board" and initialize via `ensureViewerInitialized`.

---

## Related Documentation

- `docs/implementation/convex-data-model.md` - Full data model specification
- `apps/web/components/ui/` - UI component library
- `apps/web/AGENTS.md` - Code style and conventions

---

**Next Steps**: Begin Phase 1 implementation. Start with `apps/web/app/app/tasks/page.tsx` structure and view switcher.
