import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { getSessionConfig, devAuthMiddleware } from "./simpleAuth";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuração de sessão simplificada
app.use(getSessionConfig());

// Middleware de autenticação simplificada para desenvolvimento
app.use(devAuthMiddleware);

// Endpoint de autenticação para desenvolvimento
app.get('/api/auth/user', (req, res) => {
  // Usuário de teste para desenvolvimento
  const mockUser = {
    id: "999999",
    email: "advogado@exemplo.com",
    firstName: "Advogado",
    lastName: "Exemplo",
    profileImageUrl: "https://ui-avatars.com/api/?name=Advogado&background=9F85FF&color=fff",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subscription: {
      id: "sub_1",
      planId: "professional",
      status: "active",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  };
  res.json(mockUser);
});

// Endpoint para estatísticas de dashboard
app.get('/api/dashboard/stats', (req, res) => {
  const mockStats = {
    searchCount: 24,
    documentsCount: 15,
    planUsagePercent: 65,
    clientsCount: 8,
    casesCount: 12,
    pendingDeadlinesCount: 5,
    currentPlanId: "professional",
    currentPlanName: "Profissional"
  };
  res.json(mockStats);
});

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Função principal para iniciar o servidor
async function main() {
  try {
    const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
