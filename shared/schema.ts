import { mysqlTable, varchar, text, decimal, date, datetime, boolean, timestamp } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = mysqlTable("projects", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"),
  createdAt: datetime("created_at").notNull(),
});

export const banks = mysqlTable("banks", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  name: text("name").notNull(),
  code: text("code"),
  branchName: text("branch_name"),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  status: text("status").notNull().default("active"),
  createdAt: datetime("created_at").notNull(),
});

export const currencies = mysqlTable("currencies", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  symbol: text("symbol"),
  isActive: boolean("is_active").default(true),
});

export const exchangeRates = mysqlTable("exchange_rates", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  fromCurrency: text("from_currency").notNull(),
  toCurrency: text("to_currency").notNull(),
  rate: decimal("rate", { precision: 12, scale: 6 }).notNull(),
  updatedAt: datetime("updated_at").notNull(),
});

export const guaranteeLetters = mysqlTable("guarantee_letters", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  bankId: varchar("bank_id", { length: 36 }).notNull().references(() => banks.id),
  projectId: varchar("project_id", { length: 36 }).notNull().references(() => projects.id),
  letterType: text("letter_type").notNull(), // teminat, avans, kesin-teminat, gecici-teminat
  contractAmount: decimal("contract_amount", { precision: 15, scale: 2 }).notNull(),
  letterPercentage: decimal("letter_percentage", { precision: 5, scale: 2 }).notNull(),
  letterAmount: decimal("letter_amount", { precision: 15, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(),
  bsmvAndOtherCosts: decimal("bsmv_and_other_costs", { precision: 15, scale: 2 }).default("0").notNull(),
  currency: text("currency").notNull(),
  purchaseDate: date("purchase_date").notNull(),
  letterDate: date("letter_date").notNull(),
  expiryDate: date("expiry_date"),
  status: text("status").notNull().default("aktif"), // aktif, beklemede, kapali, iptal
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const credits = mysqlTable("credits", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  bankId: varchar("bank_id", { length: 36 }).notNull().references(() => banks.id),
  projectId: varchar("project_id", { length: 36 }).notNull().references(() => projects.id),
  principalAmount: decimal("principal_amount", { precision: 15, scale: 2 }).notNull(),
  interestAmount: decimal("interest_amount", { precision: 15, scale: 2 }).notNull(),
  totalRepaidAmount: decimal("total_repaid_amount", { precision: 15, scale: 2 }).default("0").notNull(),
  currency: text("currency").notNull(),
  creditDate: date("credit_date").notNull(),
  maturityDate: date("maturity_date").notNull(),
  status: text("status").notNull().default("devam-ediyor"), // devam-ediyor, kapali, iptal
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  guaranteeLetters: many(guaranteeLetters),
  credits: many(credits),
}));

export const banksRelations = relations(banks, ({ many }) => ({
  guaranteeLetters: many(guaranteeLetters),
  credits: many(credits),
}));

export const guaranteeLettersRelations = relations(guaranteeLetters, ({ one }) => ({
  bank: one(banks, {
    fields: [guaranteeLetters.bankId],
    references: [banks.id],
  }),
  project: one(projects, {
    fields: [guaranteeLetters.projectId],
    references: [projects.id],
  }),
}));

export const creditsRelations = relations(credits, ({ one }) => ({
  bank: one(banks, {
    fields: [credits.bankId],
    references: [banks.id],
  }),
  project: one(projects, {
    fields: [credits.projectId],
    references: [projects.id],
  }),
}));

// Schemas
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertBankSchema = createInsertSchema(banks).omit({
  id: true,
  createdAt: true,
});

export const insertCurrencySchema = createInsertSchema(currencies).omit({
  id: true,
});

export const insertExchangeRateSchema = createInsertSchema(exchangeRates).omit({
  id: true,
  updatedAt: true,
});

export const insertGuaranteeLetterSchema = createInsertSchema(guaranteeLetters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCreditSchema = createInsertSchema(credits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  creditDate: z.coerce.date(),
  maturityDate: z.coerce.date(),
});

// Types
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Bank = typeof banks.$inferSelect;
export type InsertBank = z.infer<typeof insertBankSchema>;

export type Currency = typeof currencies.$inferSelect;
export type InsertCurrency = z.infer<typeof insertCurrencySchema>;

export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type InsertExchangeRate = z.infer<typeof insertExchangeRateSchema>;

export type GuaranteeLetter = typeof guaranteeLetters.$inferSelect;
export type InsertGuaranteeLetter = z.infer<typeof insertGuaranteeLetterSchema>;

export type Credit = typeof credits.$inferSelect;
export type InsertCredit = z.infer<typeof insertCreditSchema>;

// Extended types with relations
export type GuaranteeLetterWithRelations = GuaranteeLetter & {
  bank: Bank | null;
  project: Project | null;
};

export type CreditWithRelations = Credit & {
  bank: Bank | null;
  project: Project | null;
};
