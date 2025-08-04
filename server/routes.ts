import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProjectSchema,
  insertBankSchema,
  insertCurrencySchema,
  insertExchangeRateSchema,
  insertGuaranteeLetterSchema,
  insertCreditSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Projects routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const data = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(data);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const data = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, data);
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const data = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, data);
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Banks routes
  app.get("/api/banks", async (req, res) => {
    try {
      const banks = await storage.getBanks();
      res.json(banks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch banks" });
    }
  });

  app.get("/api/banks/:id", async (req, res) => {
    try {
      const bank = await storage.getBank(req.params.id);
      if (!bank) {
        return res.status(404).json({ message: "Bank not found" });
      }
      res.json(bank);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bank" });
    }
  });

  app.post("/api/banks", async (req, res) => {
    try {
      const data = insertBankSchema.parse(req.body);
      const bank = await storage.createBank(data);
      res.status(201).json(bank);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create bank" });
    }
  });

  app.patch("/api/banks/:id", async (req, res) => {
    try {
      const data = insertBankSchema.partial().parse(req.body);
      const bank = await storage.updateBank(req.params.id, data);
      res.json(bank);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update bank" });
    }
  });

  app.delete("/api/banks/:id", async (req, res) => {
    try {
      await storage.deleteBank(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bank" });
    }
  });

  app.patch("/api/banks/:id", async (req, res) => {
    try {
      const data = insertBankSchema.partial().parse(req.body);
      const bank = await storage.updateBank(req.params.id, data);
      res.json(bank);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update bank" });
    }
  });

  app.delete("/api/banks/:id", async (req, res) => {
    try {
      await storage.deleteBank(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bank" });
    }
  });

  // Currencies routes
  app.get("/api/currencies", async (req, res) => {
    try {
      const currencies = await storage.getCurrencies();
      res.json(currencies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch currencies" });
    }
  });

  app.post("/api/currencies", async (req, res) => {
    try {
      const data = insertCurrencySchema.parse(req.body);
      const currency = await storage.createCurrency(data);
      res.status(201).json(currency);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create currency" });
    }
  });

  // Exchange rates routes
  app.get("/api/exchange-rates", async (req, res) => {
    try {
      const rates = await storage.getExchangeRates();
      res.json(rates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exchange rates" });
    }
  });

  app.post("/api/exchange-rates", async (req, res) => {
    try {
      const data = insertExchangeRateSchema.parse(req.body);
      const rate = await storage.createOrUpdateExchangeRate(data);
      res.json(rate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save exchange rate" });
    }
  });

  // Guarantee Letters routes
  app.get("/api/guarantee-letters", async (req, res) => {
    try {
      const { projectId, bankId } = req.query;
      
      let letters;
      if (projectId) {
        letters = await storage.getGuaranteeLettersByProject(projectId as string);
      } else if (bankId) {
        letters = await storage.getGuaranteeLettersByBank(bankId as string);
      } else {
        letters = await storage.getGuaranteeLetters();
      }
      
      res.json(letters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guarantee letters" });
    }
  });

  app.get("/api/guarantee-letters/:id", async (req, res) => {
    try {
      const letter = await storage.getGuaranteeLetter(req.params.id);
      if (!letter) {
        return res.status(404).json({ message: "Guarantee letter not found" });
      }
      res.json(letter);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guarantee letter" });
    }
  });

  app.post("/api/guarantee-letters", async (req, res) => {
    try {
      const data = insertGuaranteeLetterSchema.parse(req.body);
      const letter = await storage.createGuaranteeLetter(data);
      res.status(201).json(letter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create guarantee letter" });
    }
  });

  app.patch("/api/guarantee-letters/:id", async (req, res) => {
    try {
      const data = insertGuaranteeLetterSchema.partial().parse(req.body);
      const letter = await storage.updateGuaranteeLetter(req.params.id, data);
      res.json(letter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update guarantee letter" });
    }
  });

  app.delete("/api/guarantee-letters/:id", async (req, res) => {
    try {
      await storage.deleteGuaranteeLetter(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete guarantee letter" });
    }
  });

  // Credits routes
  app.get("/api/credits", async (req, res) => {
    try {
      const { projectId, bankId } = req.query;
      
      let credits;
      if (projectId) {
        credits = await storage.getCreditsByProject(projectId as string);
      } else if (bankId) {
        credits = await storage.getCreditsByBank(bankId as string);
      } else {
        credits = await storage.getCredits();
      }
      
      res.json(credits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credits" });
    }
  });

  app.get("/api/credits/:id", async (req, res) => {
    try {
      const credit = await storage.getCredit(req.params.id);
      if (!credit) {
        return res.status(404).json({ message: "Credit not found" });
      }
      res.json(credit);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credit" });
    }
  });

  app.post("/api/credits", async (req, res) => {
    try {
      const data = insertCreditSchema.parse(req.body);
      const credit = await storage.createCredit(data);
      res.status(201).json(credit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create credit" });
    }
  });

  app.patch("/api/credits/:id", async (req, res) => {
    try {
      const data = insertCreditSchema.partial().parse(req.body);
      const credit = await storage.updateCredit(req.params.id, data);
      res.json(credit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update credit" });
    }
  });

  app.delete("/api/credits/:id", async (req, res) => {
    try {
      await storage.deleteCredit(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete credit" });
    }
  });

  // Statistics routes
  app.get("/api/dashboard-stats", async (req, res) => {
    try {
      const letters = await storage.getGuaranteeLetters();
      const credits = await storage.getCredits();
      const projects = await storage.getProjects();
      const banks = await storage.getBanks();

      const totalLetters = letters.length;
      const activeLetters = letters.filter(l => l.status === 'aktif').length;
      const totalLetterAmount = letters.reduce((sum, letter) => {
        return sum + parseFloat(letter.letterAmount || '0');
      }, 0);

      const totalCredits = credits.length;
      const activeCredits = credits.filter(c => c.status === 'devam-ediyor').length;
      const totalCreditAmount = credits.reduce((sum, credit) => {
        return sum + parseFloat(credit.principalAmount || '0') + parseFloat(credit.interestAmount || '0');
      }, 0);
      const totalRepaidAmount = credits.reduce((sum, credit) => {
        return sum + parseFloat(credit.totalRepaidAmount || '0');
      }, 0);

      // Get upcoming payments (letters expiring in next 30 days)
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const upcomingLetterPayments = letters.filter(letter => {
        if (!letter.expiryDate) return false;
        const expiryDate = new Date(letter.expiryDate);
        return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
      }).length;

      const upcomingCreditPayments = credits.filter(credit => {
        const maturityDate = new Date(credit.maturityDate);
        return maturityDate >= today && maturityDate <= thirtyDaysFromNow && credit.status === 'devam-ediyor';
      }).length;

      // Get overdue payments
      const overdueLetterPayments = letters.filter(letter => {
        if (!letter.expiryDate) return false;
        const expiryDate = new Date(letter.expiryDate);
        return expiryDate < today && letter.status === 'aktif';
      }).length;

      const overdueCreditPayments = credits.filter(credit => {
        const maturityDate = new Date(credit.maturityDate);
        return maturityDate < today && credit.status === 'devam-ediyor';
      }).length;

      res.json({
        totalLetters,
        activeLetters,
        totalLetterAmount,
        totalCredits,
        activeCredits,
        totalCreditAmount,
        totalRepaidAmount,
        upcomingLetterPayments,
        upcomingCreditPayments,
        overdueLetterPayments,
        overdueCreditPayments,
        totalProjects: projects.length,
        totalBanks: banks.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
