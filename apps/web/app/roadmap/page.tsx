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
          <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-medium">
              <Badge
                variant="secondary"
                className="rounded-md font-mono text-xs"
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
          className="relative w-full px-4 py-16 lg:px-6 lg:py-24"
        >
          <div className="absolute inset-0 landing-radial-wash" />
          <div className="absolute inset-0 landing-grid-bg opacity-50" />

          <div className="relative mx-auto w-full max-w-7xl">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="rounded-md font-mono text-xs"
                >
                  <HugeiconsIcon
                    icon={RocketIcon}
                    aria-hidden="true"
                    className="h-3 w-3 mr-1"
                  />
                  v1
                </Badge>
                <span className="text-xs text-muted-foreground">
                  In development
                </span>
              </div>

              <h1 className="text-balance text-3xl font-medium tracking-tight lg:text-4xl xl:text-5xl">
                MVP Roadmap
              </h1>

              <p className="max-w-[600px] text-muted-foreground text-sm lg:text-base leading-relaxed">
                Solo productivity system: capture ideas, organize projects and
                tasks, manage notes, schedule your day, and get AI help without
                tab-hopping.
              </p>
            </div>
          </div>
        </section>

        {/* MVP Scope */}
        <section className="w-full px-4 py-8 lg:px-6 border-t">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mx-auto max-w-3xl text-center mb-8">
              <Badge
                variant="outline"
                className="rounded-md mb-4 font-mono text-xs"
              >
                <HugeiconsIcon
                  icon={CheckListIcon}
                  aria-hidden="true"
                  className="h-3 w-3 mr-1"
                />
                MVP Scope
              </Badge>
              <h2 className="text-balance text-xl font-medium tracking-tight lg:text-2xl mb-2">
                Core entities
              </h2>
              <p className="text-muted-foreground text-sm">
                The foundational building blocks of your AI-assisted workplace.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mvpScope.map((item) => (
                <Card
                  key={item.title}
                  className="border-border/60 bg-card/40 dark:bg-card/20"
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
        <section className="w-full px-4 py-8 lg:px-6 border-t">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mx-auto max-w-3xl text-center mb-8">
              <Badge
                variant="outline"
                className="rounded-md mb-4 font-mono text-xs"
              >
                <HugeiconsIcon
                  icon={Layers01Icon}
                  aria-hidden="true"
                  className="h-3 w-3 mr-1"
                />
                Development phases
              </Badge>
              <h2 className="text-balance text-xl font-medium tracking-tight lg:text-2xl mb-2">
                From foundation to AI operator
              </h2>
              <p className="text-muted-foreground text-sm">
                Five weeks to a cohesive personal workflow loop.
              </p>
            </div>

            <div className="mx-auto w-full max-w-5xl space-y-6">
              {phases.map((phase, index) => (
                <Card
                  key={phase.phase}
                  className="relative border-border/60 bg-card/40 dark:bg-card/20"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className="rounded-md font-mono text-xs"
                        >
                          {phase.phase}
                        </Badge>
                        <CardTitle className="text-sm">{phase.title}</CardTitle>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
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
        <section className="w-full px-4 py-8 lg:px-6 border-t">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mx-auto max-w-3xl text-center mb-8">
              <Badge
                variant="outline"
                className="rounded-md mb-4 font-mono text-xs"
              >
                <HugeiconsIcon
                  icon={SparklesIcon}
                  aria-hidden="true"
                  className="h-3 w-3 mr-1"
                />
                v1.1+
              </Badge>
              <h2 className="text-balance text-xl font-medium tracking-tight lg:text-2xl mb-2">
                Backlog
              </h2>
              <p className="text-muted-foreground text-sm">
                Features planned for future releases.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {backlog.map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/30 p-3 text-sm text-muted-foreground"
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
        <section className="w-full px-4 py-8 lg:px-6 border-t">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-center gap-2 mb-4">
                <Badge
                  variant="outline"
                  className="rounded-md font-mono text-xs"
                >
                  <HugeiconsIcon
                    icon={Flag03Icon}
                    aria-hidden="true"
                    className="h-3 w-3 mr-1"
                  />
                  Non-goals
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Intentionally out of scope for v1:
              </p>
              <div className="flex flex-wrap gap-2">
                {nonGoals.map((goal) => (
                  <Badge
                    key={goal}
                    variant="secondary"
                    className="rounded-md text-[10px]"
                  >
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Separator className="mx-auto w-full max-w-7xl" />
      </main>

      {/* Footer */}
      <footer className="w-full px-4 py-8 lg:px-6">
        <div className="mx-auto w-full max-w-7xl">
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
