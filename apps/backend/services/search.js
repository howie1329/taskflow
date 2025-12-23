import { embeddingService } from "./ai.js";
import { db } from "../db/index.js";
import { sql } from "drizzle-orm";

export const searchService = {
  async smartSearch(searchQuery, userId) {
    const searchEmbedding = await embeddingService.createEmbedding(searchQuery);
    const formattedSearchEmbedding = `[${searchEmbedding.join(",")}]`;

    const tasks = await db.execute(
      sql`SELECT id, title, description
      FROM tasks
      WHERE user_id = ${userId} AND vector IS NOT NULL
      ORDER BY vector <=> ${formattedSearchEmbedding}::vector
      LIMIT 10`
    );

    const messages = await db.execute(
      sql`SELECT id, parts
      FROM vercel_messages
      WHERE user_id = ${userId} AND vectors IS NOT NULL
      ORDER BY vectors <=> ${formattedSearchEmbedding}::vector
      LIMIT 2`
    );

    const notes = await db.execute(
      sql`SELECT id, title, description
      FROM notes
      WHERE user_id = ${userId} AND vector IS NOT NULL
      ORDER BY vector <=> ${formattedSearchEmbedding}::vector
      LIMIT 5`
    );

    return { tasks, messages, notes };
  },
};
