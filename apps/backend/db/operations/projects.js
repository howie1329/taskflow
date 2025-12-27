import { db } from "../index.js";
import { projects } from "../schema.js";
import { eq } from "drizzle-orm";

export const projectOps = {
  async create(projectData) {
    const [project] = await db
      .insert(projects)
      .values({
        ...projectData,
        createdAt: new Date().toISOString(),
        isComplete: projectData.isComplete ?? false,
      })
      .returning();
    return project;
  },

  async findById(id) {
    const result = await db.select().from(projects).where(eq(projects.id, id));
    return result[0] || null;
  },

  async findByUserId(userId) {
    return await db.select().from(projects).where(eq(projects.userId, userId));
  },

  async update(id, updates) {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  },

  async delete(id) {
    const [project] = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning();
    return project;
  },
};
