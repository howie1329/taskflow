# Critical Issues Summary - Quick Reference

## 🚨 Must Fix Immediately

### 1. QueryClient Recreation (CRITICAL PERFORMANCE BUG)
**File:** `src/app/mainview/layout.js:16`
**Issue:** QueryClient created inside component, resetting cache on every render
**Fix:** Move QueryClient creation outside component or use `useState` with lazy init

### 2. Missing Error Propagation
**Files:** `useCreateTask.js`, `useFetchNotes.js`, and others
**Issue:** Errors caught but not thrown, breaking error handling
**Fix:** Always throw errors in catch blocks when appropriate

### 3. Environment Variables Not Validated
**File:** `src/lib/axios/axiosClient.js`
**Issue:** `process.env.NEXT_PUBLIC_API_BASE_URL` could be undefined
**Fix:** Add validation on app startup

### 4. No Input Validation
**Files:** All mutation hooks
**Issue:** No client-side validation before API calls
**Fix:** Add Zod schemas (already in dependencies)

### 5. XSS Risk in Markdown
**File:** `src/app/mainview/aichat/[id]/page.js`
**Issue:** ReactMarkdown renders unsanitized content
**Fix:** Add `rehype-sanitize` plugin

## ⚠️ High Priority

### 6. 68 Console Statements in Production
**Fix:** Create logger utility and replace all instances

### 7. Code Duplication - Status Mapping
**Files:** TaskCard.js, TaskCardDialog.js, TaskCardSheet.js, etc.
**Fix:** Extract to `lib/utils/taskUtils.js`

### 8. Context Value Recreation
**File:** `TaskFilterProvider.js`
**Fix:** Memoize context value with `useMemo`

### 9. Missing Memoization
**Files:** Multiple components
**Fix:** Add `useMemo`/`useCallback` for expensive operations

### 10. Inconsistent API Client Usage
**File:** `useSendAIMessage.js` uses `fetch` instead of `axiosClient`
**Fix:** Standardize on axiosClient

## 📋 Quick Wins (Low Effort, High Impact)

1. **Remove console statements** - Use find/replace with logger utility
2. **Extract status mapping** - Create one utility function
3. **Fix QueryClient** - Move outside component (5 min fix)
4. **Memoize context values** - Add useMemo wrapper
5. **Add environment validation** - Create config file with validation

## 🔧 Estimated Fix Times

| Issue | Time | Priority |
|-------|------|----------|
| QueryClient fix | 5 min | Critical |
| Environment validation | 30 min | Critical |
| Input validation setup | 2 hours | Critical |
| Console statement cleanup | 1 hour | High |
| Code duplication extraction | 1 hour | High |
| Context memoization | 30 min | High |
| XSS fix | 15 min | Critical |

**Total Critical Fixes:** ~4 hours
**Total High Priority:** ~3 hours

---

See `CODE_REVIEW_REPORT.md` for detailed explanations and code examples.
