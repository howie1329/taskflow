# Base Layout Restructure

## Overview

The base layout has been restructured to provide a more modern and flexible application structure with three main components:

1. **Persistent Header** (Top)
2. **Left Sidebar** (Collapsible Navigation)
3. **Main Content Area** (Center)
4. **Right Sidebar** (Contextual Information)

## Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     Header (AppHeader)                       │
│  [Menu] TaskFlow    [Theme] [Notifications] [User Menu]     │
├──────────┬──────────────────────────────────┬───────────────┤
│          │                                  │               │
│  Left    │                                  │    Right      │
│ Sidebar  │      Main Content Area           │   Sidebar     │
│          │                                  │               │
│  Nav     │      (Page Content)              │   Context     │
│  Items   │                                  │   Info        │
│          │                                  │               │
│          │                                  │               │
└──────────┴──────────────────────────────────┴───────────────┘
```

## Components

### 1. AppHeader (`/presentation/components/Layout/AppHeader.js`)

A persistent header component that appears at the top of all pages within the mainview.

**Features:**
- Logo and sidebar toggle button
- Theme switcher (Light/Dark/System)
- Notifications popover
- User account menu with sign out

**Location:** Always visible at the top of the viewport

### 2. AppSideBar (`/presentation/components/Layout/AppSideBar.js`)

The left navigation sidebar with collapsible functionality.

**Features:**
- Collapsible to icon-only mode (Cmd/Ctrl + B)
- Navigation items for all main sections:
  - Inbox
  - Schedule
  - Task
  - Todo
  - Projects
  - Notes
  - AI Chat
- Shows sub-items for Notes and AI Chat sections

**Behavior:**
- Desktop: Fixed left sidebar, collapsible to icon mode
- Mobile: Sheet overlay that slides in from the left

### 3. RightSidebar (`/presentation/components/Layout/RightSidebar.js`)

A contextual sidebar on the right side showing relevant information.

**Features:**
- Today's Overview (tasks due, events, notes)
- Quick Stats (completion progress)
- Recent Activity feed
- Customizable per page (pass `children` prop)

**Behavior:**
- Desktop (lg+): Always visible at 320px width
- Mobile/Tablet: Hidden on screens smaller than `lg` breakpoint

## Implementation

### Layout File (`/app/mainview/layout.js`)

The main layout structure uses the following hierarchy:

```jsx
<SidebarProvider>
  <AppSideBar />
  <div className="flex-1 flex flex-col min-h-screen">
    <AppHeader />
    <div className="flex flex-1 overflow-hidden">
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <RightSidebar />
    </div>
  </div>
</SidebarProvider>
```

### Key Classes

- Main container: `flex-1 flex flex-col min-h-screen`
- Content area: `flex flex-1 overflow-hidden`
- Main content: `flex-1 overflow-auto`

### Height Management

**Important:** Pages should use `h-full` instead of fixed viewport heights (`h-[96vh]`, etc.) because:
1. The header takes up vertical space
2. The layout manages the overall height
3. Using `h-full` allows proper scrolling within the main content area

## Responsive Design

### Breakpoints

- **Mobile** (`< 768px`): 
  - Left sidebar as overlay sheet
  - Right sidebar hidden
  - Header always visible

- **Tablet** (`768px - 1024px`):
  - Left sidebar collapsible
  - Right sidebar hidden
  - Header always visible

- **Desktop** (`> 1024px`):
  - Left sidebar collapsible
  - Right sidebar visible
  - Header always visible

## Migration Notes

### Changes Made

1. **Header Extraction:** User controls (theme, notifications, account) moved from sidebar to header
2. **Sidebar Simplification:** AppSideBar now only contains navigation items
3. **Height Fixes:** Updated all pages to use `h-full` instead of fixed vh units:
   - TaskPageClient
   - ChatPageClient
   - Schedule page
   - BrainDumpColumn
   - ScheduleColumn
   - Notes detail page

### Breaking Changes

None - the layout is backwards compatible with existing pages.

## Customizing the Right Sidebar

To customize the right sidebar content for a specific page, you can:

1. Import the component in your layout
2. Pass custom content as children
3. Set `defaultContent={false}` to disable default content

Example:
```jsx
<RightSidebar defaultContent={false}>
  <YourCustomContent />
</RightSidebar>
```

## Keyboard Shortcuts

- `Cmd/Ctrl + B` - Toggle left sidebar collapse
- `Cmd/Ctrl + K` - Open global search

## Future Enhancements

Potential improvements:
1. Make right sidebar collapsible
2. Add page-specific right sidebar content
3. Persist sidebar state in localStorage
4. Add transition animations
5. Support for split-view modes
