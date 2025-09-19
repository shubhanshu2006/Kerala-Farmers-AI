import { users, crops, weatherData, marketPrices, diseaseDetections, soilTests, farmingTasks, chatMessages, 
         type User, type InsertUser, type Crop, type InsertCrop, type WeatherData, type InsertWeatherData,
         type MarketPrice, type InsertMarketPrice, type DiseaseDetection, type InsertDiseaseDetection,
         type SoilTest, type InsertSoilTest, type FarmingTask, type InsertFarmingTask,
         type ChatMessage, type InsertChatMessage } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Crop operations
  getAllCrops(): Promise<Crop[]>;
  getCropById(id: number): Promise<Crop | undefined>;
  createCrop(crop: InsertCrop): Promise<Crop>;

  // Weather operations
  getLatestWeather(location: string): Promise<WeatherData | undefined>;
  createWeatherData(weather: InsertWeatherData): Promise<WeatherData>;

  // Market price operations
  getLatestMarketPrices(): Promise<MarketPrice[]>;
  getMarketPricesByCrop(cropId: number): Promise<MarketPrice[]>;
  createMarketPrice(price: InsertMarketPrice): Promise<MarketPrice>;

  // Disease detection operations
  getUserDiseaseDetections(userId: string): Promise<DiseaseDetection[]>;
  createDiseaseDetection(detection: InsertDiseaseDetection): Promise<DiseaseDetection>;

  // Soil test operations
  getUserSoilTests(userId: string): Promise<SoilTest[]>;
  getLatestSoilTest(userId: string): Promise<SoilTest | undefined>;
  createSoilTest(test: InsertSoilTest): Promise<SoilTest>;

  // Farming task operations
  getUserTasks(userId: string): Promise<FarmingTask[]>;
  getUpcomingTasks(userId: string): Promise<FarmingTask[]>;
  createFarmingTask(task: InsertFarmingTask): Promise<FarmingTask>;
  updateTaskCompletion(taskId: number, completed: boolean): Promise<FarmingTask | undefined>;

  // Chat operations
  getUserChatHistory(userId: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllCrops(): Promise<Crop[]> {
    return await db.select().from(crops);
  }

  async getCropById(id: number): Promise<Crop | undefined> {
    const [crop] = await db.select().from(crops).where(eq(crops.id, id));
    return crop || undefined;
  }

  async createCrop(insertCrop: InsertCrop): Promise<Crop> {
    const [crop] = await db
      .insert(crops)
      .values(insertCrop)
      .returning();
    return crop;
  }

  async getLatestWeather(location: string): Promise<WeatherData | undefined> {
    const [weather] = await db
      .select()
      .from(weatherData)
      .where(eq(weatherData.location, location))
      .orderBy(desc(weatherData.timestamp))
      .limit(1);
    return weather || undefined;
  }

  async createWeatherData(insertWeather: InsertWeatherData): Promise<WeatherData> {
    const [weather] = await db
      .insert(weatherData)
      .values(insertWeather)
      .returning();
    return weather;
  }

  async getLatestMarketPrices(): Promise<MarketPrice[]> {
    return await db
      .select()
      .from(marketPrices)
      .orderBy(desc(marketPrices.timestamp))
      .limit(20);
  }

  async getMarketPricesByCrop(cropId: number): Promise<MarketPrice[]> {
    return await db
      .select()
      .from(marketPrices)
      .where(eq(marketPrices.cropId, cropId))
      .orderBy(desc(marketPrices.timestamp))
      .limit(10);
  }

  async createMarketPrice(insertPrice: InsertMarketPrice): Promise<MarketPrice> {
    const [price] = await db
      .insert(marketPrices)
      .values(insertPrice)
      .returning();
    return price;
  }

  async getUserDiseaseDetections(userId: string): Promise<DiseaseDetection[]> {
    return await db
      .select()
      .from(diseaseDetections)
      .where(eq(diseaseDetections.userId, userId))
      .orderBy(desc(diseaseDetections.timestamp))
      .limit(10);
  }

  async createDiseaseDetection(insertDetection: InsertDiseaseDetection): Promise<DiseaseDetection> {
    const [detection] = await db
      .insert(diseaseDetections)
      .values(insertDetection)
      .returning();
    return detection;
  }

  async getUserSoilTests(userId: string): Promise<SoilTest[]> {
    return await db
      .select()
      .from(soilTests)
      .where(eq(soilTests.userId, userId))
      .orderBy(desc(soilTests.testDate));
  }

  async getLatestSoilTest(userId: string): Promise<SoilTest | undefined> {
    const [test] = await db
      .select()
      .from(soilTests)
      .where(eq(soilTests.userId, userId))
      .orderBy(desc(soilTests.testDate))
      .limit(1);
    return test || undefined;
  }

  async createSoilTest(insertTest: InsertSoilTest): Promise<SoilTest> {
    const [test] = await db
      .insert(soilTests)
      .values(insertTest)
      .returning();
    return test;
  }

  async getUserTasks(userId: string): Promise<FarmingTask[]> {
    return await db
      .select()
      .from(farmingTasks)
      .where(eq(farmingTasks.userId, userId))
      .orderBy(desc(farmingTasks.dueDate));
  }

  async getUpcomingTasks(userId: string): Promise<FarmingTask[]> {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return await db
      .select()
      .from(farmingTasks)
      .where(
        and(
          eq(farmingTasks.userId, userId),
          eq(farmingTasks.completed, false),
          gte(farmingTasks.dueDate, today),
          lte(farmingTasks.dueDate, nextWeek)
        )
      )
      .orderBy(farmingTasks.dueDate);
  }

  async createFarmingTask(insertTask: InsertFarmingTask): Promise<FarmingTask> {
    const [task] = await db
      .insert(farmingTasks)
      .values(insertTask)
      .returning();
    return task;
  }

  async updateTaskCompletion(taskId: number, completed: boolean): Promise<FarmingTask | undefined> {
    const [task] = await db
      .update(farmingTasks)
      .set({ completed })
      .where(eq(farmingTasks.id, taskId))
      .returning();
    return task || undefined;
  }

  async getUserChatHistory(userId: string, limit: number = 20): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.timestamp))
      .limit(limit);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage)
      .returning();
    return message;
  }
}

export const storage = new DatabaseStorage();
