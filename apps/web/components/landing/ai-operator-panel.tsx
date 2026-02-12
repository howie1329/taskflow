import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  LandingSection,
  LandingContainer,
  LandingSectionHeader,
} from "./index";
import { aiExamples } from "./landing-content";

export function AiOperatorPanel() {
  return (
    <LandingSection id="ai" withBorder>
      <LandingContainer>
        <LandingSectionHeader
          eyebrow="AI operator"
          title="AI as workplace operator"
          description="Talk to your workspace. Create items, link them, find what you need."
        />

        <Card className="mx-auto w-full max-w-5xl overflow-hidden landing-surface">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Example conversation</CardTitle>
              <Badge variant="secondary" className="rounded-md text-[10px]">
                AI chat
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {aiExamples.map((example, index) => (
                <div key={index} className="flex gap-3 p-4">
                  <div className="shrink-0">
                    <HugeiconsIcon
                      icon={example.icon}
                      aria-hidden="true"
                      className={cn(
                        "h-4 w-4",
                        example.user === "You"
                          ? "text-muted-foreground"
                          : "text-primary",
                      )}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">
                        {example.user}
                      </span>
                    </div>
                    <p className="text-pretty text-sm text-muted-foreground">
                      {example.message}
                    </p>
                    {example.actions && (
                      <div className="flex items-center gap-2 pt-2">
                        <Badge
                          variant="outline"
                          className="rounded-md text-[10px]"
                        >
                          Created task
                        </Badge>
                        <Badge
                          variant="outline"
                          className="rounded-md text-[10px]"
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
      </LandingContainer>
    </LandingSection>
  );
}
