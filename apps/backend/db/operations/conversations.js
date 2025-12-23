import { db } from "../index.js";
import { conversations } from "../schema.js";
import { eq, and } from "drizzle-orm";

export const conversationOps = {
  async create(conversationData) {
    const [conversation] = await db
      .insert(conversations)
      .values({
        ...conversationData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        count: 0,
      })
      .returning();
    console.log("conversationOps.create result:", conversation);
    return conversation;
  },

  async findById(id, userId) {
    const result = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
    return result[0] || null;
  },

  async findByUserId(userId) {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId));
  },

  async checkExists(id, userId) {
    const result = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)));
    return result[0] || null;
  },

  async update(id, userId, updateData) {
    const [conversation] = await db
      .update(conversations)
      .set({ ...updateData, updatedAt: new Date().toISOString() })
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))
      .returning();
    return conversation;
  },

  async updateSummary(id, userId, summary, count, title) {
    const [conversation] = await db
      .update(conversations)
      .set({
        summary,
        count,
        title,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))
      .returning();
    return conversation;
  },

  async delete(id, userId) {
    const [conversation] = await db
      .delete(conversations)
      .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))
      .returning();
    return conversation;
  },
  async updateTokens(
    id,
    systemPrompt,
    sessionInfo,
    userMemory,
    recentChats,
    currentChat
  ) {
    const [conversation] = await db
      .update(conversations)
      .set({ systemPrompt, sessionInfo, userMemory, recentChats, currentChat })
      .where(eq(conversations.id, id))
      .returning();
    return conversation;
  },
};
