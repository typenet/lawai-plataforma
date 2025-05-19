import express from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';
import { insertCaseSchema } from '@shared/schema';
import { z } from 'zod';

const router = express.Router();

// Listar todos os casos do usuário
router.get('/', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const cases = await storage.getUserCases(userId);
    
    res.json({
      success: true,
      cases
    });
  } catch (error: any) {
    console.error('Erro ao buscar casos:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao buscar casos: ${error.message || 'Erro desconhecido'}`
    });
  }
});

// Buscar casos de um cliente específico
router.get('/by-client/:clientId', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const clientId = parseInt(req.params.clientId);
    
    if (isNaN(clientId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de cliente inválido'
      });
    }
    
    // Verificar se o cliente pertence ao usuário atual
    const client = await storage.getClient(clientId);
    if (!client || client.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso não autorizado a este cliente'
      });
    }
    
    const cases = await storage.getClientCases(clientId);
    
    res.json({
      success: true,
      cases
    });
  } catch (error: any) {
    console.error('Erro ao buscar casos do cliente:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao buscar casos do cliente: ${error.message || 'Erro desconhecido'}`
    });
  }
});

// Obter um caso específico
router.get('/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const caseId = parseInt(req.params.id);
    
    if (isNaN(caseId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de caso inválido'
      });
    }
    
    const caseData = await storage.getCase(caseId);
    
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Caso não encontrado'
      });
    }
    
    // Verificar se o caso pertence ao usuário atual
    if (caseData.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso não autorizado a este caso'
      });
    }
    
    res.json({
      success: true,
      case: caseData
    });
  } catch (error: any) {
    console.error('Erro ao buscar caso:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao buscar caso: ${error.message || 'Erro desconhecido'}`
    });
  }
});

// Criar um novo caso
router.post('/', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Validar dados do caso
    const caseData = insertCaseSchema.parse({
      ...req.body,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Verificar se o cliente pertence ao usuário atual
    const client = await storage.getClient(caseData.clientId);
    if (!client || client.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso não autorizado a este cliente'
      });
    }
    
    const newCase = await storage.createCase(caseData);
    
    res.status(201).json({
      success: true,
      case: newCase
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos para o caso',
        errors: error.errors
      });
    }
    
    console.error('Erro ao criar caso:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao criar caso: ${error.message || 'Erro desconhecido'}`
    });
  }
});

// Atualizar um caso existente
router.put('/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const caseId = parseInt(req.params.id);
    
    if (isNaN(caseId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de caso inválido'
      });
    }
    
    const existingCase = await storage.getCase(caseId);
    
    if (!existingCase) {
      return res.status(404).json({
        success: false,
        message: 'Caso não encontrado'
      });
    }
    
    // Verificar se o caso pertence ao usuário atual
    if (existingCase.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso não autorizado a este caso'
      });
    }
    
    // Se estiver mudando o cliente, verificar se o novo cliente pertence ao usuário
    if (req.body.clientId && req.body.clientId !== existingCase.clientId) {
      const client = await storage.getClient(req.body.clientId);
      if (!client || client.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Acesso não autorizado ao cliente informado'
        });
      }
    }
    
    // Validar dados da atualização
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const updatedCase = await storage.updateCase(caseId, updateData);
    
    res.json({
      success: true,
      case: updatedCase
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos para atualização do caso',
        errors: error.errors
      });
    }
    
    console.error('Erro ao atualizar caso:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao atualizar caso: ${error.message || 'Erro desconhecido'}`
    });
  }
});

// Excluir um caso
router.delete('/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const caseId = parseInt(req.params.id);
    
    if (isNaN(caseId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de caso inválido'
      });
    }
    
    const existingCase = await storage.getCase(caseId);
    
    if (!existingCase) {
      return res.status(404).json({
        success: false,
        message: 'Caso não encontrado'
      });
    }
    
    // Verificar se o caso pertence ao usuário atual
    if (existingCase.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso não autorizado a este caso'
      });
    }
    
    const deleted = await storage.deleteCase(caseId);
    
    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Não foi possível excluir o caso'
      });
    }
    
    res.json({
      success: true,
      message: 'Caso excluído com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao excluir caso:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao excluir caso: ${error.message || 'Erro desconhecido'}`
    });
  }
});

export default router;