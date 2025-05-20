import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import * as aiService from "./ai-service";
import aiRoutes from "./routes/ai";
import clientRoutes from "./routes/clients";
import caseRoutes from "./routes/cases";
import deadlineRoutes from "./routes/deadlines";
import linkHealthRoutes from "./routes/link-health";
import settingsRoutes from "./routes/settings";
import express from "express";
import { 
  analyzeDocument, 
  legalSearch, 
  recommendDocuments 
} from "./openai";
import multer from "multer";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as path from "path";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// Setup multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC and DOCX are allowed.'));
    }
  }
});

// Helper function to format dates
function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
}

// Plan configuration
const plans = {
  basic: {
    name: "Básico",
    searchLimit: 30,
    documentLimit: 10,
    features: ["basic_search", "basic_document_analysis", "basic_templates"]
  },
  professional: {
    name: "Profissional",
    searchLimit: 100,
    documentLimit: 30,
    features: ["advanced_search", "document_analysis", "all_templates", "jurisprudence_search"]
  },
  enterprise: {
    name: "Enterprise",
    searchLimit: 999999, // Effectively unlimited
    documentLimit: 999999, // Effectively unlimited
    features: ["advanced_search", "document_analysis", "all_templates", "jurisprudence_search", "virtual_assistant"]
  }
};

// Request schema validators
const searchRequestSchema = z.object({
  query: z.string().min(3),
  sources: z.object({
    jurisprudence: z.boolean().default(true),
    doctrine: z.boolean().default(true),
    legislation: z.boolean().default(true),
  })
});

const subscriptionUpdateSchema = z.object({
  planId: z.enum(["basic", "professional", "enterprise"])
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Não inicializar autenticação Replit em desenvolvimento
  // para evitar problemas com login
  
  // Rotas de IA
  app.use('/api/ai', aiRoutes);
  
  // Rotas de clientes, casos e prazos
  app.use('/api/clients', clientRoutes);
  app.use('/api/cases', caseRoutes);
  app.use('/api/deadlines', deadlineRoutes);
  app.use('/api/link-health', linkHealthRoutes);
  app.use('/api/settings', settingsRoutes);
  
  // Servir arquivos estáticos de uploads
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // Rota de usuário para desenvolvimento (retorna usuário mockado para todos os pedidos)
  app.get('/api/auth/user', async (req: any, res) => {
    // Sempre retorna um usuário de desenvolvimento para facilitar o teste
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
  
  // Configurações do usuário
  app.get('/api/settings', async (req: any, res) => {
    const userId = req.user?.claims?.sub || '999999';
    
    // Dados básicos para desenvolvimento
    const settings = {
      id: "settings_1",
      userId: userId,
      logoPath: null,
      signaturePath: null,
      address: "Avenida Paulista, 1000, cj. 101, São Paulo - SP",
      oabNumber: "123456-SP",
      useWatermark: true,
      logoUrl: null,
      signatureUrl: null
    };
    
    res.json(settings);
  });
  
  // Rota de logout
  app.get('/api/logout', (req: any, res) => {
    // Em ambiente de desenvolvimento, apenas redireciona
    res.redirect('/');
  });

  // Dashboard stats - Simplificado para desenvolvimento
  app.get('/api/dashboard/stats', async (req: any, res) => {
    try {
      // Usar ID de usuário fixo para desenvolvimento
      const userId = "999999";
      
      // Dados simulados para desenvolvimento
      const stats = {
        searchCount: 24,
        documentsCount: 15,
        planUsagePercent: 65,
        clientsCount: 8,
        casesCount: 12,
        pendingDeadlinesCount: 5
      };
      
      // Dados de plano simulados
      const currentPlanId = "professional"; 
      const currentPlanName = "Profissional";
      
      res.json({
        ...stats,
        currentPlanId,
        currentPlanName
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Search endpoints
  app.post('/api/search', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request
      const validatedData = searchRequestSchema.parse(req.body);
      
      // Get user's subscription to check limits
      const subscription = await storage.getUserSubscription(userId);
      const planId = subscription?.planId || "basic";
      const plan = plans[planId as keyof typeof plans];
      
      // Check if user has reached search limit
      const stats = await storage.getUserStats(userId);
      if (stats.searchCount >= plan.searchLimit) {
        return res.status(403).json({
          message: `Você atingiu o limite de ${plan.searchLimit} pesquisas do seu plano. Faça upgrade para continuar.`
        });
      }
      
      // Perform search with OpenAI
      const searchResults = await legalSearch(
        validatedData.query,
        validatedData.sources
      );
      
      // Save search to database
      const searchId = uuidv4();
      await storage.createSearch({
        id: searchId,
        userId,
        query: validatedData.query,
        sources: validatedData.sources,
        results: searchResults.results,
        createdAt: new Date()
      });
      
      res.json({ success: true, searchId });
    } catch (error) {
      console.error("Error performing search:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid search request", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to perform search" });
    }
  });

  app.get('/api/search/results', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get most recent searches
      const userSearches = await storage.getUserSearches(userId, 10);
      
      // Format the results
      const formattedResults = userSearches.flatMap(search => {
        // Each search might have multiple results, so we flatten them
        const results = search.results || [];
        return (Array.isArray(results) ? results : []).map((result: any, index: number) => ({
          id: `${search.id}-${index}`,
          title: result.title,
          summary: result.summary,
          source: result.source,
          reference: result.reference,
          createdAt: search.createdAt.toISOString(),
          createdAgo: formatRelativeTime(search.createdAt)
        }));
      });
      
      res.json({
        results: formattedResults,
        totalResults: formattedResults.length,
        currentPage: 1,
        totalPages: 1
      });
    } catch (error) {
      console.error("Error fetching search results:", error);
      res.status(500).json({ message: "Failed to fetch search results" });
    }
  });

  // Document analysis endpoints
  app.post('/api/documents/analyze', isAuthenticated, upload.single('document'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const userId = req.user.claims.sub;
      
      // Get user's subscription to check limits
      const subscription = await storage.getUserSubscription(userId);
      const planId = subscription?.planId || "basic";
      const plan = plans[planId as keyof typeof plans];
      
      // Check if user has reached document limit
      const stats = await storage.getUserStats(userId);
      if (stats.documentsCount >= plan.documentLimit) {
        return res.status(403).json({
          message: `Você atingiu o limite de ${plan.documentLimit} documentos do seu plano. Faça upgrade para continuar.`
        });
      }
      
      // Extract text from document (simplified - in production would use pdf-parse/mammoth)
      // For this implementation, we'll pretend we've extracted text
      const extractedText = `This is a sample legal document containing contract terms. 
      SECTION 1: INTRODUCTION
      This agreement is made between the parties on this date.
      
      SECTION 2: TERMS
      2.1 The parties agree to the following terms...
      2.2 Payment shall be made within 30 days...
      
      SECTION 3: TERMINATION
      This agreement may be terminated by either party with written notice.`;
      
      // Determine document type (simplified)
      let documentType: "contract" | "petition" | "power_of_attorney" | "general" = "general";
      if (req.file.originalname.toLowerCase().includes("contrato")) {
        documentType = "contract";
      } else if (req.file.originalname.toLowerCase().includes("peticao")) {
        documentType = "petition";
      } else if (req.file.originalname.toLowerCase().includes("procuracao")) {
        documentType = "power_of_attorney";
      }
      
      // Analyze document with OpenAI
      const analysis = await analyzeDocument(extractedText, documentType);
      
      // Save document to database
      const documentId = uuidv4();
      const fileInfo = `${req.file.size > 1024 * 1024 ? 
        Math.round(req.file.size / (1024 * 1024)) + ' MB' : 
        Math.round(req.file.size / 1024) + ' KB'}`;
        
      await storage.createDocument({
        id: documentId,
        userId,
        title: req.file.originalname,
        fileType: path.extname(req.file.originalname).substring(1),
        fileInfo,
        filePath: req.file.path,
        analysis: JSON.stringify(analysis),
        status: analysis.status,
        createdAt: new Date()
      });
      
      res.json({ success: true, documentId });
    } catch (error) {
      console.error("Error analyzing document:", error);
      res.status(500).json({ message: "Failed to analyze document" });
    }
  });

  // Rota para criar novo documento
  app.post('/api/documents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validar dados do documento
      if (!req.body.title || !req.body.content) {
        return res.status(400).json({ message: "Título e conteúdo são obrigatórios" });
      }
      
      // Gerar ID único para o documento
      const documentId = uuidv4();
      
      // Salvar documento no banco de dados
      await storage.createDocument({
        id: documentId,
        userId,
        title: req.body.title,
        content: req.body.content, 
        fileType: "text/plain",
        fileInfo: null,
        clientName: req.body.clientName || "Cliente não especificado",
        status: req.body.status || 'draft',
        analysis: JSON.stringify({ summary: "Documento criado a partir de modelo" }),
        createdAt: new Date()
      });
      
      res.json({ 
        success: true, 
        documentId,
        message: "Documento salvo com sucesso"
      });
    } catch (error) {
      console.error("Erro ao salvar documento:", error);
      res.status(500).json({ message: "Falha ao salvar o documento" });
    }
  });

  // Rota para obter um documento específico
  app.get('/api/documents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documentId = req.params.id;
      
      // Obter o documento
      const document = await storage.getDocument(documentId);
      
      // Verificar se o documento existe e pertence ao usuário
      if (!document || document.userId !== userId) {
        return res.status(404).json({ message: "Documento não encontrado" });
      }
      
      res.json({ document });
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  // Rota para listar documentos
  app.get('/api/documents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Obter parâmetros de filtro se existirem
      const searchQuery = req.query.search?.toLowerCase();
      const documentType = req.query.documentType;
      const clientName = req.query.clientName;
      
      // Get user's documents
      const userDocuments = await storage.getUserDocuments(userId, 50);
      
      // Aplicar filtros (se houver)
      let filteredDocuments = userDocuments;
      
      if (searchQuery) {
        filteredDocuments = filteredDocuments.filter(doc => 
          doc.title.toLowerCase().includes(searchQuery) || 
          (doc.content && doc.content.toLowerCase().includes(searchQuery))
        );
      }
      
      if (documentType && documentType !== 'all') {
        filteredDocuments = filteredDocuments.filter(doc => 
          doc.fileType.toLowerCase() === documentType.toLowerCase()
        );
      }
      
      if (clientName && clientName !== 'all') {
        filteredDocuments = filteredDocuments.filter(doc => 
          doc.clientName && doc.clientName.toLowerCase().includes(clientName.toLowerCase())
        );
      }
      
      // Format the documents
      const formattedDocuments = filteredDocuments.map(doc => {
        // Parse the analysis from JSON
        let analysisObj;
        try {
          analysisObj = JSON.parse(doc.analysis || '{"summary": "Não foi possível carregar a análise"}');
        } catch (e) {
          analysisObj = { summary: "Não foi possível carregar a análise" };
        }
        
        // Extract document type in Portuguese
        let documentTypeInPortuguese = "Documento";
        if (doc.title.toLowerCase().includes("contrato")) documentTypeInPortuguese = "Contrato";
        else if (doc.title.toLowerCase().includes("petição") || doc.title.toLowerCase().includes("peticao")) documentTypeInPortuguese = "Petição";
        else if (doc.title.toLowerCase().includes("procuração") || doc.title.toLowerCase().includes("procuracao")) documentTypeInPortuguese = "Procuração";
        else if (doc.title.toLowerCase().includes("parecer")) documentTypeInPortuguese = "Parecer";
        
        return {
          id: doc.id,
          title: doc.title,
          fileType: doc.fileType,
          fileInfo: doc.fileInfo,
          status: doc.status,
          content: doc.content,
          clientName: doc.clientName || "Cliente não especificado",
          documentType: documentTypeInPortuguese,
          analysis: analysisObj.summary,
          createdAt: doc.createdAt.toISOString(),
          createdAgo: formatRelativeTime(doc.createdAt)
        };
      });
      
      res.json({ documents: formattedDocuments });
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Subscription management
  app.get('/api/subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get user's subscription
      const subscription = await storage.getUserSubscription(userId);
      
      res.json({
        currentPlan: subscription?.planId || "basic"
      });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription details" });
    }
  });

  app.post('/api/subscription/update', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request
      const validatedData = subscriptionUpdateSchema.parse(req.body);
      
      // Get existing subscription
      const existingSubscription = await storage.getUserSubscription(userId);
      
      if (existingSubscription) {
        // Update existing subscription
        await storage.updateSubscription(existingSubscription.id, {
          planId: validatedData.planId,
          updatedAt: new Date()
        });
      } else {
        // Create new subscription
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month subscription
        
        await storage.createSubscription({
          id: uuidv4(),
          userId,
          planId: validatedData.planId,
          status: "active",
          createdAt: new Date(),
          expiresAt: expiryDate,
          updatedAt: new Date()
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating subscription:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid subscription data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  // Create server instance
  const httpServer = createServer(app);
  return httpServer;
}
