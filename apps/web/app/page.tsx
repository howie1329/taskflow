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
    <main className="flex min-h-screen flex-col">
      <LandingNavbar />
      <Hero />
      <Workflow />
      <FeatureGrid />
      <AiOperatorPanel />
      <LandingFooter />
    </main>
  );
}
