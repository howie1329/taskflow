import { tool } from "ai";
import { z } from "zod";
import { taskOps } from "../../db/operations/tasks.js";
import { subtaskOps } from "../../db/operations/subtasks.js";
import { noteOps } from "../../db/operations/notes.js";
import { NodeSchema } from "./Notes/NotesBlockSchema.js";
import Exa from "exa-js";
import { ArtifactWriter } from "./ArtifactHelpers.js";

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
        const artifact = new ArtifactWriter(writer, "WebSearch");
        const input = { query };

        try {
          artifact.loading(input, `Searching the web for: "${query}"`);

          const result = await exa.search(query, {
            contents: {
              text: { maxCharacters: 2500 },
              summary: { query: "What is the main idea of the sources?" },
              livecrawl: "preferred",
              livecrawlTimeout: 12500,
              context: { maxCharacters: 5000 },
              highlights: {
                highlightsPerUrl: 2,
                numSentences: 1,
                query: "What is the main idea of the sources?",
              },
            },
            numResults: 2,
            type: "auto",
          });

          artifact.complete(
            input,
            {
              resultsCount: result.results.length,
              sources: result.results.map((r) => ({
                id: r.id,
                url: r.url,
                title: r.title,
                summary: r.summary || null,
                text: r.text || null,
                highlights:
                  r.highlights?.map((h) => ({
                    text: h.text,
                    score: h.score,
                  })) || [],
                publishedDate: r.publishedDate || null,
                author: r.author || null,
              })),
              cost: {
                total: result.costDollars?.total || 0,
                search: result.costDollars?.search || 0,
                contents: result.costDollars?.contents || 0,
              },
            },
            `Found ${result.results.length} source${result.results.length !== 1 ? "s" : ""}`
          );

          return result.context;
        } catch (error) {
          artifact.error(input, error, "Web search failed");
          throw error;
        }
      },
    }),
    GetTasks: new tool({
      name: "GetTasks",
      description: "Get all tasks for the user",
      inputSchema: z.object({
        userId: z.string().describe("The user ID to fetch the tasks for"),
      }),
      execute: async ({ userId }) => {
        const artifact = new ArtifactWriter(writer, "GetTasks");
        const input = { userId };

        try {
          artifact.loading(input, "Fetching tasks...");

          const tasks = await taskOps.findByUserId(userId);

          const formattedTasks = tasks.map((task) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            date: task.date,
            isCompleted: task.isCompleted,
            priority: task.priority,
            status: task.status,
            labels: task.labels || [],
          }));

          artifact.complete(
            input,
            {
              tasksCount: tasks.length,
              tasks: formattedTasks,
              summary: {
                completed: tasks.filter((t) => t.isCompleted).length,
                byPriority: {
                  high: tasks.filter((t) => t.priority === "High").length,
                  medium: tasks.filter((t) => t.priority === "Medium").length,
                  low: tasks.filter((t) => t.priority === "Low").length,
                },
              },
            },
            `Found ${tasks.length} task${tasks.length !== 1 ? "s" : ""}`
          );

          return formattedTasks;
        } catch (error) {
          artifact.error(input, error, "Failed to fetch tasks");
          throw error;
        }
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
        const artifact = new ArtifactWriter(writer, "CreateTask");
        const input = {
          title,
          description,
          date,
          priority,
          labels,
          userId,
          projectId,
        };

        try {
          artifact.loading(input, `Creating task: "${title}"`);

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

          artifact.complete(
            input,
            {
              task: {
                id: newTask.id,
                title: newTask.title,
                description: newTask.description,
                date: newTask.date,
                priority: newTask.priority,
                labels: newTask.labels || [],
                isCompleted: newTask.isCompleted,
                status: newTask.status,
                projectId: newTask.projectId || null,
                createdAt: newTask.createdAt,
              },
            },
            "Task created successfully"
          );

          return newTask;
        } catch (error) {
          artifact.error(input, error, "Failed to create task");
          throw error;
        }
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
        const artifact = new ArtifactWriter(writer, "UpdateTask");
        const input = {
          id,
          userId,
          title,
          description,
          date,
          priority,
          labels,
          status,
          isCompleted,
        };

        try {
          artifact.loading(input, `Updating task...`);

          const updates = {};
          if (title !== undefined) updates.title = title;
          if (description !== undefined) updates.description = description;
          if (date !== undefined) updates.date = date;
          if (priority !== undefined) updates.priority = priority;
          if (labels !== undefined) updates.labels = labels;
          if (status !== undefined) updates.status = status;
          if (isCompleted !== undefined) updates.isCompleted = isCompleted;

          const updatedTask = await taskOps.update(id, userId, updates);

          artifact.complete(
            input,
            {
              task: {
                id: updatedTask.id,
                title: updatedTask.title,
                description: updatedTask.description,
                date: updatedTask.date,
                priority: updatedTask.priority,
                labels: updatedTask.labels || [],
                isCompleted: updatedTask.isCompleted,
                status: updatedTask.status,
                updatedAt: updatedTask.updatedAt,
              },
            },
            "Task updated successfully"
          );

          return updatedTask;
        } catch (error) {
          artifact.error(input, error, "Failed to update task");
          throw error;
        }
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
        const artifact = new ArtifactWriter(writer, "DeleteTask");
        const input = { id, userId };

        try {
          artifact.loading(input, "Deleting task...");

          const deletedTask = await taskOps.delete(id, userId);

          artifact.complete(
            input,
            {
              task: {
                id: deletedTask.id,
                title: deletedTask.title,
              },
            },
            "Task deleted successfully"
          );

          return deletedTask;
        } catch (error) {
          artifact.error(input, error, "Failed to delete task");
          throw error;
        }
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
        const artifact = new ArtifactWriter(writer, "GetTaskById");
        const input = { id, userId };

        try {
          artifact.loading(input, "Fetching task...");

          const task = await taskOps.findById(id, userId);

          artifact.complete(
            input,
            {
              task: {
                id: task.id,
                title: task.title,
                description: task.description,
                date: task.date,
                priority: task.priority,
                labels: task.labels || [],
                isCompleted: task.isCompleted,
                status: task.status,
                projectId: task.projectId || null,
              },
            },
            "Task fetched successfully"
          );

          return task;
        } catch (error) {
          artifact.error(input, error, "Failed to fetch task");
          throw error;
        }
      },
    }),
    GetSubtasks: new tool({
      name: "GetSubtasks",
      description: "Get all subtasks for a specific task",
      inputSchema: z.object({
        taskId: z.string().describe("The task ID to get subtasks for"),
      }),
      execute: async ({ taskId }) => {
        const artifact = new ArtifactWriter(writer, "GetSubtasks");
        const input = { taskId };

        try {
          artifact.loading(input, "Fetching subtasks...");

          const subtasks = await subtaskOps.findByTaskId(taskId);

          artifact.complete(
            input,
            {
              subtasksCount: subtasks.length,
              subtasks: subtasks.map((st) => ({
                id: st.id,
                taskId: st.taskId,
                subtaskName: st.subtaskName,
                isComplete: st.isComplete,
              })),
            },
            `Found ${subtasks.length} subtask${subtasks.length !== 1 ? "s" : ""}`
          );

          return subtasks;
        } catch (error) {
          artifact.error(input, error, "Failed to fetch subtasks");
          throw error;
        }
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
        const artifact = new ArtifactWriter(writer, "CreateSubtask");
        const input = { taskId, subtaskName, isComplete };

        try {
          artifact.loading(input, `Creating subtask: "${subtaskName}"`);

          const subtaskData = { taskId, subtaskName, isComplete };
          const newSubtask = await subtaskOps.create(subtaskData);

          artifact.complete(
            input,
            {
              subtask: {
                id: newSubtask.id,
                taskId: newSubtask.taskId,
                subtaskName: newSubtask.subtaskName,
                isComplete: newSubtask.isComplete,
              },
            },
            "Subtask created successfully"
          );

          return newSubtask;
        } catch (error) {
          artifact.error(input, error, "Failed to create subtask");
          throw error;
        }
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
        const artifact = new ArtifactWriter(writer, "UpdateSubtask");
        const input = { id, subtaskName, isComplete };

        try {
          artifact.loading(input, "Updating subtask...");

          const updates = {};
          if (subtaskName !== undefined) updates.subtaskName = subtaskName;
          if (isComplete !== undefined) updates.isComplete = isComplete;

          const updatedSubtask = await subtaskOps.update(id, updates);

          artifact.complete(
            input,
            {
              subtask: {
                id: updatedSubtask.id,
                subtaskName: updatedSubtask.subtaskName,
                isComplete: updatedSubtask.isComplete,
              },
            },
            "Subtask updated successfully"
          );

          return updatedSubtask;
        } catch (error) {
          artifact.error(input, error, "Failed to update subtask");
          throw error;
        }
      },
    }),
    DeleteSubtask: new tool({
      name: "DeleteSubtask",
      description: "Delete a subtask",
      inputSchema: z.object({
        id: z.string().describe("The subtask ID to delete"),
      }),
      execute: async ({ id }) => {
        const artifact = new ArtifactWriter(writer, "DeleteSubtask");
        const input = { id };

        try {
          artifact.loading(input, "Deleting subtask...");

          const deletedSubtask = await subtaskOps.delete(id);

          artifact.complete(
            input,
            {
              subtask: {
                id: deletedSubtask.id,
                subtaskName: deletedSubtask.subtaskName,
              },
            },
            "Subtask deleted successfully"
          );

          return deletedSubtask;
        } catch (error) {
          artifact.error(input, error, "Failed to delete subtask");
          throw error;
        }
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
        const artifact = new ArtifactWriter(writer, "BulkCreateSubtasks");
        const input = { taskId, subtaskNames };

        try {
          artifact.loading(
            input,
            `Creating ${subtaskNames.length} subtasks...`
          );

          const subtasksData = subtaskNames.map((name) => ({
            taskId,
            subtaskName: name,
            isComplete: false,
          }));

          const newSubtasks = await subtaskOps.createMultiple(subtasksData);

          artifact.complete(
            input,
            {
              subtasksCount: newSubtasks.length,
              subtasks: newSubtasks.map((st) => ({
                id: st.id,
                taskId: st.taskId,
                subtaskName: st.subtaskName,
                isComplete: st.isComplete,
              })),
            },
            `${newSubtasks.length} subtasks created successfully`
          );

          return newSubtasks;
        } catch (error) {
          artifact.error(input, error, "Failed to create subtasks");
          throw error;
        }
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
        const artifact = new ArtifactWriter(writer, "MarkSubtaskComplete");
        const input = { id, isComplete };

        try {
          artifact.loading(
            input,
            `Marking subtask as ${isComplete ? "complete" : "incomplete"}...`
          );

          const updatedSubtask = isComplete
            ? await subtaskOps.markComplete(id)
            : await subtaskOps.markIncomplete(id);

          artifact.complete(
            input,
            {
              subtask: {
                id: updatedSubtask.id,
                subtaskName: updatedSubtask.subtaskName,
                isComplete: updatedSubtask.isComplete,
              },
            },
            `Subtask marked as ${isComplete ? "complete" : "incomplete"}`
          );

          return updatedSubtask;
        } catch (error) {
          artifact.error(input, error, "Failed to mark subtask");
          throw error;
        }
      },
    }),
    GetNotes: new tool({
      name: "GetNotes",
      description: "Get all notes for the user",
      inputSchema: z.object({
        userId: z.string().describe("The user ID to fetch notes for"),
      }),
      execute: async ({ userId }) => {
        const artifact = new ArtifactWriter(writer, "GetNotes");
        const input = { userId };

        try {
          artifact.loading(input, "Fetching notes...");

          const notes = await noteOps.findByUserId(userId);

          artifact.complete(
            input,
            {
              notesCount: notes.length,
              notes: notes.map((note) => ({
                id: note.id,
                title: note.title,
                description: note.description || null,
                blocks: note.blocks || [],
                taskId: note.taskId || null,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt,
              })),
            },
            `Found ${notes.length} note${notes.length !== 1 ? "s" : ""}`
          );

          return notes;
        } catch (error) {
          artifact.error(input, error, "Failed to fetch notes");
          throw error;
        }
      },
    }),
    GetNotesByTaskId: new tool({
      name: "GetNotesByTaskId",
      description: "Get all notes for a specific task",
      inputSchema: z.object({
        taskId: z.string().describe("The task ID to get notes for"),
      }),
      execute: async ({ taskId }) => {
        const artifact = new ArtifactWriter(writer, "GetNotesByTaskId");
        const input = { taskId };

        try {
          artifact.loading(input, "Fetching notes for task...");

          const notes = await noteOps.findByTaskId(taskId);

          artifact.complete(
            input,
            {
              notesCount: notes.length,
              notes: notes.map((note) => ({
                id: note.id,
                title: note.title,
                description: note.description || null,
                blocks: note.blocks || [],
                taskId: note.taskId,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt,
              })),
            },
            `Found ${notes.length} note${notes.length !== 1 ? "s" : ""} for task`
          );

          return notes;
        } catch (error) {
          artifact.error(input, error, "Failed to fetch notes");
          throw error;
        }
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
        const artifact = new ArtifactWriter(writer, "CreateNote");
        const input = { title, description, blocks, taskId, userId };

        try {
          artifact.loading(input, `Creating note: "${title}"`);

          const noteData = {
            title,
            description: description ?? "",
            blocks,
            userId,
            ...(taskId && { taskId }),
          };
          const newNote = await noteOps.create(noteData);

          artifact.complete(
            input,
            {
              note: {
                id: newNote.id,
                title: newNote.title,
                description: newNote.description,
                blocks: newNote.blocks,
                taskId: newNote.taskId || null,
                createdAt: newNote.createdAt,
              },
            },
            "Note created successfully"
          );

          return newNote;
        } catch (error) {
          artifact.error(input, error, "Failed to create note");
          throw error;
        }
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
        const artifact = new ArtifactWriter(writer, "UpdateNote");
        const input = { id, title, description, content, taskId };

        try {
          artifact.loading(input, "Updating note...");

          const updates = {};
          if (title !== undefined) updates.title = title;
          if (description !== undefined) updates.description = description;
          if (content !== undefined) updates.content = content;
          if (taskId !== undefined) updates.taskId = taskId;

          const updatedNote = await noteOps.update(id, updates);

          artifact.complete(
            input,
            {
              note: {
                id: updatedNote.id,
                title: updatedNote.title,
                description: updatedNote.description,
                taskId: updatedNote.taskId || null,
                updatedAt: updatedNote.updatedAt,
              },
            },
            "Note updated successfully"
          );

          return updatedNote;
        } catch (error) {
          artifact.error(input, error, "Failed to update note");
          throw error;
        }
      },
    }),
    DeleteNote: new tool({
      name: "DeleteNote",
      description: "Delete a note",
      inputSchema: z.object({
        id: z.string().describe("The ID of the note to delete"),
      }),
      execute: async ({ id }) => {
        const artifact = new ArtifactWriter(writer, "DeleteNote");
        const input = { id };

        try {
          artifact.loading(input, "Deleting note...");

          const deletedNote = await noteOps.delete(id);

          artifact.complete(
            input,
            {
              note: {
                id: deletedNote.id,
                title: deletedNote.title,
              },
            },
            "Note deleted successfully"
          );

          return deletedNote;
        } catch (error) {
          artifact.error(input, error, "Failed to delete note");
          throw error;
        }
      },
    }),
  };
};
