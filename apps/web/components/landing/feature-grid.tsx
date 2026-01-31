"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InboxIcon,
  Task01Icon,
  Folder02Icon,
  NoteIcon,
  Calendar03Icon,
  MessageQuestionIcon,
} from "@hugeicons/core-free-icons";

const features = [
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

export function FeatureGrid() {
  return (
    <section
      id="features"
      className="container px-4 py-16 lg:px-6 lg:py-24 border-t"
    >
      <div className="mx-auto max-w-3xl text-center mb-12">
        <Badge
          variant="outline"
          className="rounded-none mb-4 font-mono text-xs"
        >
          Features
        </Badge>
        <h2 className="text-2xl font-medium tracking-tight lg:text-3xl mb-4">
          Everything you need
        </h2>
        <p className="text-muted-foreground text-sm">
          Core entities to manage your personal workflow. No bloat, no missing
          pieces.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="group">
            <CardHeader className="pb-3">
              <HugeiconsIcon
                icon={feature.icon}
                className="h-5 w-5 text-muted-foreground"
              />
            </CardHeader>
            <CardContent className="space-y-2">
              <CardTitle className="text-sm">{feature.title}</CardTitle>
              <CardDescription className="text-xs">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
