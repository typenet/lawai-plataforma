import axios from 'axios';
import { log } from './vite';

interface LinkCheckResult {
  url: string;
  status: 'healthy' | 'broken' | 'redirected' | 'pending';
  statusCode?: number;
  redirectTo?: string;
  responseTime?: number;
  lastChecked: Date;
  context: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  error?: string;
}

interface Link {
  url: string;
  label: string;
  context: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Verifica a saúde de um link específico
 * @param link Informações do link a ser verificado
 * @returns Resultado da verificação
 */
export async function checkLink(link: Link): Promise<LinkCheckResult> {
  const startTime = Date.now();
  
  try {
    log(`Verificando link: ${link.url}`, 'link-health');
    
    const response = await axios.get(link.url, {
      validateStatus: () => true,  // Não lance erro para nenhum código de status
      maxRedirects: 0,             // Não siga redirecionamentos automaticamente
      timeout: 5000                // Timeout de 5 segundos
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.status >= 200 && response.status < 300) {
      return {
        url: link.url,
        status: 'healthy',
        statusCode: response.status,
        responseTime,
        lastChecked: new Date(),
        context: link.context,
        importance: link.importance
      };
    } else if (response.status >= 300 && response.status < 400) {
      return {
        url: link.url,
        status: 'redirected',
        statusCode: response.status,
        redirectTo: response.headers.location,
        responseTime,
        lastChecked: new Date(),
        context: link.context,
        importance: link.importance
      };
    } else {
      return {
        url: link.url,
        status: 'broken',
        statusCode: response.status,
        responseTime,
        lastChecked: new Date(),
        context: link.context,
        importance: link.importance,
        error: `Status code: ${response.status}`
      };
    }
  } catch (error: any) {
    log(`Erro ao verificar link ${link.url}: ${error.message || 'Erro desconhecido'}`, 'link-health');
    
    return {
      url: link.url,
      status: 'broken',
      responseTime: Date.now() - startTime,
      lastChecked: new Date(),
      context: link.context,
      importance: link.importance,
      error: error.message || 'Erro desconhecido'
    };
  }
}

/**
 * Verifica a saúde de um conjunto de links em paralelo
 * @param links Lista de links a serem verificados
 * @param concurrency Número máximo de verificações em paralelo
 * @returns Lista com os resultados das verificações
 */
export async function checkLinks(links: Link[], concurrency = 5): Promise<LinkCheckResult[]> {
  const results: LinkCheckResult[] = [];
  let index = 0;
  
  log(`Iniciando verificação de ${links.length} links com concorrência ${concurrency}`, 'link-health');
  
  // Função que processa links até que todos sejam verificados
  const worker = async () => {
    while (index < links.length) {
      const currentIndex = index++;
      const link = links[currentIndex];
      
      try {
        const result = await checkLink(link);
        results.push(result);
        
        // Log para links com problemas
        if (result.status !== 'healthy') {
          log(`Link com problema: ${link.url} (${result.status})`, 'link-health');
        }
      } catch (error: any) {
        log(`Erro ao verificar link ${link.url}: ${error.message || 'Erro desconhecido'}`, 'link-health');
        
        results.push({
          url: link.url,
          status: 'broken',
          lastChecked: new Date(),
          context: link.context,
          importance: link.importance,
          error: error.message || 'Erro desconhecido'
        });
      }
    }
  };
  
  // Inicia os workers em paralelo conforme a concorrência definida
  const workers = Array(Math.min(concurrency, links.length))
    .fill(0)
    .map(() => worker());
  
  // Aguarda todos os workers terminarem
  await Promise.all(workers);
  
  log(`Verificação de links concluída. ${results.length} links verificados.`, 'link-health');
  
  return results;
}

/**
 * Gera estatísticas a partir dos resultados da verificação de links
 * @param results Resultados da verificação de links
 * @returns Estatísticas sobre a saúde dos links
 */
export function generateLinkStats(results: LinkCheckResult[]): {
  total: number;
  healthy: number;
  broken: number;
  redirected: number;
  pending: number;
  avgResponseTime: number;
  lastFullCheck: Date;
} {
  const stats = {
    total: results.length,
    healthy: results.filter(r => r.status === 'healthy').length,
    broken: results.filter(r => r.status === 'broken').length,
    redirected: results.filter(r => r.status === 'redirected').length,
    pending: results.filter(r => r.status === 'pending').length,
    avgResponseTime: 0,
    lastFullCheck: new Date()
  };
  
  // Calcula o tempo médio de resposta dos links verificados
  const responseTimes = results
    .filter(r => r.responseTime !== undefined)
    .map(r => r.responseTime || 0);
  
  if (responseTimes.length > 0) {
    stats.avgResponseTime = responseTimes.reduce((acc: number, time: number) => acc + time, 0) / responseTimes.length;
  }
  
  return stats;
}

/**
 * Obtém links internos do sistema
 * @returns Lista de links internos do sistema
 */
export function getSystemLinks(): Link[] {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://' + (process.env.REPLIT_DOMAINS ? process.env.REPLIT_DOMAINS.split(',')[0] : 'localhost:5000')
    : 'http://localhost:5000';
  
  return [
    // Links de navegação principal
    { url: `${baseUrl}/dashboard`, label: 'Dashboard', context: 'Menu Principal', importance: 'critical' },
    { url: `${baseUrl}/novo-documento`, label: 'Novo documento', context: 'Menu Principal', importance: 'critical' },
    { url: `${baseUrl}/documentos`, label: 'Documentos', context: 'Menu Principal', importance: 'critical' },
    { url: `${baseUrl}/historico`, label: 'Histórico', context: 'Menu Principal', importance: 'high' },
    { url: `${baseUrl}/analytics`, label: 'Analytics', context: 'Menu Principal', importance: 'high' },
    { url: `${baseUrl}/clientes`, label: 'Clientes', context: 'Menu Principal', importance: 'critical' },
    { url: `${baseUrl}/prazos`, label: 'Prazos Processuais', context: 'Menu Principal', importance: 'critical' },
    { url: `${baseUrl}/link-health`, label: 'Verificador de Links', context: 'Menu Principal', importance: 'medium' },
    
    // Links de documentos
    { url: `${baseUrl}/api/documents`, label: 'API Documentos', context: 'API', importance: 'critical' },
    { url: `${baseUrl}/api/clients`, label: 'API Clientes', context: 'API', importance: 'critical' },
    { url: `${baseUrl}/api/cases`, label: 'API Processos', context: 'API', importance: 'critical' },
    { url: `${baseUrl}/api/deadlines`, label: 'API Prazos', context: 'API', importance: 'critical' },
    { url: `${baseUrl}/api/link-health/results`, label: 'API Verificador Links', context: 'API', importance: 'medium' },
    
    // Links de autenticação
    { url: `${baseUrl}/api/login`, label: 'Login', context: 'Autenticação', importance: 'critical' },
    { url: `${baseUrl}/api/logout`, label: 'Logout', context: 'Autenticação', importance: 'critical' },
    
    // Links de IA
    { url: `${baseUrl}/api/ai/query`, label: 'API IA Query', context: 'API IA', importance: 'high' },
    
    // Links externos relevantes
    { url: 'https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm', label: 'Código Civil', context: 'Legislação', importance: 'high' },
    { url: 'https://www.planalto.gov.br/ccivil_03/leis/l5869.htm', label: 'Código de Processo Civil Antigo', context: 'Legislação', importance: 'medium' },
    { url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13105.htm', label: 'Código de Processo Civil', context: 'Legislação', importance: 'high' },
    { url: 'https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm', label: 'Código de Defesa do Consumidor', context: 'Legislação', importance: 'high' },
    { url: 'https://www.gov.br/defesa/pt-br/arquivos/carteira/legislacao/codigo20penal20brasileiro.pdf/view', label: 'Código Penal', context: 'Legislação', importance: 'high' },
    { url: 'https://www.stf.jus.br', label: 'STF', context: 'Jurisprudência', importance: 'high' },
    { url: 'https://www.stj.jus.br', label: 'STJ', context: 'Jurisprudência', importance: 'high' },
  ];
}