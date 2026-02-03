"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PromptInput,
  PromptInputProvider,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputHeader,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  usePromptInputController,
} from "@/components/ai-elements/prompt-input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GlobalIcon,
  Image01Icon,
  MessageQuestionIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { nanoid } from "nanoid";
import { mockProjects } from "./components/mock-data";

type Scope =
  | { type: "all" }
  | { type: "project"; projectId: string; projectName: string };

const SUGGESTIONS = [
  {
    title: "Plan my day",
    description: "Turn tasks into a clear schedule",
    value: "Plan my day",
  },
  {
    title: "Break this into tasks",
    description: "Create steps from a rough idea",
    value: "Break this into tasks",
  },
  {
    title: "Prioritize my backlog",
    description: "Sort tasks by impact and urgency",
    value: "Prioritize my backlog",
  },
  {
    title: "Create a project plan",
    description: "Outline milestones and deliverables",
    value: "Create a project plan",
  },
];

function SuggestionGrid({ onSelect }: { onSelect: (suggestion: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {SUGGESTIONS.map((suggestion) => (
        <button
          key={suggestion.value}
          type="button"
          onClick={() => onSelect(suggestion.value)}
          className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Card className="border-border/60 hover:border-foreground/20 hover:bg-accent/40 transition-colors">
            <CardHeader className="space-y-1.5">
              <CardTitle className="text-sm font-medium">
                {suggestion.title}
              </CardTitle>
              <CardDescription className="text-xs">
                {suggestion.description}
              </CardDescription>
            </CardHeader>
          </Card>
        </button>
      ))}
    </div>
  );
}

function ComposerWithScope() {
  const router = useRouter();
  const [scope, setScope] = useState<Scope>({ type: "all" });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { textInput } = usePromptInputController();

  const handleSubmit = () => {
    const threadId = `temp-${nanoid()}`;
    router.push(`/app/chat/${threadId}`);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    textInput.setInput(suggestion);
    textareaRef.current?.focus();
  };

  const scopeLabel =
    scope.type === "all"
      ? "All workspace"
      : `${mockProjects.find((p) => p.id === scope.projectId)?.icon || "📁"} ${scope.projectName}`;

  return (
    <div className="flex flex-col h-full">
      {/* Center content */}
      <div className="flex-1">
        <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
          <div className="text-center max-w-2xl">
            <div className="inline-flex items-center justify-center size-11 rounded-none border bg-background mb-5">
              <HugeiconsIcon
                icon={MessageQuestionIcon}
                className="size-5"
                strokeWidth={2}
              />
            </div>
            <h1 className="text-3xl font-medium mb-3">
              What can I help you build?
            </h1>
            <p className="text-sm text-muted-foreground">
              Start a conversation or choose a prompt to shape your next task.
            </p>
          </div>

          <div className="w-full max-w-2xl mt-10">
            <p className="text-xs font-medium text-muted-foreground mb-3 text-center">
              Suggested prompts
            </p>
            <SuggestionGrid onSelect={handleSuggestionSelect} />
          </div>
        </div>
      </div>

      {/* Composer - Fixed at bottom */}
      <div className="shrink-0 border-t bg-background/80 backdrop-blur p-4 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-3xl mx-auto">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputHeader>
              <div className="flex w-full items-center justify-between gap-3">
                <PromptInputTools>
                  <PromptInputActionMenu>
                    <PromptInputActionMenuTrigger>
                      <HugeiconsIcon
                        icon={PlusSignIcon}
                        className="size-4"
                        strokeWidth={2}
                      />
                    </PromptInputActionMenuTrigger>
                    <PromptInputActionMenuContent>
                      <PromptInputActionAddAttachments />
                    </PromptInputActionMenuContent>
                  </PromptInputActionMenu>
                  <PromptInputButton variant="ghost" size="icon-sm">
                    <HugeiconsIcon
                      icon={Image01Icon}
                      className="size-4"
                      strokeWidth={2}
                    />
                  </PromptInputButton>
                </PromptInputTools>
                <div className="w-full max-w-[200px]">
                  <Combobox>
                    <ComboboxInput
                      placeholder="Select scope..."
                      className="h-7 text-xs"
                      showTrigger
                      value={scopeLabel}
                      readOnly
                    />
                    <ComboboxContent>
                      <ComboboxList>
                        <ComboboxItem
                          onClick={() => setScope({ type: "all" })}
                          className="flex items-center gap-2"
                        >
                          <HugeiconsIcon
                            icon={GlobalIcon}
                            className="size-4"
                            strokeWidth={2}
                          />
                          All workspace
                        </ComboboxItem>
                        <ComboboxEmpty />
                      </ComboboxList>
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                        Projects
                      </div>
                      <ComboboxList>
                        {mockProjects.map((project) => (
                          <ComboboxItem
                            key={project.id}
                            onClick={() =>
                              setScope({
                                type: "project",
                                projectId: project.id,
                                projectName: project.title,
                              })
                            }
                            className="flex items-center gap-2"
                          >
                            <span>{project.icon}</span>
                            {project.title}
                          </ComboboxItem>
                        ))}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>
              </div>
            </PromptInputHeader>

            <PromptInputTextarea
              ref={textareaRef}
              placeholder={
                scope.type === "all"
                  ? "Message Taskflow..."
                  : `Ask about ${scope.projectName}...`
              }
            />

            <PromptInputFooter>
              <PromptInputTools>
                <span className="text-xs text-muted-foreground">
                  Press Enter to send, Shift+Enter for new line
                </span>
              </PromptInputTools>
              <PromptInputSubmit />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <PromptInputProvider>
      <ComposerWithScope />
    </PromptInputProvider>
  );
}
