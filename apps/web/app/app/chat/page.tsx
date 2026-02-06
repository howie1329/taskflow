"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import {
  PromptInput,
  PromptInputProvider,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputFooter,
  usePromptInputController,
} from "@/components/ai-elements/prompt-input";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";
import {
  ProjectSelector,
  ProjectSelectorTrigger,
  ProjectSelectorContent,
  ProjectSelectorList,
  ProjectSelectorItem,
  ProjectSelectorGroup,
  ProjectSelectorEmpty,
} from "@/components/ai-elements/project-selector";
import {
  ModelSelector,
  ModelSelectorTrigger,
  ModelSelectorContent,
  ModelSelectorInput,
  ModelSelectorList,
  ModelSelectorItem,
  ModelSelectorGroup,
  ModelSelectorName,
} from "@/components/ai-elements/model-selector";
import { useChatContext } from "./components/chat-provider";

const SUGGESTIONS = [
  { title: "Plan my day", value: "Plan my day" },
  { title: "Break this into tasks", value: "Break this into tasks" },
  { title: "Prioritize my backlog", value: "Prioritize my backlog" },
  { title: "Create a project plan", value: "Create a project plan" },
];

function ComposerWithScope() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { textInput } = usePromptInputController();
  const {
    activeThreadId,
    sendText,
    status,
    stop,
    selectedModelId,
    setSelectedModelId,
    selectedProjectId,
    setSelectedProjectId,
    projects,
    availableModels,
  } = useChatContext();

  const handleSubmit = () => {
    if (!textInput.value.trim() || !selectedModelId) return;
    router.push(`/app/chat/${activeThreadId}`);
    void sendText(textInput.value);
    textInput.clear();
  };

  const handleSuggestionSelect = (suggestion: string) => {
    textInput.setInput(suggestion);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 min-h-0 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-7xl rounded-md border border-border/60 bg-card/40 dark:bg-card/20 p-6">
          <h1 className="text-center text-sm font-medium text-muted-foreground">
            Taskflow Chat Agent
          </h1>

          <div className="mt-4 mb-3">
            <Suggestions className="justify-center">
              {SUGGESTIONS.map((suggestion) => (
                <Suggestion
                  key={suggestion.value}
                  suggestion={suggestion.value}
                  onClick={handleSuggestionSelect}
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4 text-xs"
                >
                  {suggestion.title}
                </Suggestion>
              ))}
            </Suggestions>
          </div>

          <Separator className="my-3" />

          <label htmlFor="new-chat-message" className="sr-only">
            Message
          </label>
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea
              id="new-chat-message"
              ref={textareaRef}
              placeholder="Message Taskflow..."
            />

            <PromptInputFooter>
              <div className="flex items-center gap-2">
                {availableModels.length > 0 && (
                  <ModelSelector>
                    <ModelSelectorTrigger className="h-7 text-[11px] px-2">
                      <ModelSelectorName>
                        {availableModels.find(
                          (m) => m.modelId === selectedModelId,
                        )?.name ?? "Select model"}
                      </ModelSelectorName>
                    </ModelSelectorTrigger>
                    <ModelSelectorContent>
                      <ModelSelectorInput placeholder="Search models..." />
                      <ModelSelectorList>
                        <ModelSelectorGroup heading="Available Models">
                          {availableModels.map((model) => (
                            <ModelSelectorItem
                              key={model.modelId}
                              value={model.modelId}
                              onSelect={() => setSelectedModelId(model.modelId)}
                            >
                              <ModelSelectorName>
                                {model.name}
                              </ModelSelectorName>
                            </ModelSelectorItem>
                          ))}
                        </ModelSelectorGroup>
                      </ModelSelectorList>
                    </ModelSelectorContent>
                  </ModelSelector>
                )}
                {projects.length > 0 && (
                  <ProjectSelector>
                    <ProjectSelectorTrigger className="h-7 text-[11px] px-2 flex items-center gap-1">
                      <span className="truncate max-w-[150px]">
                        {selectedProjectId
                          ? projects.find((p) => p._id === selectedProjectId)
                              ?.icon +
                              " " +
                              projects.find((p) => p._id === selectedProjectId)
                                ?.title || "Select project"
                          : "Project"}
                      </span>
                    </ProjectSelectorTrigger>
                    <ProjectSelectorContent>
                      <ProjectSelectorList>
                        <ProjectSelectorEmpty>
                          No projects found
                        </ProjectSelectorEmpty>
                        <ProjectSelectorGroup heading="Your Projects">
                          <ProjectSelectorItem
                            value="none"
                            onSelect={() => setSelectedProjectId(null)}
                          >
                            No project
                          </ProjectSelectorItem>
                          {projects.map((project) => (
                            <ProjectSelectorItem
                              key={project._id}
                              value={project._id}
                              onSelect={() => setSelectedProjectId(project._id)}
                            >
                              <span className="mr-2">{project.icon}</span>
                              {project.title}
                            </ProjectSelectorItem>
                          ))}
                        </ProjectSelectorGroup>
                      </ProjectSelectorList>
                    </ProjectSelectorContent>
                  </ProjectSelector>
                )}
              </div>

              <PromptInputSubmit status={status} onStop={stop} />
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
