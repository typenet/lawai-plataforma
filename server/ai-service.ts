// Serviço de IA combinado que utiliza OpenAI ou DeepSeek conforme disponibilidade
import * as openaiService from './openai';
import * as deepseekService from './deepseek';
import { log } from './vite';

// Verifica se temos configurações para APIs de IA
const hasOpenAI = !!process.env.OPENAI_API_KEY;
const hasDeepSeek = !!process.env.DEEPSEEK_API_KEY;

// Determina qual serviço está disponível
const primaryService = hasDeepSeek ? 'deepseek' : (hasOpenAI ? 'openai' : null);

// Registra qual serviço está sendo usado
log(`Serviço de IA primário: ${primaryService || 'Nenhum'}`, 'ai-service');
if (!primaryService) {
  log('AVISO: Nenhuma API de IA está configurada. Funcionalidades de IA não estarão disponíveis.', 'ai-service');
}

/**
 * Analisa um documento jurídico usando o serviço de IA disponível
 */
export async function analyzeDocument(
  text: string,
  documentType: "contract" | "petition" | "power_of_attorney" | "general"
): Promise<{
  summary: string;
  findings: Array<{
    type: "issue" | "recommendation" | "missing" | "strength";
    description: string;
    severity?: "high" | "medium" | "low";
    location?: string;
  }>;
  status: "complete" | "issues_found" | "incomplete";
}> {
  try {
    // Preferência para DeepSeek se disponível, caso contrário usa OpenAI
    if (hasDeepSeek) {
      // Mapeamento de tipo de documento para string mais descritiva
      const docTypeMap = {
        'contract': 'contrato',
        'petition': 'petição',
        'power_of_attorney': 'procuração',
        'general': 'documento jurídico geral'
      };
      
      // Chama DeepSeek
      const deepseekResult = await deepseekService.analyzeDocument(text, docTypeMap[documentType]);
      
      // Mapeia o resultado para o formato esperado
      const findings = [];
      
      // Mapeia problemas encontrados
      if (deepseekResult.issues && Array.isArray(deepseekResult.issues)) {
        for (const issue of deepseekResult.issues) {
          findings.push({
            type: "issue",
            description: issue,
            severity: "medium"
          });
        }
      }
      
      // Mapeia recomendações
      if (deepseekResult.recommendations && Array.isArray(deepseekResult.recommendations)) {
        for (const recommendation of deepseekResult.recommendations) {
          findings.push({
            type: "recommendation",
            description: recommendation
          });
        }
      }
      
      // Mapeia pontos-chave para pontos fortes
      if (deepseekResult.keyPoints && Array.isArray(deepseekResult.keyPoints)) {
        for (const point of deepseekResult.keyPoints) {
          findings.push({
            type: "strength",
            description: point
          });
        }
      }
      
      // Determina status com base na presença de problemas
      const status = findings.some(f => f.type === "issue") 
        ? "issues_found" 
        : "complete";
      
      return {
        summary: deepseekResult.summary || "Análise concluída",
        findings,
        status
      };
    } else if (hasOpenAI) {
      // Usa OpenAI como fallback
      return await openaiService.analyzeDocument(text, documentType);
    } else {
      throw new Error("Nenhum serviço de IA está configurado");
    }
  } catch (error) {
    log(`Erro ao analisar documento: ${error.message}`, 'ai-service');
    throw new Error(`Falha na análise do documento: ${error.message}`);
  }
}

/**
 * Realiza uma pesquisa jurídica usando o serviço de IA disponível
 */
export async function legalSearch(
  query: string,
  sources: {
    jurisprudence: boolean;
    doctrine: boolean;
    legislation: boolean;
  }
): Promise<{
  results: Array<{
    title: string;
    summary: string;
    source: "jurisprudence" | "doctrine" | "legislation";
    reference: string;
    relevance: number;
  }>;
}> {
  try {
    // Preferência para DeepSeek se disponível, caso contrário usa OpenAI
    if (hasDeepSeek) {
      // Prepara contexto adicional com base nas fontes selecionadas
      const selectedSources = Object.entries(sources)
        .filter(([_, included]) => included)
        .map(([type]) => type)
        .join(", ");
      
      const context = `Buscar em: ${selectedSources}`;
      
      // Chama DeepSeek
      const deepseekResult = await deepseekService.legalSearch(query, context);
      
      // Tenta mapear o resultado para o formato esperado
      if (deepseekResult.results && Array.isArray(deepseekResult.results)) {
        return {
          results: deepseekResult.results.map(result => {
            // Tenta determinar o tipo de fonte com base no conteúdo
            let source = "legislation" as "jurisprudence" | "doctrine" | "legislation";
            if (result.source) {
              // Se já tiver o campo source, use-o diretamente
              source = result.source;
            } else if (result.title) {
              // Senão, tenta inferir pelo título
              const title = result.title.toLowerCase();
              if (title.includes('acórdão') || title.includes('processo') || title.includes('autos')) {
                source = "jurisprudence";
              } else if (title.includes('artigo') || title.includes('lei') || title.includes('código')) {
                source = "legislation";
              } else {
                source = "doctrine";
              }
            }
            
            return {
              title: result.title || "Resultado de pesquisa",
              summary: result.summary || result.content || "Sem resumo disponível",
              source,
              reference: result.reference || "",
              relevance: result.relevance || 0.8
            };
          })
        };
      } else {
        // Formato de resposta não esperado, tenta criar uma resposta mínima
        return {
          results: [{
            title: "Resultado da pesquisa",
            summary: typeof deepseekResult === 'string' ? deepseekResult : JSON.stringify(deepseekResult),
            source: "legislation",
            reference: "",
            relevance: 0.8
          }]
        };
      }
    } else if (hasOpenAI) {
      // Usa OpenAI como fallback
      return await openaiService.legalSearch(query, sources);
    } else {
      throw new Error("Nenhum serviço de IA está configurado");
    }
  } catch (error) {
    log(`Erro na pesquisa jurídica: ${error.message}`, 'ai-service');
    throw new Error(`Falha na pesquisa jurídica: ${error.message}`);
  }
}

/**
 * Recomenda documentos com base no contexto usando o serviço de IA disponível
 */
export async function recommendDocuments(
  context: string,
  documentType?: string
): Promise<{
  recommendations: Array<{
    title: string;
    description: string;
    type: string;
    relevance: number;
  }>;
}> {
  try {
    // Por enquanto, apenas OpenAI tem esta funcionalidade específica
    if (hasOpenAI) {
      return await openaiService.recommendDocuments(context, documentType);
    } else if (hasDeepSeek) {
      // Adaptamos a API DeepSeek para fornecer recomendações de documentos
      const prompt = `
        Com base no seguinte contexto jurídico, recomende documentos relevantes ${documentType ? `especificamente para ${documentType}` : ''}:
        
        Contexto: ${context}
        
        Forneça até 3 recomendações de documentos mais relevantes, incluindo título, descrição, tipo e relevância.
      `;
      
      // Chama DeepSeek com uma consulta adaptada
      const deepseekResult = await deepseekService.legalSearch(prompt);
      
      // Tenta extrair ou criar recomendações
      const recommendations = [];
      
      if (deepseekResult.results && Array.isArray(deepseekResult.results)) {
        for (const result of deepseekResult.results) {
          recommendations.push({
            title: result.title || "Documento recomendado",
            description: result.summary || result.description || "Documento relevante para o contexto",
            type: documentType || "general",
            relevance: result.relevance || 0.8
          });
        }
      }
      
      return { recommendations };
    } else {
      throw new Error("Nenhum serviço de IA está configurado");
    }
  } catch (error) {
    log(`Erro ao recomendar documentos: ${error.message}`, 'ai-service');
    throw new Error(`Falha ao recomendar documentos: ${error.message}`);
  }
}

/**
 * Testa a conexão com os serviços de IA
 */
export async function testConnection(): Promise<{
  openai: boolean;
  deepseek: boolean;
  primary: string | null;
}> {
  const result = {
    openai: false,
    deepseek: false,
    primary: primaryService
  };
  
  if (hasDeepSeek) {
    try {
      result.deepseek = await deepseekService.testConnection();
    } catch (error) {
      log(`Erro ao testar conexão DeepSeek: ${error.message}`, 'ai-service');
    }
  }
  
  return result;
}