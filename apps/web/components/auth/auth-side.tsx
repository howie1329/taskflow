"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Task01Icon,
  NoteIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";

interface AuthSideProps {
  mode?: "signin" | "signup";
}

const features = [
  {
    icon: Task01Icon,
    text: "Tasks, projects, and inbox in one solo workspace",
  },
  {
    icon: NoteIcon,
    text: "Notes and links that stay tied to real work",
  },
  {
    icon: SparklesIcon,
    text: "AI that runs operations on your items—not generic chat",
  },
] as const;

export function AuthSide({ mode = "signin" }: AuthSideProps) {
  const title =
    mode === "signin"
      ? "One place for tasks, notes, and AI"
      : "A workspace built for solo focus";
  const description =
    mode === "signin"
      ? "Pick up where you left off. Your tasks, notes, and AI context stay in one place."
      : "Capture work, organize it, and let AI handle operational to-dos—without tab-hopping.";

  return (
    <div className="flex h-full flex-col justify-center space-y-8 px-2 lg:px-6">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/40 px-2.5 py-1">
          <span className="text-xs font-medium text-foreground">Taskflow</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
          {title}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <ul className="space-y-4">
        {features.map((feature) => (
          <li key={feature.text} className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-card text-primary">
              <HugeiconsIcon
                icon={feature.icon}
                aria-hidden="true"
                className="h-4 w-4"
              />
            </span>
            <span className="text-sm leading-relaxed text-muted-foreground">
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
