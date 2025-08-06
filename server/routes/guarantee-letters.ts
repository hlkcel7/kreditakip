import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { insertGuaranteeLetterSchema } from "@shared/schema";

const updateGuaranteeLetterSchema = insertGuaranteeLetterSchema.partial();

export const setupGuaranteeLettersRoutes = (app: Express) => {
  // Get all guarantee letters
  app.get("/api/guarantee-letters", async (req: Request, res: Response) => {
    try {
      const letters = await storage.getGuaranteeLetters();
      res.json(letters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guarantee letters" });
    }
  });

  // Update a guarantee letter
  app.patch("/api/guarantee-letters/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = updateGuaranteeLetterSchema.parse(req.body);

      // Convert string number values to actual numbers
      if (updateData.contractAmount) updateData.contractAmount = Number(updateData.contractAmount);
      if (updateData.letterPercentage) updateData.letterPercentage = Number(updateData.letterPercentage);
      if (updateData.letterAmount) updateData.letterAmount = Number(updateData.letterAmount);
      if (updateData.commissionRate) updateData.commissionRate = Number(updateData.commissionRate);
      if (updateData.bsmvAndOtherCosts) updateData.bsmvAndOtherCosts = Number(updateData.bsmvAndOtherCosts);

      const updatedLetter = await storage.updateGuaranteeLetter(id, updateData);
      if (!updatedLetter) {
        return res.status(404).json({ message: "Guarantee letter not found" });
      }
      res.json(updatedLetter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update guarantee letter" });
    }
  });

  // Get guarantee letters by project
  app.get("/api/guarantee-letters/project/:projectId", async (req: Request, res: Response) => {
    try {
      const letters = await storage.getGuaranteeLettersByProject(req.params.projectId);
      res.json(letters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guarantee letters" });
    }
  });

  // Get guarantee letters by bank
  app.get("/api/guarantee-letters/bank/:bankId", async (req: Request, res: Response) => {
    try {
      const letters = await storage.getGuaranteeLettersByBank(req.params.bankId);
      res.json(letters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guarantee letters" });
    }
  });
};
