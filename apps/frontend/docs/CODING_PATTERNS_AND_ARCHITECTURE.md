# Frontend Coding Patterns & Architecture Guide

## Overview

This document outlines the coding patterns, architectural decisions, and best practices for the TaskFlow frontend. These patterns reduce code duplication, improve performance, and create maintainable React code.

---

## Table of Contents

1. [Core Philosophy](#core-philosophy)
2. [Current State](#current-state)
3. [Recommended Patterns](#recommended-patterns)
4. [File Structure](#file-structure)
5. [Migration Guide](#migration-guide)

---

## Core Philosophy

### The Five Principles

1. **Hook Composition** - Build complex hooks from simple ones
2. **Factory Pattern** - Create similar hooks/components with factories
3. **DRY (Don't Repeat Yourself)** - Extract common utilities
4. **Separation of Concerns** - UI state (Zustand) vs Server state (React Query)
5. **Performance First** - Memoization, lazy loading, code splitting

---

## Current State

### What We're Doing Well ✅

#### 1. React Query with Optimistic Updates

```javascript
// hooks/tasks/useCreateTask.js
const useCreateTask = () => {
  return useMutation({
    mutationFn: (task) => createTask(task, getToken),
    onMutate: async (task) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData(["tasks"]);
      queryClient.setQueryData(["tasks"], (old) => [...old, task]);
      return { previousTasks };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully");
    },
    onError: (context) => {
      queryClient.setQueryData(["tasks"], context.previousTasks);
      toast.error("Task creation failed");
    },
  });
};
```

**Why This Is Good:**
- ✅ Immediate UI updates (optimistic)
- ✅ Automatic rollback on error
- ✅ Cache invalidation
- ✅ User feedback (toasts)

#### 2. Zustand for UI State

```javascript
// presentation/hooks/useTaskUIStore.js
export const useTaskUIStore = create((set, get) => ({
  // UI State (not from server)
  activeSearch: false,
  searchQuery: "",
  filterStatuses: ["all"],
  
  // Actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  // Complex Logic
  handleStatusFilterChange: (status) => {
    const { filterStatuses } = get();
    // ... filtering logic
  },
}));
```

**Why This Is Good:**
- ✅ Clear separation: UI state in Zustand, server data in React Query
- ✅ No prop drilling
- ✅ Fast, lightweight

### What Needs Improvement ⚠️

#### 1. Code Duplication

**Problem:** Same code repeated across hooks and components

```javascript
// Repeated in EVERY mutation hook (47 lines each)
const useCreateTask = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (task) => createTask(task, getToken),
    onMutate: async (task) => { /* ... */ },
    onSuccess: () => { /* ... */ },
    onError: (context) => { /* ... */ },
  });
};

// Repeated in MULTIPLE components
const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case "high": return "bg-red-100 text-red-700";
    case "medium": return "bg-yellow-100 text-yellow-700";
    case "low": return "bg-green-100 text-green-700";
    default: return "bg-gray-100 text-gray-700";
  }
};
```

#### 2. File Structure Confusion

```
src/
├── components/      # What goes here?
├── presentation/
│   ├── components/  # vs here?
│   └── hooks/       # What about hooks/ at root?
└── hooks/           # Duplication!
```

---

## Recommended Patterns

### 1. Mutation Hook Factory 🔥 HIGHEST IMPACT

**Problem:** Every mutation hook has identical 47-line structure

**Solution:** Create a factory function

#### Implementation

```javascript
// shared/lib/api/createMutationHook.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

export const createMutationHook = ({
  mutationFn,
  queryKeys = [],
  optimisticUpdate,
  successMessage,
  errorMessage,
  onSuccessCallback,
}) => {
  return (options = {}) => {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (data) => {
        const token = await getToken();
        return mutationFn(data, token);
      },
      
      onMutate: async (data) => {
        if (!optimisticUpdate) return;
        
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ 
          queryKey: optimisticUpdate.queryKey 
        });
        
        // Snapshot previous value
        const previous = queryClient.getQueryData(optimisticUpdate.queryKey);
        
        // Optimistically update
        queryClient.setQueryData(
          optimisticUpdate.queryKey,
          optimisticUpdate.updater(data)
        );
        
        return { previous };
      },
      
      onSuccess: (result, variables, context) => {
        // Invalidate related queries
        queryKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
        
        // Success notification
        if (successMessage) {
          const message = typeof successMessage === 'function'
            ? successMessage(result)
            : successMessage;
          toast.success(message);
        }
        
        // Custom callback
        onSuccessCallback?.(result, variables, context);
      },
      
      onError: (error, variables, context) => {
        // Rollback optimistic update
        if (context?.previous && optimisticUpdate) {
          queryClient.setQueryData(
            optimisticUpdate.queryKey, 
            context.previous
          );
        }
        
        // Error notification
        const message = typeof errorMessage === 'function'
          ? errorMessage(error)
          : errorMessage || "Operation failed";
        toast.error(message);
      },
      
      ...options, // Allow overrides
    });
  };
};
```

#### Usage

```javascript
// features/tasks/hooks/useCreateTask.js
import { createMutationHook } from "@/shared/lib/api/createMutationHook";
import axiosClient from "@/shared/lib/api/client";

const createTask = async (task, token) => {
  const response = await axiosClient.post("/api/v1/tasks/create", task, {
    headers: { Authorization: token },
  });
  return response.data.data;
};

export const useCreateTask = createMutationHook({
  mutationFn: createTask,
  queryKeys: [["tasks"], ["project-tasks"]],
  optimisticUpdate: {
    queryKey: ["tasks"],
    updater: (newTask) => (old) => [...old, newTask],
  },
  successMessage: "Task created successfully",
  errorMessage: (error) => `Failed to create task: ${error.message}`,
});
```

**Result:**
- Before: 47 lines per hook
- After: 10 lines per hook
- **Savings: ~370 lines across 10+ hooks**

---

### 2. Utility Functions Library 🔥 HIGH IMPACT

**Problem:** Same helper functions repeated in multiple components

#### Implementation

```javascript
// shared/lib/utils/taskHelpers.js

/**
 * Task utility functions
 */
export const taskHelpers = {
  /**
   * Get Tailwind classes for priority badge
   */
  getPriorityColor(priority) {
    const colors = {
      high: "bg-red-100 text-red-700",
      medium: "bg-yellow-100 text-yellow-700",
      low: "bg-green-100 text-green-700",
    };
    return colors[priority?.toLowerCase()] || "bg-gray-100 text-gray-700";
  },

  /**
   * Convert status key to display label
   */
  getStatusLabel(status) {
    const labels = {
      notStarted: "Not Started",
      todo: "Todo",
      inProgress: "In Progress",
      done: "Done",
      overdue: "Overdue",
    };
    return labels[status] || status;
  },

  /**
   * Get status badge color
   */
  getStatusColor(status) {
    const colors = {
      notStarted: "bg-gray-100 text-gray-700",
      todo: "bg-blue-100 text-blue-700",
      inProgress: "bg-purple-100 text-purple-700",
      done: "bg-green-100 text-green-700",
      overdue: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  },

  /**
   * Check if task is overdue
   */
  isOverdue(date) {
    if (!date) return false;
    return new Date(date) < new Date();
  },

  /**
   * Format task date for display
   */
  formatDate(date) {
    if (!date) return "No date";
    const taskDate = new Date(date);
    const now = new Date();
    const diffTime = taskDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays <= 7) return `${diffDays} days`;
    
    return taskDate.toLocaleDateString();
  },

  /**
   * Get complete task display data
   */
  formatTaskForDisplay(task) {
    return {
      ...task,
      priorityColor: this.getPriorityColor(task.priority),
      statusLabel: this.getStatusLabel(task.status),
      statusColor: this.getStatusColor(task.status),
      isOverdue: this.isOverdue(task.date),
      dateLabel: this.formatDate(task.date),
    };
  },
};

/**
 * Date formatting utilities
 */
export const dateHelpers = {
  formatRelative(date) {
    if (!date) return "";
    const now = new Date();
    const target = new Date(date);
    const diffMs = target - now;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return `${Math.floor(diffMins / 1440)}d`;
  },

  formatFull(date) {
    if (!date) return "";
    return new Date(date).toLocaleString();
  },
};
```

#### Usage

```javascript
// Before: Repeated in TaskCard.jsx, TaskSheet.jsx, TaskDialog.jsx
const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case "high": return "bg-red-100 text-red-700";
    case "medium": return "bg-yellow-100 text-yellow-700";
    case "low": return "bg-green-100 text-green-700";
    default: return "bg-gray-100 text-gray-700";
  }
};

// After: One import
import { taskHelpers } from "@/shared/lib/utils/taskHelpers";

const TaskCard = ({ task }) => {
  const displayTask = taskHelpers.formatTaskForDisplay(task);
  
  return (
    <Card>
      <Badge className={displayTask.priorityColor}>
        {task.priority}
      </Badge>
      <Badge className={displayTask.statusColor}>
        {displayTask.statusLabel}
      </Badge>
      {displayTask.isOverdue && <OverdueIcon />}
      <span>{displayTask.dateLabel}</span>
    </Card>
  );
};
```

**Savings: ~50-100 lines across components**

---

### 3. React Query Configuration 🔥 MEDIUM IMPACT

**Problem:** Inconsistent cache times, stale times, retry logic

#### Implementation

```javascript
// shared/lib/api/queryClient.js
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
      onError: (error) => {
        console.error("Query error:", error);
      },
    },
    mutations: {
      retry: 0,
      onError: (error) => {
        console.error("Mutation error:", error);
      },
    },
  },
});

// Query key factory
export const queryKeys = {
  tasks: {
    all: ["tasks"],
    byId: (id) => ["tasks", id],
    byProject: (projectId) => ["tasks", "project", projectId],
  },
  notes: {
    all: ["notes"],
    byId: (id) => ["notes", id],
    byTask: (taskId) => ["notes", "task", taskId],
  },
  projects: {
    all: ["projects"],
    byId: (id) => ["projects", id],
  },
};

// Cache invalidation utilities
export const cacheUtils = {
  invalidateTask: (queryClient, taskId) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.byId(taskId) });
  },
  
  invalidateTaskAndRelated: (queryClient, taskId, projectId) => {
    cacheUtils.invalidateTask(queryClient, taskId);
    if (projectId) {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks.byProject(projectId) 
      });
    }
  },
};
```

---

### 4. Component Composition Pattern 🔥 MEDIUM IMPACT

**Problem:** Repeated card/list/loading patterns

#### Implementation

```javascript
// shared/components/common/DataCard.jsx
export const DataCard = ({ 
  data,
  isLoading,
  error,
  onEdit,
  onDelete,
  renderContent,
  renderActions,
  emptyMessage = "No data available",
}) => {
  if (isLoading) {
    return <CardSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Empty>
        <EmptyTitle>{emptyMessage}</EmptyTitle>
      </Empty>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {renderContent(data)}
      </CardContent>
      {renderActions && (
        <CardFooter className="flex justify-end gap-2">
          {renderActions({ data, onEdit, onDelete })}
        </CardFooter>
      )}
    </Card>
  );
};

// Usage
<DataCard
  data={task}
  isLoading={isLoading}
  error={error}
  onEdit={handleEdit}
  onDelete={handleDelete}
  emptyMessage="No task found"
  renderContent={(task) => (
    <>
      <h3 className="font-semibold">{task.title}</h3>
      <p className="text-muted-foreground">{task.description}</p>
    </>
  )}
  renderActions={({ onEdit, onDelete }) => (
    <>
      <Button onClick={onEdit}>Edit</Button>
      <Button onClick={onDelete} variant="destructive">Delete</Button>
    </>
  )}
/>
```

---

## File Structure

### Current Structure (Confusing)

```
src/
├── app/                 # Next.js App Router pages
├── components/ui/       # Shadcn components
├── hooks/              # React Query hooks?
├── presentation/       # What is this?
│   ├── components/     # More components?
│   └── hooks/          # More hooks?
└── lib/                # Utilities
```

### Recommended Structure (Feature-First)

```
src/
├── app/                              # Next.js pages ONLY
│   ├── (auth)/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   └── mainview/
│   └── layout.tsx
│
├── features/                         # Feature modules
│   ├── tasks/
│   │   ├── components/
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskSheet.tsx
│   │   │   ├── TaskKanban.tsx
│   │   │   └── CreateTaskDialog.tsx
│   │   ├── hooks/
│   │   │   ├── useTaskQuery.ts
│   │   │   ├── useTaskMutations.ts
│   │   │   └── useTaskFilters.ts
│   │   ├── stores/
│   │   │   └── useTaskUIStore.ts
│   │   ├── api/
│   │   │   └── taskApi.ts
│   │   ├── utils/
│   │   │   └── taskHelpers.ts
│   │   └── types.ts
│   │
│   ├── notes/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── ...
│   │
│   ├── ai-chat/
│   └── projects/
│
├── shared/                          # Shared across features
│   ├── components/
│   │   ├── ui/                     # Shadcn components
│   │   ├── layout/
│   │   │   ├── AppSidebar.tsx
│   │   │   └── AppHeader.tsx
│   │   └── common/
│   │       ├── DataCard.tsx
│   │       ├── DataTable.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── hooks/
│   │   ├── useSocket.ts
│   │   ├── useMobile.ts
│   │   └── useDebounce.ts
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts           # Axios instance
│   │   │   ├── queryClient.ts      # React Query config
│   │   │   └── createMutationHook.ts
│   │   ├── utils/
│   │   │   ├── cn.ts
│   │   │   ├── formatters.ts
│   │   │   └── validators.ts
│   │   └── constants/
│   │       ├── routes.ts
│   │       └── config.ts
│   │
│   └── types/                      # Shared TypeScript types
│       └── index.ts
│
└── styles/
    └── globals.css
```

### Benefits of Feature-First Structure

1. **Co-location** - Related code lives together
2. **Scalability** - Easy to add new features
3. **Clear boundaries** - No confusion about where files go
4. **Easier refactoring** - Move entire features
5. **Better imports** - Shorter, clearer paths

---

## Migration Guide

### Phase 1: Extract Utilities (Week 1)

**Goal:** Create shared utility functions

**Steps:**
1. Create `shared/lib/utils/` directory
2. Extract task helpers
3. Extract date formatters
4. Update imports in components

**Checklist:**
- [ ] Create taskHelpers.js
- [ ] Create dateHelpers.js
- [ ] Update TaskCard, TaskSheet, TaskDialog
- [ ] Remove duplicate functions

### Phase 2: Mutation Hook Factory (Week 2)

**Goal:** Standardize all mutation hooks

**Steps:**
1. Create `createMutationHook.js`
2. Test with useCreateTask
3. Apply to all task hooks
4. Apply to notes, projects hooks

**Checklist:**
- [ ] Implement createMutationHook
- [ ] Refactor useCreateTask
- [ ] Refactor useUpdateTask
- [ ] Refactor useDeleteTask
- [ ] Apply to notes hooks
- [ ] Apply to projects hooks

### Phase 3: File Structure (Week 3-4)

**Goal:** Reorganize into feature folders

**Steps:**
1. Create new folder structure
2. Move tasks feature first
3. Update imports
4. Repeat for other features

**Checklist:**
- [ ] Create features/ directory
- [ ] Move tasks components
- [ ] Move tasks hooks
- [ ] Move tasks stores
- [ ] Test tasks feature
- [ ] Migrate notes
- [ ] Migrate ai-chat
- [ ] Migrate projects

---

## Performance Best Practices

### 1. Memoization

```javascript
// Use useMemo for expensive computations
const filteredTasks = useMemo(() => {
  return tasks.filter(task => {
    // expensive filtering
  });
}, [tasks, filters]);

// Use useCallback for event handlers passed to children
const handleTaskClick = useCallback((taskId) => {
  // handler logic
}, [dependencies]);
```

### 2. Code Splitting

```javascript
// Lazy load heavy components
const BlockEditor = lazy(() => import("@/features/notes/components/BlockEditor"));

// Usage
<Suspense fallback={<EditorSkeleton />}>
  <BlockEditor />
</Suspense>
```

### 3. Query Optimization

```javascript
// Prefetch on hover
const { data, prefetch } = useQuery({
  queryKey: ["task", taskId],
  queryFn: () => fetchTask(taskId),
});

<Card onMouseEnter={() => prefetch()}>
  {/* ... */}
</Card>
```

---

## Resources

- [Critical Issues Summary](./CRITICAL_ISSUES_SUMMARY.md)
- [Code Review Report](./CODE_REVIEW_REPORT.md)
- [Migration TODO](./MIGRATION_TODO.md)

---

## Changelog

- **2025-12-27**: Created document
- **2025-12-27**: Documented mutation hook factory pattern
- **2025-12-27**: Documented utility functions pattern
- **2025-12-27**: Proposed new file structure

---

## Contributing

When adding new patterns:
1. Identify duplication (3+ times)
2. Extract to utility/factory
3. Test thoroughly
4. Document here
5. Update affected code
6. Create migration guide

