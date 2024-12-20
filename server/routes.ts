import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { brewingSessions } from "@db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// Define schemas for structured responses
const recommendationSchema = {
  type: SchemaType.OBJECT,
  properties: {
    status: {
      type: SchemaType.STRING,
      enum: ["Allowed", "Unallowed"],
      description: "Whether the brewing configuration is recommended",
    },
    message: {
      type: SchemaType.STRING,
      description: "A concise feedback message under 100 characters",
    },
  },
  required: ["status", "message"],
};

const brewingStepsSchema = {
  type: SchemaType.OBJECT,
  properties: {
    rinse: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Steps for rinsing the filter",
    },
    addCoffee: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Steps for adding coffee",
    },
    brewing: {
      type: SchemaType.OBJECT,
      properties: {
        bloom: { type: SchemaType.STRING },
        firstPour: { type: SchemaType.STRING },
        secondPour: { type: SchemaType.STRING },
      },
      required: ["bloom", "firstPour", "secondPour"],
    },
    dripping: { type: SchemaType.STRING },
    finalBrew: { type: SchemaType.STRING },
  },
  required: ["rinse", "addCoffee", "brewing", "dripping", "finalBrew"],
};

// Create models with specific schemas
const recommendationModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  generationConfig: {
    temperature: 0.7,
    topK: 1,
    topP: 1,
    maxOutputTokens: 200,
    stopSequences: [],
    responseMimeType: "application/json",
    responseSchema: recommendationSchema,
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ],
});

const brewingStepsModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  generationConfig: {
    temperature: 0.7,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
    stopSequences: [],
    responseMimeType: "application/json",
    responseSchema: brewingStepsSchema,
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ],
});

export function registerRoutes(app: Express): Server {
  app.post("/api/brewing/start", async (req, res) => {
    const brewingId = `${nanoid(5)}-${Date.now()}`;
    const session = await db.insert(brewingSessions).values({
      brewingId,
      bean: "/ethiopian/washed/natural/coffee-zen",
      method: "V60",
      settings: {
        coffee: 18,
        water_ratio: 16,
        grind_size: "medium",
        water_temp: 92
      },
      status: "started"
    }).returning();

    res.json(session[0]);
  });

  app.post("/api/brewing/:id/settings", async (req, res) => {
    const { id } = req.params;
    const { bean, method, settings } = req.body;

    const prompt = `Analyze these coffee brewing settings and provide a concise recommendation:
Bean: ${bean}
Method: ${method}
Settings: ${JSON.stringify(settings)}

Respond with a clear recommendation focusing on whether these settings are optimal for the chosen method and bean.`;

    const result = await recommendationModel.generateContent(prompt);
    const response = await result.response;
    const recommendation = JSON.parse(response.text());

    const session = await db.update(brewingSessions)
      .set({ 
        bean, 
        method, 
        settings,
        recommendation,
        status: "settings_updated"
      })
      .where(eq(brewingSessions.brewingId, id))
      .returning();

    res.json(session[0]);
  });

  app.post("/api/brewing/:id/steps", async (req, res) => {
    const { id } = req.params;
    // Get the current session to access settings
    const currentSession = await db.query.brewingSessions.findFirst({
      where: eq(brewingSessions.brewingId, id)
    });

    if (!currentSession) {
      return res.status(404).json({ message: "Session not found" });
    }

    const prompt = `Generate precise brewing steps for these settings:
${JSON.stringify({
  method: currentSession.method,
  settings: currentSession.settings
}, null, 2)}`;

    const result = await brewingStepsModel.generateContent(prompt);
    const response = await result.response;
    const steps = JSON.parse(response.text());

    const session = await db.update(brewingSessions)
      .set({ 
        steps,
        status: "brewing"
      })
      .where(eq(brewingSessions.brewingId, id))
      .returning();

    res.json(session[0]);
  });

  app.post("/api/brewing/:id/tasting", async (req, res) => {
    const { id } = req.params;
    const tasting = req.body;

    const session = await db.update(brewingSessions)
      .set({ 
        tasting,
        status: "completed"
      })
      .where(eq(brewingSessions.brewingId, id))
      .returning();

    res.json(session[0]);
  });

  const httpServer = createServer(app);
  return httpServer;
}
