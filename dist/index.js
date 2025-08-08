var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  banks: () => banks,
  banksRelations: () => banksRelations,
  credits: () => credits,
  creditsRelations: () => creditsRelations,
  currencies: () => currencies,
  exchangeRates: () => exchangeRates,
  guaranteeLetters: () => guaranteeLetters,
  guaranteeLettersRelations: () => guaranteeLettersRelations,
  insertBankSchema: () => insertBankSchema,
  insertCreditSchema: () => insertCreditSchema,
  insertCurrencySchema: () => insertCurrencySchema,
  insertExchangeRateSchema: () => insertExchangeRateSchema,
  insertGuaranteeLetterSchema: () => insertGuaranteeLetterSchema,
  insertProjectSchema: () => insertProjectSchema,
  projects: () => projects,
  projectsRelations: () => projectsRelations
});
import { mysqlTable, varchar, text, decimal, date, datetime, boolean, timestamp } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var projects = mysqlTable("projects", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"),
  createdAt: datetime("created_at").notNull()
});
var banks = mysqlTable("banks", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  name: text("name").notNull(),
  code: text("code"),
  branchName: text("branch_name"),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  status: text("status").notNull().default("active"),
  createdAt: datetime("created_at").notNull()
});
var currencies = mysqlTable("currencies", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  symbol: text("symbol"),
  isActive: boolean("is_active").default(true)
});
var exchangeRates = mysqlTable("exchange_rates", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  fromCurrency: text("from_currency").notNull(),
  toCurrency: text("to_currency").notNull(),
  rate: decimal("rate", { precision: 12, scale: 6 }).notNull(),
  updatedAt: datetime("updated_at").notNull()
});
var guaranteeLetters = mysqlTable("guarantee_letters", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  bankId: varchar("bank_id", { length: 36 }).notNull().references(() => banks.id),
  projectId: varchar("project_id", { length: 36 }).notNull().references(() => projects.id),
  letterType: varchar("letter_type", { length: 50 }).notNull(),
  // teminat, avans, kesin-teminat, gecici-teminat
  contractAmount: decimal("contract_amount", { precision: 15, scale: 2 }).notNull(),
  letterPercentage: decimal("letter_percentage", { precision: 5, scale: 2 }).notNull(),
  letterAmount: decimal("letter_amount", { precision: 15, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(),
  bsmvAndOtherCosts: decimal("bsmv_and_other_costs", { precision: 15, scale: 2 }).default("0").notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  purchaseDate: date("purchase_date").notNull(),
  expiryDate: date("expiry_date"),
  status: varchar("status", { length: 20 }).notNull().default("aktif"),
  // aktif, beklemede, kapali, iptal
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var credits = mysqlTable("credits", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  bankId: varchar("bank_id", { length: 36 }).notNull().references(() => banks.id),
  projectId: varchar("project_id", { length: 36 }).notNull().references(() => projects.id),
  principalAmount: decimal("principal_amount", { precision: 15, scale: 2 }).notNull(),
  interestAmount: decimal("interest_amount", { precision: 15, scale: 2 }).notNull(),
  bsmvAndOtherCosts: decimal("bsmv_and_other_costs", { precision: 15, scale: 2 }).default("0").notNull(),
  totalRepaidAmount: decimal("total_repaid_amount", { precision: 15, scale: 2 }).default("0").notNull(),
  currency: text("currency").notNull(),
  creditDate: date("credit_date").notNull(),
  maturityDate: date("maturity_date").notNull(),
  status: text("status").notNull().default("devam-ediyor"),
  // devam-ediyor, kapali, iptal
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var projectsRelations = relations(projects, ({ many }) => ({
  guaranteeLetters: many(guaranteeLetters),
  credits: many(credits)
}));
var banksRelations = relations(banks, ({ many }) => ({
  guaranteeLetters: many(guaranteeLetters),
  credits: many(credits)
}));
var guaranteeLettersRelations = relations(guaranteeLetters, ({ one }) => ({
  bank: one(banks, {
    fields: [guaranteeLetters.bankId],
    references: [banks.id]
  }),
  project: one(projects, {
    fields: [guaranteeLetters.projectId],
    references: [projects.id]
  })
}));
var creditsRelations = relations(credits, ({ one }) => ({
  bank: one(banks, {
    fields: [credits.bankId],
    references: [banks.id]
  }),
  project: one(projects, {
    fields: [credits.projectId],
    references: [projects.id]
  })
}));
var insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true
});
var insertBankSchema = createInsertSchema(banks).omit({
  id: true,
  createdAt: true
});
var insertCurrencySchema = createInsertSchema(currencies).omit({
  id: true
});
var insertExchangeRateSchema = createInsertSchema(exchangeRates).omit({
  id: true,
  updatedAt: true
});
var insertGuaranteeLetterSchema = createInsertSchema(guaranteeLetters).extend({
  bankId: z.string().min(1, "Banka se\xE7imi gerekli"),
  projectId: z.string().min(1, "Proje se\xE7imi gerekli"),
  letterType: z.string().min(1, "Mektup t\xFCr\xFC se\xE7imi gerekli"),
  contractAmount: z.coerce.number().min(0, "S\xF6zle\u015Fme tutar\u0131 0'dan b\xFCy\xFCk olmal\u0131"),
  letterPercentage: z.coerce.number().min(0, "Y\xFCzde 0'dan b\xFCy\xFCk olmal\u0131"),
  letterAmount: z.coerce.number().min(0, "Mektup tutar\u0131 0'dan b\xFCy\xFCk olmal\u0131"),
  commissionRate: z.coerce.number().min(0, "Komisyon oran\u0131 0'dan b\xFCy\xFCk olmal\u0131"),
  bsmvAndOtherCosts: z.coerce.number().min(0),
  currency: z.string().min(3).max(3, "Para birimi 3 karakter olmal\u0131"),
  purchaseDate: z.coerce.date(),
  expiryDate: z.coerce.date().nullable(),
  status: z.string().default("aktif"),
  notes: z.string().nullable().default("")
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertCreditSchema = createInsertSchema(credits).omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  creditDate: z.coerce.date(),
  maturityDate: z.coerce.date()
});

// server/db.ts
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
var pool = mysql.createPool({
  host: "127.0.0.1",
  user: "kreditakip",
  password: "kreditakip123",
  database: "kreditakip",
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
var db = drizzle(pool, { schema: schema_exports, mode: "default" });

// server/storage.ts
import { eq, desc, and } from "drizzle-orm";

// server/utils.ts
import { randomUUID } from "crypto";
function generateId() {
  return randomUUID();
}

// server/storage.ts
var DatabaseStorage = class {
  // Projects
  async getProjects() {
    return await db.query.projects.findMany({
      orderBy: [desc(projects.createdAt)]
    });
  }
  async getProject(id) {
    return await db.query.projects.findFirst({
      where: eq(projects.id, id)
    });
  }
  async createProject(insertProject) {
    const id = generateId();
    await db.insert(projects).values({
      id,
      ...insertProject,
      status: insertProject.status ?? "active",
      createdAt: /* @__PURE__ */ new Date()
    });
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }
  async updateProject(id, insertProject) {
    await db.update(projects).set({
      ...insertProject
    }).where(eq(projects.id, id));
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }
  async deleteProject(id) {
    await db.delete(projects).where(eq(projects.id, id));
  }
  // Banks
  async getBanks() {
    return await db.query.banks.findMany({
      orderBy: [desc(banks.createdAt)]
    });
  }
  async getBank(id) {
    return await db.query.banks.findFirst({
      where: eq(banks.id, id)
    });
  }
  async createBank(insertBank) {
    const id = generateId();
    await db.insert(banks).values({
      id,
      ...insertBank,
      status: insertBank.status ?? "active",
      createdAt: /* @__PURE__ */ new Date()
    });
    const [bank] = await db.select().from(banks).where(eq(banks.id, id));
    return bank;
  }
  async updateBank(id, insertBank) {
    await db.update(banks).set({
      ...insertBank
    }).where(eq(banks.id, id));
    const [bank] = await db.select().from(banks).where(eq(banks.id, id));
    return bank;
  }
  async deleteBank(id) {
    await db.delete(banks).where(eq(banks.id, id));
  }
  // Currencies
  async getCurrencies() {
    return await db.query.currencies.findMany({
      where: eq(currencies.isActive, true)
    });
  }
  async getCurrency(id) {
    return await db.query.currencies.findFirst({
      where: eq(currencies.id, id)
    });
  }
  async createCurrency(insertCurrency) {
    const id = generateId();
    await db.insert(currencies).values({
      id,
      ...insertCurrency,
      isActive: insertCurrency.isActive ?? true
    });
    const [currency] = await db.select().from(currencies).where(eq(currencies.id, id));
    return currency;
  }
  async updateCurrency(id, insertCurrency) {
    await db.update(currencies).set(insertCurrency).where(eq(currencies.id, id));
    const [currency] = await db.select().from(currencies).where(eq(currencies.id, id));
    return currency;
  }
  // Exchange Rates
  async getExchangeRates() {
    return await db.select().from(exchangeRates).orderBy(desc(exchangeRates.updatedAt));
  }
  async getExchangeRate(fromCurrency, toCurrency) {
    const [rate] = await db.select().from(exchangeRates).where(
      and(
        eq(exchangeRates.fromCurrency, fromCurrency),
        eq(exchangeRates.toCurrency, toCurrency)
      )
    );
    return rate || void 0;
  }
  async createOrUpdateExchangeRate(insertRate) {
    const existing = await this.getExchangeRate(insertRate.fromCurrency, insertRate.toCurrency);
    if (existing) {
      await db.update(exchangeRates).set({
        rate: insertRate.rate,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(exchangeRates.id, existing.id));
      const [rate] = await db.select().from(exchangeRates).where(eq(exchangeRates.id, existing.id));
      return rate;
    } else {
      const id = generateId();
      await db.insert(exchangeRates).values({
        id,
        ...insertRate,
        updatedAt: /* @__PURE__ */ new Date()
      });
      const [rate] = await db.select().from(exchangeRates).where(eq(exchangeRates.id, id));
      return rate;
    }
  }
  // Guarantee Letters
  async getGuaranteeLetters() {
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
        createdAt: banks.createdAt
      },
      project: {
        id: projects.id,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        createdAt: projects.createdAt
      }
    }).from(guaranteeLetters).leftJoin(banks, eq(guaranteeLetters.bankId, banks.id)).leftJoin(projects, eq(guaranteeLetters.projectId, projects.id)).orderBy(desc(guaranteeLetters.createdAt));
    return letters;
  }
  async getGuaranteeLetter(id) {
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
        createdAt: banks.createdAt
      },
      project: {
        id: projects.id,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        createdAt: projects.createdAt
      }
    }).from(guaranteeLetters).leftJoin(banks, eq(guaranteeLetters.bankId, banks.id)).leftJoin(projects, eq(guaranteeLetters.projectId, projects.id)).where(eq(guaranteeLetters.id, id));
    return letter || void 0;
  }
  async createGuaranteeLetter(insertLetter) {
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
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
    const [letter] = await db.select().from(guaranteeLetters).where(eq(guaranteeLetters.id, id));
    return letter;
  }
  async updateGuaranteeLetter(id, insertLetter) {
    const updateData = {};
    if (insertLetter.bankId !== void 0) updateData.bankId = insertLetter.bankId;
    if (insertLetter.projectId !== void 0) updateData.projectId = insertLetter.projectId;
    if (insertLetter.letterType !== void 0) updateData.letterType = insertLetter.letterType;
    if (insertLetter.contractAmount !== void 0) updateData.contractAmount = insertLetter.contractAmount.toString();
    if (insertLetter.letterPercentage !== void 0) updateData.letterPercentage = insertLetter.letterPercentage.toString();
    if (insertLetter.letterAmount !== void 0) updateData.letterAmount = insertLetter.letterAmount.toString();
    if (insertLetter.commissionRate !== void 0) updateData.commissionRate = insertLetter.commissionRate.toString();
    if (insertLetter.bsmvAndOtherCosts !== void 0) updateData.bsmvAndOtherCosts = insertLetter.bsmvAndOtherCosts.toString();
    if (insertLetter.currency !== void 0) updateData.currency = insertLetter.currency;
    if (insertLetter.purchaseDate !== void 0) updateData.purchaseDate = insertLetter.purchaseDate;
    if (insertLetter.expiryDate !== void 0) updateData.expiryDate = insertLetter.expiryDate;
    if (insertLetter.status !== void 0) updateData.status = insertLetter.status;
    if (insertLetter.notes !== void 0) updateData.notes = insertLetter.notes;
    await db.update(guaranteeLetters).set({
      ...updateData
    }).where(eq(guaranteeLetters.id, id));
    const [letter] = await db.select().from(guaranteeLetters).where(eq(guaranteeLetters.id, id));
    return letter;
  }
  async deleteGuaranteeLetter(id) {
    await db.delete(guaranteeLetters).where(eq(guaranteeLetters.id, id));
  }
  async getGuaranteeLettersByProject(projectId) {
    return await db.query.guaranteeLetters.findMany({
      where: eq(guaranteeLetters.projectId, projectId),
      with: {
        bank: true,
        project: true
      },
      orderBy: [desc(guaranteeLetters.createdAt)]
    });
  }
  async getGuaranteeLettersByBank(bankId) {
    return await db.query.guaranteeLetters.findMany({
      where: eq(guaranteeLetters.bankId, bankId),
      with: {
        bank: true,
        project: true
      },
      orderBy: [desc(guaranteeLetters.createdAt)]
    });
  }
  // Credits
  async getCredits() {
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
        createdAt: banks.createdAt
      },
      project: {
        id: projects.id,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        createdAt: projects.createdAt
      }
    }).from(credits).leftJoin(banks, eq(credits.bankId, banks.id)).leftJoin(projects, eq(credits.projectId, projects.id)).orderBy(desc(credits.createdAt));
    return results;
  }
  async getCredit(id) {
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
        createdAt: banks.createdAt
      },
      project: {
        id: projects.id,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        createdAt: projects.createdAt
      }
    }).from(credits).leftJoin(banks, eq(credits.bankId, banks.id)).leftJoin(projects, eq(credits.projectId, projects.id)).where(eq(credits.id, id));
    return credit || void 0;
  }
  async createCredit(insertCredit) {
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
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
    const [credit] = await db.select().from(credits).where(eq(credits.id, id));
    return credit;
  }
  async updateCredit(id, insertCredit) {
    const updateData = {};
    if (insertCredit.bankId !== void 0) updateData.bankId = insertCredit.bankId;
    if (insertCredit.projectId !== void 0) updateData.projectId = insertCredit.projectId;
    if (insertCredit.currency !== void 0) updateData.currency = insertCredit.currency;
    if (insertCredit.principalAmount !== void 0) updateData.principalAmount = insertCredit.principalAmount.toString();
    if (insertCredit.interestAmount !== void 0) updateData.interestAmount = insertCredit.interestAmount.toString();
    if (insertCredit.totalRepaidAmount !== void 0) updateData.totalRepaidAmount = insertCredit.totalRepaidAmount.toString();
    if (insertCredit.creditDate !== void 0) updateData.creditDate = insertCredit.creditDate;
    if (insertCredit.maturityDate !== void 0) updateData.maturityDate = insertCredit.maturityDate;
    if (insertCredit.status !== void 0) updateData.status = insertCredit.status;
    if (insertCredit.notes !== void 0) updateData.notes = insertCredit.notes;
    await db.update(credits).set({
      ...updateData
    }).where(eq(credits.id, id));
    const [credit] = await db.select().from(credits).where(eq(credits.id, id));
    return credit;
  }
  async deleteCredit(id) {
    await db.delete(credits).where(eq(credits.id, id));
  }
  async getCreditsByProject(projectId) {
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
        createdAt: banks.createdAt
      },
      project: {
        id: projects.id,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        createdAt: projects.createdAt
      }
    }).from(credits).leftJoin(banks, eq(credits.bankId, banks.id)).leftJoin(projects, eq(credits.projectId, projects.id)).where(eq(credits.projectId, projectId)).orderBy(desc(credits.createdAt));
    return results;
  }
  async getCreditsByBank(bankId) {
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
        createdAt: banks.createdAt
      },
      project: {
        id: projects.id,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        createdAt: projects.createdAt
      }
    }).from(credits).leftJoin(banks, eq(credits.bankId, banks.id)).leftJoin(projects, eq(credits.projectId, projects.id)).where(eq(credits.bankId, bankId)).orderBy(desc(credits.createdAt));
    return results;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  app2.get("/api/projects", async (req, res) => {
    try {
      const projects2 = await storage.getProjects();
      res.json(projects2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });
  app2.get("/api/projects/:id", async (req, res) => {
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
  app2.post("/api/projects", async (req, res) => {
    try {
      const data = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(data);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });
  app2.get("/api/guarantee-letters", async (req, res) => {
    try {
      const letters = await storage.getGuaranteeLetters();
      res.json(letters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guarantee letters" });
    }
  });
  app2.post("/api/guarantee-letters", async (req, res) => {
    try {
      const data = insertGuaranteeLetterSchema.parse(req.body);
      const letter = await storage.createGuaranteeLetter(data);
      res.status(201).json(letter);
    } catch (error) {
      console.error("Error creating guarantee letter:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create guarantee letter" });
    }
  });
  app2.patch("/api/projects/:id", async (req, res) => {
    try {
      const data = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, data);
      res.json(project);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });
  app2.delete("/api/projects/:id", async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });
  app2.patch("/api/projects/:id", async (req, res) => {
    try {
      const data = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, data);
      res.json(project);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });
  app2.delete("/api/projects/:id", async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });
  app2.get("/api/banks", async (req, res) => {
    try {
      const banks2 = await storage.getBanks();
      res.json(banks2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch banks" });
    }
  });
  app2.get("/api/banks/:id", async (req, res) => {
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
  app2.post("/api/banks", async (req, res) => {
    try {
      const data = insertBankSchema.parse(req.body);
      const bank = await storage.createBank(data);
      res.status(201).json(bank);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create bank" });
    }
  });
  app2.patch("/api/banks/:id", async (req, res) => {
    try {
      const data = insertBankSchema.partial().parse(req.body);
      const bank = await storage.updateBank(req.params.id, data);
      res.json(bank);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update bank" });
    }
  });
  app2.delete("/api/banks/:id", async (req, res) => {
    try {
      await storage.deleteBank(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bank" });
    }
  });
  app2.patch("/api/banks/:id", async (req, res) => {
    try {
      const data = insertBankSchema.partial().parse(req.body);
      const bank = await storage.updateBank(req.params.id, data);
      res.json(bank);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update bank" });
    }
  });
  app2.delete("/api/banks/:id", async (req, res) => {
    try {
      await storage.deleteBank(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bank" });
    }
  });
  app2.get("/api/currencies", async (req, res) => {
    try {
      const currencies2 = await storage.getCurrencies();
      res.json(currencies2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch currencies" });
    }
  });
  app2.post("/api/currencies", async (req, res) => {
    try {
      const data = insertCurrencySchema.parse(req.body);
      const currency = await storage.createCurrency(data);
      res.status(201).json(currency);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create currency" });
    }
  });
  app2.get("/api/exchange-rates", async (req, res) => {
    try {
      const rates = await storage.getExchangeRates();
      res.json(rates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exchange rates" });
    }
  });
  app2.post("/api/exchange-rates", async (req, res) => {
    try {
      const data = insertExchangeRateSchema.parse(req.body);
      const rate = await storage.createOrUpdateExchangeRate(data);
      res.json(rate);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save exchange rate" });
    }
  });
  app2.get("/api/guarantee-letters", async (req, res) => {
    try {
      const { projectId, bankId } = req.query;
      let letters;
      if (projectId) {
        letters = await storage.getGuaranteeLettersByProject(projectId);
      } else if (bankId) {
        letters = await storage.getGuaranteeLettersByBank(bankId);
      } else {
        letters = await storage.getGuaranteeLetters();
      }
      res.json(letters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guarantee letters" });
    }
  });
  app2.get("/api/guarantee-letters/:id", async (req, res) => {
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
  app2.post("/api/guarantee-letters", async (req, res) => {
    try {
      const data = insertGuaranteeLetterSchema.parse(req.body);
      const letter = await storage.createGuaranteeLetter(data);
      res.status(201).json(letter);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create guarantee letter" });
    }
  });
  app2.patch("/api/guarantee-letters/:id", async (req, res) => {
    try {
      const data = insertGuaranteeLetterSchema.partial().parse(req.body);
      const letter = await storage.updateGuaranteeLetter(req.params.id, data);
      res.json(letter);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update guarantee letter" });
    }
  });
  app2.delete("/api/guarantee-letters/:id", async (req, res) => {
    try {
      await storage.deleteGuaranteeLetter(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete guarantee letter" });
    }
  });
  app2.get("/api/credits", async (req, res) => {
    try {
      const { projectId, bankId } = req.query;
      let credits2;
      if (projectId) {
        credits2 = await storage.getCreditsByProject(projectId);
      } else if (bankId) {
        credits2 = await storage.getCreditsByBank(bankId);
      } else {
        credits2 = await storage.getCredits();
      }
      res.json(credits2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credits" });
    }
  });
  app2.get("/api/credits/:id", async (req, res) => {
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
  app2.post("/api/credits", async (req, res) => {
    try {
      const data = insertCreditSchema.parse(req.body);
      const credit = await storage.createCredit(data);
      res.status(201).json(credit);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create credit" });
    }
  });
  app2.patch("/api/credits/:id", async (req, res) => {
    try {
      const data = insertCreditSchema.partial().parse(req.body);
      const credit = await storage.updateCredit(req.params.id, data);
      res.json(credit);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update credit" });
    }
  });
  app2.delete("/api/credits/:id", async (req, res) => {
    try {
      await storage.deleteCredit(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete credit" });
    }
  });
  app2.get("/api/dashboard-stats", async (req, res) => {
    try {
      const targetCurrency = req.query.currency || "TRY";
      const letters = await storage.getGuaranteeLetters();
      const credits2 = await storage.getCredits();
      const projects2 = await storage.getProjects();
      const banks2 = await storage.getBanks();
      const exchangeRates2 = await storage.getExchangeRates();
      const totalLetters = letters.length;
      const activeLetters = letters.filter((l) => l.status === "aktif").length;
      const convertAmount = (amount, fromCurrency, toCurrency) => {
        if (fromCurrency === toCurrency) return amount;
        const rate = exchangeRates2.find(
          (r) => r.fromCurrency === fromCurrency && r.toCurrency === toCurrency || r.fromCurrency === toCurrency && r.toCurrency === fromCurrency
        );
        if (!rate) return amount;
        if (rate.fromCurrency === fromCurrency) {
          return amount * parseFloat(rate.rate.toString());
        } else {
          return amount / parseFloat(rate.rate.toString());
        }
      };
      const totalLetterAmount = letters.reduce((sum, letter) => {
        const amount = parseFloat(letter.letterAmount || "0");
        return sum + convertAmount(amount, letter.currency, targetCurrency);
      }, 0);
      const totalCredits = credits2.length;
      const activeCredits = credits2.filter((c) => c.status === "devam-ediyor").length;
      const totalCreditAmount = credits2.reduce((sum, credit) => {
        const amount = parseFloat(credit.principalAmount || "0") + parseFloat(credit.interestAmount || "0");
        return sum + convertAmount(amount, credit.currency, targetCurrency);
      }, 0);
      const totalRepaidAmount = credits2.reduce((sum, credit) => {
        const amount = parseFloat(credit.totalRepaidAmount || "0");
        return sum + convertAmount(amount, credit.currency, targetCurrency);
      }, 0);
      const today = /* @__PURE__ */ new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1e3);
      const upcomingLetterPayments = letters.filter((letter) => {
        if (!letter.expiryDate) return false;
        const expiryDate = new Date(letter.expiryDate);
        return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
      }).length;
      const upcomingCreditPayments = credits2.filter((credit) => {
        const maturityDate = new Date(credit.maturityDate);
        return maturityDate >= today && maturityDate <= thirtyDaysFromNow && credit.status === "devam-ediyor";
      }).length;
      const overdueLetterPayments = letters.filter((letter) => {
        if (!letter.expiryDate) return false;
        const expiryDate = new Date(letter.expiryDate);
        return expiryDate < today && letter.status === "aktif";
      }).length;
      const overdueCreditPayments = credits2.filter((credit) => {
        const maturityDate = new Date(credit.maturityDate);
        return maturityDate < today && credit.status === "devam-ediyor";
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
        totalProjects: projects2.length,
        totalBanks: banks2.length,
        currency: targetCurrency
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
var vite_config_default = defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
