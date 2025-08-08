import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { insertLetterPaymentSchema } from "@shared/schema";

const updateLetterPaymentSchema = insertLetterPaymentSchema.partial();

export const setupLetterPaymentsRoutes = (app: Express) => {
  // Get all letter payments
  app.get("/api/letter-payments", async (req: Request, res: Response) => {
    try {
      const payments = await storage.getLetterPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Ödeme kayıtları alınamadı" });
    }
  });

  // Get payments for a specific letter
  app.get("/api/letter-payments/letter/:letterId", async (req: Request, res: Response) => {
    try {
      const payments = await storage.getLetterPaymentsByLetterId(req.params.letterId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Ödeme kayıtları alınamadı" });
    }
  });

  // Get summary for a specific letter
  app.get("/api/letter-payments/:letterId/summary", async (req: Request, res: Response) => {
    try {
      const { letterId } = req.params;

      // Get the guarantee letter to calculate total commission
      const letter = await storage.getGuaranteeLetter(letterId);
      if (!letter) {
        return res.status(404).json({ message: "Mektup bulunamadı" });
      }

      const commissionRate = Number(letter.commissionRate);
      const letterAmount = Number(letter.letterAmount);
      const bsmvAndOtherCosts = Number(letter.bsmvAndOtherCosts || 0);
      const totalCommission = (letterAmount * commissionRate / 100) + bsmvAndOtherCosts;

      // Get payments
      const payments = await storage.getLetterPaymentsByLetterId(letterId);
      const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      const totalBsmv = payments.reduce((sum, payment) => sum + Number(payment.bsmv || 0), 0);
      const remainingCommission = totalCommission - totalPaid;
      const lastPaymentDate = payments.length > 0 
        ? payments.reduce((latest, payment) => {
            const paymentDate = new Date(payment.paymentDate);
            return latest > paymentDate ? latest : paymentDate;
          }, new Date(0)).toISOString()
        : null;

      res.json({
        letterId,
        totalCommission,
        totalPaid,
        totalBsmv,
        remainingCommission,
        payments: payments.length,
        lastPaymentDate
      });
    } catch (error) {
      console.error('Error fetching payment summary:', error);
      res.status(500).json({ message: "Ödeme özeti alınamadı" });
    }
  });

  // Get a specific payment
  app.get("/api/letter-payments/:id", async (req: Request, res: Response) => {
    try {
      const payment = await storage.getLetterPayment(req.params.id);
      if (!payment) {
        return res.status(404).json({ message: "Ödeme kaydı bulunamadı" });
      }
      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: "Ödeme kaydı alınamadı" });
    }
  });

  // Create a new letter payment
  app.post("/api/letter-payments", async (req: Request, res: Response) => {
    try {
      const paymentData = insertLetterPaymentSchema.parse(req.body);

      // Convert string values to numbers
      if (typeof paymentData.amount === "string") paymentData.amount = Number(paymentData.amount);
      if (typeof paymentData.bsmv === "string") paymentData.bsmv = Number(paymentData.bsmv);

      const newPayment = await storage.createLetterPayment(paymentData);
      res.status(201).json(newPayment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Geçersiz veri", errors: error.errors });
      }
      console.error('Error creating payment:', error);
      res.status(500).json({ message: "Ödeme kaydı oluşturulamadı" });
    }
  });

  // Update a letter payment
  app.patch("/api/letter-payments/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = updateLetterPaymentSchema.parse(req.body);

      // Convert string values to numbers
      if (typeof updateData.amount === "string") updateData.amount = Number(updateData.amount);
      if (typeof updateData.bsmv === "string") updateData.bsmv = Number(updateData.bsmv);

      const updatedPayment = await storage.updateLetterPayment(id, updateData);
      if (!updatedPayment) {
        return res.status(404).json({ message: "Ödeme kaydı bulunamadı" });
      }
      res.json(updatedPayment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Geçersiz veri", errors: error.errors });
      }
      res.status(500).json({ message: "Ödeme kaydı güncellenemedi" });
    }
  });

  // Delete a letter payment
  app.delete("/api/letter-payments/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteLetterPayment(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Ödeme kaydı silinemedi" });
    }
  });
};
