# Quick Improvement Checklist

## 🔴 Critical - Fix Immediately

### 1. Silent Error Failures
**Files to fix:**
- `src/hooks/notes/useSaveNote.js` - Line 6-17: Catches error but doesn't throw
- `src/hooks/tasks/useDeleteTask.js` - Line 6-19: Catches error but doesn't throw

**Fix**: Remove try-catch or ensure errors are thrown so React Query's `onError` fires.

### 2. Missing Error Messages
**Files to fix:**
- `src/hooks/notes/useDeleteNote.js` - Line 38-41: Error toast has no description
- `src/hooks/tasks/useDeleteTask.js` - Line 39-42: Error toast has no description

**Fix**: Add `description: error.message` to error toasts.

---

## 🟡 High Priority - Fix This Week

### 3. Console Statements (41 files)
**Quick fix**: Search for `console.` and remove/replace:
- Remove debug `console.log`
- Replace `console.error` with proper error tracking
- Use conditional logging: `if (process.env.NODE_ENV === 'development')`

**Most critical files:**
- `src/lib/sockets/SocketStore.js` - Lines 19, 23, 27
- `src/hooks/ai/utils/StreamingUtils.js` - Multiple console.error
- `src/hooks/tasks/useFetchAllTasks.js` - Line 19

### 4. Code Duplication
**Pattern**: Token + axios call + error handling repeated 20+ times

**Solution**: Create `src/lib/axios/apiClient.js` wrapper (see full doc for example)

**Affected files**: All hooks in `src/hooks/` directory

### 5. Inconsistent API Usage
**File**: `src/hooks/ai/useSendAIMessage.js`
- Line 17: Uses `axiosClient`
- Line 51: Uses `fetch`

**Fix**: Use `axiosClient` for both calls

---

## 🟢 Medium Priority - Fix This Month

### 6. Optimistic Update Safety
**Files to check:**
- `src/hooks/tasks/useCreateTask.js` - Line 33: `[...old, task]` - what if old is undefined?
- `src/hooks/notes/useCreateNote.js` - Line 27: Same issue

**Fix**: Add null checks: `[...(old || []), task]`

### 7. Magic Values
**Examples:**
- `src/hooks/tasks/useFetchAllTasks.js` - Line 31: `2 * 60 * 1000`
- `src/presentation/components/task/TaskCard.js` - Line 29: `"30vw"`

**Fix**: Extract to `src/lib/constants.js`

### 8. Unnecessary Timestamps
**Files:**
- `src/hooks/tasks/useCreateTask.js` - Line 38-40
- `src/hooks/tasks/useFetchAllTasks.js` - Line 14-16

**Fix**: Remove `description: new Date().toLocaleString()` from success toasts

---

## 📋 Code Cleanup

### 9. TODO Comments
- `src/presentation/components/notes/layout/NotesSideBar.js:91`
- `src/presentation/components/projects/layout/ProjectSidebar.js:96`

### 10. Commented Code
- `src/presentation/components/task/TaskCard.js:124-129` - Remove or implement

### 11. Naming Inconsistencies
- `src/hooks/ai/utils/StreamingUtils.js` - Uses snake_case, should be camelCase

---

## 🎯 Quick Wins (5 minutes each)

1. ✅ Remove timestamps from success toasts
2. ✅ Add error descriptions to error toasts  
3. ✅ Remove commented code in TaskCard.js
4. ✅ Fix optimistic update null checks
5. ✅ Extract magic numbers to constants

---

## 📖 See Full Details

For detailed examples and recommended fixes, see: `docs/CODE_IMPROVEMENT_EXAMPLES.md`
