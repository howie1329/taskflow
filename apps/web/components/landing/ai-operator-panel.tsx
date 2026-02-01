"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon, SparklesIcon } from "@hugeicons/core-free-icons";

const examples = [
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

export function AiOperatorPanel() {
  return (
    <section id="ai" className="container px-4 py-16 lg:px-6 lg:py-24 border-t">
      <div className="mx-auto max-w-3xl text-center mb-12">
        <Badge
          variant="outline"
          className="rounded-none mb-4 font-mono text-xs"
        >
          AI operator
        </Badge>
        <h2 className="text-2xl font-medium tracking-tight lg:text-3xl mb-4">
          AI as workplace operator
        </h2>
        <p className="text-muted-foreground text-sm">
          Talk to your workspace. Create items, link them, find what you need.
        </p>
      </div>

      <Card className="mx-auto max-w-2xl overflow-hidden border-dashed">
        <CardHeader className="border-b border-dashed pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Example conversation</CardTitle>
            <Badge variant="secondary" className="rounded-none text-[10px]">
              AI chat
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-dashed">
            {examples.map((example, index) => (
              <div key={index} className="p-4 flex gap-3">
                <div className="shrink-0">
                  <HugeiconsIcon
                    icon={example.icon}
                    className={`h-4 w-4 ${example.user === "You"
                        ? "text-muted-foreground"
                        : "text-primary"
                      }`}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{example.user}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {example.user === "You" ? "10:42 AM" : "10:42 AM"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {example.message}
                  </p>
                  {example.actions && (
                    <div className="flex items-center gap-2 pt-2">
                      <Badge
                        variant="outline"
                        className="rounded-none text-[10px]"
                      >
                        Created task
                      </Badge>
                      <Badge
                        variant="outline"
                        className="rounded-none text-[10px]"
                      >
                        Scheduled today
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
