import { Experimental_Agent as Agent, stepCountIs, tool } from "ai";
import { VercelAITools } from "./VercelAITools.js";
import { z } from "zod";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { TaskAgentPrompt } from "../AIPrompts/TaskPrompt.js";
import { NoteAgentPrompt } from "../AIPrompts/NotePrompt.js";

export const VercelMiniAgents = (writer) => {
  const tools = VercelAITools(writer);
  const openRouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_AI_KEY,
  });
  return {
    TaskAgent: new tool({
      name: "TaskAgent",
      description: "A tool that can be used handle tasks",
      inputSchema: z.object({
        request: z.string().describe("The users question"),
        userId: z
          .string()
          .describe(
            "The userId of the user (REQUIRED - use the userId from the system context"
          ),
      }),
      execute: async ({ request, userId }) => {
        console.log("Inside TaskAgent tool", request, userId);
        const agent = new Agent({
          name: "TaskAgent",
          instructions: TaskAgentPrompt({ userId }),
          model: openRouter("openai/gpt-5-nano"),
          tools: {
            getTasks: tools.GetTasks,
            createTask: tools.CreateTask,
            updateTask: tools.UpdateTask,
            deleteTask: tools.DeleteTask,
            getSubtasks: tools.GetSubtasks,
            createSubtask: tools.CreateSubtask,
            updateSubtask: tools.UpdateSubtask,
            deleteSubtask: tools.DeleteSubtask,
            bulkCreateSubtasks: tools.BulkCreateSubtasks,
            markSubtaskComplete: tools.MarkSubtaskComplete,
          },
          stopWhen: stepCountIs(10),
        });

        const result = await agent.generate({ prompt: request + " " + userId });
        console.log("Result in TaskAgent tool", result);
        return result.text;
      },
    }),
    NoteAgent: new tool({
      name: "NoteAgent",
      description: "A tool that can be used to handle notes",
      inputSchema: z.object({
        request: z.string().describe("The users question"),
        userId: z
          .string()
          .describe(
            "The userId of the user (REQUIRED - use the userId from the system context"
          ),
      }),
      execute: async ({ request, userId }) => {
        console.log("Inside NoteAgent tool", request, userId);
        const agent = new Agent({
          name: "NoteAgent",
          instructions: NoteAgentPrompt({ userId }),
          model: openRouter("openai/gpt-5-nano"),
          tools: {
            getAllNotes: tools.GetNotes,
            getNotesByTask: tools.GetNotesByTaskId,
            createNote: tools.CreateNote,
            updateNote: tools.UpdateNote,
            deleteNote: tools.DeleteNote,
          },
          stopWhen: stepCountIs(10),
        });

        const result = await agent.generate({ prompt: request + " " + userId });
        return result.text;
      },
    }),

    WebSearchAgent: new tool({
      name: "WebSearchAgent",
      description: "A tool that can be used to search the web",
      inputSchema: z.object({
        query: z.string().describe("The query to search the web for"),
      }),
      execute: async ({ query }) => {
        const agent = new Agent({
          name: "WebSearchAgent",
          instructions:
            "You are a web search agent. You are tasked with searching the web for the query.",
          model: openRouter("openai/gpt-5-nano"),
          tools: {
            webSearch: tools.webSearch,
          },
          toolChoice: {
            type: "tool",
            toolName: "webSearch",
          },
          stopWhen: stepCountIs(5),
        });
        const result = await agent.generate({
          prompt: query,
        });
        return result.text;
      },
    }),
  };
};
