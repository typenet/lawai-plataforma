// User types
export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  subscription?: Subscription;
}

// Subscription types
export interface Subscription {
  id: string;
  planId: string;
  status: "active" | "canceled" | "expired";
  createdAt: string;
  expiresAt: string;
}

// Dashboard stats
export interface DashboardStats {
  searchCount: number;
  documentsCount: number;
  planUsagePercent: number;
  currentPlanId: string;
  currentPlanName: string;
}

// Search types
export interface SearchResult {
  id: string;
  title: string;
  summary: string;
  source: "jurisprudence" | "doctrine" | "legislation";
  reference: string;
  createdAt: string;
  createdAgo: string;
}

// Document types
export interface AnalyzedDocument {
  id: string;
  title: string;
  fileType: string;
  fileInfo: string;
  status: "complete" | "issues_found" | "incomplete" | "processing";
  analysis: string;
  createdAt: string;
  createdAgo: string;
}
