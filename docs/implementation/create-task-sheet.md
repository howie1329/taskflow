# Create Task Sheet - Implementation Plan

**Status**: ✅ Completed  
**Last Updated**: 2026-02-01  
**Scope**: UI-only implementation (no Convex persistence)

## Overview

Implemented a Linear-like Create Task Sheet for the Taskflow web app. When users create a task, the sheet closes and opens the existing Task Details sheet to show the newly created task.

## Design Decisions

### Why a Sheet, Not a Dialog?

- Task creation has multiple fields (title, description, project, status, priority, dates, tags)
- Sheet keeps the board visible in the background (Linear-style composer)
- Consistent with existing Task Details sheet interaction pattern
- Better for mobile (bottom sheet) vs cramped modal

### Flow

1. User clicks "Add task" in a column or the Today lane
2. Create Task Sheet opens with pre-filled defaults (status for columns, scheduled date for Today)
3. User fills in task details
4. On "Create": sheet closes → Task Details sheet opens with the new task
5. New task card appears immediately in the board (in-memory)

## Implementation

### Components Created

#### 1. CreateTaskSheet (`apps/web/components/tasks/create-task-sheet.tsx`)

- **Props**: `open`, `onOpenChange`, `defaults`, `onCreate`
- **Layout**:
  - Header with title and keyboard hint
  - Scrollable body with form fields
  - Sticky footer with Cancel/Create buttons
- **Fields** (in order):
  1. Title (required, autofocus)
  2. Description (optional textarea)
  3. Project (select, optional)
  4. Status (select, pre-filled)
  5. Priority (select, default: low, with color dots)
  6. Scheduled date (date input, pre-filled for Today)
  7. Due date (date input, optional)
  8. Tags (toggle buttons, optional)
- **Validation**:
  - Title required (disables Create button until valid)
  - Shows FieldError when attempting to submit with empty title
- **Keyboard Interactions**:
  - `Enter` on title input submits (if valid)
  - `Cmd/Ctrl + Enter` submits from anywhere
  - `Esc` closes sheet (Radix default)
- **Responsive**: Uses `useIsMobile()` to switch between `side="bottom"` (mobile) and `side="right"` (desktop)

### Components Modified

#### 2. Tasks Page (`apps/web/app/app/tasks/page.tsx`)

- **State Changes**:
  - Added `tasks` state (moved from using `mockTasks` directly)
  - Added `isCreateOpen` and `createDefaults` state for the Create sheet
- **New Handlers**:
  - `handleOpenCreate(defaults)` - opens create sheet with pre-filled values
  - `handleCreateTask(draft)` - creates task in memory, updates state, opens details sheet
- **JSX Changes**:
  - Updated `BoardView` and `TodayBoardView` props to include `onCreateTask`
  - Added `CreateTaskSheet` component at the bottom

#### 3. BoardView (`apps/web/components/tasks/board-view.tsx`)

- **New Prop**: `onCreateTask: (defaults: { status: Task["status"] }) => void`
- **Changes**:
  - Column "+" button now calls `onCreateTask({ status: column.id })`
  - `AddTaskCard` at bottom of each column now triggers create
  - Removed console.log TODOs

#### 4. TodayBoardView (`apps/web/components/tasks/today-board-view.tsx`)

- **New Prop**: `onCreateTask: (defaults: { status?: Task["status"]; scheduledDate?: string | null }) => void`
- **Changes**:
  - Today lane "+" button calls `onCreateTask({ status: "To Do", scheduledDate: today })`
  - Today lane `AddTaskCard` calls same handler
  - Passes `onCreateTask` through to inner `BoardView` (wrapped to maintain interface)
  - Removed console.log TODOs

### Bug Fixes (Unrelated)

#### 5. Dialog Component (`apps/web/components/ui/dialog.tsx`)

- Fixed import: `import { Dialog as DialogPrimitive } from "radix-ui"` → `import * as DialogPrimitive from "@radix-ui/react-dialog"`

#### 6. Spinner Component (`apps/web/components/ui/spinner.tsx`)

- Fixed type error with `strokeWidth` prop
- Simplified props interface to just `className?: string`

## Technical Details

### Type Handling

The mock Task type has some inference complexities due to union types in the data. Used type assertions (`as Task["field"]`) where necessary to satisfy TypeScript while maintaining the correct runtime behavior.

### Defaults System

- **Board columns**: Only `status` is pre-filled based on the column clicked
- **Today lane**: Both `status: "To Do"` and `scheduledDate: today` are pre-filled
- Empty form state is reset each time the sheet opens

### Styling Guidelines Followed

- Sharp aesthetic: `rounded-none` borders throughout
- Compact typography: `text-[10px]` labels with `uppercase tracking-wider`
- Linear-like spacing: `space-y-4` in body, `gap-2` in fields
- Color-coded priority dots (red/amber/blue)
- Mobile-optimized: Bottom sheet on mobile, right sheet on desktop
- Uses existing design system: `Field`, `Input`, `Textarea`, `Select`, `Button`, `Sheet`, `Separator`, `Badge`

## Files Modified/Created

```
apps/web/
├── components/
│   └── tasks/
│       ├── create-task-sheet.tsx      [NEW]
│       ├── board-view.tsx              [MOD]
│       ├── today-board-view.tsx        [MOD]
│   └── ui/
│       ├── dialog.tsx                  [FIX]
│       └── spinner.tsx                 [FIX]
├── app/app/
│   └── tasks/
│       └── page.tsx                    [MOD]
```

## Acceptance Criteria

- [x] Clicking "Add task" in any column opens Create sheet with that column's status pre-filled
- [x] Clicking "Add task" in Today lane opens Create sheet with today as scheduled date
- [x] Title is required and autofocused on open
- [x] Create button is disabled until title is entered
- [x] Validation shows error if attempting to submit with empty title
- [x] On Create: Create sheet closes and Task Details sheet opens immediately
- [x] New task appears in the board behind the sheets (in-memory)
- [x] Responsive: Bottom sheet on mobile, right sheet on desktop
- [x] Keyboard shortcuts work (Enter, Cmd+Enter, Esc)
- [x] Build passes without TypeScript errors

## Future Enhancements (Phase 4+)

- Connect to Convex for real persistence
- Add optimistic updates with proper error handling
- Implement drag-and-drop ordering
- Add subtask creation in the details sheet
- Quick-add templates
- Keyboard shortcut `N` for global new task

## Dependencies

- Uses existing UI primitives from `apps/web/components/ui/`
- Uses `useIsMobile` hook from `apps/web/hooks/use-mobile.ts`
- No new npm dependencies required
