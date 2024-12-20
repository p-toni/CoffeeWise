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

    const prompt = `Analyze these coffee brewing settings and provide a concise recommendation.
Context:
- Bean Path: ${bean}
- Brewing Method: ${method}
- Coffee Amount: ${settings.coffee}g
- Water Ratio: 1:${settings.water_ratio}
- Water Temperature: ${settings.water_temp}°C
- Grind Size: ${settings.grind_size}

Bean Profile: ${
  bean.includes('ethiopian') ? 'Ethiopian (bright, floral)' :
  bean.includes('colombian') ? 'Colombian (medium body, sweet)' :
  bean.includes('brazilian') ? 'Brazilian (nutty, low acid)' : 'Unknown'
}
Method Requirements: ${
  method === 'V60' ? 'V60 (medium-fine grind, precise pour)' :
  method === 'French Press' ? 'French Press (coarse grind, immersion)' :
  method === 'Espresso' ? 'Espresso (fine grind, high pressure)' : 'Unknown'
}

Analyze the compatibility of these parameters and respond with a clear recommendation about whether these settings are optimal for the chosen method and bean. Consider extraction, temperature impact, and grind size appropriateness.`;

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

    const getMethodSteps = (method: string, settings: any) => {
      const waterAmount = settings.coffee * settings.water_ratio;
      
      switch (method) {
        case 'V60':
          return {
            rinse: 'Pour hot water through the filter. Discard the rinse water.',
            addCoffee: 'Place the coffee into the filter. Gently shake the dripper to level.',
            brewing: [
              { step: 'Bloom', amount: `${Math.round(settings.coffee * 2)}ml`, time: '30s' },
              { step: 'First Pour', amount: `${Math.round(waterAmount * 0.6)}ml`, time: '30s' },
              { step: 'Second Pour', amount: `${Math.round(waterAmount * 0.4)}ml`, time: '30s' }
            ],
            dripping: '30s',
            finalBrew: `${waterAmount}ml / 120s`
          };
        case 'French Press':
          return {
            addCoffee: 'Add coffee to the French Press',
            brewing: [
              { step: 'Add Water', amount: `${waterAmount}ml`, time: '20s' },
              { step: 'Stir', amount: '5 times', time: '10s' },
              { step: 'Steep', amount: 'Wait', time: '4min' }
            ],
            plunge: '30s',
            finalBrew: `${waterAmount}ml / 270s`
          };
        case 'Espresso':
          return {
            prep: 'Preheat machine and portafilter',
            grind: 'Grind coffee fine, dose into portafilter',
            tamp: 'Tamp with 30 lbs pressure, level and polish',
            brewing: [
              { step: 'Shot', amount: `${settings.coffee * 2}ml`, time: '30s' }
            ],
            finalBrew: `${settings.coffee * 2}ml / 30s`
          };
        default:
          return {
            error: 'Unsupported brewing method'
          };
      }
    };

    const steps = getMethodSteps(currentSession.method, currentSession.settings);

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
