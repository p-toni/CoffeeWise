import { pgTable, text, serial, timestamp, integer, json, foreignKey } from "drizzle-orm/pg-core";
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
    acidity: number;
    sweetness: number;
    balance: number;
    overall: number;
    notes: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// New table for user preferences
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  preferredFlavors: json("preferred_flavors").$type<string[]>().notNull(),
  equipment: json("equipment").$type<string[]>().notNull(),
  skillLevel: text("skill_level").notNull(),
  tastePreference: json("taste_preference").$type<{
    acidity: number;
    sweetness: number;
    body: number;
    bitterness: number;
  }>().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// New table for recipe recommendations
export const recipeRecommendations = pgTable("recipe_recommendations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  bean: text("bean").notNull(),
  method: text("method").notNull(),
  settings: json("settings").$type<{
    coffee: number;
    water_ratio: number;
    grind_size: string;
    water_temp: number;
  }>().notNull(),
  reasoning: text("reasoning").notNull(),
  contextualFactors: json("contextual_factors").$type<{
    humidity?: number;
    ambientTemp?: number;
    waterQuality?: string;
    beanAge?: number;
  }>(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create schemas for the new tables
export const insertUserPreferencesSchema = createInsertSchema(userPreferences);
export const selectUserPreferencesSchema = createSelectSchema(userPreferences);

export const insertRecipeRecommendationsSchema = createInsertSchema(recipeRecommendations);
export const selectRecipeRecommendationsSchema = createSelectSchema(recipeRecommendations);

// Export types for the new tables
export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;

export type RecipeRecommendation = typeof recipeRecommendations.$inferSelect;
export type NewRecipeRecommendation = typeof recipeRecommendations.$inferInsert;

// Re-export existing types
export type BrewingSession = typeof brewingSessions.$inferSelect;
export type NewBrewingSession = typeof brewingSessions.$inferInsert;