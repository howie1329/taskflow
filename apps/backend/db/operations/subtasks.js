import { db } from "../index.js";
import { subtasks } from "../schema.js";
import { eq, desc } from "drizzle-orm";

export const subtaskOps = {
  async create(subtaskData) {
    console.log("subtaskOps.create received:", subtaskData);
    const insertData = {
      taskId: subtaskData.taskId,
      subtaskName: subtaskData.subtaskName,
      isComplete: subtaskData.isComplete ?? false,
    };
    console.log("subtaskOps.create inserting:", insertData);
    const [subtask] = await db.insert(subtasks).values(insertData).returning();
    console.log("subtaskOps.create result:", subtask);
    return subtask;
  },

  async createMultiple(subtasksData) {
    return await db
      .insert(subtasks)
      .values(
        subtasksData.map((st) => ({
          ...st,
          createdAt: new Date().toISOString(),
          isComplete: st.isComplete ?? false,
        }))
      )
      .returning();
  },

  async findByTaskId(taskId) {
    return await db
      .select()
      .from(subtasks)
      .where(eq(subtasks.taskId, taskId))
      .orderBy(desc(subtasks.createdAt));
  },

  async update(id, updates) {
    const [subtask] = await db
      .update(subtasks)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(subtasks.id, id))
      .returning();
    return subtask;
  },

  async markComplete(id) {
    const [subtask] = await db
      .update(subtasks)
      .set({ isComplete: true, updatedAt: new Date().toISOString() })
      .where(eq(subtasks.id, id))
      .returning();
    return subtask;
  },

  async markIncomplete(id) {
    const [subtask] = await db
      .update(subtasks)
      .set({ isComplete: false, updatedAt: new Date().toISOString() })
      .where(eq(subtasks.id, id))
      .returning();
    return subtask;
  },

  async delete(id) {
    const [subtask] = await db
      .delete(subtasks)
      .where(eq(subtasks.id, id))
      .returning();
    return subtask;
  },
};
