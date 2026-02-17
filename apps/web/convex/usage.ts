import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const getUtcDayKey = (timestamp: number) =>
  new Date(timestamp).toISOString().slice(0, 10);

export const getMyChatUsage = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const now = Date.now();
    const day = getUtcDayKey(now);

    const totals = await ctx.db
      .query("chatUsageTotals")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const daily = await ctx.db
      .query("chatUsageDaily")
      .withIndex("by_userId_day", (q) => q.eq("userId", userId).eq("day", day))
      .first();

    return {
      day,
      messagesSentToday: daily?.messagesSent ?? 0,
      messagesSentTotal: totals?.messagesSent ?? 0,
    };
  },
});
