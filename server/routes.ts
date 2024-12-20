import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { brewingSessions } from "@db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

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

    const prompt = `As a coffee expert, analyze these brewing settings:
${JSON.stringify({ bean, method, settings }, null, 2)}

Respond with a JSON object following these rules:
1. Keep the message under 100 characters
2. Use "Allowed" if the combination is good, "Unallowed" if it needs adjustment
3. Focus on the most critical factor in the message

{
  "status": "Allowed" or "Unallowed",
  "message": "Concise feedback about the most important factor"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response text by removing markdown formatting
    const cleanedText = text.replace(/```json\n|\n```/g, '').trim();
    const recommendation = JSON.parse(cleanedText);

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

    const prompt = `You are a coffee brewing expert. Generate brewing steps for the following settings:
${JSON.stringify({
  method: currentSession.method,
  settings: currentSession.settings
}, null, 2)}

Respond with a JSON object containing the brewing steps in this format:
{
  "rinse": ["Pour hot water through the filter", "Discard the rinse water"],
  "addCoffee": ["Place the coffee into the filter", "Gently shake the dripper to level"],
  "brewing": {
    "bloom": "45ml/30s",
    "firstPour": "105ml/120s",
    "secondPour": "100ml/80s"
  },
  "dripping": "30s",
  "finalBrew": "240ml / 180s"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```json\n|\n```/g, '').trim();
    const steps = JSON.parse(cleanedText);

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
