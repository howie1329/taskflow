import { db } from "../index.js";
import { notifications } from "../schema.js";
import { eq, desc } from "drizzle-orm";

export const notificationOps = {
  async create(notificationData) {
    const [notification] = await db
      .insert(notifications)
      .values({
        ...notificationData,
        createdAt: new Date().toISOString(),
        isRead: notificationData.isRead ?? false,
      })
      .returning();
    return notification;
  },

  async findByUserId(userId) {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  },

  async markAsRead(id) {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  },

  async delete(id) {
    const [notification] = await db
      .delete(notifications)
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  },

  async deleteIfRead() {
    const deletedNotifications = await db
      .delete(notifications)
      .where(eq(notifications.isRead, true))
      .returning();
    return deletedNotifications;
  },
};
