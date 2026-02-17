import type { Id } from "@/convex/_generated/dataModel";

export interface ChatThread {
  id: string;
  title: string;
  snippet: string;
  updatedAt: number;
  createdAt: number;
  pinned: boolean;
  projectId?: string;
}

export interface ConvexThread {
  _id: Id<"thread">;
  userId: string;
  threadId: string;
  title: string;
  snippet?: string;
  pinned?: boolean;
  projectId?: Id<"projects">;
  model?: string;
  scope?: "workspace" | "project";
  deletedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export function convertToChatThread(thread: ConvexThread): ChatThread {
  return {
    id: thread.threadId,
    title: thread.title,
    snippet: thread.snippet || "",
    updatedAt: thread.updatedAt,
    createdAt: thread.createdAt,
    pinned: thread.pinned || false,
    projectId: thread.projectId,
  };
}

export interface ChatProject {
  id: string;
  title: string;
  icon: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export const mockProjects: ChatProject[] = [
  { id: "p1", title: "Website Redesign", icon: "🎨" },
  { id: "p2", title: "Mobile App", icon: "📱" },
  { id: "p3", title: "Q1 Planning", icon: "📊" },
];

export const mockThreads: ChatThread[] = [
  {
    id: "t1",
    title: "Planning Q1 roadmap",
    snippet: "Let's break down the goals...",
    updatedAt: Date.now() - 1000 * 60 * 30,
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    pinned: true,
  },
  {
    id: "t2",
    title: "Website redesign ideas",
    snippet: "Consider a darker theme...",
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    pinned: true,
    projectId: "p1",
  },
  {
    id: "t3",
    title: "Task prioritization",
    snippet: "Here are the high priority items...",
    updatedAt: Date.now() - 1000 * 60 * 60 * 4,
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    pinned: false,
  },
  {
    id: "t4",
    title: "Meeting notes summary",
    snippet: "Key takeaways from the sync...",
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    pinned: false,
    projectId: "p1",
  },
  {
    id: "t5",
    title: "Bug triage help",
    snippet: "These are the critical bugs...",
    updatedAt: Date.now() - 1000 * 60 * 60 * 48,
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
    pinned: false,
    projectId: "p2",
  },
];

export const mockMessagesByThreadId: Record<string, ChatMessage[]> = {
  t1: [
    { id: "m1", role: "user", content: "Help me plan the Q1 roadmap" },
    {
      id: "m2",
      role: "assistant",
      content:
        "I'd be happy to help you plan your Q1 roadmap. Let me break this down into key areas:\n\n1. **Goals & Objectives** - What are the main outcomes you want to achieve?\n2. **Key Projects** - Which major initiatives need to be completed?\n3. **Timeline** - When do these need to be delivered?\n4. **Resources** - What team members and budget are available?\n\nCould you share more details about your current priorities?",
    },
    {
      id: "m3",
      role: "user",
      content: "We need to focus on the website redesign and mobile app launch",
    },
    {
      id: "m4",
      role: "assistant",
      content:
        "Great focus areas! Here's a suggested Q1 plan:\n\n**January:**\n- Finalize website redesign requirements\n- Begin mobile app development\n- Set up analytics and tracking\n\n**February:**\n- Website redesign implementation\n- Mobile app beta testing\n- Content migration planning\n\n**March:**\n- Website launch preparation\n- Mobile app store submission\n- Post-launch monitoring setup\n\nWould you like me to create tasks for any of these phases?",
    },
  ],
  t2: [
    {
      id: "m1",
      role: "user",
      content: "What are some good color schemes for a modern SaaS website?",
    },
    {
      id: "m2",
      role: "assistant",
      content:
        "Here are some popular color schemes for modern SaaS websites:\n\n1. **Blue & White (Classic)** - Trust, professionalism\n2. **Purple & Pink (Creative)** - Innovation, uniqueness\n3. **Green & Neutral (Growth)** - Sustainability, growth\n4. **Dark Mode (Modern)** - Sleek, developer-friendly\n\nConsider your target audience and brand personality when choosing.",
    },
  ],
  t3: [
    { id: "m1", role: "user", content: "How should I prioritize my backlog?" },
    {
      id: "m2",
      role: "assistant",
      content:
        "Here's a framework for prioritizing your backlog:\n\n**1. Impact vs Effort Matrix**\n- High Impact, Low Effort: Do first\n- High Impact, High Effort: Plan carefully\n- Low Impact, Low Effort: Quick wins\n- Low Impact, High Effort: Deprioritize\n\n**2. RICE Scoring**\n- Reach, Impact, Confidence, Effort\n\n**3. MoSCoW Method**\n- Must have, Should have, Could have, Won't have\n\nWould you like me to help apply any of these to your specific tasks?",
    },
  ],
};
