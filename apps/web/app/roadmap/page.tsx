import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckListIcon,
  NoteIcon,
  MessageQuestionIcon,
  InboxDownloadIcon,
  FolderManagementIcon,
  Calendar03Icon,
  Link01Icon,
  Search01Icon,
  Clock01Icon,
  Layers01Icon,
  BookOpenIcon,
  SparklesIcon,
  Task01Icon,
  Flag03Icon,
  RocketIcon,
} from "@hugeicons/core-free-icons";

export const metadata: Metadata = {
  title: "Roadmap | Taskflow",
  description:
    "MVP roadmap and product direction for Taskflow — your AI-assisted workplace.",
};

const mvpScope = [
  {
    icon: InboxDownloadIcon,
    title: "Inbox",
    description:
      "Capture + triage. Convert items to tasks, notes, or projects.",
  },
  {
    icon: Task01Icon,
    title: "Tasks",
    description:
      "Status, priority, labels, subtasks, and due dates. Track what matters.",
  },
  {
    icon: FolderManagementIcon,
    title: "Projects",
    description: "CRUD + project views. Organize work by project.",
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
    description: "Persisted 'assign to day' at minimum. View upcoming work.",
  },
  {
    icon: MessageQuestionIcon,
    title: "AI Chat",
    description:
      "Persisted conversations/messages. Actions that operate on workspace items.",
  },
];

const phases = [
  {
    phase: "Phase 1",
    title: "Foundation",
    timeline: "Week 1",
    items: [
      "Convex schema + auth rules (identity → user-scoped data)",
      "Base UI shell: layout, navigation, command entry points",
      "Core types + validation strategy (Zod)",
    ],
  },
  {
    phase: "Phase 2",
    title: "Make It Real",
    timeline: "Weeks 2–3",
    items: [
      "Inbox persistence + convert flows (task/note/project)",
      "Tasks CRUD + subtasks",
      "Projects CRUD + project task views",
      "Notes CRUD + editor + basic linking",
    ],
  },
  {
    phase: "Phase 3",
    title: "Plan & Execute",
    timeline: "Weeks 3–4",
    items: [
      "Schedule persistence (start with scheduledDate / day assignment)",
      "Polished navigation: command palette (Cmd/Ctrl+K) for jump/create/search",
      "Minimal in-app notifications for system feedback",
    ],
  },
  {
    phase: "Phase 4",
    title: "AI as Workplace Operator",
    timeline: "Weeks 4–5",
    items: [
      "Persisted chat history",
      "AI actions: create/link/search/open items",
      "Decide streaming approach (non-streaming first, optional streaming route later)",
    ],
  },
];

const backlog = [
  { icon: Link01Icon, text: "Mention system + backlinks panel" },
  { icon: Clock01Icon, text: "Reminders" },
  { icon: Flag03Icon, text: "Recurring tasks" },
  { icon: Search01Icon, text: "Semantic search / embeddings" },
  { icon: BookOpenIcon, text: "Research library + daily digest" },
];

const nonGoals = [
  "Team collaboration / multi-user workspaces",
  "External calendar sync (Google/Outlook)",
  "Research library + daily digest (v1.1+)",
  "Mention system/backlinks (v1.1+)",
  "Semantic vector search (v1.1+)",
  "Full reminders engine (planned after schedule model is solid)",
];

export default function RoadmapPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 absolute left-4 top-2 z-50 rounded-md bg-background px-3 py-2 text-xs text-foreground"
        >
          Skip to content
        </a>
        <div className="w-full px-4 lg:px-6">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-medium">
              <Badge
                variant="secondary"
                className="rounded-full px-2.5 font-mono text-[11px]"
              >
                Taskflow
              </Badge>
            </Link>
            <Link
              href="/"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section
          id="main"
          className="relative w-full px-4 py-20 lg:px-6 lg:py-28"
        >
          <div className="pointer-events-none absolute inset-0 landing-radial-wash" />

          <div className="relative mx-auto w-full max-w-6xl">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-7 text-center">
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className="rounded-full border-border/50 px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
                >
                  <HugeiconsIcon
                    icon={RocketIcon}
                    aria-hidden="true"
                    className="mr-1 h-3 w-3"
                  />
                  v1
                </Badge>
                <span className="text-xs text-muted-foreground">
                  In development
                </span>
              </div>

              <h1 className="text-balance text-4xl font-medium tracking-tight lg:text-5xl">
                MVP Roadmap
              </h1>

              <p className="max-w-[62ch] text-pretty text-base leading-7 text-muted-foreground">
                A focused path to Taskflow v1: capture, organize, execute, and
                operate with AI in one calm workspace.
              </p>
            </div>
          </div>
        </section>

        {/* MVP Scope */}
        <section className="w-full border-t border-border/40 px-4 py-12 lg:px-6">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mx-auto mb-9 max-w-3xl text-center">
              <Badge
                variant="outline"
                className="mb-4 rounded-full border-border/50 px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
              >
                <HugeiconsIcon
                  icon={CheckListIcon}
                  aria-hidden="true"
                  className="mr-1 h-3 w-3"
                />
                MVP Scope
              </Badge>
              <h2 className="mb-3 text-balance text-[1.8rem] font-medium leading-tight tracking-tight lg:text-[2.1rem]">
                Core entities
              </h2>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                The foundational building blocks of your AI-assisted workplace.
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {mvpScope.map((item) => (
                <Card
                  key={item.title}
                  className="rounded-xl border-border/40 bg-card/55 dark:bg-card/35"
                >
                  <CardHeader className="pb-3">
                    <HugeiconsIcon
                      icon={item.icon}
                      aria-hidden="true"
                      className="h-5 w-5 text-muted-foreground"
                    />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <CardTitle className="text-sm">{item.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Phases */}
        <section className="w-full border-t border-border/40 px-4 py-12 lg:px-6">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mx-auto mb-9 max-w-3xl text-center">
              <Badge
                variant="outline"
                className="mb-4 rounded-full border-border/50 px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
              >
                <HugeiconsIcon
                  icon={Layers01Icon}
                  aria-hidden="true"
                  className="mr-1 h-3 w-3"
                />
                Development phases
              </Badge>
              <h2 className="mb-3 text-balance text-[1.8rem] font-medium leading-tight tracking-tight lg:text-[2.1rem]">
                From foundation to AI operator
              </h2>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                Five weeks to a cohesive personal workflow loop.
              </p>
            </div>

            <div className="mx-auto w-full max-w-4xl space-y-4">
              {phases.map((phase, index) => (
                <Card
                  key={phase.phase}
                  className="relative rounded-xl border-border/40 bg-card/55 dark:bg-card/35"
                >
                  <CardHeader className="border-b border-border/35 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className="rounded-full px-2.5 font-mono text-[11px]"
                        >
                          {phase.phase}
                        </Badge>
                        <CardTitle className="text-sm">{phase.title}</CardTitle>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {phase.timeline}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {phase.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="text-primary">—</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  {index < phases.length - 1 && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                      <div className="h-3 w-px bg-border" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Backlog */}
        <section className="w-full border-t border-border/40 px-4 py-12 lg:px-6">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mx-auto mb-9 max-w-3xl text-center">
              <Badge
                variant="outline"
                className="mb-4 rounded-full border-border/50 px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
              >
                <HugeiconsIcon
                  icon={SparklesIcon}
                  aria-hidden="true"
                  className="mr-1 h-3 w-3"
                />
                v1.1+
              </Badge>
              <h2 className="mb-3 text-balance text-[1.8rem] font-medium leading-tight tracking-tight lg:text-[2.1rem]">
                Backlog
              </h2>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                Features planned for future releases.
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {backlog.map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/55 p-3 text-sm text-muted-foreground dark:bg-card/35"
                >
                  <HugeiconsIcon
                    icon={item.icon}
                    aria-hidden="true"
                    className="h-4 w-4 text-muted-foreground"
                  />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Non-goals */}
        <section className="w-full border-t border-border/40 px-4 py-12 lg:px-6">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mx-auto max-w-3xl">
              <div className="mb-4 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="rounded-full border-border/50 px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
                >
                  <HugeiconsIcon
                    icon={Flag03Icon}
                    aria-hidden="true"
                    className="mr-1 h-3 w-3"
                  />
                  Non-goals
                </Badge>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Intentionally out of scope for v1:
              </p>
              <div className="flex flex-wrap gap-2">
                {nonGoals.map((goal) => (
                  <Badge
                    key={goal}
                    variant="secondary"
                    className="rounded-full px-2.5 text-[10px]"
                  >
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Separator className="mx-auto w-full max-w-6xl" />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/40 px-4 py-8 lg:px-6">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
            <p className="text-xs text-muted-foreground">
              Taskflow v1 — Solo AI-assisted workplace. Built with Next.js,
              Convex, and shadcn/ui.
            </p>
            <Link
              href="/"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
