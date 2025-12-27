import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

export default db;
