import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { insertCreditSchema } from "@shared/schema";

const updateCreditSchema = insertCreditSchema.partial();

export const setupCreditsRoutes = (app: Express) => {
  // Create a new credit
  app.post("/api/credits", async (req: Request, res: Response) => {
    try {
      const data = insertCreditSchema.parse(req.body);
      const newCredit = await storage.createCredit(data);
      res.json(newCredit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create credit" });
    }
  });

  // Get all credits
  app.get("/api/credits", async (req: Request, res: Response) => {
    try {
      const credits = await storage.getCredits();
      res.json(credits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credits" });
    }
  });

  // Update a credit
  app.patch("/api/credits/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = updateCreditSchema.parse(req.body);

      // Convert numbers to strings for storage
      if (updateData.principalAmount) updateData.principalAmount = updateData.principalAmount.toString();
      if (updateData.interestAmount) updateData.interestAmount = updateData.interestAmount.toString();
      if (updateData.totalRepaidAmount) updateData.totalRepaidAmount = updateData.totalRepaidAmount.toString();
      if (updateData.bsmvAndOtherCosts) updateData.bsmvAndOtherCosts = updateData.bsmvAndOtherCosts.toString();

      const updatedCredit = await storage.updateCredit(id, updateData);
      if (!updatedCredit) {
        return res.status(404).json({ message: "Credit not found" });
      }
      res.json(updatedCredit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update credit" });
    }
  });

  // Get credits by project
  app.get("/api/credits/project/:projectId", async (req: Request, res: Response) => {
    try {
      const credits = await storage.getCreditsByProject(req.params.projectId);
      res.json(credits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credits" });
    }
  });

  // Get credits by bank
  app.get("/api/credits/bank/:bankId", async (req: Request, res: Response) => {
    try {
      const credits = await storage.getCreditsByBank(req.params.bankId);
      res.json(credits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credits" });
    }
  });
};
