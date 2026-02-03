"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useViewer } from "@/components/settings/hooks/use-viewer"
import { useAvailableModels } from "@/components/settings/hooks/use-available-models"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"

const steps = [
  {
    key: "profile",
    title: "Profile basics",
    description: "Add the essentials so your workspace feels personal.",
  },
  {
    key: "model",
    title: "Default AI model",
    description: "Pick the model you want Taskflow to use by default.",
  },
  {
    key: "notifications",
    title: "Notifications",
    description: "Choose how you want in-app updates to appear.",
  },
]

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function OnboardingWizard() {
  const router = useRouter()
  const { displayValues, preferences, isLoading } = useViewer()
  const { models, isLoading: isLoadingModels, isEmpty } = useAvailableModels()

  const updateProfile = useMutation(api.profiles.updateMyProfile)
  const updatePreferences = useMutation(api.preferences.updateMyPreferences)

  const [activeStep, setActiveStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })
  const [modelQuery, setModelQuery] = useState("")
  const [selectedModelId, setSelectedModelId] = useState("")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const isCompleted = !!preferences?.onboardingCompletedAt

  const displayFirstName = displayValues?.firstName || ""
  const displayLastName = displayValues?.lastName || ""
  const displayEmail = displayValues?.email || ""

  useEffect(() => {
    if (
      profileData.firstName === displayFirstName &&
      profileData.lastName === displayLastName &&
      profileData.email === displayEmail
    ) {
      return
    }
    setProfileData({
      firstName: displayFirstName,
      lastName: displayLastName,
      email: displayEmail,
    })
  }, [
    displayFirstName,
    displayLastName,
    displayEmail,
    profileData.firstName,
    profileData.lastName,
    profileData.email,
  ])

  useEffect(() => {
    if (preferences?.defaultAIModel?.modelId && !selectedModelId) {
      setSelectedModelId(preferences.defaultAIModel.modelId)
    }
  }, [preferences?.defaultAIModel?.modelId, selectedModelId])

  useEffect(() => {
    if (preferences?.notificationsEnabled !== undefined) {
      setNotificationsEnabled(preferences.notificationsEnabled)
    }
  }, [preferences?.notificationsEnabled])

  const filteredModels = useMemo(() => {
    if (!modelQuery.trim()) return models
    const query = modelQuery.toLowerCase()
    return models.filter(
      (model) =>
        model.name.toLowerCase().includes(query) ||
        model.modelId.toLowerCase().includes(query),
    )
  }, [modelQuery, models])

  const progressValue = ((activeStep + 1) / steps.length) * 100
  const currentStep = steps[activeStep]
  const hasModelMatches = filteredModels.length > 0

  const handleProfileSubmit = async () => {
    if (
      !profileData.firstName.trim() ||
      !profileData.lastName.trim() ||
      !profileData.email.trim()
    ) {
      toast.error("All profile fields are required")
      return
    }

    if (!emailRegex.test(profileData.email)) {
      toast.error("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)
    try {
      await updateProfile({
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
        email: profileData.email.trim(),
      })
      setActiveStep(1)
    } catch (error) {
      toast.error("Failed to save profile")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleModelSubmit = async () => {
    if (!selectedModelId && !isEmpty) {
      toast.error("Please select a default model")
      return
    }

    if (selectedModelId) {
      const selectedModel = models.find(
        (model) => model.modelId === selectedModelId,
      )
      if (!selectedModel) {
        toast.error("Selected model not found")
        return
      }

      setIsSubmitting(true)
      try {
        await updatePreferences({
          defaultAIModel: {
            modelId: selectedModel.modelId,
            name: selectedModel.name,
          },
        })
        setActiveStep(2)
      } catch (error) {
        toast.error("Failed to save default model")
        console.error(error)
      } finally {
        setIsSubmitting(false)
      }
    } else {
      setActiveStep(2)
    }
  }

  const handleFinish = async () => {
    setIsSubmitting(true)
    try {
      await updatePreferences({
        notificationsEnabled,
        onboardingCompletedAt: Date.now(),
        onboardingVersion: "v1",
      })
      router.push("/app/tasks")
    } catch (error) {
      toast.error("Failed to finish onboarding")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6 space-y-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-2 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </Card>
    )
  }

  if (isCompleted) {
    return (
      <Card className="p-6 space-y-4">
        <div>
          <h2 className="text-base font-medium">Onboarding complete</h2>
          <p className="text-sm text-muted-foreground">
            You’re all set. Jump back into your workspace whenever you’re ready.
          </p>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => router.push("/app/tasks")}>Go to Tasks</Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Step {activeStep + 1} of {steps.length}
          </span>
          <span>{currentStep.title}</span>
        </div>
        <Progress value={progressValue} />
      </div>

      <div className="space-y-2">
        <h2 className="text-base font-medium">{currentStep.title}</h2>
        <p className="text-sm text-muted-foreground">{currentStep.description}</p>
      </div>

      {currentStep.key === "profile" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Field>
              <FieldLabel>First name</FieldLabel>
              <Input
                value={profileData.firstName}
                onChange={(event) =>
                  setProfileData((prev) => ({
                    ...prev,
                    firstName: event.target.value,
                  }))
                }
                placeholder="Enter your first name"
              />
              <FieldDescription>Max 50 characters</FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Last name</FieldLabel>
              <Input
                value={profileData.lastName}
                onChange={(event) =>
                  setProfileData((prev) => ({
                    ...prev,
                    lastName: event.target.value,
                  }))
                }
                placeholder="Enter your last name"
              />
              <FieldDescription>Max 50 characters</FieldDescription>
            </Field>
          </div>
          <Field>
            <FieldLabel>Contact email</FieldLabel>
            <Input
              type="email"
              value={profileData.email}
              onChange={(event) =>
                setProfileData((prev) => ({
                  ...prev,
                  email: event.target.value,
                }))
              }
              placeholder="Enter your contact email"
            />
            <FieldDescription>
              Used for account contact and future notifications.
            </FieldDescription>
          </Field>
        </div>
      )}

      {currentStep.key === "model" && (
        <div className="space-y-6">
          <Field>
            <FieldLabel>Search models</FieldLabel>
            <Input
              value={modelQuery}
              onChange={(event) => setModelQuery(event.target.value)}
              placeholder="Search by model name or ID"
            />
            <FieldDescription>
              This will become your default model in the app.
            </FieldDescription>
          </Field>

          {isLoadingModels ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : isEmpty ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No models available yet</EmptyTitle>
                <EmptyDescription>
                  We’ll let you continue and you can set a model later in
                  Settings.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <span>Continue to finish onboarding.</span>
              </EmptyContent>
            </Empty>
          ) : hasModelMatches ? (
            <ScrollArea className="h-56 rounded-none border">
              <div className="divide-y">
                {filteredModels.map((model) => {
                  const isSelected = model.modelId === selectedModelId
                  return (
                    <button
                      key={model._id}
                      type="button"
                      onClick={() => setSelectedModelId(model.modelId)}
                      className={`flex w-full flex-col gap-1 px-3 py-2 text-left text-xs transition ${
                        isSelected
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/50"
                      }`}
                    >
                      <span className="font-medium">{model.name}</span>
                      <span className="text-muted-foreground">
                        {model.modelId}
                      </span>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No matching models</EmptyTitle>
                <EmptyDescription>
                  Try a different search term to find the model you want.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {!isEmpty && selectedModelId && (
            <div className="rounded-none border px-3 py-2 text-xs text-muted-foreground">
              Selected model:{" "}
              <span className="text-foreground">
                {models.find((model) => model.modelId === selectedModelId)?.name}
              </span>
            </div>
          )}
        </div>
      )}

      {currentStep.key === "notifications" && (
        <div className="space-y-6">
          <Field>
            <div className="flex items-center justify-between gap-4">
              <div>
                <FieldLabel>In-app notifications</FieldLabel>
                <FieldDescription>
                  Toggle updates like successful saves or reminders.
                </FieldDescription>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
          </Field>

          <div className="rounded-none border p-4 text-xs text-muted-foreground space-y-2">
            <div className="text-foreground font-medium">Review</div>
            <div>
              {profileData.firstName} {profileData.lastName} ·{" "}
              {profileData.email}
            </div>
            <div>
              Default model:{" "}
              {selectedModelId
                ? models.find((model) => model.modelId === selectedModelId)?.name
                : "Not set yet"}
            </div>
            <div>
              Notifications: {notificationsEnabled ? "Enabled" : "Disabled"}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setActiveStep((prev) => Math.max(prev - 1, 0))}
          disabled={activeStep === 0 || isSubmitting}
        >
          Back
        </Button>
        <div className="flex items-center gap-2">
          {currentStep.key === "profile" && (
            <Button onClick={handleProfileSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Next"}
            </Button>
          )}
          {currentStep.key === "model" && (
            <Button onClick={handleModelSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Next"}
            </Button>
          )}
          {currentStep.key === "notifications" && (
            <Button onClick={handleFinish} disabled={isSubmitting}>
              {isSubmitting ? "Finishing..." : "Finish"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
