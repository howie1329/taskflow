export const mockChatData = {
  conversations: [
    {
      id: "conv_1",
      title: "Task Management Help",
      messages: [
        {
          id: "msg_1",
          role: "user",
          content: {
            tasks: [],
            notes: [],
            projects: [],
            events: [],
            aiResponse:
              "I need help organizing my tasks for this week. I have a lot of design work and some backend tasks.",
          },
          timestamp: "2024-02-15T10:30:00Z",
        },
        {
          id: "msg_2",
          role: "assistant",
          content: {
            tasks: [
              {
                id: "task_1",
                title: "Design System Implementation",
                description:
                  "Create and implement a comprehensive design system",
                status: "inProgress",
                priority: "High",
                dueDate: "2024-02-20",
              },
              {
                id: "task_2",
                title: "User Authentication Setup",
                description:
                  "Implement Clerk authentication with proper user management",
                status: "todo",
                priority: "High",
                dueDate: "2024-02-22",
              },
            ],
            notes: [
              {
                id: "note_1",
                title: "Design System Notes",
                content:
                  "Focus on component consistency and accessibility standards",
              },
            ],
            projects: [],
            events: [
              {
                id: "event_1",
                title: "Design Review Meeting",
                date: "2024-02-18",
                time: "14:00",
                duration: 60,
              },
            ],
            aiResponse:
              "I've analyzed your tasks and created a structured plan. Here are the prioritized tasks and some helpful notes for your design work. I've also scheduled a design review meeting.",
          },
          timestamp: "2024-02-15T10:31:00Z",
        },
        {
          id: "msg_3",
          role: "user",
          content: {
            tasks: [],
            notes: [],
            projects: [],
            events: [],
            aiResponse:
              "Can you help me break down the design system task into smaller subtasks?",
          },
          timestamp: "2024-02-15T10:32:00Z",
        },
        {
          id: "msg_4",
          role: "assistant",
          content: {
            tasks: [
              {
                id: "task_1_1",
                title: "Design Tokens Setup",
                description: "Create color, typography, and spacing tokens",
                status: "todo",
                priority: "High",
                dueDate: "2024-02-16",
              },
              {
                id: "task_1_2",
                title: "Component Library",
                description: "Build reusable UI components",
                status: "todo",
                priority: "Medium",
                dueDate: "2024-02-19",
              },
              {
                id: "task_1_3",
                title: "Documentation",
                description:
                  "Create component documentation and usage guidelines",
                status: "todo",
                priority: "Low",
                dueDate: "2024-02-21",
              },
            ],
            notes: [
              {
                id: "note_2",
                title: "Design System Checklist",
                content:
                  "1. Color palette definition\n2. Typography scale\n3. Spacing system\n4. Component variants\n5. Accessibility compliance",
              },
            ],
            projects: [],
            events: [],
            aiResponse:
              "I've broken down the design system task into three manageable subtasks. Each subtask builds upon the previous one, creating a logical progression. I've also added a checklist note to help you track progress.",
          },
          timestamp: "2024-02-15T10:33:00Z",
        },
      ],
      createdAt: "2024-02-15T10:30:00Z",
      updatedAt: "2024-02-15T10:33:00Z",
    },
    {
      id: "conv_2",
      title: "Project Planning Session",
      messages: [
        {
          id: "msg_5",
          role: "user",
          content: {
            tasks: [],
            notes: [],
            projects: [],
            events: [],
            aiResponse:
              "I'm starting a new project and need help with project planning. What should I consider?",
          },
          timestamp: "2024-02-14T14:20:00Z",
        },
        {
          id: "msg_6",
          role: "assistant",
          content: {
            tasks: [
              {
                id: "task_3",
                title: "Project Charter Creation",
                description: "Define project scope, goals, and success metrics",
                status: "todo",
                priority: "High",
                dueDate: "2024-02-16",
              },
              {
                id: "task_4",
                title: "Stakeholder Analysis",
                description: "Identify and map all project stakeholders",
                status: "todo",
                priority: "Medium",
                dueDate: "2024-02-17",
              },
            ],
            notes: [
              {
                id: "note_3",
                title: "Project Planning Framework",
                content:
                  "1. Scope Definition\n2. Resource Planning\n3. Risk Assessment\n4. Timeline Creation\n5. Communication Plan",
              },
            ],
            projects: [
              {
                id: "project_1",
                name: "New Product Launch",
                description: "Launch of innovative product solution",
                status: "planning",
                startDate: "2024-03-01",
                endDate: "2024-06-30",
              },
            ],
            events: [
              {
                id: "event_2",
                title: "Project Kickoff Meeting",
                date: "2024-02-20",
                time: "10:00",
                duration: 90,
              },
            ],
            aiResponse:
              "I've created a comprehensive project planning framework for you. This includes initial tasks, a project structure, and key milestones. The project kickoff meeting will help align all stakeholders.",
          },
          timestamp: "2024-02-14T14:21:00Z",
        },
      ],
      createdAt: "2024-02-14T14:20:00Z",
      updatedAt: "2024-02-14T14:21:00Z",
    },
    {
      id: "conv_3",
      title: "Code Review Discussion",
      messages: [
        {
          id: "msg_7",
          role: "user",
          content: {
            tasks: [],
            notes: [],
            projects: [],
            events: [],
            aiResponse:
              "What are the best practices for code reviews in a team setting?",
          },
          timestamp: "2024-02-13T16:45:00Z",
        },
        {
          id: "msg_8",
          role: "assistant",
          content: {
            tasks: [
              {
                id: "task_5",
                title: "Code Review Checklist Creation",
                description: "Create standardized review checklist for team",
                status: "todo",
                priority: "High",
                dueDate: "2024-02-15",
              },
              {
                id: "task_6",
                title: "Review Process Documentation",
                description: "Document code review workflow and guidelines",
                status: "todo",
                priority: "Medium",
                dueDate: "2024-02-18",
              },
            ],
            notes: [
              {
                id: "note_4",
                title: "Code Review Best Practices",
                content:
                  "1. Keep PRs small (200-400 lines max)\n2. Review within 24 hours\n3. Use constructive feedback\n4. Focus on code quality\n5. Check for security issues",
              },
            ],
            projects: [],
            events: [
              {
                id: "event_3",
                title: "Code Review Training",
                date: "2024-02-16",
                time: "15:00",
                duration: 120,
              },
            ],
            aiResponse:
              "I've outlined the key best practices for code reviews and created tasks to implement a structured review process. The training session will help ensure everyone follows the same standards.",
          },
          timestamp: "2024-02-13T16:46:00Z",
        },
      ],
      createdAt: "2024-02-13T16:45:00Z",
      updatedAt: "2024-02-13T16:46:00Z",
    },
  ],
  currentConversationId: "conv_1",
};

export const mockAIResponses = [
  {
    tasks: [
      {
        id: "task_new_1",
        title: "Task Analysis",
        description: "Review and prioritize current tasks",
        status: "todo",
        priority: "Medium",
        dueDate: "2024-02-20",
      },
    ],
    notes: [
      {
        id: "note_new_1",
        title: "Action Items",
        content: "Key points to address in next steps",
      },
    ],
    projects: [],
    events: [],
    aiResponse:
      "I've analyzed your request and created some actionable items. Here's what I recommend focusing on next.",
  },
  {
    tasks: [],
    notes: [
      {
        id: "note_new_2",
        title: "Best Practices",
        content: "Industry standards and recommendations for this area",
      },
    ],
    projects: [],
    events: [],
    aiResponse:
      "Based on best practices, here are some key considerations and recommendations for your situation.",
  },
  {
    tasks: [],
    notes: [],
    projects: [
      {
        id: "project_new_1",
        name: "Strategic Initiative",
        description: "Long-term strategic project planning",
        status: "planning",
        startDate: "2024-03-01",
        endDate: "2024-12-31",
      },
    ],
    events: [
      {
        id: "event_new_1",
        title: "Planning Session",
        date: "2024-02-25",
        time: "10:00",
        duration: 120,
      },
    ],
    aiResponse:
      "I've created a strategic project framework and scheduled a planning session to discuss the next steps.",
  },
];
