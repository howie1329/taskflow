import type { MockProject, MockNote } from "@/components/notes/types";

export const mockProjects: MockProject[] = [
  { _id: "p1", title: "Website Redesign", icon: "🎨" },
  { _id: "p2", title: "Q1 Planning", icon: "📊" },
  { _id: "p3", title: "Personal", icon: "🏠" },
];

export const mockNotesData: MockNote[] = [
  {
    _id: "n1",
    projectId: "p1",
    title: "Color palette ideas",
    content:
      "Consider using a blue-grey primary with orange accents for the new landing page. Need to check contrast ratios.",
    pinned: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    updatedAt: Date.now() - 1000 * 60 * 30,
  },
  {
    _id: "n2",
    projectId: "p1",
    title: "Typography research",
    content:
      "Look into Inter and Geist as options. Also consider system font stack for performance.",
    pinned: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    _id: "n3",
    projectId: "__none__",
    title: "Random idea",
    content: "What if we added voice notes? Could be useful for quick capture.",
    pinned: false,
    createdAt: Date.now() - 1000 * 60 * 60,
    updatedAt: Date.now() - 1000 * 60 * 60,
  },
  {
    _id: "n4",
    projectId: "p2",
    title: "Meeting notes",
    content:
      "Discussed roadmap priorities. Focus on stability before new features.",
    pinned: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
    updatedAt: Date.now() - 1000 * 60 * 60 * 4,
  },
];

export function generateId(): string {
  return Math.random().toString(36).slice(2);
}
