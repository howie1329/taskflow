import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  LandingSection,
  LandingContainer,
  LandingSectionHeader,
} from "./index";
import { workflowSteps } from "./landing-content";

export function Workflow() {
  return (
    <LandingSection id="workflow">
      <LandingContainer>
        <LandingSectionHeader
          eyebrow="The loop"
          title="Solo workflow, amplified"
          description="One seamless cycle from capture to completion, with AI as your copilot."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {workflowSteps.map((step, index) => (
            <Card key={step.title} className="relative landing-surface">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <HugeiconsIcon
                    icon={step.icon}
                    aria-hidden="true"
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
      </LandingContainer>
    </LandingSection>
  );
}
