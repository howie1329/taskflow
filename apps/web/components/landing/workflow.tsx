import {
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  LandingSection,
  LandingContainer,
  LandingSectionHeader,
} from "./index";
import { workflowSteps, features } from "./landing-content";

export function Workflow() {
  return (
    <LandingSection id="workflow" withBorder>
      <LandingContainer size="sm">
        <LandingSectionHeader
          eyebrow="Workflow"
          title="One calm system from capture to completion"
          description="Taskflow keeps your daily loop tight: collect, organize, ship, and let AI handle operational work."
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {workflowSteps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-xl landing-surface p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <HugeiconsIcon
                  icon={step.icon}
                  aria-hidden="true"
                  className="h-5 w-5 text-muted-foreground"
                />
                <span className="font-mono text-[10px] text-muted-foreground">
                  0{index + 1}
                </span>
              </div>
              <CardTitle className="text-sm">{step.title}</CardTitle>
              <CardDescription className="mt-2 text-xs leading-relaxed">
                {step.description}
              </CardDescription>
            </div>
          ))}
        </div>

        <div id="features" className="mt-16 border-t border-border/40 pt-12">
          <LandingSectionHeader
            align="left"
            className="mb-8"
            eyebrow="Foundations"
            title="Everything you need, without noise"
            description="Core building blocks designed for solo work. Every piece is connected and intentionally simple."
          />

          <div className="divide-y divide-border/40 rounded-xl border border-border/40 bg-card/50 dark:bg-card/30">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="grid gap-3 px-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start sm:px-5"
              >
                <HugeiconsIcon
                  icon={feature.icon}
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 text-muted-foreground"
                />
                <div className="space-y-1">
                  <CardTitle className="text-sm">{feature.title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </div>
              </div>
            ))}
          </div>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
