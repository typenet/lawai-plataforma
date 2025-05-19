import {
  users,
  type User,
  type UpsertUser,
  searches,
  type Search,
  type InsertSearch,
  documents,
  type Document,
  type InsertDocument,
  subscriptions,
  type Subscription,
  type InsertSubscription,
  clients,
  type Client,
  type InsertClient,
  cases,
  type Case,
  type InsertCase,
  deadlines,
  type Deadline,
  type InsertDeadline
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, isNull, not, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Search operations
  createSearch(search: InsertSearch): Promise<Search>;
  getUserSearches(userId: string, limit?: number): Promise<Search[]>;
  getSearch(id: string): Promise<Search | undefined>;
  
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getUserDocuments(userId: string, limit?: number): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  
  // Subscription operations
  getUserSubscription(userId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription>;
  
  // Client operations
  createClient(client: InsertClient): Promise<Client>;
  getClient(id: number): Promise<Client | undefined>;
  updateClient(id: number, updates: Partial<Client>): Promise<Client>;
  getUserClients(userId: string, limit?: number): Promise<Client[]>;
  deleteClient(id: number): Promise<boolean>;
  
  // Case operations
  createCase(caseData: InsertCase): Promise<Case>;
  getCase(id: number): Promise<Case | undefined>;
  updateCase(id: number, updates: Partial<Case>): Promise<Case>;
  getUserCases(userId: string, limit?: number): Promise<Case[]>;
  getClientCases(clientId: number): Promise<Case[]>;
  deleteCase(id: number): Promise<boolean>;
  
  // Deadline operations
  createDeadline(deadline: InsertDeadline): Promise<Deadline>;
  getDeadline(id: number): Promise<Deadline | undefined>;
  updateDeadline(id: number, updates: Partial<Deadline>): Promise<Deadline>;
  getUserDeadlines(userId: string, limit?: number): Promise<Deadline[]>;
  getCaseDeadlines(caseId: number): Promise<Deadline[]>;
  getPendingDeadlines(userId: string, daysAhead?: number): Promise<Deadline[]>;
  completeDeadline(id: number): Promise<Deadline>;
  deleteDeadline(id: number): Promise<boolean>;
  
  // Usage statistics
  getUserStats(userId: string): Promise<{
    searchCount: number;
    documentsCount: number;
    planUsagePercent: number;
    clientsCount?: number;
    casesCount?: number;
    pendingDeadlinesCount?: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  // Search operations
  async createSearch(search: InsertSearch): Promise<Search> {
    const [newSearch] = await db.insert(searches).values(search).returning();
    return newSearch;
  }
  
  async getUserSearches(userId: string, limit = 10): Promise<Search[]> {
    return await db
      .select()
      .from(searches)
      .where(eq(searches.userId, userId))
      .orderBy(desc(searches.createdAt))
      .limit(limit);
  }
  
  async getSearch(id: string): Promise<Search | undefined> {
    const [search] = await db.select().from(searches).where(eq(searches.id, id));
    return search;
  }
  
  // Document operations
  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }
  
  async getUserDocuments(userId: string, limit = 10): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.createdAt))
      .limit(limit);
  }
  
  async getDocument(id: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }
  
  // Subscription operations
  async getUserSubscription(userId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, "active"),
          gte(subscriptions.expiresAt, new Date())
        )
      );
    return subscription;
  }
  
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db.insert(subscriptions).values(subscription).returning();
    return newSubscription;
  }
  
  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription> {
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, id))
      .returning();
    return updatedSubscription;
  }
  
  // Client operations
  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async updateClient(id: number, updates: Partial<Client>): Promise<Client> {
    const [updatedClient] = await db
      .update(clients)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, id))
      .returning();
    return updatedClient;
  }

  async getUserClients(userId: string, limit = 50): Promise<Client[]> {
    return await db
      .select()
      .from(clients)
      .where(eq(clients.userId, userId))
      .orderBy(desc(clients.updatedAt))
      .limit(limit);
  }

  async deleteClient(id: number): Promise<boolean> {
    try {
      await db.delete(clients).where(eq(clients.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting client:", error);
      return false;
    }
  }

  // Case operations
  async createCase(caseData: InsertCase): Promise<Case> {
    const [newCase] = await db.insert(cases).values(caseData).returning();
    return newCase;
  }

  async getCase(id: number): Promise<Case | undefined> {
    const [caseData] = await db.select().from(cases).where(eq(cases.id, id));
    return caseData;
  }

  async updateCase(id: number, updates: Partial<Case>): Promise<Case> {
    const [updatedCase] = await db
      .update(cases)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(cases.id, id))
      .returning();
    return updatedCase;
  }

  async getUserCases(userId: string, limit = 50): Promise<Case[]> {
    return await db
      .select()
      .from(cases)
      .where(eq(cases.userId, userId))
      .orderBy(desc(cases.updatedAt))
      .limit(limit);
  }

  async getClientCases(clientId: number): Promise<Case[]> {
    return await db
      .select()
      .from(cases)
      .where(eq(cases.clientId, clientId))
      .orderBy(desc(cases.updatedAt));
  }

  async deleteCase(id: number): Promise<boolean> {
    try {
      await db.delete(cases).where(eq(cases.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting case:", error);
      return false;
    }
  }

  // Deadline operations
  async createDeadline(deadline: InsertDeadline): Promise<Deadline> {
    const [newDeadline] = await db.insert(deadlines).values(deadline).returning();
    return newDeadline;
  }

  async getDeadline(id: number): Promise<Deadline | undefined> {
    const [deadline] = await db.select().from(deadlines).where(eq(deadlines.id, id));
    return deadline;
  }

  async updateDeadline(id: number, updates: Partial<Deadline>): Promise<Deadline> {
    const [updatedDeadline] = await db
      .update(deadlines)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(deadlines.id, id))
      .returning();
    return updatedDeadline;
  }

  async getUserDeadlines(userId: string, limit = 50): Promise<Deadline[]> {
    return await db
      .select()
      .from(deadlines)
      .where(eq(deadlines.userId, userId))
      .orderBy(desc(deadlines.updatedAt))
      .limit(limit);
  }

  async getCaseDeadlines(caseId: number): Promise<Deadline[]> {
    return await db
      .select()
      .from(deadlines)
      .where(eq(deadlines.caseId, caseId))
      .orderBy(deadlines.dueDate);
  }

  async getPendingDeadlines(userId: string, daysAhead = 7): Promise<Deadline[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    const todayStr = today.toISOString().split('T')[0];
    const futureDateStr = futureDate.toISOString().split('T')[0];
    
    return await db
      .select()
      .from(deadlines)
      .where(
        and(
          eq(deadlines.userId, userId),
          eq(deadlines.completed, false),
          sql`${deadlines.dueDate} >= ${todayStr}`,
          sql`${deadlines.dueDate} <= ${futureDateStr}`
        )
      )
      .orderBy(deadlines.dueDate);
  }

  async completeDeadline(id: number): Promise<Deadline> {
    const [updatedDeadline] = await db
      .update(deadlines)
      .set({
        completed: true,
        updatedAt: new Date(),
      })
      .where(eq(deadlines.id, id))
      .returning();
    return updatedDeadline;
  }

  async deleteDeadline(id: number): Promise<boolean> {
    try {
      await db.delete(deadlines).where(eq(deadlines.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting deadline:", error);
      return false;
    }
  }

  // Usage statistics
  async getUserStats(userId: string): Promise<{
    searchCount: number;
    documentsCount: number;
    planUsagePercent: number;
    clientsCount: number;
    casesCount: number;
    pendingDeadlinesCount: number;
  }> {
    // Get statistics for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Pesquisas recentes
    const userSearches = await db
      .select()
      .from(searches)
      .where(
        and(
          eq(searches.userId, userId),
          gte(searches.createdAt, thirtyDaysAgo)
        )
      );
    
    // Documentos recentes
    const userDocuments = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.userId, userId),
          gte(documents.createdAt, thirtyDaysAgo)
        )
      );
    
    // Total de clientes
    const userClients = await db
      .select()
      .from(clients)
      .where(eq(clients.userId, userId));
    
    // Total de casos
    const userCases = await db
      .select()
      .from(cases)
      .where(eq(cases.userId, userId));
    
    // Prazos pendentes
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14); // próximos 14 dias
    
    const todayStr = today.toISOString().split('T')[0];
    const futureDateStr = futureDate.toISOString().split('T')[0];
    
    const pendingDeadlines = await db
      .select()
      .from(deadlines)
      .where(
        and(
          eq(deadlines.userId, userId),
          eq(deadlines.completed, false),
          sql`${deadlines.dueDate} >= ${todayStr}`,
          sql`${deadlines.dueDate} <= ${futureDateStr}`
        )
      );
    
    const searchCount = userSearches.length;
    const documentsCount = userDocuments.length;
    const clientsCount = userClients.length;
    const casesCount = userCases.length;
    const pendingDeadlinesCount = pendingDeadlines.length;
    
    // Get user's subscription to determine the plan limits
    const subscription = await this.getUserSubscription(userId);
    let planUsagePercent = 0;
    
    if (subscription) {
      // Basic plan: 30 searches, 10 documents
      // Professional plan: 100 searches, 30 documents
      // Enterprise plan: unlimited
      
      if (subscription.planId === "basic") {
        const searchUsage = (searchCount / 30) * 100;
        const documentUsage = (documentsCount / 10) * 100;
        planUsagePercent = Math.max(searchUsage, documentUsage);
      } else if (subscription.planId === "professional") {
        const searchUsage = (searchCount / 100) * 100;
        const documentUsage = (documentsCount / 30) * 100;
        planUsagePercent = Math.max(searchUsage, documentUsage);
      } else {
        // Enterprise plan has unlimited usage
        planUsagePercent = Math.min((searchCount + documentsCount) / 200 * 100, 100);
      }
    }
    
    return {
      searchCount,
      documentsCount,
      planUsagePercent: Math.round(planUsagePercent),
      clientsCount,
      casesCount,
      pendingDeadlinesCount
    };
  }
}

export const storage = new DatabaseStorage();
