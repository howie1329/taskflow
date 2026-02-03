"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
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
  FolderManagementIcon,
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
  {
    title: "Draft a task list",
    description: "Capture quick to-dos from a note",
    value: "Draft a task list",
  },
  {
    title: "Summarize project status",
    description: "Turn updates into a short brief",
    value: "Summarize project status",
  },
];

function SuggestionGrid({ onSelect }: { onSelect: (suggestion: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {SUGGESTIONS.map((suggestion) => (
        <button
          key={suggestion.value}
          type="button"
          onClick={() => onSelect(suggestion.value)}
          className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Card
            className="border-border/60 hover:border-foreground/20 hover:bg-accent/40 transition-colors"
            size="sm"
          >
            <CardHeader className="space-y-1">
              <CardTitle className="text-sm">{suggestion.title}</CardTitle>
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
          {/* Headline */}
          <div className="text-center mb-8 max-w-2xl">
            <div className="inline-flex items-center justify-center size-10 rounded-none border bg-background mb-4">
              <HugeiconsIcon
                icon={MessageQuestionIcon}
                className="size-5"
                strokeWidth={2}
              />
            </div>
            <h1 className="text-2xl font-medium mb-2">
              Chat with your workspace
            </h1>
            <p className="text-sm text-muted-foreground">
              Ask questions, plan work, and turn ideas into tasks.
            </p>
          </div>

          {/* Suggestions */}
          <div className="w-full max-w-3xl">
            <SuggestionGrid onSelect={handleSuggestionSelect} />
          </div>
        </div>
      </div>

      {/* Composer - Fixed at bottom */}
      <div className="shrink-0 border-t bg-background/80 backdrop-blur p-4 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-3xl mx-auto">
          {/* Scope control */}
          <div className="flex items-center justify-between gap-3 mb-2 px-1">
            <span className="text-xs text-muted-foreground">Scope</span>
            <div className="w-full max-w-[240px]">
              <Combobox>
                <ComboboxInput
                  placeholder="Select scope..."
                  className="h-8 text-xs"
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
            <Badge variant="outline" className="rounded-none text-xs">
              {scope.type === "all" ? (
                <>
                  <HugeiconsIcon
                    icon={GlobalIcon}
                    className="size-3 mr-1"
                    strokeWidth={2}
                  />
                  All workspace
                </>
              ) : (
                <>
                  <HugeiconsIcon
                    icon={FolderManagementIcon}
                    className="size-3 mr-1"
                    strokeWidth={2}
                  />
                  {mockProjects.find((p) => p.id === scope.projectId)?.icon}{" "}
                  {scope.projectName}
                </>
              )}
            </Badge>
          </div>

          <PromptInput onSubmit={handleSubmit}>
            <PromptInputHeader>
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
