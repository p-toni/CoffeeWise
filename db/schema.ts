import { pgTable, text, serial, timestamp, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const brewingSessions = pgTable("brewing_sessions", {
  id: serial("id").primaryKey(),
  brewingId: text("brewing_id").notNull(),
  bean: text("bean").notNull(),
  method: text("method").notNull(),
  settings: json("settings").$type<{
    coffee: number;
    water_ratio: number;
    grind_size: string;
    water_temp: number;
  }>().notNull(),
  status: text("status").notNull().default("started"),
  recommendation: json("recommendation").$type<{
    status: "Allowed" | "Unallowed";
    message: string;
  }>(),
  steps: json("steps").$type<{
    rinse: string[];
    addCoffee: string[];
    brewing: {
      bloom: string;
      firstPour: string;
      secondPour: string;
    };
    dripping: string;
    finalBrew: string;
  }>(),
  tasting: json("tasting").$type<{
    aroma: number;
    body: number;
    aftertaste: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBrewingSessionSchema = createInsertSchema(brewingSessions);
export const selectBrewingSessionSchema = createSelectSchema(brewingSessions);

export type BrewingSession = typeof brewingSessions.$inferSelect;
export type NewBrewingSession = typeof brewingSessions.$inferInsert;
