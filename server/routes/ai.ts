import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import * as aiService from '../ai-service';

const router = Router();

// Rota para testar a conexão com os serviços de IA
router.get('/test-connection', isAuthenticated, async (req, res) => {
  try {
    const result = await aiService.testConnection();
    res.json({
      success: true,
      status: result,
      message: `Serviço primário: ${result.primary || 'Nenhum'}`
    });
  } catch (error) {
    console.error('Erro ao testar conexão com IA:', error);
    res.status(500).json({
      success: false,
      message: 'Falha ao testar conexão com serviços de IA'
    });
  }
});

// Rota para analisar documentos jurídicos
router.post('/analyze-document', isAuthenticated, async (req, res) => {
  try {
    const { text, documentType } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Texto do documento não fornecido'
      });
    }
    
    const analysis = await aiService.analyzeDocument(
      text,
      documentType || 'general'
    );
    
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Erro ao analisar documento:', error);
    res.status(500).json({
      success: false,
      message: `Falha ao analisar documento: ${error.message || 'Erro desconhecido'}`
    });
  }
});

// Rota para realizar pesquisa jurídica
router.post('/legal-search', isAuthenticated, async (req, res) => {
  try {
    const { query, sources } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Consulta de pesquisa não fornecida'
      });
    }
    
    // Garante que fontes estejam definidas
    const searchSources = sources || {
      jurisprudence: true,
      doctrine: true,
      legislation: true
    };
    
    const results = await aiService.legalSearch(query, searchSources);
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Erro na pesquisa jurídica:', error);
    res.status(500).json({
      success: false,
      message: `Falha na pesquisa jurídica: ${error.message || 'Erro desconhecido'}`
    });
  }
});

// Rota para recomendar documentos
router.post('/recommend-documents', isAuthenticated, async (req, res) => {
  try {
    const { context, documentType } = req.body;
    
    if (!context) {
      return res.status(400).json({
        success: false,
        message: 'Contexto não fornecido'
      });
    }
    
    const recommendations = await aiService.recommendDocuments(context, documentType);
    
    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Erro ao recomendar documentos:', error);
    res.status(500).json({
      success: false,
      message: `Falha ao recomendar documentos: ${error.message || 'Erro desconhecido'}`
    });
  }
});

export default router;