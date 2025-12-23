import { db } from "../index.js";
import { tasks } from "../schema.js";
import { eq, and, desc, isNull } from "drizzle-orm";

export const taskOps = {
  async create(taskData) {
    console.log("taskData", taskData);
    const [task] = await db
      .insert(tasks)
      .values({
        ...taskData,
        createdAt: new Date().toISOString(),
        isCompleted: taskData.isCompleted ?? false,
        priority: taskData.priority || "None",
        status: taskData.status || "notStarted",
        position: taskData.position || 1,
      })
      .returning();
    return task;
  },

  async findById(id, userId) {
    const result = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
    return result[0] || null;
  },

  async findByUserId(userId) {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));
  },

  async findByProjectId(projectId) {
    return await db.select().from(tasks).where(eq(tasks.projectId, projectId));
  },

  async findWithNoVector() {
    return await db.select().from(tasks).where(isNull(tasks.vector));
  },

  async update(id, userId, updates) {
    const [task] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    return task;
  },

  async markComplete(id) {
    const [task] = await db
      .update(tasks)
      .set({ isCompleted: true, updatedAt: new Date().toISOString() })
      .where(eq(tasks.id, id))
      .returning();
    return task;
  },

  async markIncomplete(id) {
    const [task] = await db
      .update(tasks)
      .set({ isCompleted: false, updatedAt: new Date().toISOString() })
      .where(eq(tasks.id, id))
      .returning();
    return task;
  },

  async delete(id, userId) {
    const [task] = await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    return task;
  },
};
