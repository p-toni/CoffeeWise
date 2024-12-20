
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

try {
  export const db = drizzle({
    connection: process.env.DATABASE_URL,
    schema,
    ws: ws,
  });
} catch (error) {
  console.error("Database connection error:", error);
  // Provide a mock db for development if needed
  export const db = {
    insert: () => ({ values: () => ({ returning: () => [] }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
    query: { brewingSessions: { findFirst: () => null } }
  };
}
