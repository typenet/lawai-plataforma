import {
  pgTable,
  text,
  varchar,
  json,
  timestamp,
  jsonb,
  index,
  boolean,
  date,
  integer,
  serial
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  planId: varchar("plan_id").notNull(), // basic, professional, enterprise
  status: varchar("status").notNull(), // active, canceled, expired
  createdAt: timestamp("created_at").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

// Searches table
export const searches = pgTable("searches", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  query: text("query").notNull(),
  sources: json("sources").notNull(), // { jurisprudence: true, doctrine: true, legislation: true }
  results: json("results"), // Array of results from the AI
  createdAt: timestamp("created_at").notNull(),
});

// Documents table
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  fileType: varchar("file_type").notNull(), // pdf, doc, docx
  fileInfo: varchar("file_info"), // Size, pages, etc.
  filePath: varchar("file_path"), // Path to the file
  analysis: text("analysis"), // JSON string with analysis results
  status: varchar("status").notNull(), // complete, issues_found, incomplete
  createdAt: timestamp("created_at").notNull(),
});

// Schema for inserting a new user
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Schema for subscription
export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// Schema for searches
export const insertSearchSchema = createInsertSchema(searches);
export type InsertSearch = z.infer<typeof insertSearchSchema>;
export type Search = typeof searches.$inferSelect;

// Schema for documents
export const insertDocumentSchema = createInsertSchema(documents);
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// Clients table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  documentType: varchar("document_type", { length: 20 }).notNull(), // CPF, CNPJ
  documentNumber: varchar("document_number", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Casos/Processos table
export const cases = pgTable("cases", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  clientId: integer("client_id").notNull().references(() => clients.id),
  caseNumber: varchar("case_number", { length: 50 }).notNull(),
  caseType: varchar("case_type", { length: 100 }).notNull(), // Civil, Criminal, Trabalhista, etc.
  court: varchar("court", { length: 100 }), // Tribunal onde tramita
  subject: text("subject").notNull(), // Assunto/Tema principal
  description: text("description"),
  status: varchar("status", { length: 30 }).notNull(), // Ativo, Arquivado, Encerrado, etc.
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Prazos Processuais table
export const deadlines = pgTable("deadlines", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  caseId: integer("case_id").notNull().references(() => cases.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: date("due_date").notNull(),
  completed: boolean("completed").default(false).notNull(),
  priority: varchar("priority", { length: 20 }).notNull().default("medium"), // high, medium, low
  notifyDaysBefore: integer("notify_days_before").default(3),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Schema for clients
export const insertClientSchema = createInsertSchema(clients, {
  documentNumber: z.string().min(11).max(18),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(10).max(20).optional().nullable(),
});
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

// Schema for cases
export const insertCaseSchema = createInsertSchema(cases);
export type InsertCase = z.infer<typeof insertCaseSchema>;
export type Case = typeof cases.$inferSelect;

// Schema for deadlines
export const insertDeadlineSchema = createInsertSchema(deadlines);
export type InsertDeadline = z.infer<typeof insertDeadlineSchema>;
export type Deadline = typeof deadlines.$inferSelect;

// Tabela de configurações do usuário
export const userSettings = pgTable("user_settings", {
  id: varchar("id", { length: 36 }).primaryKey().defaultRandom().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  logoPath: varchar("logo_path"),
  signaturePath: varchar("signature_path"),
  address: text("address"),
  oabNumber: varchar("oab_number"),
  useWatermark: boolean("use_watermark").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({ id: true });
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
