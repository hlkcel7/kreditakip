import { Express, Request, Response } from "express";
import { storage } from "../storage";

export const setupGuaranteeLettersRoutes = (app: Express) => {
  // Guarantee Letters routes
  app.get("/api/guarantee-letters", async (req: Request, res: Response) => {
    try {
      const letters = await storage.getGuaranteeLetters();
      res.json(letters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guarantee letters" });
    }
  });
};
