import { db } from "../index.js";
import { notes } from "../schema.js";
import { eq, and, desc } from "drizzle-orm";

export const noteOps = {
  async create(noteData) {
    const [note] = await db
      .insert(notes)
      .values({
        ...noteData,
        createdAt: new Date().toISOString(),
      })
      .returning();
    return note;
  },

  async findById(id) {
    const result = await db.select().from(notes).where(eq(notes.id, id));
    return result[0] || null;
  },

  async findByUserId(userId) {
    return await db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(desc(notes.createdAt));
  },

  async findByTaskId(taskId) {
    return await db.select().from(notes).where(eq(notes.taskId, taskId));
  },

  async update(id, updates) {
    const [note] = await db
      .update(notes)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(notes.id, id))
      .returning();
    return note;
  },

  async delete(id) {
    const [note] = await db.delete(notes).where(eq(notes.id, id)).returning();
    return note;
  },
};
