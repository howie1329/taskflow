import {
  LandingNavbar,
  Hero,
  Workflow,
  AiOperatorPanel,
  LandingFooter,
} from "@/components/landing";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col">
      <LandingNavbar />
      <Hero />
      <Workflow />
      <AiOperatorPanel />
      <LandingFooter />
    </main>
  );
}
