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
  InboxDownloadIcon,
  FolderManagementIcon,
  CheckListIcon,
  ArtificialIntelligence04Icon,
} from "@hugeicons/core-free-icons";

const workflowSteps = [
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

export function Workflow() {
  return (
    <section id="workflow" className="container px-4 py-16 lg:px-6 lg:py-24">
      <div className="mx-auto max-w-3xl text-center mb-12">
        <Badge
          variant="outline"
          className="rounded-md mb-4 font-mono text-xs"
        >
          The loop
        </Badge>
        <h2 className="text-2xl font-medium tracking-tight lg:text-3xl mb-4">
          Solo workflow, amplified
        </h2>
        <p className="text-muted-foreground text-sm">
          One seamless cycle from capture to completion, with AI as your
          copilot.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
        {workflowSteps.map((step, index) => (
          <Card key={step.title} className="relative group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <HugeiconsIcon
                  icon={step.icon}
                  className="h-5 w-5 text-muted-foreground"
                />
                <span className="font-mono text-[10px] text-muted-foreground">
                  0{index + 1}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <CardTitle className="text-sm">{step.title}</CardTitle>
              <CardDescription className="text-xs">
                {step.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
