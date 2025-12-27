import { tool } from "ai";
import { z } from "zod";
import { taskOps } from "../../db/operations/tasks.js";
import { subtaskOps } from "../../db/operations/subtasks.js";
import { noteOps } from "../../db/operations/notes.js";
import { NodeSchema } from "./Notes/NotesBlockSchema.js";
import Exa from "exa-js";

export const VercelAITools = (writer) => {
  const exa = new Exa(process.env.EXA_API_KEY);
  return {
    webSearch: new tool({
      name: "WebSearch",
      description: "A tool that can be used to search the web",
      inputSchema: z.object({
        query: z.string().describe("The query to search the web for"),
      }),
      execute: async ({ query }) => {
        const searchId = `tool-call-web-search-${crypto.randomUUID()}`;
        writer.write({
          type: "data-web-search",
          id: searchId,
          data: {
            status: "loading",
            message: "Using Exa WebSearch Tool to Search the Web",
          },
        });
        console.log("Query from Exa WebSearch Tool", query);
        const result = await exa.search(query, {
          contents: {
            text: {
              maxCharacters: 2500,
            },
            summary: {
              query: "What is the main idea of the sources?",
            },
            livecrawl: "preferred",
            livecrawlTimeout: 12500,
            context: {
              maxCharacters: 5000,
            },
            highlights: {
              highlightsPerUrl: 2,
              numSentences: 1,
              query: "What is the main idea of the sources?",
            },
          },
          numResults: 2,
          type: "auto",
        });
        console.log("Result from Exa WebSearch Tool", result);
        writer.write({
          type: "data-web-search",
          id: searchId,
          data: {
            status: "complete",
            message: "Exa WebSearch Tool completed successfully",
            results: result.results,
            cost: result.costDollars,
          },
        });
        return result.context;
      },
    }),
    GetTasks: new tool({
      name: "GetTasks",
      description: "Get all tasks for the user",
      inputSchema: z.object({
        userId: z.string().describe("The user ID to fetch the tasks for"),
      }),
      execute: async ({ userId }) => {
        writer.write({
          type: "data-get-tasks",
          id: "tool-call-get-tasks",
          data: {
            status: "loading",
            message: "Using GetTasks Tools to Find Tasks",
          },
        });
        const tasks = await taskOps.findByUserId(userId);
        console.log("Tasks in GetTasks tool", tasks);
        writer.write({
          type: "data-get-tasks",
          id: "tool-call-get-tasks",
          data: {
            status: "complete",
            message:
              "Tasks fetched successfully... have found " +
              tasks.length +
              " tasks",
          },
        });
        const formattedTasks = tasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          date: task.date,
          isCompleted: task.isCompleted,
          priority: task.priority,
        }));
        console.log("About to write artifact for GetTasks tool");
        writer.write({
          type: "data-artifact-get-tasks",
          id: "data-artifact-get-tasks",
          data: {
            status: "complete",
            toolName: "GetTasks",
            message: "Tasks fetched successfully",
            input: { userId },
            outputs: { tasksCount: tasks.length, tasks: formattedTasks },
            timestamp: new Date().toISOString(),
          },
        });
        console.log("Artifact written for GetTasks tool");
        return formattedTasks;
      },
    }),
    CreateTask: new tool({
      name: "CreateTask",
      description: "Create a new task and add it to the database",
      inputSchema: z.object({
        title: z.string().describe("The title of the task"),
        description: z.string().describe("The description of the task"),
        date: z.string().optional().describe("The due date of the task"),
        priority: z
          .enum(["Low", "Medium", "High"])
          .optional()
          .describe("The priority of the task"),
        labels: z
          .array(z.string())
          .optional()
          .describe("The labels of the task"),
        userId: z.string().describe("The user ID to create the task for"),
        projectId: z
          .string()
          .optional()
          .describe("The project ID to associate the task with"),
      }),
      execute: async ({
        title,
        description,
        date,
        priority,
        labels,
        userId,
        projectId,
      }) => {
        writer.write({
          type: "data-create-task",
          id: "tool-call-create-task",
          data: {
            status: "loading",
            message: "Using CreateTask Tool to Create Task",
          },
        });
        const taskData = {
          title,
          description,
          userId,
          ...(date && { date }),
          ...(priority && { priority }),
          ...(labels && { labels }),
          ...(projectId && { projectId }),
        };

        const newTask = await taskOps.create(taskData);
        writer.write({
          type: "data-create-task",
          id: "tool-call-create-task",
          data: {
            status: "complete",
            message: "Task created successfully",
          },
        });

        return newTask;
      },
    }),
    UpdateTask: new tool({
      name: "UpdateTask",
      description: "Update an existing task in the database",
      inputSchema: z.object({
        id: z.string().describe("The ID of the task to update"),
        userId: z.string().describe("The user ID who owns the task"),
        title: z.string().optional().describe("The title of the task"),
        description: z
          .string()
          .optional()
          .describe("The description of the task"),
        date: z.string().optional().describe("The due date of the task"),
        priority: z
          .enum(["Low", "Medium", "High"])
          .optional()
          .describe("The priority of the task"),
        labels: z
          .array(z.string())
          .optional()
          .describe("The labels of the task"),
        status: z.string().optional().describe("The status of the task"),
        isCompleted: z
          .boolean()
          .optional()
          .describe("Whether the task is completed"),
      }),
      execute: async ({
        id,
        userId,
        title,
        description,
        date,
        priority,
        labels,
        status,
        isCompleted,
      }) => {
        writer.write({
          type: "data-update-task",
          id: "tool-call-update-task",
          data: {
            status: "loading",
            message: "Using UpdateTask Tool to Update Task",
          },
        });
        const updates = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (date !== undefined) updates.date = date;
        if (priority !== undefined) updates.priority = priority;
        if (labels !== undefined) updates.labels = labels;
        if (status !== undefined) updates.status = status;
        if (isCompleted !== undefined) updates.isCompleted = isCompleted;

        const updatedTask = await taskOps.update(id, userId, updates);
        writer.write({
          type: "data-update-task",
          id: "tool-call-update-task",
          data: {
            status: "complete",
            message: "Task updated successfully",
          },
        });

        return updatedTask;
      },
    }),
    DeleteTask: new tool({
      name: "DeleteTask",
      description: "Delete a task from the database",
      inputSchema: z.object({
        id: z.string().describe("The ID of the task to delete"),
        userId: z.string().describe("The user ID who owns the task"),
      }),
      execute: async ({ id, userId }) => {
        writer.write({
          type: "data-delete-task",
          id: "tool-call-delete-task",
          data: {
            status: "loading",
            message: "Using DeleteTask Tool to Delete Task",
          },
        });
        const deletedTask = await taskOps.delete(id, userId);
        writer.write({
          type: "data-delete-task",
          id: "tool-call-delete-task",
          data: {
            status: "complete",
            message: "Task deleted successfully",
          },
        });

        return deletedTask;
      },
    }),
    GetTaskById: new tool({
      name: "GetTaskById",
      description: "Get a specific task by ID for the user",
      inputSchema: z.object({
        id: z.string().describe("The ID of the task to retrieve"),
        userId: z.string().describe("The user ID who owns the task"),
      }),
      execute: async ({ id, userId }) => {
        writer.write({
          type: "data-get-task-by-id",
          id: "tool-call-get-task-by-id",
          data: {
            status: "loading",
            message: "Using GetTaskById Tool to Find Task",
          },
        });
        const task = await taskOps.findById(id, userId);
        writer.write({
          type: "data-get-task-by-id",
          id: "tool-call-get-task-by-id",
          data: {
            status: "complete",
            message: "Task fetched successfully",
          },
        });

        return task;
      },
    }),
    GetSubtasks: new tool({
      name: "GetSubtasks",
      description: "Get all subtasks for a specific task",
      inputSchema: z.object({
        taskId: z.string().describe("The task ID to get subtasks for"),
      }),
      execute: async ({ taskId }) => {
        writer.write({
          type: "data-get-subtasks",
          id: "tool-call-get-subtasks",
          data: {
            status: "loading",
            message: "Using GetSubtasks Tool to Find Subtasks",
          },
        });
        const subtasks = await subtaskOps.findByTaskId(taskId);
        writer.write({
          type: "data-get-subtasks",
          id: "tool-call-get-subtasks",
          data: {
            status: "complete",
            message: `Subtasks fetched successfully... have found ${subtasks.length} subtasks`,
          },
        });

        return subtasks;
      },
    }),
    CreateSubtask: new tool({
      name: "CreateSubtask",
      description: "Create a new subtask for a task",
      inputSchema: z.object({
        taskId: z.string().describe("The task ID to create the subtask for"),
        subtaskName: z.string().describe("The name/title of the subtask"),
        isComplete: z
          .boolean()
          .optional()
          .describe("Whether the subtask is completed (default: false)"),
      }),
      execute: async ({ taskId, subtaskName, isComplete = false }) => {
        writer.write({
          type: "data-create-subtask",
          id: "tool-call-create-subtask",
          data: {
            status: "loading",
            message: "Using CreateSubtask Tool to Create Subtask",
          },
        });
        const subtaskData = {
          taskId,
          subtaskName,
          isComplete,
        };

        const newSubtask = await subtaskOps.create(subtaskData);
        writer.write({
          type: "data-create-subtask",
          id: "tool-call-create-subtask",
          data: {
            status: "complete",
            message: "Subtask created successfully",
          },
        });

        return newSubtask;
      },
    }),
    UpdateSubtask: new tool({
      name: "UpdateSubtask",
      description: "Update a subtask",
      inputSchema: z.object({
        id: z.string().describe("The subtask ID to update"),
        subtaskName: z
          .string()
          .optional()
          .describe("The new name of the subtask"),
        isComplete: z
          .boolean()
          .optional()
          .describe("Whether the subtask is completed"),
      }),
      execute: async ({ id, subtaskName, isComplete }) => {
        writer.write({
          type: "data-update-subtask",
          id: "tool-call-update-subtask",
          data: {
            status: "loading",
            message: "Using UpdateSubtask Tool to Update Subtask",
          },
        });
        const updates = {};
        if (subtaskName !== undefined) updates.subtaskName = subtaskName;
        if (isComplete !== undefined) updates.isComplete = isComplete;

        const updatedSubtask = await subtaskOps.update(id, updates);
        writer.write({
          type: "data-update-subtask",
          id: "tool-call-update-subtask",
          data: {
            status: "complete",
            message: "Subtask updated successfully",
          },
        });

        return updatedSubtask;
      },
    }),
    DeleteSubtask: new tool({
      name: "DeleteSubtask",
      description: "Delete a subtask",
      inputSchema: z.object({
        id: z.string().describe("The subtask ID to delete"),
      }),
      execute: async ({ id }) => {
        writer.write({
          type: "data-delete-subtask",
          id: "tool-call-delete-subtask",
          data: {
            status: "loading",
            message: "Using DeleteSubtask Tool to Delete Subtask",
          },
        });
        const deletedSubtask = await subtaskOps.delete(id);
        writer.write({
          type: "data-delete-subtask",
          id: "tool-call-delete-subtask",
          data: {
            status: "complete",
            message: "Subtask deleted successfully",
          },
        });

        return deletedSubtask;
      },
    }),
    BulkCreateSubtasks: new tool({
      name: "BulkCreateSubtasks",
      description: "Create multiple subtasks for a task at once",
      inputSchema: z.object({
        taskId: z.string().describe("The task ID to create subtasks for"),
        subtaskNames: z
          .array(z.string())
          .describe("Array of subtask names to create"),
      }),
      execute: async ({ taskId, subtaskNames }) => {
        writer.write({
          type: "data-bulk-create-subtasks",
          id: "tool-call-bulk-create-subtasks",
          data: {
            status: "loading",
            message: `Using BulkCreateSubtasks Tool to Create ${subtaskNames.length} Subtasks`,
          },
        });
        const subtasksData = subtaskNames.map((name) => ({
          taskId,
          subtaskName: name,
          isComplete: false,
        }));

        const newSubtasks = await subtaskOps.createMultiple(subtasksData);
        writer.write({
          type: "data-bulk-create-subtasks",
          id: "tool-call-bulk-create-subtasks",
          data: {
            status: "complete",
            message: `${newSubtasks.length} subtasks created successfully`,
          },
        });

        return newSubtasks;
      },
    }),
    MarkSubtaskComplete: new tool({
      name: "MarkSubtaskComplete",
      description: "Mark a subtask as complete or incomplete",
      inputSchema: z.object({
        id: z.string().describe("The subtask ID to update"),
        isComplete: z
          .boolean()
          .describe("Whether the subtask should be marked as complete"),
      }),
      execute: async ({ id, isComplete }) => {
        writer.write({
          type: "data-mark-subtask-complete",
          id: "tool-call-mark-subtask-complete",
          data: {
            status: "loading",
            message: `Using MarkSubtaskComplete Tool to Mark Subtask as ${
              isComplete ? "Complete" : "Incomplete"
            }`,
          },
        });
        const updatedSubtask = isComplete
          ? await subtaskOps.markComplete(id)
          : await subtaskOps.markIncomplete(id);
        writer.write({
          type: "data-mark-subtask-complete",
          id: "tool-call-mark-subtask-complete",
          data: {
            status: "complete",
            message: `Subtask marked as ${
              isComplete ? "complete" : "incomplete"
            } successfully`,
          },
        });

        return updatedSubtask;
      },
    }),
    GetNotes: new tool({
      name: "GetNotes",
      description: "Get all notes for the user",
      inputSchema: z.object({
        userId: z.string().describe("The user ID to fetch notes for"),
      }),
      execute: async ({ userId }) => {
        writer.write({
          type: "data-get-notes",
          id: "tool-call-get-notes",
          data: {
            status: "loading",
            message: "Using GetNotes Tool to Find Notes",
          },
        });
        const notes = await noteOps.findByUserId(userId);
        writer.write({
          type: "data-get-notes",
          id: "tool-call-get-notes",
          data: {
            status: "complete",
            message: `Notes fetched successfully... have found ${notes.length} notes`,
          },
        });

        return notes;
      },
    }),
    GetNotesByTaskId: new tool({
      name: "GetNotesByTaskId",
      description: "Get all notes for a specific task",
      inputSchema: z.object({
        taskId: z.string().describe("The task ID to get notes for"),
      }),
      execute: async ({ taskId }) => {
        writer.write({
          type: "data-get-notes-by-task-id",
          id: "tool-call-get-notes-by-task-id",
          data: {
            status: "loading",
            message: "Using GetNotesByTaskId Tool to Find Notes",
          },
        });
        const notes = await noteOps.findByTaskId(taskId);
        writer.write({
          type: "data-get-notes-by-task-id",
          id: "tool-call-get-notes-by-task-id",
          data: {
            status: "complete",
            message: `Notes fetched successfully... have found ${notes.length} notes`,
          },
        });

        return notes;
      },
    }),
    // Need to see if blocks work. Right now we know know content is working and being saved.
    CreateNote: new tool({
      name: "CreateNote",
      description: "Create a new note",
      inputSchema: z.object({
        title: z.string().describe("The title of the note"),
        description: z
          .string()
          .optional()
          .describe("A short description of the note"),
        blocks: z.array(NodeSchema).describe("The blocks of the note"),
        taskId: z.string().optional().describe("Optional task linkage"),
        userId: z.string().describe("The user ID creating the note"),
      }),
      execute: async ({ title, description, blocks, taskId, userId }) => {
        writer.write({
          type: "data-create-note",
          id: "tool-call-create-note",
          data: {
            status: "loading",
            message: "Using CreateNote Tool to Create Note",
          },
        });
        const noteData = {
          title,
          description: description ?? "",
          blocks,
          userId,
          ...(taskId && { taskId }),
        };
        const newNote = await noteOps.create(noteData);
        writer.write({
          type: "data-create-note",
          id: "tool-call-create-note",
          data: {
            status: "complete",
            message: "Note created successfully",
          },
        });

        return newNote;
      },
    }),
    UpdateNote: new tool({
      name: "UpdateNote",
      description: "Update an existing note",
      inputSchema: z.object({
        id: z.string().describe("The ID of the note to update"),
        title: z.string().optional().describe("The title of the note"),
        description: z
          .string()
          .optional()
          .describe("A short description of the note"),
        content: z.string().optional().describe("The main content of the note"),
        taskId: z.string().optional().describe("Optional task linkage"),
      }),
      execute: async ({ id, title, description, content, taskId }) => {
        writer.write({
          type: "data-update-note",
          id: "tool-call-update-note",
          data: {
            status: "loading",
            message: "Using UpdateNote Tool to Update Note",
          },
        });
        const updates = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (content !== undefined) updates.content = content;
        if (taskId !== undefined) updates.taskId = taskId;

        const updatedNote = await noteOps.update(id, updates);
        writer.write({
          type: "data-update-note",
          id: "tool-call-update-note",
          data: {
            status: "complete",
            message: "Note updated successfully",
          },
        });

        return updatedNote;
      },
    }),
    DeleteNote: new tool({
      name: "DeleteNote",
      description: "Delete a note",
      inputSchema: z.object({
        id: z.string().describe("The ID of the note to delete"),
      }),
      execute: async ({ id }) => {
        writer.write({
          type: "data-delete-note",
          id: "tool-call-delete-note",
          data: {
            status: "loading",
            message: "Using DeleteNote Tool to Delete Note",
          },
        });
        const deletedNote = await noteOps.delete(id);
        writer.write({
          type: "data-delete-note",
          id: "tool-call-delete-note",
          data: {
            status: "complete",
            message: "Note deleted successfully",
          },
        });

        return deletedNote;
      },
    }),
  };
};
