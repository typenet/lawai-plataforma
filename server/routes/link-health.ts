import { Router } from 'express';
import { checkLinks, generateLinkStats, getSystemLinks } from '../link-health-service';
// Usar autenticação simplificada para ambiente de desenvolvimento
// import { isAuthenticated } from '../replitAuth';
import { isAuthenticated } from '../simpleAuth';

const router = Router();

// Cache para armazenar os resultados das verificações
let linkCheckCache: any = {
  results: [],
  stats: null,
  lastChecked: null
};

// Retorna os resultados da última verificação de links
router.get('/results', isAuthenticated, async (req, res) => {
  try {
    // Se não houver resultados em cache ou foi há mais de 30 minutos
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    if (!linkCheckCache.lastChecked || linkCheckCache.lastChecked < thirtyMinutesAgo) {
      res.json({
        success: true,
        results: linkCheckCache.results,
        stats: linkCheckCache.stats,
        message: 'Verificação de links iniciada em segundo plano. Atualize em alguns minutos.',
        isCached: true,
        lastChecked: linkCheckCache.lastChecked
      });
      
      // Inicia a verificação em segundo plano
      updateLinkHealthCache();
      return;
    }
    
    res.json({
      success: true,
      results: linkCheckCache.results,
      stats: linkCheckCache.stats,
      isCached: true,
      lastChecked: linkCheckCache.lastChecked
    });
  } catch (error) {
    console.error('Erro ao recuperar resultados da verificação de links:', error);
    res.status(500).json({
      success: false, 
      message: 'Erro ao recuperar resultados da verificação de links'
    });
  }
});

// Força uma nova verificação de links
router.post('/check', isAuthenticated, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Verificação de links iniciada. A operação continuará em segundo plano.'
    });
    
    // Inicia a verificação em segundo plano
    updateLinkHealthCache();
  } catch (error) {
    console.error('Erro ao iniciar verificação de links:', error);
    res.status(500).json({
      success: false, 
      message: 'Erro ao iniciar verificação de links'
    });
  }
});

// Função para atualizar o cache de verificação de links
async function updateLinkHealthCache() {
  try {
    console.log('Iniciando verificação de links do sistema...');
    
    // Obter links do sistema
    const systemLinks = getSystemLinks();
    
    // Verificar links
    const results = await checkLinks(systemLinks);
    
    // Gerar estatísticas
    const stats = generateLinkStats(results);
    
    // Atualizar cache
    linkCheckCache = {
      results,
      stats,
      lastChecked: new Date()
    };
    
    console.log('Verificação de links concluída:', stats);
  } catch (error) {
    console.error('Erro durante verificação de links:', error);
  }
}

export default router;