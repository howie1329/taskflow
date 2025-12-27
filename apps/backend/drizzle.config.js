import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";
dotenv.config();

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.js",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
  introspect: {
    casing: "camel",
    exclude: ["check_constraints", "policies"],
  },
  tablesFilter: ["!*_check_constraints", "!*_policies"],
});
