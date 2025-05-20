import { Request, Response, NextFunction } from "express";
import session from "express-session";

// Configuração simplificada para sessão
export function getSessionConfig() {
  return session({
    secret: process.env.SESSION_SECRET || "desenvolvimento-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000 // Uma semana
    }
  });
}

// Middleware para simular autenticação em desenvolvimento
export function devAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  // Adicionar propriedades de autenticação ao request
  (req as any).isAuthenticated = () => true;
  (req as any).user = {
    claims: {
      sub: "999999"
    }
  };
  next();
}

// Middleware que simula verificação de autenticação
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // Em desenvolvimento, sempre passa
  next();
}