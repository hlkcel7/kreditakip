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
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProject(id: string, insertProject: Partial<InsertProject>): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set(insertProject)
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Banks
  async getBanks(): Promise<Bank[]> {
    return await db.select().from(banks).orderBy(desc(banks.createdAt));
  }

  async getBank(id: string): Promise<Bank | undefined> {
    const [bank] = await db.select().from(banks).where(eq(banks.id, id));
    return bank || undefined;
  }

  async createBank(insertBank: InsertBank): Promise<Bank> {
    const [bank] = await db.insert(banks).values(insertBank).returning();
    return bank;
  }

  async updateBank(id: string, insertBank: Partial<InsertBank>): Promise<Bank> {
    const [bank] = await db
      .update(banks)
      .set(insertBank)
      .where(eq(banks.id, id))
      .returning();
    return bank;
  }

  async deleteBank(id: string): Promise<void> {
    await db.delete(banks).where(eq(banks.id, id));
  }

  // Currencies
  async getCurrencies(): Promise<Currency[]> {
    return await db.select().from(currencies).where(eq(currencies.isActive, true));
  }

  async getCurrency(id: string): Promise<Currency | undefined> {
    const [currency] = await db.select().from(currencies).where(eq(currencies.id, id));
    return currency || undefined;
  }

  async createCurrency(insertCurrency: InsertCurrency): Promise<Currency> {
    const [currency] = await db.insert(currencies).values(insertCurrency).returning();
    return currency;
  }

  async updateCurrency(id: string, insertCurrency: Partial<InsertCurrency>): Promise<Currency> {
    const [currency] = await db
      .update(currencies)
      .set(insertCurrency)
      .where(eq(currencies.id, id))
      .returning();
    return currency;
  }

  // Exchange Rates
  async getExchangeRates(): Promise<ExchangeRate[]> {
    return await db.select().from(exchangeRates).orderBy(desc(exchangeRates.updatedAt));
  }

  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRate | undefined> {
    const [rate] = await db
      .select()
      .from(exchangeRates)
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
      const [rate] = await db
        .update(exchangeRates)
        .set({ rate: insertRate.rate, updatedAt: sql`now()` })
        .where(eq(exchangeRates.id, existing.id))
        .returning();
      return rate;
    } else {
      const [rate] = await db.insert(exchangeRates).values(insertRate).returning();
      return rate;
    }
  }

  // Guarantee Letters
  async getGuaranteeLetters(): Promise<GuaranteeLetterWithRelations[]> {
    return await db
      .select({
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
        letterDate: guaranteeLetters.letterDate,
        expiryDate: guaranteeLetters.expiryDate,
        status: guaranteeLetters.status,
        notes: guaranteeLetters.notes,
        createdAt: guaranteeLetters.createdAt,
        updatedAt: guaranteeLetters.updatedAt,
        bank: banks,
        project: projects,
      })
      .from(guaranteeLetters)
      .leftJoin(banks, eq(guaranteeLetters.bankId, banks.id))
      .leftJoin(projects, eq(guaranteeLetters.projectId, projects.id))
      .orderBy(desc(guaranteeLetters.createdAt));
  }

  async getGuaranteeLetter(id: string): Promise<GuaranteeLetterWithRelations | undefined> {
    const [letter] = await db
      .select({
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
        letterDate: guaranteeLetters.letterDate,
        expiryDate: guaranteeLetters.expiryDate,
        status: guaranteeLetters.status,
        notes: guaranteeLetters.notes,
        createdAt: guaranteeLetters.createdAt,
        updatedAt: guaranteeLetters.updatedAt,
        bank: banks,
        project: projects,
      })
      .from(guaranteeLetters)
      .leftJoin(banks, eq(guaranteeLetters.bankId, banks.id))
      .leftJoin(projects, eq(guaranteeLetters.projectId, projects.id))
      .where(eq(guaranteeLetters.id, id));
    
    return letter || undefined;
  }

  async createGuaranteeLetter(insertLetter: InsertGuaranteeLetter): Promise<GuaranteeLetter> {
    const [letter] = await db.insert(guaranteeLetters).values(insertLetter).returning();
    return letter;
  }

  async updateGuaranteeLetter(id: string, insertLetter: Partial<InsertGuaranteeLetter>): Promise<GuaranteeLetter> {
    const [letter] = await db
      .update(guaranteeLetters)
      .set({ ...insertLetter, updatedAt: sql`now()` })
      .where(eq(guaranteeLetters.id, id))
      .returning();
    return letter;
  }

  async deleteGuaranteeLetter(id: string): Promise<void> {
    await db.delete(guaranteeLetters).where(eq(guaranteeLetters.id, id));
  }

  async getGuaranteeLettersByProject(projectId: string): Promise<GuaranteeLetterWithRelations[]> {
    return await db
      .select({
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
        letterDate: guaranteeLetters.letterDate,
        expiryDate: guaranteeLetters.expiryDate,
        status: guaranteeLetters.status,
        notes: guaranteeLetters.notes,
        createdAt: guaranteeLetters.createdAt,
        updatedAt: guaranteeLetters.updatedAt,
        bank: banks,
        project: projects,
      })
      .from(guaranteeLetters)
      .leftJoin(banks, eq(guaranteeLetters.bankId, banks.id))
      .leftJoin(projects, eq(guaranteeLetters.projectId, projects.id))
      .where(eq(guaranteeLetters.projectId, projectId))
      .orderBy(desc(guaranteeLetters.createdAt));
  }

  async getGuaranteeLettersByBank(bankId: string): Promise<GuaranteeLetterWithRelations[]> {
    return await db
      .select({
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
        letterDate: guaranteeLetters.letterDate,
        expiryDate: guaranteeLetters.expiryDate,
        status: guaranteeLetters.status,
        notes: guaranteeLetters.notes,
        createdAt: guaranteeLetters.createdAt,
        updatedAt: guaranteeLetters.updatedAt,
        bank: banks,
        project: projects,
      })
      .from(guaranteeLetters)
      .leftJoin(banks, eq(guaranteeLetters.bankId, banks.id))
      .leftJoin(projects, eq(guaranteeLetters.projectId, projects.id))
      .where(eq(guaranteeLetters.bankId, bankId))
      .orderBy(desc(guaranteeLetters.createdAt));
  }

  // Credits
  async getCredits(): Promise<CreditWithRelations[]> {
    return await db
      .select({
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
        bank: banks,
        project: projects,
      })
      .from(credits)
      .leftJoin(banks, eq(credits.bankId, banks.id))
      .leftJoin(projects, eq(credits.projectId, projects.id))
      .orderBy(desc(credits.createdAt));
  }

  async getCredit(id: string): Promise<CreditWithRelations | undefined> {
    const [credit] = await db
      .select({
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
        bank: banks,
        project: projects,
      })
      .from(credits)
      .leftJoin(banks, eq(credits.bankId, banks.id))
      .leftJoin(projects, eq(credits.projectId, projects.id))
      .where(eq(credits.id, id));
    
    return credit || undefined;
  }

  async createCredit(insertCredit: InsertCredit): Promise<Credit> {
    const [credit] = await db.insert(credits).values(insertCredit).returning();
    return credit;
  }

  async updateCredit(id: string, insertCredit: Partial<InsertCredit>): Promise<Credit> {
    const [credit] = await db
      .update(credits)
      .set({ ...insertCredit, updatedAt: sql`now()` })
      .where(eq(credits.id, id))
      .returning();
    return credit;
  }

  async deleteCredit(id: string): Promise<void> {
    await db.delete(credits).where(eq(credits.id, id));
  }

  async getCreditsByProject(projectId: string): Promise<CreditWithRelations[]> {
    return await db
      .select({
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
        bank: banks,
        project: projects,
      })
      .from(credits)
      .leftJoin(banks, eq(credits.bankId, banks.id))
      .leftJoin(projects, eq(credits.projectId, projects.id))
      .where(eq(credits.projectId, projectId))
      .orderBy(desc(credits.createdAt));
  }

  async getCreditsByBank(bankId: string): Promise<CreditWithRelations[]> {
    return await db
      .select({
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
        bank: banks,
        project: projects,
      })
      .from(credits)
      .leftJoin(banks, eq(credits.bankId, banks.id))
      .leftJoin(projects, eq(credits.projectId, projects.id))
      .where(eq(credits.bankId, bankId))
      .orderBy(desc(credits.createdAt));
  }
}

export const storage = new DatabaseStorage();
