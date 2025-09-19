import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean, decimal, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  location: text("location"),
  preferredLanguage: text("preferred_language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const crops = pgTable("crops", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameLocal: jsonb("name_local").notNull(), // {ml: "നെൽ", ta: "நெல்", en: "Rice"}
  category: text("category").notNull(),
  season: text("season").notNull(),
  plantingMonths: jsonb("planting_months").notNull(), // ["6", "7", "11", "12"]
  harvestDays: integer("harvest_days").notNull(),
  description: text("description"),
});

export const weatherData = pgTable("weather_data", {
  id: serial("id").primaryKey(),
  location: text("location").notNull(),
  temperature: decimal("temperature", { precision: 5, scale: 2 }).notNull(),
  humidity: integer("humidity").notNull(),
  windSpeed: decimal("wind_speed", { precision: 5, scale: 2 }).notNull(),
  condition: text("condition").notNull(),
  forecast: jsonb("forecast").notNull(), // 5-day forecast data
  timestamp: timestamp("timestamp").defaultNow(),
});

export const marketPrices = pgTable("market_prices", {
  id: serial("id").primaryKey(),
  cropId: integer("crop_id").references(() => crops.id),
  market: text("market").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull(),
  priceChange: decimal("price_change", { precision: 5, scale: 2 }),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const diseaseDetections = pgTable("disease_detections", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  imagePath: text("image_path").notNull(),
  detectedDisease: text("detected_disease"),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  treatment: text("treatment"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const soilTests = pgTable("soil_tests", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  location: text("location").notNull(),
  ph: decimal("ph", { precision: 3, scale: 1 }).notNull(),
  nitrogen: text("nitrogen").notNull(), // "low", "medium", "high"
  phosphorus: text("phosphorus").notNull(),
  potassium: text("potassium").notNull(),
  organicMatter: decimal("organic_matter", { precision: 5, scale: 2 }),
  recommendations: text("recommendations"),
  testDate: timestamp("test_date").defaultNow(),
});

export const farmingTasks = pgTable("farming_tasks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  cropId: integer("crop_id").references(() => crops.id),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  completed: boolean("completed").default(false),
  priority: text("priority").default("medium"), // "low", "medium", "high"
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  message: text("message").notNull(),
  response: text("response"),
  language: text("language").default("en"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  diseaseDetections: many(diseaseDetections),
  soilTests: many(soilTests),
  farmingTasks: many(farmingTasks),
  chatMessages: many(chatMessages),
}));

export const cropsRelations = relations(crops, ({ many }) => ({
  marketPrices: many(marketPrices),
  farmingTasks: many(farmingTasks),
}));

export const marketPricesRelations = relations(marketPrices, ({ one }) => ({
  crop: one(crops, {
    fields: [marketPrices.cropId],
    references: [crops.id],
  }),
}));

export const diseaseDetectionsRelations = relations(diseaseDetections, ({ one }) => ({
  user: one(users, {
    fields: [diseaseDetections.userId],
    references: [users.id],
  }),
}));

export const soilTestsRelations = relations(soilTests, ({ one }) => ({
  user: one(users, {
    fields: [soilTests.userId],
    references: [users.id],
  }),
}));

export const farmingTasksRelations = relations(farmingTasks, ({ one }) => ({
  user: one(users, {
    fields: [farmingTasks.userId],
    references: [users.id],
  }),
  crop: one(crops, {
    fields: [farmingTasks.cropId],
    references: [crops.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCropSchema = createInsertSchema(crops).omit({
  id: true,
});

export const insertWeatherDataSchema = createInsertSchema(weatherData).omit({
  id: true,
  timestamp: true,
});

export const insertMarketPriceSchema = createInsertSchema(marketPrices).omit({
  id: true,
  timestamp: true,
});

export const insertDiseaseDetectionSchema = createInsertSchema(diseaseDetections).omit({
  id: true,
  timestamp: true,
});

export const insertSoilTestSchema = createInsertSchema(soilTests).omit({
  id: true,
  testDate: true,
});

export const insertFarmingTaskSchema = createInsertSchema(farmingTasks).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Crop = typeof crops.$inferSelect;
export type InsertCrop = z.infer<typeof insertCropSchema>;
export type WeatherData = typeof weatherData.$inferSelect;
export type InsertWeatherData = z.infer<typeof insertWeatherDataSchema>;
export type MarketPrice = typeof marketPrices.$inferSelect;
export type InsertMarketPrice = z.infer<typeof insertMarketPriceSchema>;
export type DiseaseDetection = typeof diseaseDetections.$inferSelect;
export type InsertDiseaseDetection = z.infer<typeof insertDiseaseDetectionSchema>;
export type SoilTest = typeof soilTests.$inferSelect;
export type InsertSoilTest = z.infer<typeof insertSoilTestSchema>;
export type FarmingTask = typeof farmingTasks.$inferSelect;
export type InsertFarmingTask = z.infer<typeof insertFarmingTaskSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
