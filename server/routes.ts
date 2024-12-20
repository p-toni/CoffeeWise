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

    const prompt = `You are a coffee expert. Analyze these brewing settings and provide a recommendation:
${JSON.stringify({ bean, method, settings }, null, 2)}

Respond with a JSON object in this format:
{
  "status": "Allowed" or "Unallowed",
  "message": "Your detailed recommendation explaining why"
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
    const steps = req.body;

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
