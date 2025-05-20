import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Ambiente de desenvolvimento usa armazenamento em memória para sessões
  if (process.env.NODE_ENV !== 'production' || !process.env.REPLIT_DOMAINS) {
    console.log("Usando armazenamento de sessão em memória para desenvolvimento");
    return session({
      secret: process.env.SESSION_SECRET || 'dev-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false, // Em desenvolvimento, podemos usar HTTP
        maxAge: sessionTtl,
      },
    });
  }
  
  // Ambiente de produção usa PostgreSQL
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Configuração específica para desenvolvimento local
  const isDevelopment = process.env.NODE_ENV !== 'production' || !process.env.REPLIT_DOMAINS;

  if (isDevelopment) {
    console.log("Iniciando em modo de desenvolvimento com autenticação local");
    
    // Adiciona rota para login de desenvolvimento
    app.get("/api/login", (req, res) => {
      // Cria um usuário de teste
      const testUser = {
        claims: {
          sub: "999999",
          email: "teste@exemplo.com",
          first_name: "Usuário",
          last_name: "Teste",
          profile_image_url: "https://ui-avatars.com/api/?name=Dev&background=9F85FF&color=fff",
          exp: Math.floor(Date.now() / 1000) + 3600 * 24
        },
        access_token: "dev-access-token",
        refresh_token: "dev-refresh-token",
        expires_at: Math.floor(Date.now() / 1000) + 3600 * 24
      };

      // Salva o usuário na sessão
      req.login(testUser, async () => {
        // Adicionar usuário ao banco de dados
        await storage.upsertUser({
          id: testUser.claims.sub,
          email: testUser.claims.email,
          firstName: testUser.claims.first_name,
          lastName: testUser.claims.last_name,
          profileImageUrl: testUser.claims.profile_image_url,
        });
        
        res.redirect("/dashboard");
      });
    });

    // Adiciona rota para logout
    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        res.redirect("/");
      });
    });

    // Rota de callback para desenvolvimento
    app.get("/api/callback", (req, res) => {
      res.redirect("/dashboard");
    });

    return; // Não configura as estratégias do Replit em desenvolvimento
  }

  // Configuração de produção com Replit Auth
  try {
    const config = await getOidcConfig();

    const verify: VerifyFunction = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      verified: passport.AuthenticateCallback
    ) => {
      const user = {};
      updateUserSession(user, tokens);
      await upsertUser(tokens.claims());
      verified(null, user);
    };

    if (process.env.REPLIT_DOMAINS) {
      for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
        const strategy = new Strategy(
          {
            name: `replitauth:${domain}`,
            config,
            scope: "openid email profile offline_access",
            callbackURL: `https://${domain}/api/callback`,
          },
          verify,
        );
        passport.use(strategy);
      }
    }
  } catch (error) {
    console.error("Erro ao configurar autenticação Replit:", error);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Configuração específica para desenvolvimento local
  if (process.env.NODE_ENV !== 'production' || !process.env.REPLIT_DOMAINS) {
    console.log("Configurando rotas de autenticação para ambiente de desenvolvimento");
    
    // Rota simplificada para login em desenvolvimento
    app.get("/api/login", (req, res) => {
      // Cria um usuário de teste
      const testUser = {
        claims: {
          sub: "999999",
          email: "teste@exemplo.com",
          first_name: "Usuário",
          last_name: "Teste",
          profile_image_url: "https://ui-avatars.com/api/?name=Dev&background=9F85FF&color=fff",
          exp: Math.floor(Date.now() / 1000) + 3600 * 24
        },
        access_token: "dev-access-token",
        refresh_token: "dev-refresh-token",
        expires_at: Math.floor(Date.now() / 1000) + 3600 * 24
      };

      // Salva o usuário na sessão
      req.login(testUser, async () => {
        // Adicionar usuário ao banco de dados
        await storage.upsertUser({
          id: testUser.claims.sub,
          email: testUser.claims.email,
          firstName: testUser.claims.first_name,
          lastName: testUser.claims.last_name,
          profileImageUrl: testUser.claims.profile_image_url,
        });
        
        res.redirect("/dashboard");
      });
    });
    
    // Rota para logout simplificada
    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        res.redirect("/");
      });
    });
    
    // Rota de callback para desenvolvimento
    app.get("/api/callback", (req, res) => {
      res.redirect("/dashboard");
    });
  } else {
    // Configuração de produção com Replit Auth
    app.get("/api/login", (req, res, next) => {
      passport.authenticate(`replitauth:${req.hostname}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    });

    app.get("/api/callback", (req, res, next) => {
      passport.authenticate(`replitauth:${req.hostname}`, {
        successReturnToOrRedirect: "/",
        failureRedirect: "/api/login",
      })(req, res, next);
    });

    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        try {
          // Simplificado para evitar problemas com async/await
          res.redirect("/");
        } catch (error) {
          console.error("Erro ao fazer logout:", error);
          res.redirect("/");
        }
      });
    });
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Em desenvolvimento, permitir acesso sem autenticação ou com autenticação simplificada
  if (process.env.NODE_ENV !== 'production' || !process.env.REPLIT_DOMAINS) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return next();
  }
  
  // Em produção, usar o comportamento padrão com refresh token
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    return res.redirect("/api/login");
  }

  try {
    const oidcConfig = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(oidcConfig, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    return res.redirect("/api/login");
  }
};
