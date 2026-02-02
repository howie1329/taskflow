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
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GlobalIcon,
  FolderManagementIcon,
  Image01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { nanoid } from "nanoid";

// Mock projects for scope selection
const mockProjects = [
  { id: "p1", title: "Website Redesign", icon: "🎨" },
  { id: "p2", title: "Mobile App", icon: "📱" },
  { id: "p3", title: "Q1 Planning", icon: "📊" },
];

type Scope =
  | { type: "all" }
  | { type: "project"; projectId: string; projectName: string };

const PLAN_SUGGESTIONS = [
  "Plan my day",
  "Break this into tasks",
  "Prioritize my backlog",
];

const CREATE_SUGGESTIONS = [
  "Create a project plan",
  "Draft a task list",
  "Write a note summary",
];

const FIND_SUGGESTIONS = [
  "Find tasks about...",
  "What's overdue?",
  "Summarize project status",
];

function PromptChips({ onSelect }: { onSelect: (suggestion: string) => void }) {
  return (
    <div className="space-y-4">
      {/* Plan */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
          Plan
        </p>
        <Suggestions>
          {PLAN_SUGGESTIONS.map((suggestion) => (
            <Suggestion
              key={suggestion}
              suggestion={suggestion}
              onClick={onSelect}
              variant="outline"
              size="sm"
              className="rounded-full"
            />
          ))}
        </Suggestions>
      </div>

      {/* Create */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
          Create
        </p>
        <Suggestions>
          {CREATE_SUGGESTIONS.map((suggestion) => (
            <Suggestion
              key={suggestion}
              suggestion={suggestion}
              onClick={onSelect}
              variant="outline"
              size="sm"
              className="rounded-full"
            />
          ))}
        </Suggestions>
      </div>

      {/* Find/Explain */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
          Find & Explain
        </p>
        <Suggestions>
          {FIND_SUGGESTIONS.map((suggestion) => (
            <Suggestion
              key={suggestion}
              suggestion={suggestion}
              onClick={onSelect}
              variant="outline"
              size="sm"
              className="rounded-full"
            />
          ))}
        </Suggestions>
      </div>
    </div>
  );
}

function ComposerWithScope() {
  const router = useRouter();
  const [scope, setScope] = useState<Scope>({ type: "all" });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { textInput } = usePromptInputController();

  const handleSubmit = () => {
    // Mock: create thread and navigate
    const threadId = nanoid();
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
      <ScrollArea className="flex-1">
        <div className="flex flex-col items-center justify-center min-h-full px-8 py-12">
          {/* Headline */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-medium mb-2">
              Talk to your workspace
            </h1>
            <p className="text-sm text-muted-foreground">
              Get help with tasks, projects, and planning
            </p>
          </div>

          {/* Scope Control */}
          <div className="w-full max-w-2xl mb-6">
            <Combobox>
              <ComboboxInput
                placeholder="Select scope..."
                className="w-full"
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
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase">
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

          {/* Prompt Chips */}
          <div className="w-full max-w-2xl mb-8">
            <PromptChips onSelect={handleSuggestionSelect} />
          </div>
        </div>
      </ScrollArea>

      {/* Composer - Fixed at bottom */}
      <div className="shrink-0 border-t bg-background/80 backdrop-blur p-4">
        <div className="max-w-3xl mx-auto">
          {/* Scope indicator above composer */}
          <div className="flex items-center gap-2 mb-2 px-1">
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
