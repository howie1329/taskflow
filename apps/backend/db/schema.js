import {
  pgTable,
  uuid,
  timestamp,
  text,
  foreignKey,
  unique,
  varchar,
  boolean,
  json,
  date,
  vector,
  bigint,
  jsonb,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const priority = pgEnum("priority", ["None", "Low", "Medium", "High"]);

export const categories = pgTable("categories", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  name: text(),
  color: text(),
});

export const conversations = pgTable("conversations", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  title: text(),
  userId: text("user_id"),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  summary: text(),
  tags: text().array(),
  intent: text(),
  summaryMessageIndex: integer("summary_message_index").default(0).notNull(),
  systemPrompt: integer("system_prompt").default(0).notNull(),
  sessionInfo: integer("session_info").default(0).notNull(),
  userMemory: integer("user_memory").default(0).notNull(),
  recentChats: integer("recent_chats").default(0).notNull(),
  currentChat: integer("current_chat").default(0).notNull(),
});

export const notes = pgTable(
  "notes",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    content: text(),
    blocks: jsonb(),
    description: text(),
    taskId: uuid("task_id"),
    title: text().notNull(),
    linkedTask: uuid("linked_task").array(),
    userId: text("user_id"),
    vector: vector({ dimensions: 1536 }),
  },
  (table) => [
    foreignKey({
      columns: [table.taskId],
      foreignColumns: [tasks.id],
      name: "notes_task_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const labels = pgTable(
  "labels",
  {
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    userId: uuid("user_id"),
    title: text(),
    color: text(),
    id: uuid().defaultRandom().primaryKey().notNull(),
  },
  (table) => [unique("labels_ids_key").on(table.id)]
);

export const projects = pgTable(
  "projects",
  {
    userId: varchar("user_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    title: text(),
    description: text(),
    deadline: timestamp({ mode: "string" }),
    isComplete: boolean("is_complete").default(false).notNull(),
    tags: json(),
    id: uuid().defaultRandom().primaryKey().notNull(),
  },
  (table) => [unique("projects_ids_key").on(table.id)]
);

export const subtasks = pgTable(
  "subtasks",
  {
    taskId: uuid("task_id"),
    subtaskName: text("subtask_name"),
    isComplete: boolean("is_complete").default(false),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    id: uuid().defaultRandom().primaryKey().notNull(),
    status: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.taskId],
      foreignColumns: [tasks.id],
      name: "subtasks_task_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    title: text(),
    userId: varchar("user_id"),
    description: text(),
    date: date(),
    isCompleted: boolean().default(false).notNull(),
    vector: vector({ dimensions: 1536 }),
    labels: text().array(),
    priority: priority().default("None").notNull(),
    categories: text(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    position: bigint({ mode: "number" })
      .default(sql`'1'`)
      .notNull(),
    status: text().default("notStarted").notNull(),
    projectId: uuid("project_id"),
  },
  (table) => [
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "tasks_project_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const vercel_messages = pgTable(
  "vercel_messages",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    conversationId: uuid("conversation_id"),
    role: text("role").notNull(),
    parts: jsonb("parts").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    userId: text("user_id"),
    metadata: jsonb("metadata"),
    vectors: vector({ dimensions: 1536 }),
    tokens: integer("tokens").default(0).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.conversationId],
      foreignColumns: [conversations.id],
      name: "vercel_messages_conversation_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const notifications = pgTable("notifications", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  title: text(),
  content: text(),
  userId: text("user_id"),
  isRead: boolean().default(false).notNull(),
  data: jsonb(),
});

export const tags = pgTable("tags", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  userId: text("user_id"),
  name: text(),
  color: text(),
  icon: text(),
  description: text(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
});

export const entity_types = pgEnum("entity_type", [
  "task",
  "note",
  "project",
  "subtask",
  "conversation",
]);

export const tag_relations = pgTable("tag_relations", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  tagId: uuid("tag_id"),
  entityId: uuid("entity_id"),
  entityType: entity_types(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
});

export const message_history_summary = pgTable(
  "message_history_summary",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    conversationId: uuid("conversation_id"),
    userId: text("user_id"),
    summary: text(),
    tags: text().array(),
    intent: text(),
    messageCount: integer("message_count").default(0).notNull(),
    messageStartTokens: integer("message_start_tokens").default(0).notNull(),
    messageEndTokens: integer("message_end_tokens").default(0).notNull(),
    messageIndex: integer("message_index").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.conversationId],
      foreignColumns: [conversations.id],
      name: "message_history_summary_conversation_id_fkey",
    }).onDelete("cascade"),
  ]
);
