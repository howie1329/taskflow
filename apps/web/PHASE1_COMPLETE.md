Phase 1 — Routing + Shared Chat Shell

✅ **New Files Created:**

- `apps/web/app/app/chat/layout.tsx` — Shared chat shell wrapper
- `apps/web/app/app/chat/components/chat-shell.tsx` — Left rail with thread list, search, pinned/recent sections
- `apps/web/app/app/chat/page.tsx` — New chat landing with scope control + prompt chips + composer
- `apps/web/app/app/chat/[threadId]/page.tsx` — Thread conversation view with messages + composer

✅ **Bug Fixes:**

- Fixed `radix-ui` import errors in `hover-card.tsx` and `button-group.tsx`
- Installed missing `@radix-ui/react-hover-card` package

**Features Implemented:**

- Route-per-thread architecture: `/app/chat` and `/app/chat/[threadId]`
- 2-pane layout (340px left rail + flex main panel)
- Left rail with New chat button, search, Pinned + Recent thread sections
- Thread rows with title, snippet, time, project badge, pin icon
- Active thread highlighting based on current route
- New chat landing: Scope picker (All workspace / Projects), 9 prompt chips in 3 groups, bottom-anchored composer
- Thread view: Header with mobile back button + scope badge, conversation log, composer
- Not-found state for invalid thread IDs
- Mobile responsive with route-driven navigation

**Next:** Phase 2 — Add real interaction with mock data (thread selection, search filtering, empty states)
