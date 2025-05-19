// Serviço de integração com a API DeepSeek para análise jurídica
import axios from 'axios';
import { log } from './vite';

// Configuração básica para a API DeepSeek
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek-ai.com/v1';

// Verifica se a chave da API está definida
if (!DEEPSEEK_API_KEY) {
  log('Aviso: DEEPSEEK_API_KEY não está definida. Algumas funcionalidades podem não funcionar corretamente.', 'deepseek');
}

// Configuração do cliente axios
const deepseekClient = axios.create({
  baseURL: DEEPSEEK_API_URL,
  headers: {
    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Analisa um documento jurídico usando a API DeepSeek
 * @param documentText O texto do documento a ser analisado
 * @param documentType O tipo de documento (contrato, petição, etc.)
 * @returns Análise do documento
 */
export async function analyzeDocument(documentText: string, documentType: string): Promise<any> {
  try {
    // Prompt específico para documentos jurídicos
    const prompt = `
      Analise este documento jurídico do tipo ${documentType}:
      
      ${documentText}
      
      Por favor, forneça:
      1. Um resumo do documento
      2. Pontos principais e cláusulas importantes
      3. Possíveis problemas ou inconsistências
      4. Recomendações para melhorias
      
      Formate a resposta como JSON com as seguintes chaves:
      - summary
      - keyPoints
      - issues
      - recommendations
    `;

    const response = await deepseekClient.post('/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'Você é um assistente jurídico especializado em análise de documentos legais.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    // Parse o resultado JSON
    let analysisResult;
    try {
      if (typeof response.data.choices[0].message.content === 'string') {
        analysisResult = JSON.parse(response.data.choices[0].message.content);
      } else {
        analysisResult = response.data.choices[0].message.content;
      }
    } catch (error) {
      log('Erro ao analisar resposta JSON da API DeepSeek', 'deepseek');
      analysisResult = {
        summary: response.data.choices[0].message.content,
        keyPoints: [],
        issues: [],
        recommendations: []
      };
    }

    return analysisResult;
  } catch (error) {
    log(`Erro ao chamar a API DeepSeek: ${error.message}`, 'deepseek');
    throw new Error(`Falha na análise do documento: ${error.message}`);
  }
}

/**
 * Realiza uma pesquisa jurídica usando a API DeepSeek
 * @param query A consulta de pesquisa
 * @param context Contexto adicional para a pesquisa
 * @returns Resultados da pesquisa
 */
export async function legalSearch(query: string, context?: string): Promise<any> {
  try {
    // Prompt específico para pesquisa jurídica
    const promptContent = context 
      ? `Pesquisa jurídica: ${query}\nContexto: ${context}` 
      : `Pesquisa jurídica: ${query}`;

    const response = await deepseekClient.post('/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        { 
          role: 'system', 
          content: 'Você é um assistente jurídico especializado em pesquisa legal brasileira. Responda apenas com base em jurisprudência, doutrina e legislação.' 
        },
        { role: 'user', content: promptContent }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    // Parse o resultado
    let searchResults;
    try {
      if (typeof response.data.choices[0].message.content === 'string') {
        searchResults = JSON.parse(response.data.choices[0].message.content);
      } else {
        searchResults = response.data.choices[0].message.content;
      }
    } catch (error) {
      log('Erro ao analisar resposta JSON da API DeepSeek', 'deepseek');
      searchResults = {
        results: [response.data.choices[0].message.content],
        sources: []
      };
    }

    return searchResults;
  } catch (error) {
    log(`Erro ao chamar a API DeepSeek: ${error.message}`, 'deepseek');
    throw new Error(`Falha na pesquisa jurídica: ${error.message}`);
  }
}

/**
 * Gera um documento jurídico com base em parâmetros
 * @param documentType Tipo de documento a ser gerado
 * @param parameters Parâmetros para geração do documento
 * @returns Documento gerado
 */
export async function generateDocument(documentType: string, parameters: any): Promise<string> {
  try {
    // Converte parâmetros para string formatada
    const paramsText = Object.entries(parameters)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    // Prompt para geração de documento
    const prompt = `
      Gere um documento jurídico do tipo "${documentType}" com os seguintes parâmetros:
      
      ${paramsText}
      
      O documento deve seguir o formato e estilo padrão utilizado no Brasil para este tipo específico.
    `;

    const response = await deepseekClient.post('/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        { 
          role: 'system', 
          content: 'Você é um assistente jurídico especializado em elaboração de documentos legais brasileiros.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    log(`Erro ao chamar a API DeepSeek: ${error.message}`, 'deepseek');
    throw new Error(`Falha na geração do documento: ${error.message}`);
  }
}

/**
 * Verifica a conexão com a API DeepSeek
 * @returns Verdadeiro se a conexão estiver funcionando
 */
export async function testConnection(): Promise<boolean> {
  try {
    // Apenas uma chamada simples para verificar se a API está respondendo
    const response = await deepseekClient.post('/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        { role: 'user', content: 'Test connection' }
      ],
      max_tokens: 10
    });
    
    return response.status === 200;
  } catch (error) {
    log(`Erro ao testar conexão com API DeepSeek: ${error.message}`, 'deepseek');
    return false;
  }
}