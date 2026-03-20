import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingContainer } from "@/components/landing/landing-container";

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
    <div className="flex min-h-dvh flex-col bg-background">
      <LandingNavbar />

      <main className="flex flex-1 flex-col">
        <section
          id="main"
          className="relative w-full border-b border-border/40 py-12 lg:py-16"
        >
          <div className="pointer-events-none absolute inset-0 landing-radial-wash" />
          <LandingContainer className="relative">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
              <div className="flex items-center gap-3 text-xs font-medium">
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
                <span className="text-muted-foreground">In development</span>
              </div>

              <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                MVP roadmap
              </h1>

              <p className="max-w-[62ch] text-pretty text-sm leading-relaxed text-muted-foreground">
                A focused path to Taskflow v1: capture, organize, execute, and
                operate with AI in one calm workspace.
              </p>
            </div>
          </LandingContainer>
        </section>

        <section className="w-full border-b border-border/40 py-10 lg:py-12">
          <LandingContainer>
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <Badge
                variant="outline"
                className="mb-4 rounded-full border-border/50 px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
              >
                <HugeiconsIcon
                  icon={CheckListIcon}
                  aria-hidden="true"
                  className="mr-1 h-3 w-3"
                />
                MVP scope
              </Badge>
              <h2 className="mb-3 text-balance text-2xl font-semibold leading-tight tracking-tight text-foreground lg:text-3xl">
                Core entities
              </h2>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                The foundational building blocks of your AI-assisted workplace.
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {mvpScope.map((item) => (
                <Card key={item.title} className="rounded-xl landing-surface">
                  <CardHeader className="pb-3">
                    <HugeiconsIcon
                      icon={item.icon}
                      aria-hidden="true"
                      className="h-5 w-5 text-muted-foreground"
                    />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <CardTitle className="text-sm font-medium">
                      {item.title}
                    </CardTitle>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </LandingContainer>
        </section>

        <section className="w-full border-b border-border/40 py-10 lg:py-12">
          <LandingContainer>
            <div className="mx-auto mb-10 max-w-3xl text-center">
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
              <h2 className="mb-3 text-balance text-2xl font-semibold leading-tight tracking-tight text-foreground lg:text-3xl">
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
                  className="relative rounded-xl landing-surface"
                >
                  <CardHeader className="border-b border-border/35 pb-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className="rounded-full px-2.5 font-mono text-[11px]"
                        >
                          {phase.phase}
                        </Badge>
                        <CardTitle className="text-sm font-medium">
                          {phase.title}
                        </CardTitle>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {phase.timeline}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-2">
                      {phase.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="shrink-0 text-primary">—</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  {index < phases.length - 1 && (
                    <div className="pointer-events-none absolute -bottom-3 left-1/2 -translate-x-1/2">
                      <div className="h-3 w-px bg-border" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </LandingContainer>
        </section>

        <section className="w-full border-b border-border/40 py-10 lg:py-12">
          <LandingContainer>
            <div className="mx-auto mb-10 max-w-3xl text-center">
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
              <h2 className="mb-3 text-balance text-2xl font-semibold leading-tight tracking-tight text-foreground lg:text-3xl">
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
                  className="flex items-center gap-3 rounded-xl landing-surface p-3 text-sm text-muted-foreground"
                >
                  <HugeiconsIcon
                    icon={item.icon}
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                  />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </LandingContainer>
        </section>

        <section className="w-full py-10 lg:py-12">
          <LandingContainer>
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
                    className="rounded-full px-2.5 text-[10px] font-medium"
                  >
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          </LandingContainer>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
