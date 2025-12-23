# Module Candidates Quick Reference

## Top 5 Priority Modules

### 1. 🔴 User Context Management
**Why:** Scattered across 8+ files, high reusability
**Includes:** Embeddings, summarization, smart context, context windowing
**Files:** `services/ai.js`, `services/chat/*`, `services/jobs.js`, `services/search.js`
**Status:** ✅ Already analyzed

### 2. 🔴 Task Management  
**Why:** Well-structured but coupled, core feature
**Includes:** Task CRUD, subtasks, notes, projects
**Files:** `services/tasks.js`, `controllers/tasks.js`, `db/operations/tasks.js`
**Status:** 🔄 Ready to extract

### 3. 🟡 Job Queue System
**Why:** Very reusable, mixed concerns in one file
**Includes:** Queue management, workers, cron jobs
**Files:** `services/jobs.js` (211 lines, mixed concerns)
**Status:** 🔄 High reusability value

### 4. 🟡 Notification System
**Why:** Used by many features, mixed with jobs
**Includes:** Notifications, background jobs, real-time updates
**Files:** `services/notifications.js`, `services/jobs.js`, `sockets/index.js`
**Status:** 🔄 Medium priority

### 5. 🟡 AI Services
**Why:** Large monolithic file (392 lines), high reusability
**Includes:** Providers, agents, tools, prompts
**Files:** `services/ai.js`, `utils/AIPrompts/`, `utils/AiTools/`
**Status:** 🔄 Needs breakdown

---

## Quick Stats

| Module | Files Affected | Lines of Code | Reusability |
|--------|---------------|---------------|-------------|
| User Context | 8+ files | ~500+ | ⭐⭐⭐⭐⭐ |
| Task Management | 3 files | ~300 | ⭐⭐⭐ |
| Job Queue | 1 file | 211 | ⭐⭐⭐⭐⭐ |
| Notifications | 3 files | ~150 | ⭐⭐⭐⭐ |
| AI Services | 3+ files | ~500+ | ⭐⭐⭐⭐⭐ |

---

## Module Structure Template

```
modules/[module-name]/
├── src/
│   ├── core/           # Core business logic
│   ├── services/       # Service layer
│   ├── controllers/    # HTTP handlers (if needed)
│   ├── database/       # DB operations
│   ├── jobs/           # Background jobs (if needed)
│   └── utils/          # Utilities
├── tests/
└── README.md
```

---

## Dependency Graph

```
User Context ← AI Services
     ↓
Task Management ← Notifications ← Job Queue
     ↓                ↓
  Cache Layer    Real-time Comm
```

---

## Implementation Order

1. **User Context** (already planned)
2. **Job Queue** (infrastructure, high reusability)
3. **Task Management** (core feature)
4. **Notifications** (used everywhere)
5. **AI Services** (needs organization)

---

## Consolidation Opportunities

**Content Management Module:**
- Tasks + Notes + Projects = Unified content module
- Shared: embeddings, caching, notifications
- **Decision:** Separate modules OR unified module?

**Search + User Context:**
- Search uses embeddings (from User Context)
- Could merge Search into User Context
- **Decision:** Keep separate OR merge?

---

## Quick Decision Matrix

| Module | Extract Now? | As Module? | As Package? |
|--------|-------------|------------|--------------|
| User Context | ✅ Yes | ✅ Start | 🔄 Later |
| Job Queue | ✅ Yes | ✅ Start | 🔄 Later |
| Task Management | 🟡 Maybe | ✅ Start | ❌ No |
| Notifications | 🟡 Maybe | ✅ Start | 🔄 Later |
| AI Services | 🟡 Maybe | ✅ Start | 🔄 Later |
| Cache Layer | ❌ Low priority | ✅ If needed | 🔄 Later |
| Real-time | ❌ Low priority | ✅ If needed | 🔄 Later |

---

## Key Takeaways

1. **Start with modules** (not packages) - easier migration
2. **User Context + Job Queue** = highest impact
3. **Infrastructure modules** (Job Queue, Cache, Real-time) = highest reusability
4. **Feature modules** (Tasks, Notes, Projects) = consider consolidation
5. **AI Services** = needs breakdown regardless

---

See `BackendModularizationAnalysis.md` for detailed analysis.
