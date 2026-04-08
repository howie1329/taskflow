import { MainAgentPrompt } from "./AiPrompts/main_prompt";
import { getModePrompt, type ModeName } from "./AITools/ModePrompts";

export interface ProjectContext {
  project: {
    id: string;
    title: string;
    description?: string;
    icon: string;
  };
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority?: string;
    dueDate?: number;
  }>;
  notes: Array<{
    id: string;
    title: string;
    content?: string;
  }>;
}

export interface DaytonaPromptContext {
  repoUrl: string
  status: "idle" | "provisioning" | "ready" | "stopped" | "failed"
}

export function buildProjectContextPrompt(context: ProjectContext): string {
  const { project, tasks, notes } = context;

  let prompt = `## Project Context

**Project**: ${project.icon} ${project.title}
${project.description ? `**Description**: ${project.description}\n` : ""}
`;

  if (tasks.length > 0) {
    prompt += `\n### Tasks (${tasks.length})\n`;
    tasks.forEach((task) => {
      const status = task.status === "Completed" ? "[x]" : "[ ]";
      const priority = task.priority ? ` (${task.priority})` : "";
      const dueDate = task.dueDate
        ? ` - Due: ${new Date(task.dueDate).toLocaleDateString()}`
        : "";
      prompt += `- ${status} ${task.title}${priority}${dueDate}\n`;
    });
  }

  if (notes.length > 0) {
    prompt += `\n### Notes (${notes.length})\n`;
    notes.forEach((note) => {
      prompt += `- **${note.title}**: ${note.content || "No content"}\n`;
    });
  }

  return prompt;
}

export const BASE_SYSTEM_INSTRUCTIONS = MainAgentPrompt;

export function buildDaytonaAttachmentPrompt(context: DaytonaPromptContext): string {
  return `## Attached Repo Workspace

- An attached Daytona repo workspace is available for this thread.
- Repository: ${context.repoUrl}
- Sandbox status: ${context.status}
- For broad repo or codebase questions, prefer \`researchDaytonaRepo\` first so a Daytona research subagent can explore the repo without bloating the main assistant's context.
- Use lower-level Daytona tools directly only for explicit lifecycle actions, tightly scoped follow-up inspection, or when the user clearly wants manual control.
- Use Daytona before web tools for questions like "where is X", "how is this implemented", "summarize this codebase", or "what does this function do".
- Do not use Daytona for external/current-web research.
- If Daytona is unavailable, provisioning, or failed, say that clearly and avoid pretending you inspected the repo.
- When Daytona evidence supports your answer, cite the file path and relevant line number or line range inline in lightweight prose.`
}

export function buildSystemPrompt(
  projectContext?: ProjectContext,
  modeName?: ModeName,
  customInstructions?: string,
  daytonaContext?: DaytonaPromptContext,
): string {
  const baseInstructions = customInstructions || BASE_SYSTEM_INSTRUCTIONS;
  const parts: string[] = [baseInstructions];

  // Add mode-specific instructions if mode is provided
  if (modeName) {
    const modePrompt = getModePrompt(modeName);
    parts.push(modePrompt);
  }

  // Add project context if provided
  if (projectContext) {
    const contextPrompt = buildProjectContextPrompt(projectContext);
    parts.push(contextPrompt);
  }

  if (daytonaContext) {
    parts.push(buildDaytonaAttachmentPrompt(daytonaContext))
  }

  return parts.join("\n\n");
}
