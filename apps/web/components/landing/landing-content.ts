import {
  InboxDownloadIcon,
  FolderManagementIcon,
  CheckListIcon,
  ArtificialIntelligence04Icon,
  InboxIcon,
  Task01Icon,
  Folder02Icon,
  NoteIcon,
  Calendar03Icon,
  MessageQuestionIcon,
  UserIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";

export const workflowSteps = [
  {
    icon: InboxDownloadIcon,
    title: "Capture",
    description: "Dump ideas into inbox. No structure needed yet.",
  },
  {
    icon: FolderManagementIcon,
    title: "Organize",
    description: "Convert inbox items into projects, tasks, and notes.",
  },
  {
    icon: CheckListIcon,
    title: "Execute",
    description: "Schedule tasks, track progress, ship work.",
  },
  {
    icon: ArtificialIntelligence04Icon,
    title: "Assist",
    description: "Ask AI to create, link, or find anything in your workspace.",
  },
];

export const features = [
  {
    icon: InboxIcon,
    title: "Inbox",
    description:
      "Quick capture + triage. Convert items to tasks, notes, or projects.",
  },
  {
    icon: Task01Icon,
    title: "Tasks",
    description:
      "Status, priority, labels, subtasks, and due dates. Track what matters.",
  },
  {
    icon: Folder02Icon,
    title: "Projects",
    description:
      "Organize work by project. View tasks, notes, and progress at a glance.",
  },
  {
    icon: NoteIcon,
    title: "Notes",
    description:
      "Block-based editor with links to tasks and projects. Knowledge base.",
  },
  {
    icon: Calendar03Icon,
    title: "Schedule",
    description: "Assign tasks to days. View upcoming work and plan your week.",
  },
  {
    icon: MessageQuestionIcon,
    title: "AI Chat",
    description:
      "Create, link, and find anything. Natural language workspace control.",
  },
];

export const aiExamples = [
  {
    user: "You",
    message: "Create a task to review the Q4 roadmap",
    icon: UserIcon,
  },
  {
    user: "Taskflow AI",
    message:
      "Created 'Review Q4 roadmap'. Scheduled for today. Priority: High.",
    icon: SparklesIcon,
    actions: ["FileAddIcon", "Check"],
  },
  {
    user: "You",
    message: "Link my meeting notes to the Website Redesign project",
    icon: UserIcon,
  },
  {
    user: "Taskflow AI",
    message:
      "Linked 'Website Redesign Meeting Notes' to 'Website Redesign' project.",
    icon: SparklesIcon,
    actions: ["Link02Icon", "Check"],
  },
];
