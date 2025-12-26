# Base Layout Restructure

## Overview

The base layout has been restructured to provide a more modern and flexible application structure with three main components:

1. **Persistent Header** (Top)
2. **Left Sidebar** (Collapsible Navigation)
3. **Main Content Area** (Center)

## Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     Header (AppHeader)                       │
│  [Menu] TaskFlow    [Theme] [Notifications] [User Menu]     │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                   │
│  Left    │                                                   │
│ Sidebar  │           Main Content Area                       │
│          │                                                   │
│  Nav     │           (Page Content)                          │
│  Items   │                                                   │
│          │                                                   │
│          │                                                   │
└──────────┴───────────────────────────────────────────────────┘
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

## Implementation

### Layout File (`/app/mainview/layout.js`)

The main layout structure uses the following hierarchy:

```jsx
<SidebarProvider>
  <AppSideBar />
  <div className="flex-1 flex flex-col min-h-screen">
    <AppHeader />
    <main className="flex-1 overflow-auto">
      {children}
    </main>
  </div>
</SidebarProvider>
```

### Key Classes

- Main container: `flex-1 flex flex-col min-h-screen`
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
  - Header always visible

- **Tablet** (`768px - 1024px`):
  - Left sidebar collapsible
  - Header always visible

- **Desktop** (`> 1024px`):
  - Left sidebar collapsible
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

## Keyboard Shortcuts

- `Cmd/Ctrl + B` - Toggle left sidebar collapse
- `Cmd/Ctrl + K` - Open global search

## Future Enhancements

Potential improvements:
1. Persist sidebar state in localStorage
2. Add transition animations
3. Support for split-view modes
4. Add breadcrumb navigation to header
