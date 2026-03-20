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
import { features } from "./landing-content";

export function FeatureGrid() {
  return (
    <LandingSection id="features" withBorder>
      <LandingContainer>
        <LandingSectionHeader
          eyebrow="Features"
          title="Everything you need"
          description="Core entities to manage your personal workflow. No bloat, no missing pieces."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="rounded-xl landing-surface">
              <CardHeader className="pb-3">
                <HugeiconsIcon
                  icon={feature.icon}
                  aria-hidden="true"
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
      </LandingContainer>
    </LandingSection>
  );
}
