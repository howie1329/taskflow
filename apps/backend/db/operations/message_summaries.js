import { message_history_summary } from "../schema.js";
import { db } from "../index.js";
import { eq, and, asc } from "drizzle-orm";

export const messageHistorySummaryOps = {
  async create(conversationId, userId, summaryObject) {
    const messageHistorySummaryData = {
      conversationId,
      userId,
      summary: summaryObject.summary,
      tags: summaryObject.tags,
      intent: summaryObject.intent,
      messageCount: summaryObject.messageCount,
      messageStartTokens: summaryObject.messageStartTokens,
      messageEndTokens: summaryObject.messageEndTokens,
      messageIndex: summaryObject.messageIndex,
      createdAt: new Date().toISOString(),
    };
    const [messageHistorySummary] = await db
      .insert(message_history_summary)
      .values(messageHistorySummaryData)
      .returning();
    return messageHistorySummary;
  },

  async findByConversationId(conversationId, userId) {
    return await db
      .select()
      .from(message_history_summary)
      .where(
        and(
          eq(message_history_summary.conversationId, conversationId),
          eq(message_history_summary.userId, userId)
        )
      )
      .orderBy(asc(message_history_summary.messageIndex));
  },
};
