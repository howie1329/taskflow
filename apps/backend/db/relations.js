import { relations } from "drizzle-orm/relations";
import { tasks, notes, subtasks, projects, conversations, messages } from "./schema";

export const notesRelations = relations(notes, ({one}) => ({
	task: one(tasks, {
		fields: [notes.taskId],
		references: [tasks.id]
	}),
}));

export const tasksRelations = relations(tasks, ({one, many}) => ({
	notes: many(notes),
	subtasks: many(subtasks),
	project: one(projects, {
		fields: [tasks.projectId],
		references: [projects.id]
	}),
}));

export const subtasksRelations = relations(subtasks, ({one}) => ({
	task: one(tasks, {
		fields: [subtasks.taskId],
		references: [tasks.id]
	}),
}));

export const projectsRelations = relations(projects, ({many}) => ({
	tasks: many(tasks),
}));

export const messagesRelations = relations(messages, ({one}) => ({
	conversation: one(conversations, {
		fields: [messages.conversationId],
		references: [conversations.id]
	}),
}));

export const conversationsRelations = relations(conversations, ({many}) => ({
	messages: many(messages),
}));