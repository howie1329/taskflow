import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"

export const metadata = {
  title: "Onboarding | Taskflow",
  description: "Set up your Taskflow workspace",
}

export default function OnboardingPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-lg font-semibold">Welcome to Taskflow</h1>
        <p className="text-sm text-muted-foreground">
          Let’s set up the basics so your workspace is ready to go.
        </p>
      </div>
      <OnboardingWizard />
    </div>
  )
}
