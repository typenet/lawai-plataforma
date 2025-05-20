import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';
import { insertClientSchema } from '@shared/schema';

const router = Router();

// Rota para buscar todos os clientes (com limite)
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const userId = req.user?.claims?.sub || "999999"; // Fallback para testes
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'ID de usuário não encontrado'
      });
    }
    
    const clients = await storage.getUserClients(userId, limit);
    
    res.json({
      success: true,
      clients
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar clientes'
    });
  }
});

// Rota para buscar um cliente específico
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);
    
    if (isNaN(clientId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de cliente inválido'
      });
    }
    
    const client = await storage.getClient(clientId);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }
    
    res.json({
      success: true,
      client
    });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cliente'
    });
  }
});

// Rota para criar um novo cliente
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.claims?.sub || "999999"; // Fallback para testes
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'ID de usuário não encontrado'
      });
    }
    
    const validationResult = insertClientSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Dados de cliente inválidos',
        errors: validationResult.error.errors
      });
    }
    
    const clientData = {
      ...validationResult.data,
      userId
    };
    
    const client = await storage.createClient(clientData);
    
    res.status(201).json({
      success: true,
      client
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar cliente'
    });
  }
});

// Rota para atualizar um cliente
router.patch('/:id', isAuthenticated, async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);
    
    if (isNaN(clientId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de cliente inválido'
      });
    }
    
    const existingClient = await storage.getClient(clientId);
    
    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }
    
    const userId = req.user?.claims?.sub || "999999"; // Fallback para testes
    if (existingClient.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Não autorizado a modificar este cliente'
      });
    }
    
    // Aceita atualizações parciais
    const updatedClient = await storage.updateClient(clientId, req.body);
    
    res.json({
      success: true,
      client: updatedClient
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar cliente'
    });
  }
});

// Rota para excluir um cliente
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);
    
    if (isNaN(clientId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de cliente inválido'
      });
    }
    
    const existingClient = await storage.getClient(clientId);
    
    if (!existingClient) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }
    
    const userId = req.user?.claims?.sub || "999999"; // Fallback para testes
    if (existingClient.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Não autorizado a excluir este cliente'
      });
    }
    
    const success = await storage.deleteClient(clientId);
    
    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Falha ao excluir cliente'
      });
    }
    
    res.json({
      success: true,
      message: 'Cliente excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir cliente'
    });
  }
});

export default router;