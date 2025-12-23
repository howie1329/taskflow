import { db } from "../index.js";
import { vercel_messages } from "../schema.js";
import { eq, and } from "drizzle-orm";

export const messageOps = {
  async create(messageData) {
    const [message] = await db
      .insert(vercel_messages)
      .values({
        ...messageData,
        createdAt: new Date(),
      })
      .returning();
    return message;
  },

  async findByConversationId(conversationId, userId) {
    return await db
      .select()
      .from(vercel_messages)
      .where(
        and(
          eq(vercel_messages.conversationId, conversationId),
          eq(vercel_messages.userId, userId)
        )
      )
      .orderBy(vercel_messages.createdAt);
  },

  async updateEmbedding(id, conversationId, userId, vectors) {
    const [message] = await db
      .update(vercel_messages)
      .set({ vectors })
      .where(
        and(
          eq(vercel_messages.id, id),
          eq(vercel_messages.conversationId, conversationId),
          eq(vercel_messages.userId, userId)
        )
      )
      .returning();
    return message;
  },

  async delete(id) {
    const [message] = await db
      .delete(vercel_messages)
      .where(eq(vercel_messages.id, id))
      .returning();
    return message;
  },

  async updateTokens(id, tokens) {
    const [message] = await db
      .update(vercel_messages)
      .set({ tokens })
      .where(eq(vercel_messages.id, id))
      .returning();
    return message;
  },
};
