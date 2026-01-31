# Legacy Feature Inventory (Reference)

This file lists what existed in the legacy implementation so we can reuse ideas and avoid re-learning lessons.

Important: the rewrite treats all features as not yet implemented.

## Legacy Apps

- Frontend: `apps/frontend`
- Backend: `apps/backend`

## Major Legacy Feature Areas

- Tasks: UI + Express routes (`apps/backend/routes/v1/tasks.js`)
- Subtasks: Express routes (`apps/backend/routes/v1/subtasks.js`)
- Notes: Block editor + Express routes (`apps/backend/routes/v1/notes.js`)
- Projects: UI exists; backend missing update/delete (`apps/backend/routes/v1/projects.js`)
- Inbox: UI prototype only (`apps/frontend/src/app/mainview/inbox/page.js`)
- Schedule: UI prototype only (`apps/frontend/src/app/mainview/schedule/page.js`)
- AI Chat: streaming chat UI + persisted conversations/messages (`apps/backend/routes/v1/conversations.js`)
- Global search modal: UI existed (`apps/frontend/src/presentation/components/Layout/GlobalSearch.js`)
- Notifications: UI + Express routes (`apps/backend/routes/v1/notifications.js`)

## Legacy Docs Worth Mining

- Feature priorities: `apps/backend/docs/FEATURE_RECOMMENDATIONS_SUMMARY.md`
- Feature analysis: `apps/backend/docs/FEATURE_ANALYSIS_AND_RECOMMENDATIONS.md`
- Gaps list: `apps/frontend/docs/FEATURE_GAPS_AND_IDEAS.md`
- Mentions guide: `apps/frontend/docs/MENTION_SYSTEM_GUIDE.md`
- AI artifacts: `apps/backend/docs/ARTIFACT_SYSTEM.md`
- Chat context: `apps/backend/docs/CHAT_HISTORY_ANALYSIS.md`
