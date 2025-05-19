import express from 'express';
import { randomUUID } from 'crypto';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';
import { insertClientSchema } from '@shared/schema';
import { z } from 'zod';

const router = express.Router();

// Buscar todos os clientes do usuário
router.get('/', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const clients = await storage.getUserClients(userId);
    
    res.json({
      success: true,
      clients
    });
  } catch (error: any) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao buscar clientes: ${error.message || 'Erro desconhecido'}`
    });
  }
});

// Obter um cliente específico
router.get('/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
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
    
    // Verificar se o cliente pertence ao usuário atual
    if (client.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso não autorizado a este cliente'
      });
    }
    
    res.json({
      success: true,
      client
    });
  } catch (error: any) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao buscar cliente: ${error.message || 'Erro desconhecido'}`
    });
  }
});

// Criar um novo cliente
router.post('/', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Validar dados do cliente
    const clientData = insertClientSchema.parse({
      ...req.body,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const newClient = await storage.createClient(clientData);
    
    res.status(201).json({
      success: true,
      client: newClient
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos para o cliente',
        errors: error.errors
      });
    }
    
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao criar cliente: ${error.message || 'Erro desconhecido'}`
    });
  }
});

// Atualizar um cliente existente
router.put('/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
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
    
    // Verificar se o cliente pertence ao usuário atual
    if (existingClient.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso não autorizado a este cliente'
      });
    }
    
    // Validar dados da atualização
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const updatedClient = await storage.updateClient(clientId, updateData);
    
    res.json({
      success: true,
      client: updatedClient
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos para atualização do cliente',
        errors: error.errors
      });
    }
    
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao atualizar cliente: ${error.message || 'Erro desconhecido'}`
    });
  }
});

// Excluir um cliente
router.delete('/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
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
    
    // Verificar se o cliente pertence ao usuário atual
    if (existingClient.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso não autorizado a este cliente'
      });
    }
    
    const deleted = await storage.deleteClient(clientId);
    
    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Não foi possível excluir o cliente'
      });
    }
    
    res.json({
      success: true,
      message: 'Cliente excluído com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao excluir cliente:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao excluir cliente: ${error.message || 'Erro desconhecido'}`
    });
  }
});

export default router;