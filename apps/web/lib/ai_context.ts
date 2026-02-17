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

export function buildSystemPrompt(
  projectContext?: ProjectContext,
  modeName?: ModeName,
  customInstructions?: string,
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

  return parts.join("\n\n");
}
