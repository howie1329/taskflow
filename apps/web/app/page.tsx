import {
  LandingNavbar,
  Hero,
  Workflow,
  FeatureGrid,
  AiOperatorPanel,
  LandingFooter,
} from "@/components/landing";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col">
      <LandingNavbar />
      <Hero />
      <Workflow />
      <FeatureGrid />
      <AiOperatorPanel />
      <LandingFooter />
    </main>
  );
}
