# TaskFlow MVP Plan

## Goal

Launch a functional "all-in-one" productivity app with core features for task management, note-taking, and calendar viewing, built upon the existing foundation.

## Core Features for MVP:

1.  **User Authentication (Clerk)**

    - Verify sign-up, sign-in, and sign-out flows.
    - Ensure user session management is working correctly.
    - Connect user identity to stored data (tasks, notes).

2.  **Task Management (Supabase Backend)**

    - **CRUD Operations:**
      - Implement and test task creation (title, description, optional due date, priority).
      - Implement and test task viewing (list view, detail view/modal).
      - Implement and test task updating (completion status, title, description, priority, due date).
      - Implement and test task deletion.
    - **Basic Subtasks:**
      - Implement and test adding/removing/completing simple subtasks associated with a parent task.
    - **UI Integration:**
      - Ensure `TaskCreateForm`, `TaskModal`, `TaskCard`, and list views (`HTaskDashBoardView`, `VerticalTaskBoardView`) are fully functional and reflect database state.
      - Refine filtering/sorting based on priority and completion status.

3.  **Note Taking (Supabase Backend)**

    - **CRUD Operations:**
      - Implement basic note creation (title, content).
      - Implement note viewing (list/preview, full view).
      - Implement note updating.
      - Implement note deletion.
    - **UI Integration:**
      - Create necessary components for note creation, viewing, and editing.
      - Integrate into the dashboard or a dedicated notes section.

4.  **Calendar View**

    - Display tasks with due dates on the existing `Calendar` component.
    - Ensure clicking a date potentially filters tasks or shows relevant tasks.
    - (Stretch Goal: Basic Google Calendar view integration if feasible within MVP timeframe).

5.  **Dashboard**
    - Refine `dashboard/page.js` to clearly present:
      - Today's tasks.
      - Quick access to create tasks/notes.
      - A view of the calendar.
      - Links to full task/note sections.

## Post-MVP Considerations (Based on `taskData.json`):

- Advanced Task Features (Dependencies, Kanban, Gantt)
- Advanced Calendar (Recurring tasks, Time blocking, AI scheduling)
- Rich Text Notes/Knowledge Management
- Collaboration & Sharing
- Pomodoro Timer/Time Tracking Integration (if not fully completed)
- Monetization (Stripe integration)
- Offline Mode/Data Backup
- Advanced AI features

## Action Items:

1.  **Review & Verify:** Go through each "completed" feature in `taskData.json` and verify its implementation status in the codebase.
2.  **Prioritize Core CRUD:** Focus development effort on ensuring the basic CRUD operations for Tasks and Notes are robust.
3.  **Integrate Views:** Connect the backend data to the respective UI components (Task lists, Modals, Calendar, Notes section).
4.  **Refine Dashboard:** Make the dashboard the central hub, providing clear access to the core MVP features.
5.  **Testing:** Thoroughly test the user authentication flow and all CRUD operations for tasks and notes.
