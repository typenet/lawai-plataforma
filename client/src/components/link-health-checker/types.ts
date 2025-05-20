export interface LinkCheckResult {
  url: string;
  status: 'healthy' | 'broken' | 'redirected' | 'pending';
  statusCode?: number;
  redirectTo?: string;
  responseTime?: number;
  lastChecked: Date;
  context: string;  // Onde o link está no sistema (ex: "Dashboard", "Menu", "Documento")
  importance: 'critical' | 'high' | 'medium' | 'low';
  error?: string;
}

export interface LinkCheckStats {
  total: number;
  healthy: number;
  broken: number;
  redirected: number;
  pending: number;
  avgResponseTime: number;
  lastFullCheck: Date;
}

export interface Link {
  url: string;
  label: string;
  context: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
}