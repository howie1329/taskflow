"use client"

import type { Doc, Id } from "@/convex/_generated/dataModel"
import type { Note } from "@/components/notes/types"
import type { ProjectCardData } from "@/components/projects/project-card"

const now = Date.now()
const userId = "user-1" as Id<"users">

const projectIds = {
  website: "proj-website",
  marketing: "proj-marketing",
  mobile: "proj-mobile",
  archived: "proj-archived",
  empty: "proj-empty",
} as const

const tagIds = {
  urgent: "tag-urgent",
  design: "tag-design",
  backend: "tag-backend",
  research: "tag-research",
} as const

export const mockProjects: ProjectCardData[] = [
  {
    _id: projectIds.website,
    title: "Website Redesign",
    description: "Complete overhaul of the company website with new branding",
    status: "active",
    color: "#3b82f6",
    icon: "🎨",
    updatedAt: now - 86400000,
  },
  {
    _id: projectIds.marketing,
    title: "Q4 Marketing Campaign",
    description: "Holiday marketing campaign planning and execution",
    status: "active",
    color: "#ef4444",
    icon: "📢",
    updatedAt: now - 172800000,
  },
  {
    _id: projectIds.mobile,
    title: "Mobile App v2.0",
    description: "Major version update with new features and performance work",
    status: "active",
    color: "#22c55e",
    icon: "📱",
    updatedAt: now - 259200000,
  },
  {
    _id: projectIds.archived,
    title: "Old Brand Assets",
    description: "Previous brand design system and assets",
    status: "archived",
    color: "#6b7280",
    icon: "🗂️",
    updatedAt: now - 604800000,
  },
  {
    _id: projectIds.empty,
    title: "2023 Annual Report",
    description: "Completed annual report project from last year",
    status: "archived",
    color: "#8b5cf6",
    icon: "📊",
    updatedAt: now - 2592000000,
  },
]

export const mockProjectTags: Doc<"tags">[] = [
  {
    _id: tagIds.urgent as Id<"tags">,
    _creationTime: now - 120000,
    userId,
    name: "urgent",
    color: "#ef4444",
    usageCount: 6,
  },
  {
    _id: tagIds.design as Id<"tags">,
    _creationTime: now - 240000,
    userId,
    name: "design",
    color: "#3b82f6",
    usageCount: 4,
  },
  {
    _id: tagIds.backend as Id<"tags">,
    _creationTime: now - 360000,
    userId,
    name: "backend",
    color: "#22c55e",
    usageCount: 3,
  },
  {
    _id: tagIds.research as Id<"tags">,
    _creationTime: now - 480000,
    userId,
    name: "research",
    color: "#f59e0b",
    usageCount: 2,
  },
]

const baseTask = {
  _creationTime: now - 600000,
  userId,
  description: "",
  notes: "",
  status: "Not Started",
  priority: "medium",
  dueDate: undefined,
  scheduledDate: undefined,
  completionDate: undefined,
  tagIds: [],
  parentTaskId: undefined,
  estimatedDuration: undefined,
  actualDuration: undefined,
  energyLevel: "medium",
  context: [],
  source: "created",
  orderIndex: 0,
  lastActiveAt: now,
  streakCount: 0,
  difficulty: "medium",
  isTemplate: false,
  aiSummary: undefined,
  aiContext: {},
  embedding: undefined,
  createdAt: now - 1209600000,
  updatedAt: now - 604800000,
}

export const mockProjectTasks: Doc<"tasks">[] = [
  {
    _id: "task-website-1" as Id<"tasks">,
    ...baseTask,
    title: "Audit current landing page",
    projectId: projectIds.website as Id<"projects">,
    tagIds: [tagIds.design as Id<"tags">],
    orderIndex: 1,
    createdAt: now - 86400000,
    updatedAt: now - 43200000,
  },
  {
    _id: "task-website-2" as Id<"tasks">,
    ...baseTask,
    title: "Compile hero copy options",
    projectId: projectIds.website as Id<"projects">,
    tagIds: [tagIds.research as Id<"tags">],
    orderIndex: 2,
    createdAt: now - 172800000,
    updatedAt: now - 64800000,
  },
  {
    _id: "task-marketing-1" as Id<"tasks">,
    ...baseTask,
    title: "Outline Q4 campaign timeline",
    projectId: projectIds.marketing as Id<"projects">,
    tagIds: [tagIds.urgent as Id<"tags">],
    orderIndex: 1,
    createdAt: now - 259200000,
    updatedAt: now - 86400000,
  },
  {
    _id: "task-mobile-1" as Id<"tasks">,
    ...baseTask,
    title: "Plan onboarding refresh",
    projectId: projectIds.mobile as Id<"projects">,
    tagIds: [tagIds.design as Id<"tags">],
    orderIndex: 1,
    createdAt: now - 345600000,
    updatedAt: now - 172800000,
  },
  {
    _id: "task-archived-1" as Id<"tasks">,
    ...baseTask,
    title: "Archive legacy asset library",
    description: "Move old assets to cold storage",
    status: "Completed",
    priority: "low",
    dueDate: now - 259200000,
    scheduledDate: "2026-01-28",
    completionDate: now - 172800000,
    projectId: projectIds.archived as Id<"projects">,
    tagIds: [tagIds.backend as Id<"tags">],
    orderIndex: 0,
    createdAt: now - 1209600000,
    updatedAt: now - 172800000,
  },
]

export const mockProjectNotes: Note[] = [
  {
    _id: "note-website-1",
    projectId: projectIds.website,
    title: "Landing page moodboard",
    content: "",
    contentText: "Collect 5 references that balance clarity with modern layout.",
    pinned: true,
    createdAt: now - 1000 * 60 * 60 * 24,
    updatedAt: now - 1000 * 60 * 30,
  },
  {
    _id: "note-website-2",
    projectId: projectIds.website,
    title: "Typography comparisons",
    content: "",
    contentText: "Compare Geist, Inter, and JetBrains Mono for headings/body.",
    pinned: false,
    createdAt: now - 1000 * 60 * 60 * 48,
    updatedAt: now - 1000 * 60 * 60 * 2,
  },
  {
    _id: "note-marketing-1",
    projectId: projectIds.marketing,
    title: "Channel ideas",
    content: "",
    contentText: "Email + social + partner posts. Need a CTA ladder.",
    pinned: false,
    createdAt: now - 1000 * 60 * 60 * 36,
    updatedAt: now - 1000 * 60 * 60 * 6,
  },
  {
    _id: "note-archived-1",
    projectId: projectIds.archived,
    title: "Brand archive checklist",
    content: "",
    contentText: "Confirm which assets can be removed from active circulation.",
    pinned: false,
    createdAt: now - 1000 * 60 * 60 * 72,
    updatedAt: now - 1000 * 60 * 60 * 24,
  },
]
