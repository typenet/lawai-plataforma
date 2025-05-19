import express from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';
import { insertDeadlineSchema } from '@shared/schema';
import { z } from 'zod';

const router = express.Router();

// Listar todos os prazos do usuário
router.get('/', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const deadlines = await storage.getUserDeadlines(userId);
    
    res.json({
      success: true,
      deadlines
    });
  } catch (error: any) {
    console.error('Erro ao buscar prazos:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao buscar prazos: ${error.message || 'Erro desconhecido'}`
    });
  }
});

// Listar prazos pendentes (próximos X dias)
router.get('/pending', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const daysAhead = req.query.days ? parseInt(req.query.days) : 7; // Padrão: próximos 7 dias
    
    const deadlines = await storage.getPendingDeadlines(userId, daysAhead);
    
    res.json({
      success: true,
      deadlines
    });
  } catch (error: any) {
    console.error('Erro ao buscar prazos pendentes:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao buscar prazos pendentes: ${error.message || 'Erro desconhecido'}`
    });
  }
});

// Buscar prazos de um caso específico
router.get('/by-case/:caseId', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const caseId = parseInt(req.params.caseId);
    
    if (isNaN(caseId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de caso inválido'
      });
    }
    
    // Verificar se o caso pertence ao usuário atual
    const caseData = await storage.getCase(caseId);
    if (!caseData || caseData.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso não autorizado a este caso'
      });
    }
    
    const deadlines = await storage.getCaseDeadlines(caseId);
    
    res.json({
      success: true,
      deadlines
    });
  } catch (error: any) {
    console.error('Erro ao buscar prazos do caso:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao buscar prazos do caso: ${error.message || 'Erro desconhecido'}`
    });
  }
});

// Obter um prazo específico
router.get('/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const deadlineId = parseInt(req.params.id);
    
    if (isNaN(deadlineId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de prazo inválido'
      });
    }
    
    const deadline = await storage.getDeadline(deadlineId);
    
    if (!deadline) {
      return res.status(404).json({
        success: false,
        message: 'Prazo não encontrado'
      });
    }
    
    // Verificar se o prazo pertence ao usuário atual
    if (deadline.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso não autorizado a este prazo'
      });
    }
    
    res.json({
      success: true,
      deadline
    });
  } catch (error: any) {
    console.error('Erro ao buscar prazo:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao buscar prazo: ${error.message || 'Erro desconhecido'}`
    });
  }
});

// Criar um novo prazo
router.post('/', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Validar dados do prazo
    const deadlineData = insertDeadlineSchema.parse({
      ...req.body,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Verificar se o caso pertence ao usuário atual
    const caseData = await storage.getCase(deadlineData.caseId);
    if (!caseData || caseData.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso não autorizado a este caso'
      });
    }
    
    const newDeadline = await storage.createDeadline(deadlineData);
    
    res.status(201).json({
      success: true,
      deadline: newDeadline
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos para o prazo',
        errors: error.errors
      });
    }
    
    console.error('Erro ao criar prazo:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao criar prazo: ${error.message || 'Erro desconhecido'}`
    });
  }
});

// Atualizar um prazo existente
router.put('/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const deadlineId = parseInt(req.params.id);
    
    if (isNaN(deadlineId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de prazo inválido'
      });
    }
    
    const existingDeadline = await storage.getDeadline(deadlineId);
    
    if (!existingDeadline) {
      return res.status(404).json({
        success: false,
        message: 'Prazo não encontrado'
      });
    }
    
    // Verificar se o prazo pertence ao usuário atual
    if (existingDeadline.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso não autorizado a este prazo'
      });
    }
    
    // Se estiver mudando o caso, verificar se o novo caso pertence ao usuário
    if (req.body.caseId && req.body.caseId !== existingDeadline.caseId) {
      const caseData = await storage.getCase(req.body.caseId);
      if (!caseData || caseData.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Acesso não autorizado ao caso informado'
        });
      }
    }
    
    // Preparar dados para atualização
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const updatedDeadline = await storage.updateDeadline(deadlineId, updateData);
    
    res.json({
      success: true,
      deadline: updatedDeadline
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos para atualização do prazo',
        errors: error.errors
      });
    }
    
    console.error('Erro ao atualizar prazo:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao atualizar prazo: ${error.message || 'Erro desconhecido'}`
    });
  }
});

// Marcar um prazo como concluído
router.patch('/:id/complete', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const deadlineId = parseInt(req.params.id);
    
    if (isNaN(deadlineId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de prazo inválido'
      });
    }
    
    const existingDeadline = await storage.getDeadline(deadlineId);
    
    if (!existingDeadline) {
      return res.status(404).json({
        success: false,
        message: 'Prazo não encontrado'
      });
    }
    
    // Verificar se o prazo pertence ao usuário atual
    if (existingDeadline.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso não autorizado a este prazo'
      });
    }
    
    // Se já estiver concluído, retornar sem alterações
    if (existingDeadline.completed) {
      return res.json({
        success: true,
        deadline: existingDeadline,
        message: 'Prazo já está marcado como concluído'
      });
    }
    
    const updatedDeadline = await storage.completeDeadline(deadlineId);
    
    res.json({
      success: true,
      deadline: updatedDeadline,
      message: 'Prazo marcado como concluído com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao marcar prazo como concluído:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao marcar prazo como concluído: ${error.message || 'Erro desconhecido'}`
    });
  }
});

// Excluir um prazo
router.delete('/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const deadlineId = parseInt(req.params.id);
    
    if (isNaN(deadlineId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de prazo inválido'
      });
    }
    
    const existingDeadline = await storage.getDeadline(deadlineId);
    
    if (!existingDeadline) {
      return res.status(404).json({
        success: false,
        message: 'Prazo não encontrado'
      });
    }
    
    // Verificar se o prazo pertence ao usuário atual
    if (existingDeadline.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso não autorizado a este prazo'
      });
    }
    
    const deleted = await storage.deleteDeadline(deadlineId);
    
    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Não foi possível excluir o prazo'
      });
    }
    
    res.json({
      success: true,
      message: 'Prazo excluído com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao excluir prazo:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao excluir prazo: ${error.message || 'Erro desconhecido'}`
    });
  }
});

export default router;