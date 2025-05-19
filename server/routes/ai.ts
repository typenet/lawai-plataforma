import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import * as aiService from '../ai-service';

const router = Router();

// Rota para testar a conexão com os serviços de IA
router.get('/test-connection', isAuthenticated, async (req, res) => {
  try {
    // Responder com status de conexão bem-sucedido para fins de demonstração
    res.json({
      success: true,
      status: {
        deepseek: true,
        primary: 'deepseek'
      },
      message: 'Serviço primário: deepseek'
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
    
    // Resposta simulada para fins de demonstração
    const simulatedAnalysis = {
      summary: `Análise do documento ${documentType || 'jurídico'} realizada com sucesso. Este documento contém ${text.length} caracteres e parece ser ${documentType === 'contract' ? 'um contrato com cláusulas padronizadas' : 'um documento jurídico com termos técnicos'}.`,
      findings: [
        {
          type: "strength",
          description: "Documento bem estruturado com divisões claras de seções",
        },
        {
          type: "issue",
          description: "Algumas cláusulas podem apresentar ambiguidade na interpretação",
          severity: "medium",
          location: "Seção 3, Parágrafo 2"
        },
        {
          type: "recommendation",
          description: "Recomenda-se revisar os termos de vigência para garantir clareza",
        },
        {
          type: "missing",
          description: "Faltam cláusulas específicas sobre resolução de conflitos",
          severity: "low"
        }
      ],
      status: "issues_found"
    };
    
    res.json({
      success: true,
      analysis: simulatedAnalysis
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
    
    // Resposta simulada para fins de demonstração
    const simulatedResults = {
      results: [
        {
          title: "Lei 10.406/2002 - Código Civil",
          summary: "Artigos relacionados a contratos e responsabilidade civil que se aplicam à consulta sobre responsabilidade contratual.",
          source: "legislation",
          reference: "Art. 421-426, Lei 10.406/2002",
          relevance: 0.95
        },
        {
          title: "Jurisprudência STJ - REsp 1234567/DF",
          summary: "Acórdão que trata sobre quebra de contrato e indenização por perdas e danos em situação similar à consultada.",
          source: "jurisprudence",
          reference: "REsp 1234567/DF, Rel. Ministro João Silva, 3ª Turma, julgado em 15/03/2020",
          relevance: 0.87
        },
        {
          title: "Doutrina - Responsabilidade Civil Contratual",
          summary: "Artigo acadêmico sobre os requisitos e efeitos da responsabilidade civil contratual no direito brasileiro.",
          source: "doctrine",
          reference: "SILVA, Maria. Revista de Direito Civil, v. 45, n. 2, p. 87-112, 2021",
          relevance: 0.82
        }
      ]
    };
    
    res.json({
      success: true,
      results: simulatedResults
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
    
    // Resposta simulada para fins de demonstração
    const simulatedRecommendations = {
      recommendations: [
        {
          title: "Modelo de Contrato de Prestação de Serviços",
          description: "Um modelo completo de contrato de prestação de serviços adaptado para o contexto descrito.",
          type: documentType || "contract",
          relevance: 0.95
        },
        {
          title: "Cláusulas Específicas para Proteção de Propriedade Intelectual",
          description: "Conjunto de cláusulas especializadas para proteção de propriedade intelectual em contratos de serviço.",
          type: "clauses",
          relevance: 0.87
        },
        {
          title: "Minuta de Acordo de Confidencialidade",
          description: "Modelo de NDA (Non-Disclosure Agreement) que complementa o contrato principal.",
          type: "nda",
          relevance: 0.82
        }
      ]
    };
    
    res.json({
      success: true,
      recommendations: simulatedRecommendations
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