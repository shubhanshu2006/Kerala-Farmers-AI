import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { 
  generateCropRecommendations, 
  analyzePlantDisease, 
  generateChatResponse,
  generateSoilRecommendations 
} from "./services/openai";
import { fetchWeatherData, getWeatherAlerts } from "./services/weather";
import { fetchMarketPrices, updateMarketPrices } from "./services/market";
import { 
  insertUserSchema, 
  insertDiseaseDetectionSchema, 
  insertSoilTestSchema,
  insertFarmingTaskSchema,
  insertChatMessageSchema 
} from "@shared/schema";

// Configure multer for image uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Weather routes
  app.get("/api/weather/:location", async (req, res) => {
    try {
      const { location } = req.params;
      const weatherData = await fetchWeatherData(location);
      
      // Store weather data in database
      await storage.createWeatherData({
        location: weatherData.location,
        temperature: weatherData.current.temperature.toString(),
        humidity: weatherData.current.humidity,
        windSpeed: weatherData.current.windSpeed.toString(),
        condition: weatherData.current.condition,
        forecast: weatherData.forecast
      });
      
      res.json(weatherData);
    } catch (error) {
      console.error("Weather API error:", error);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  app.get("/api/weather/alerts/:location", async (req, res) => {
    try {
      const { location } = req.params;
      const alerts = await getWeatherAlerts(location);
      res.json({ alerts });
    } catch (error) {
      console.error("Weather alerts error:", error);
      res.status(500).json({ error: "Failed to fetch weather alerts" });
    }
  });

  // Crop routes
  app.get("/api/crops", async (req, res) => {
    try {
      const crops = await storage.getAllCrops();
      res.json(crops);
    } catch (error) {
      console.error("Crops fetch error:", error);
      res.status(500).json({ error: "Failed to fetch crops" });
    }
  });

  app.post("/api/crops/:cropId/recommendations", async (req, res) => {
    try {
      const { cropId } = req.params;
      const { location, language = "en" } = req.body;
      
      const crop = await storage.getCropById(parseInt(cropId));
      if (!crop) {
        return res.status(404).json({ error: "Crop not found" });
      }
      
      // Get weather and soil data
      const weatherData = await storage.getLatestWeather(location);
      const soilData = req.body.userId ? 
        await storage.getLatestSoilTest(req.body.userId) : null;
      
      const recommendations = await generateCropRecommendations(
        crop.name,
        location,
        weatherData,
        soilData,
        language
      );
      
      res.json(recommendations);
    } catch (error) {
      console.error("Crop recommendations error:", error);
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  // Market routes
  app.get("/api/market/prices", async (req, res) => {
    try {
      const marketData = await fetchMarketPrices();
      res.json(marketData);
    } catch (error) {
      console.error("Market prices error:", error);
      res.status(500).json({ error: "Failed to fetch market prices" });
    }
  });

  app.post("/api/market/update", async (req, res) => {
    try {
      await updateMarketPrices();
      res.json({ message: "Market prices updated successfully" });
    } catch (error) {
      console.error("Market update error:", error);
      res.status(500).json({ error: "Failed to update market prices" });
    }
  });

  // Disease detection routes
  app.post("/api/disease/analyze", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
      }

      // Convert image to base64
      const imagePath = req.file.path;
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString("base64");

      // Analyze with OpenAI
      const analysis = await analyzePlantDisease(base64Image);

      // Save to database
      if (req.body.userId) {
        await storage.createDiseaseDetection({
          userId: req.body.userId,
          imagePath: imagePath,
          detectedDisease: analysis.disease,
          confidence: analysis.confidence.toString(),
          treatment: analysis.treatment.join("; ")
        });
      }

      // Clean up uploaded file
      fs.unlinkSync(imagePath);

      res.json(analysis);
    } catch (error) {
      console.error("Disease analysis error:", error);
      res.status(500).json({ error: "Failed to analyze image" });
    }
  });

  app.get("/api/disease/history/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const detections = await storage.getUserDiseaseDetections(userId);
      res.json(detections);
    } catch (error) {
      console.error("Disease history error:", error);
      res.status(500).json({ error: "Failed to fetch disease history" });
    }
  });

  // Soil health routes
  app.post("/api/soil/test", async (req, res) => {
    try {
      const testData = insertSoilTestSchema.parse(req.body);
      const soilTest = await storage.createSoilTest(testData);
      
      // Generate AI recommendations
      const recommendations = await generateSoilRecommendations(soilTest);
      
      res.json({ 
        soilTest, 
        recommendations 
      });
    } catch (error) {
      console.error("Soil test error:", error);
      res.status(500).json({ error: "Failed to create soil test" });
    }
  });

  app.get("/api/soil/tests/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const tests = await storage.getUserSoilTests(userId);
      res.json(tests);
    } catch (error) {
      console.error("Soil tests fetch error:", error);
      res.status(500).json({ error: "Failed to fetch soil tests" });
    }
  });

  app.get("/api/soil/latest/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const latestTest = await storage.getLatestSoilTest(userId);
      if (!latestTest) {
        return res.status(404).json({ error: "No soil test found" });
      }
      res.json(latestTest);
    } catch (error) {
      console.error("Latest soil test error:", error);
      res.status(500).json({ error: "Failed to fetch latest soil test" });
    }
  });

  // Farming tasks routes
  app.get("/api/tasks/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const tasks = await storage.getUserTasks(userId);
      res.json(tasks);
    } catch (error) {
      console.error("Tasks fetch error:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/:userId/upcoming", async (req, res) => {
    try {
      const { userId } = req.params;
      const tasks = await storage.getUpcomingTasks(userId);
      res.json(tasks);
    } catch (error) {
      console.error("Upcoming tasks error:", error);
      res.status(500).json({ error: "Failed to fetch upcoming tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertFarmingTaskSchema.parse(req.body);
      const task = await storage.createFarmingTask(taskData);
      res.json(task);
    } catch (error) {
      console.error("Create task error:", error);
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:taskId/complete", async (req, res) => {
    try {
      const { taskId } = req.params;
      const { completed } = req.body;
      const task = await storage.updateTaskCompletion(parseInt(taskId), completed);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Update task error:", error);
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  // Chat routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { userId, message, language = "en" } = req.body;
      
      // Get user context (recent tasks, soil data, weather, etc.)
      const context = {
        recentTasks: userId ? await storage.getUpcomingTasks(userId) : [],
        soilData: userId ? await storage.getLatestSoilTest(userId) : null,
        location: req.body.location || "Kochi"
      };
      
      // Generate AI response
      const chatResponse = await generateChatResponse(message, context, language);
      
      // Save chat message
      if (userId) {
        await storage.createChatMessage({
          userId,
          message,
          response: chatResponse.response,
          language
        });
      }
      
      res.json(chatResponse);
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  app.get("/api/chat/history/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const history = await storage.getUserChatHistory(userId, limit);
      res.json(history);
    } catch (error) {
      console.error("Chat history error:", error);
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
