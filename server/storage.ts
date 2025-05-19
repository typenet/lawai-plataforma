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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte } from "drizzle-orm";

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
  
  // Usage statistics
  getUserStats(userId: string): Promise<{
    searchCount: number;
    documentsCount: number;
    planUsagePercent: number;
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
  
  // Usage statistics
  async getUserStats(userId: string): Promise<{
    searchCount: number;
    documentsCount: number;
    planUsagePercent: number;
  }> {
    // Get search count for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [searchCountResult] = await db
      .select({ count: searches.id.count() })
      .from(searches)
      .where(
        and(
          eq(searches.userId, userId),
          gte(searches.createdAt, thirtyDaysAgo)
        )
      );
    
    const [documentsCountResult] = await db
      .select({ count: documents.id.count() })
      .from(documents)
      .where(
        and(
          eq(documents.userId, userId),
          gte(documents.createdAt, thirtyDaysAgo)
        )
      );
    
    // Calculate plan usage (mock calculation for now)
    const searchCount = Number(searchCountResult?.count || 0);
    const documentsCount = Number(documentsCountResult?.count || 0);
    
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
    };
  }
}

export const storage = new DatabaseStorage();
