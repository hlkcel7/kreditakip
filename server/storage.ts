
import { 
  projects, 
  banks, 
  currencies, 
  exchangeRates, 
  guaranteeLetters,
  credits,
  type Project,
  type InsertProject,
  type Bank,
  type InsertBank,
  type Currency,
  type InsertCurrency,
  type ExchangeRate,
  type InsertExchangeRate,
  type GuaranteeLetter,
  type InsertGuaranteeLetter,
  type GuaranteeLetterWithRelations,
  type Credit,
  type InsertCredit,
  type CreditWithRelations
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc, and } from "drizzle-orm";
import { generateId } from "./utils";

export interface IStorage {
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  // Banks
  getBanks(): Promise<Bank[]>;
  getBank(id: string): Promise<Bank | undefined>;
  createBank(bank: InsertBank): Promise<Bank>;
  updateBank(id: string, bank: Partial<InsertBank>): Promise<Bank>;
  deleteBank(id: string): Promise<void>;

  // Currencies
  getCurrencies(): Promise<Currency[]>;
  getCurrency(id: string): Promise<Currency | undefined>;
  createCurrency(currency: InsertCurrency): Promise<Currency>;
  updateCurrency(id: string, currency: Partial<InsertCurrency>): Promise<Currency>;

  // Exchange Rates
  getExchangeRates(): Promise<ExchangeRate[]>;
  getExchangeRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRate | undefined>;
  createOrUpdateExchangeRate(rate: InsertExchangeRate): Promise<ExchangeRate>;

  // Guarantee Letters
  getGuaranteeLetters(): Promise<GuaranteeLetterWithRelations[]>;
  getGuaranteeLetter(id: string): Promise<GuaranteeLetterWithRelations | undefined>;
  createGuaranteeLetter(letter: InsertGuaranteeLetter): Promise<GuaranteeLetter>;
  updateGuaranteeLetter(id: string, letter: Partial<InsertGuaranteeLetter>): Promise<GuaranteeLetter>;
  deleteGuaranteeLetter(id: string): Promise<void>;
  getGuaranteeLettersByProject(projectId: string): Promise<GuaranteeLetterWithRelations[]>;
  getGuaranteeLettersByBank(bankId: string): Promise<GuaranteeLetterWithRelations[]>;

  // Credits
  getCredits(): Promise<CreditWithRelations[]>;
  getCredit(id: string): Promise<CreditWithRelations | undefined>;
  createCredit(credit: InsertCredit): Promise<Credit>;
  updateCredit(id: string, credit: Partial<InsertCredit>): Promise<Credit>;
  deleteCredit(id: string): Promise<void>;
  getCreditsByProject(projectId: string): Promise<CreditWithRelations[]>;
  getCreditsByBank(bankId: string): Promise<CreditWithRelations[]>;
}

export class DatabaseStorage implements IStorage {
  // Projects
  async getProjects(): Promise<Project[]> {
    return await db.query.projects.findMany({
      orderBy: [desc(projects.createdAt)]
    });
  }

  async getProject(id: string): Promise<Project | undefined> {
    return await db.query.projects.findFirst({
      where: eq(projects.id, id)
    });
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = generateId();
    await db.insert(projects).values({
      id,
      ...insertProject,
      status: insertProject.status ?? "active",
      createdAt: new Date()
    });
    
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async updateProject(id: string, insertProject: Partial<InsertProject>): Promise<Project> {
    await db.update(projects)
      .set({
        ...insertProject
      })
      .where(eq(projects.id, id));
    
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Banks
  async getBanks(): Promise<Bank[]> {
    return await db.query.banks.findMany({
      orderBy: [desc(banks.createdAt)]
    });
  }

  async getBank(id: string): Promise<Bank | undefined> {
    return await db.query.banks.findFirst({
      where: eq(banks.id, id)
    });
  }

  async createBank(insertBank: InsertBank): Promise<Bank> {
    const id = generateId();
    await db.insert(banks).values({
      id,
      ...insertBank,
      status: insertBank.status ?? "active",
      createdAt: new Date()
    });
    
    const [bank] = await db.select().from(banks).where(eq(banks.id, id));
    return bank;
  }

  async updateBank(id: string, insertBank: Partial<InsertBank>): Promise<Bank> {
    await db.update(banks)
      .set({
        ...insertBank
      })
      .where(eq(banks.id, id));
      
    const [bank] = await db.select().from(banks).where(eq(banks.id, id));
    return bank;
  }

  async deleteBank(id: string): Promise<void> {
    await db.delete(banks).where(eq(banks.id, id));
  }

  // Currencies
  async getCurrencies(): Promise<Currency[]> {
    return await db.query.currencies.findMany({
      where: eq(currencies.isActive, true)
    });
  }

  async getCurrency(id: string): Promise<Currency | undefined> {
    return await db.query.currencies.findFirst({
      where: eq(currencies.id, id)
    });
  }

  async createCurrency(insertCurrency: InsertCurrency): Promise<Currency> {
    const id = generateId();
    await db.insert(currencies).values({
      id,
      ...insertCurrency,
      isActive: insertCurrency.isActive ?? true
    });
    
    const [currency] = await db.select().from(currencies).where(eq(currencies.id, id));
    return currency;
  }

  async updateCurrency(id: string, insertCurrency: Partial<InsertCurrency>): Promise<Currency> {
    await db.update(currencies)
      .set(insertCurrency)
      .where(eq(currencies.id, id));
      
    const [currency] = await db.select().from(currencies).where(eq(currencies.id, id));
    return currency;
  }

  // Exchange Rates
  async getExchangeRates(): Promise<ExchangeRate[]> {
    return await db.select().from(exchangeRates).orderBy(desc(exchangeRates.updatedAt));
  }

  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRate | undefined> {
    const [rate] = await db.select().from(exchangeRates)
      .where(
        and(
          eq(exchangeRates.fromCurrency, fromCurrency),
          eq(exchangeRates.toCurrency, toCurrency)
        )
      );
    return rate || undefined;
  }

  async createOrUpdateExchangeRate(insertRate: InsertExchangeRate): Promise<ExchangeRate> {
    const existing = await this.getExchangeRate(insertRate.fromCurrency, insertRate.toCurrency);
    
    if (existing) {
      await db.update(exchangeRates)
        .set({
          rate: insertRate.rate,
          updatedAt: new Date()
        })
        .where(eq(exchangeRates.id, existing.id));
      
      const [rate] = await db.select().from(exchangeRates).where(eq(exchangeRates.id, existing.id));
      return rate;
    } else {
      const id = generateId();
      await db.insert(exchangeRates).values({
        id,
        ...insertRate,
        updatedAt: new Date()
      });
      
      const [rate] = await db.select().from(exchangeRates).where(eq(exchangeRates.id, id));
      return rate;
    }
  }

  // Guarantee Letters
  async getGuaranteeLetters(): Promise<GuaranteeLetterWithRelations[]> {
    const letters = await db.select({
      id: guaranteeLetters.id,
      bankId: guaranteeLetters.bankId,
      projectId: guaranteeLetters.projectId,
      letterType: guaranteeLetters.letterType,
      contractAmount: guaranteeLetters.contractAmount,
      letterPercentage: guaranteeLetters.letterPercentage,
      letterAmount: guaranteeLetters.letterAmount,
      commissionRate: guaranteeLetters.commissionRate,
      bsmvAndOtherCosts: guaranteeLetters.bsmvAndOtherCosts,
      currency: guaranteeLetters.currency,
      purchaseDate: guaranteeLetters.purchaseDate,
      expiryDate: guaranteeLetters.expiryDate,
      status: guaranteeLetters.status,
      notes: guaranteeLetters.notes,
      createdAt: guaranteeLetters.createdAt,
      updatedAt: guaranteeLetters.updatedAt,
      bank: {
        id: banks.id,
        name: banks.name,
        code: banks.code,
        branchName: banks.branchName,
        contactPerson: banks.contactPerson,
        phone: banks.phone,
        email: banks.email,
        address: banks.address,
        status: banks.status,
        createdAt: banks.createdAt,
      },
      project: {
        id: projects.id,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        createdAt: projects.createdAt,
      }
    })
    .from(guaranteeLetters)
    .leftJoin(banks, eq(guaranteeLetters.bankId, banks.id))
    .leftJoin(projects, eq(guaranteeLetters.projectId, projects.id))
    .orderBy(desc(guaranteeLetters.createdAt));

    return letters;
  }

  async getGuaranteeLetter(id: string): Promise<GuaranteeLetterWithRelations | undefined> {
    const [letter] = await db.select({
      id: guaranteeLetters.id,
      bankId: guaranteeLetters.bankId,
      projectId: guaranteeLetters.projectId,
      letterType: guaranteeLetters.letterType,
      contractAmount: guaranteeLetters.contractAmount,
      letterPercentage: guaranteeLetters.letterPercentage,
      letterAmount: guaranteeLetters.letterAmount,
      commissionRate: guaranteeLetters.commissionRate,
      bsmvAndOtherCosts: guaranteeLetters.bsmvAndOtherCosts,
      currency: guaranteeLetters.currency,
      purchaseDate: guaranteeLetters.purchaseDate,
      expiryDate: guaranteeLetters.expiryDate,
      status: guaranteeLetters.status,
      notes: guaranteeLetters.notes,
      createdAt: guaranteeLetters.createdAt,
      updatedAt: guaranteeLetters.updatedAt,
      bank: {
        id: banks.id,
        name: banks.name,
        code: banks.code,
        branchName: banks.branchName,
        contactPerson: banks.contactPerson,
        phone: banks.phone,
        email: banks.email,
        address: banks.address,
        status: banks.status,
        createdAt: banks.createdAt,
      },
      project: {
        id: projects.id,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        createdAt: projects.createdAt,
      }
    })
    .from(guaranteeLetters)
    .leftJoin(banks, eq(guaranteeLetters.bankId, banks.id))
    .leftJoin(projects, eq(guaranteeLetters.projectId, projects.id))
    .where(eq(guaranteeLetters.id, id));
    
    return letter || undefined;
  }

  async createGuaranteeLetter(insertLetter: InsertGuaranteeLetter): Promise<GuaranteeLetter> {
    const id = generateId();
    await db.insert(guaranteeLetters).values({
      id,
      bankId: insertLetter.bankId,
      projectId: insertLetter.projectId,
      letterType: insertLetter.letterType,
      contractAmount: insertLetter.contractAmount?.toString() ?? "0",
      letterPercentage: insertLetter.letterPercentage?.toString() ?? "0",
      letterAmount: insertLetter.letterAmount?.toString() ?? "0",
      commissionRate: insertLetter.commissionRate?.toString() ?? "0",
      bsmvAndOtherCosts: insertLetter.bsmvAndOtherCosts?.toString() ?? "0",
      currency: insertLetter.currency,
      purchaseDate: insertLetter.purchaseDate,
      expiryDate: insertLetter.expiryDate,
      status: insertLetter.status ?? "aktif",
      notes: insertLetter.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const [letter] = await db.select().from(guaranteeLetters).where(eq(guaranteeLetters.id, id));
    return letter;
  }

  async updateGuaranteeLetter(id: string, insertLetter: Partial<InsertGuaranteeLetter>): Promise<GuaranteeLetter> {
    const updateData: Record<string, any> = {};
    
    if (insertLetter.bankId !== undefined) updateData.bankId = insertLetter.bankId;
    if (insertLetter.projectId !== undefined) updateData.projectId = insertLetter.projectId;
    if (insertLetter.letterType !== undefined) updateData.letterType = insertLetter.letterType;
    if (insertLetter.contractAmount !== undefined) updateData.contractAmount = insertLetter.contractAmount.toString();
    if (insertLetter.letterPercentage !== undefined) updateData.letterPercentage = insertLetter.letterPercentage.toString();
    if (insertLetter.letterAmount !== undefined) updateData.letterAmount = insertLetter.letterAmount.toString();
    if (insertLetter.commissionRate !== undefined) updateData.commissionRate = insertLetter.commissionRate.toString();
    if (insertLetter.bsmvAndOtherCosts !== undefined) updateData.bsmvAndOtherCosts = insertLetter.bsmvAndOtherCosts.toString();
    if (insertLetter.currency !== undefined) updateData.currency = insertLetter.currency;
    if (insertLetter.purchaseDate !== undefined) updateData.purchaseDate = insertLetter.purchaseDate;
    if (insertLetter.expiryDate !== undefined) updateData.expiryDate = insertLetter.expiryDate;
    if (insertLetter.status !== undefined) updateData.status = insertLetter.status;
    if (insertLetter.notes !== undefined) updateData.notes = insertLetter.notes;

      await db.update(guaranteeLetters)
      .set({
        ...updateData
      })
      .where(eq(guaranteeLetters.id, id));    const [letter] = await db.select().from(guaranteeLetters).where(eq(guaranteeLetters.id, id));
    return letter;
  }

  async deleteGuaranteeLetter(id: string): Promise<void> {
    await db.delete(guaranteeLetters).where(eq(guaranteeLetters.id, id));
  }

  async getGuaranteeLettersByProject(projectId: string): Promise<GuaranteeLetterWithRelations[]> {
    return await db.query.guaranteeLetters.findMany({
      where: eq(guaranteeLetters.projectId, projectId),
      with: {
        bank: true,
        project: true,
      },
      orderBy: [desc(guaranteeLetters.createdAt)]
    });
  }

  async getGuaranteeLettersByBank(bankId: string): Promise<GuaranteeLetterWithRelations[]> {
    return await db.query.guaranteeLetters.findMany({
      where: eq(guaranteeLetters.bankId, bankId),
      with: {
        bank: true,
        project: true,
      },
      orderBy: [desc(guaranteeLetters.createdAt)]
    });
  }

  // Credits
  async getCredits(): Promise<CreditWithRelations[]> {
    const results = await db.select({
      id: credits.id,
      bankId: credits.bankId,
      projectId: credits.projectId,
      principalAmount: credits.principalAmount,
      interestAmount: credits.interestAmount,
      totalRepaidAmount: credits.totalRepaidAmount,
      currency: credits.currency,
      creditDate: credits.creditDate,
      maturityDate: credits.maturityDate,
      status: credits.status,
      notes: credits.notes,
      createdAt: credits.createdAt,
      updatedAt: credits.updatedAt,
      bank: {
        id: banks.id,
        name: banks.name,
        code: banks.code,
        branchName: banks.branchName,
        contactPerson: banks.contactPerson,
        phone: banks.phone,
        email: banks.email,
        address: banks.address,
        status: banks.status,
        createdAt: banks.createdAt,
      },
      project: {
        id: projects.id,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        createdAt: projects.createdAt,
      }
    })
    .from(credits)
    .leftJoin(banks, eq(credits.bankId, banks.id))
    .leftJoin(projects, eq(credits.projectId, projects.id))
    .orderBy(desc(credits.createdAt));

    return results;
  }

  async getCredit(id: string): Promise<CreditWithRelations | undefined> {
    const [credit] = await db.select({
      id: credits.id,
      bankId: credits.bankId,
      projectId: credits.projectId,
      principalAmount: credits.principalAmount,
      interestAmount: credits.interestAmount,
      totalRepaidAmount: credits.totalRepaidAmount,
      currency: credits.currency,
      creditDate: credits.creditDate,
      maturityDate: credits.maturityDate,
      status: credits.status,
      notes: credits.notes,
      createdAt: credits.createdAt,
      updatedAt: credits.updatedAt,
      bank: {
        id: banks.id,
        name: banks.name,
        code: banks.code,
        branchName: banks.branchName,
        contactPerson: banks.contactPerson,
        phone: banks.phone,
        email: banks.email,
        address: banks.address,
        status: banks.status,
        createdAt: banks.createdAt,
      },
      project: {
        id: projects.id,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        createdAt: projects.createdAt,
      }
    })
    .from(credits)
    .leftJoin(banks, eq(credits.bankId, banks.id))
    .leftJoin(projects, eq(credits.projectId, projects.id))
    .where(eq(credits.id, id));

    return credit || undefined;
  }

  async createCredit(insertCredit: InsertCredit): Promise<Credit> {
    const id = generateId();
    await db.insert(credits).values({
      id,
      bankId: insertCredit.bankId,
      projectId: insertCredit.projectId,
      currency: insertCredit.currency,
      principalAmount: insertCredit.principalAmount?.toString() ?? "0",
      interestAmount: insertCredit.interestAmount?.toString() ?? "0",
      totalRepaidAmount: insertCredit.totalRepaidAmount?.toString() ?? "0",
      creditDate: insertCredit.creditDate,
      maturityDate: insertCredit.maturityDate,
      status: insertCredit.status ?? "devam-ediyor",
      notes: insertCredit.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const [credit] = await db.select().from(credits).where(eq(credits.id, id));
    return credit;
  }

  async updateCredit(id: string, insertCredit: Partial<InsertCredit>): Promise<Credit> {
    const updateData: Record<string, any> = {};
    
    if (insertCredit.bankId !== undefined) updateData.bankId = insertCredit.bankId;
    if (insertCredit.projectId !== undefined) updateData.projectId = insertCredit.projectId;
    if (insertCredit.currency !== undefined) updateData.currency = insertCredit.currency;
    if (insertCredit.principalAmount !== undefined) updateData.principalAmount = insertCredit.principalAmount.toString();
    if (insertCredit.interestAmount !== undefined) updateData.interestAmount = insertCredit.interestAmount.toString();
    if (insertCredit.totalRepaidAmount !== undefined) updateData.totalRepaidAmount = insertCredit.totalRepaidAmount.toString();
    if (insertCredit.creditDate !== undefined) updateData.creditDate = insertCredit.creditDate;
    if (insertCredit.maturityDate !== undefined) updateData.maturityDate = insertCredit.maturityDate;
    if (insertCredit.status !== undefined) updateData.status = insertCredit.status;
    if (insertCredit.notes !== undefined) updateData.notes = insertCredit.notes;

      await db.update(credits)
      .set({
        ...updateData
      })
      .where(eq(credits.id, id));    const [credit] = await db.select().from(credits).where(eq(credits.id, id));
    return credit;
  }

  async deleteCredit(id: string): Promise<void> {
    await db.delete(credits).where(eq(credits.id, id));
  }

  async getCreditsByProject(projectId: string): Promise<CreditWithRelations[]> {
    const results = await db.select({
      id: credits.id,
      bankId: credits.bankId,
      projectId: credits.projectId,
      principalAmount: credits.principalAmount,
      interestAmount: credits.interestAmount,
      totalRepaidAmount: credits.totalRepaidAmount,
      currency: credits.currency,
      creditDate: credits.creditDate,
      maturityDate: credits.maturityDate,
      status: credits.status,
      notes: credits.notes,
      createdAt: credits.createdAt,
      updatedAt: credits.updatedAt,
      bank: {
        id: banks.id,
        name: banks.name,
        code: banks.code,
        branchName: banks.branchName,
        contactPerson: banks.contactPerson,
        phone: banks.phone,
        email: banks.email,
        address: banks.address,
        status: banks.status,
        createdAt: banks.createdAt,
      },
      project: {
        id: projects.id,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        createdAt: projects.createdAt,
      }
    })
    .from(credits)
    .leftJoin(banks, eq(credits.bankId, banks.id))
    .leftJoin(projects, eq(credits.projectId, projects.id))
    .where(eq(credits.projectId, projectId))
    .orderBy(desc(credits.createdAt));

    return results;
  }

  async getCreditsByBank(bankId: string): Promise<CreditWithRelations[]> {
    const results = await db.select({
      id: credits.id,
      bankId: credits.bankId,
      projectId: credits.projectId,
      principalAmount: credits.principalAmount,
      interestAmount: credits.interestAmount,
      totalRepaidAmount: credits.totalRepaidAmount,
      currency: credits.currency,
      creditDate: credits.creditDate,
      maturityDate: credits.maturityDate,
      status: credits.status,
      notes: credits.notes,
      createdAt: credits.createdAt,
      updatedAt: credits.updatedAt,
      bank: {
        id: banks.id,
        name: banks.name,
        code: banks.code,
        branchName: banks.branchName,
        contactPerson: banks.contactPerson,
        phone: banks.phone,
        email: banks.email,
        address: banks.address,
        status: banks.status,
        createdAt: banks.createdAt,
      },
      project: {
        id: projects.id,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        createdAt: projects.createdAt,
      }
    })
    .from(credits)
    .leftJoin(banks, eq(credits.bankId, banks.id))
    .leftJoin(projects, eq(credits.projectId, projects.id))
    .where(eq(credits.bankId, bankId))
    .orderBy(desc(credits.createdAt));

    return results;
  }
}

export const storage = new DatabaseStorage();
