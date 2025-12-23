# Code Improvement Examples for TaskFlow

This document identifies specific areas in the codebase where you can improve as a developer, with concrete examples and recommendations.

## 🔴 Critical Issues

### 1. Inconsistent Error Handling

**Problem**: Error handling is inconsistent across hooks. Some catch and show errors, others silently fail.

**Example 1 - Missing Error Handling:**
```javascript
// ❌ BAD: src/hooks/notes/useSaveNote.js
const saveNote = async (data, getToken) => {
  try {
    const token = await getToken();
    const response = await axiosClient.patch(`/api/v1/notes/${data.id}`, data, {
      headers: { Authorization: token },
      withCredentials: true,
    });
    return response.data.data;
  } catch (error) {
    console.error(error);  // ❌ Only logs, doesn't throw or handle
  }
};
```

**Example 2 - Inconsistent Pattern:**
```javascript
// ❌ BAD: src/hooks/tasks/useDeleteTask.js
const deleteTask = async (id, getToken) => {
  const token = await getToken();
  try {
    const response = await axiosClient.delete(`/api/v1/tasks/delete/${id}`, {
      headers: { Authorization: token },
      withCredentials: true,
    });
    return response.data.message;
  } catch (error) {
    console.error(error);  // ❌ Catches but doesn't throw, mutation thinks it succeeded
  }
};
```

**✅ RECOMMENDED FIX:**
```javascript
const saveNote = async (data, getToken) => {
  const token = await getToken();
  const response = await axiosClient.patch(`/api/v1/notes/${data.id}`, data, {
    headers: { Authorization: token },
    withCredentials: true,
  });
  return response.data.data;
  // Let errors bubble up - React Query will handle them in onError
};
```

### 2. Silent Failures in Mutations

**Problem**: Some mutations catch errors but don't throw them, causing React Query to think the mutation succeeded.

**Location**: `src/hooks/tasks/useDeleteTask.js`, `src/hooks/notes/useSaveNote.js`

**Impact**: User sees success toast even when operation fails.

---

## 🟡 Code Quality Issues

### 3. Excessive Console Statements

**Problem**: 41 files contain `console.log`, `console.error`, or `console.warn` statements that should be removed or replaced with proper logging.

**Examples:**
- `src/hooks/ai/utils/StreamingUtils.js` - Multiple `console.error` calls
- `src/lib/sockets/SocketStore.js` - Debug console.logs
- `src/hooks/tasks/useFetchAllTasks.js` - Console.error in production code

**✅ RECOMMENDATION**: 
- Remove debug `console.log` statements
- Replace `console.error` with a proper logging service (e.g., Sentry, LogRocket)
- Use environment-based logging: `if (process.env.NODE_ENV === 'development') console.log(...)`

### 4. Code Duplication - API Call Patterns

**Problem**: The same pattern of getting token, making request, handling errors is repeated across many hooks.

**Example - Repeated Pattern:**
```javascript
// This pattern appears in ~20+ files:
const someOperation = async (data, getToken) => {
  const token = await getToken();
  try {
    const response = await axiosClient.post("/api/v1/...", data, {
      headers: { Authorization: token },
      withCredentials: true,
    });
    return response.data.data;
  } catch (error) {
    console.error(error);
    toast.error("Operation failed");
  }
};
```

**✅ RECOMMENDATION**: Create a centralized API client wrapper:
```javascript
// src/lib/axios/apiClient.js
import axiosClient from "./axiosClient";
import { toast } from "sonner";

export const createApiCall = (endpoint, method = "GET") => {
  return async (data, getToken, options = {}) => {
    const token = await getToken();
    try {
      const response = await axiosClient({
        url: endpoint,
        method,
        data,
        headers: { Authorization: token },
        withCredentials: true,
        ...options,
      });
      return response.data.data;
    } catch (error) {
      // Centralized error handling
      const message = error.response?.data?.message || error.message;
      if (options.showError !== false) {
        toast.error(options.errorMessage || "Operation failed", {
          description: message,
        });
      }
      throw error; // Always throw for React Query
    }
  };
};
```

### 5. Inconsistent API Client Usage

**Problem**: Mix of `axiosClient` and native `fetch` API.

**Example:**
```javascript
// ❌ Inconsistent: src/hooks/ai/useSendAIMessage.js
// Uses axiosClient for one call:
const response = await axiosClient.post("/api/v1/conversations/create", ...);

// But uses fetch for another:
const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/conversations/${variables.conversationId}/messages`,
  ...
);
```

**✅ RECOMMENDATION**: Standardize on one approach (preferably axiosClient since it's already configured).

### 6. Missing Error Messages in User Feedback

**Problem**: Some error handlers don't provide useful error messages to users.

**Example:**
```javascript
// ❌ BAD: src/hooks/notes/useDeleteNote.js
onError: (error, variables, context) => {
  queryClient.setQueryData(["notes"], context.previousNotes);
  toast.error("Note deletion failed");  // ❌ No error details
},
```

**✅ RECOMMENDATION:**
```javascript
onError: (error, variables, context) => {
  queryClient.setQueryData(["notes"], context.previousNotes);
  toast.error("Note deletion failed", {
    description: error.response?.data?.message || error.message,
  });
},
```

### 7. Unnecessary Success Toast Timestamps

**Problem**: Success toasts include timestamps which clutter the UI.

**Example:**
```javascript
// ❌ BAD: src/hooks/tasks/useCreateTask.js
toast.success("Task created successfully", {
  description: new Date().toLocaleString(),  // ❌ Unnecessary timestamp
});
```

**✅ RECOMMENDATION**: Remove timestamps from success messages (keep for errors if needed for debugging).

---

## 🟢 Best Practices & Patterns

### 8. Missing Input Validation

**Problem**: No validation before API calls.

**Example:**
```javascript
// ❌ BAD: src/hooks/notes/useCreateNote.js
const createNote = async (data, getToken) => {
  const token = await getToken();
  const response = await axiosClient.post("/api/v1/notes/create", data, {
    // ❌ No validation that data has required fields
  });
};
```

**✅ RECOMMENDATION**: Add Zod validation:
```javascript
import { z } from "zod";

const createNoteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
});

const createNote = async (data, getToken) => {
  const validatedData = createNoteSchema.parse(data);
  // ... rest of function
};
```

### 9. Optimistic Updates Without Rollback Safety

**Problem**: Some optimistic updates don't properly handle edge cases.

**Example:**
```javascript
// ⚠️ POTENTIAL ISSUE: src/hooks/tasks/useCreateTask.js
onMutate: async (task) => {
  await queryClient.cancelQueries({ queryKey: ["tasks"] });
  const previousTasks = queryClient.getQueryData(["tasks"]);
  queryClient.setQueryData(["tasks"], (old) => [...old, task]);
  // ❌ What if old is undefined? Will crash
  return { previousTasks };
},
```

**✅ RECOMMENDATION:**
```javascript
onMutate: async (task) => {
  await queryClient.cancelQueries({ queryKey: ["tasks"] });
  const previousTasks = queryClient.getQueryData(["tasks"]) || [];
  queryClient.setQueryData(["tasks"], (old) => [...(old || []), task]);
  return { previousTasks };
},
```

### 10. Missing Loading States

**Problem**: Some operations don't provide loading feedback.

**Example**: `useSaveNote` doesn't expose loading state for UI feedback.

**✅ RECOMMENDATION**: Always expose loading states:
```javascript
const useSaveNote = () => {
  // ...
  return useMutation({
    mutationFn: (data) => saveNote(data, getToken),
    // ...
  });
  
  // Usage: const { mutate: saveNote, isPending } = useSaveNote();
};
```

### 11. Hardcoded Magic Values

**Problem**: Magic strings and numbers scattered throughout code.

**Example:**
```javascript
// ❌ BAD: src/hooks/tasks/useFetchAllTasks.js
staleTime: 2 * 60 * 1000,  // What does this mean?

// ❌ BAD: src/presentation/components/task/TaskCard.js
width: "30vw",
minWidth: "30vw",  // Magic values
```

**✅ RECOMMENDATION**: Extract to constants:
```javascript
// src/lib/constants.js
export const QUERY_STALE_TIMES = {
  TASKS: 2 * 60 * 1000, // 2 minutes
  NOTES: 5 * 60 * 1000, // 5 minutes
};

export const DRAG_PREVIEW_STYLES = {
  WIDTH: "30vw",
  OPACITY: 0.5,
};
```

### 12. Missing Type Safety

**Problem**: No TypeScript or PropTypes, making refactoring risky.

**✅ RECOMMENDATION**: 
- Consider migrating to TypeScript gradually
- Or add PropTypes/JSDoc comments for critical functions:
```javascript
/**
 * @param {Object} task - Task object
 * @param {string} task.id - Task ID
 * @param {string} task.title - Task title
 * @param {'high'|'medium'|'low'} task.priority - Task priority
 */
const useCreateTask = () => { ... }
```

### 13. Inefficient Query Invalidation

**Problem**: Over-invalidating queries causes unnecessary refetches.

**Example:**
```javascript
// ❌ BAD: src/hooks/tasks/useUpdateTask.js
onSuccess: (data, variables) => {
  queryClient.invalidateQueries({ queryKey: ["tasks"] });  // Invalidates ALL tasks
  queryClient.invalidateQueries({ queryKey: ["subtasks", variables.taskId] });
  // Could just update the specific task in cache
},
```

**✅ RECOMMENDATION**: Use `setQueryData` for updates when possible:
```javascript
onSuccess: (data, variables) => {
  // Update specific task instead of invalidating all
  queryClient.setQueryData(["tasks"], (old) =>
    old.map((task) => (task.id === variables.taskId ? data : task))
  );
  queryClient.invalidateQueries({ queryKey: ["subtasks", variables.taskId] });
},
```

### 14. Missing Error Boundaries

**Problem**: No React Error Boundaries to catch component errors gracefully.

**✅ RECOMMENDATION**: Add error boundaries:
```javascript
// src/components/ErrorBoundary.jsx
"use client";
import { Component } from "react";

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page.</div>;
    }
    return this.props.children;
  }
}
```

### 15. Socket Connection Cleanup

**Problem**: Socket listeners might not be properly cleaned up.

**Example:**
```javascript
// ⚠️ POTENTIAL ISSUE: src/lib/sockets/SocketStore.js
disconnectSocket: () => {
  const socket = get().socket;
  if (socket) {
    socket.removeAllListeners();  // ✅ Good
    socket.disconnect();
  }
  set({ socket: null, isConnected: false });
},
```

**Note**: This looks okay, but ensure all components using sockets properly cleanup.

---

## 📝 Code Organization

### 16. TODO Comments Indicating Technical Debt

**Found TODOs:**
- `src/presentation/components/notes/layout/NotesSideBar.js:91` - Extract create note dialog
- `src/presentation/components/projects/layout/ProjectSidebar.js:96` - Extract create project dialog
- `src/presentation/components/task/TaskCard.js:124` - Commented code about dialog vs sheet

**✅ RECOMMENDATION**: Address these TODOs or create tickets for them.

### 17. Commented Out Code

**Problem**: Dead code left in files.

**Example:**
```javascript
// ❌ BAD: src/presentation/components/task/TaskCard.js
{/* Now using the sheet version... still look into giving the user the option to toggle the display they want */}
{/* <TaskCardDialog
  selectedTask={task}
  isOpen={isOpen}
  onOpenChange={setIsOpen}
/> */}
```

**✅ RECOMMENDATION**: Remove commented code or implement the feature.

### 18. Inconsistent Naming Conventions

**Problem**: Mix of camelCase and snake_case in some areas.

**Example:**
```javascript
// ❌ INCONSISTENT: src/hooks/ai/utils/StreamingUtils.js
const old_message = [...old];  // snake_case
const last_message_index = old_messages.length - 1;  // snake_case
// But elsewhere uses camelCase
```

**✅ RECOMMENDATION**: Standardize on camelCase for JavaScript variables.

---

## 🎯 Action Items Summary

### High Priority
1. ✅ Fix error handling inconsistencies (throw errors, don't swallow)
2. ✅ Remove or replace console statements with proper logging
3. ✅ Create centralized API client wrapper to reduce duplication
4. ✅ Standardize on axiosClient (remove fetch usage)
5. ✅ Add error messages to all error toasts

### Medium Priority
6. ✅ Add input validation with Zod
7. ✅ Fix optimistic update edge cases (null checks)
8. ✅ Extract magic values to constants
9. ✅ Improve query invalidation strategy
10. ✅ Add React Error Boundaries

### Low Priority
11. ✅ Remove commented code or implement features
12. ✅ Address TODO comments
13. ✅ Standardize naming conventions
14. ✅ Consider TypeScript migration
15. ✅ Add JSDoc comments for better IDE support

---

## 📚 Learning Resources

- [React Query Best Practices](https://tanstack.com/query/latest/docs/react/guides/important-defaults)
- [Error Handling Patterns](https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
