import { Router } from 'express';
import { storage } from '../storage';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// Configuração do multer para upload de arquivos
const uploadDir = path.join(process.cwd(), 'uploads');

// Criar diretório de uploads caso não exista
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Define storage para o multer
const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Cria um nome de arquivo único baseado no timestamp e nome original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage2,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Aceita apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos!') as any);
    }
  }
});

// Rota para obter as configurações do usuário
router.get('/', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || 'dev-user';
    const settings = await storage.getUserSettings(userId);
    
    if (settings) {
      // Adicionar URLs para as imagens
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      const response = {
        ...settings,
        logoUrl: settings.logoPath ? `${baseUrl}/uploads/${path.basename(settings.logoPath)}` : null,
        signatureUrl: settings.signaturePath ? `${baseUrl}/uploads/${path.basename(settings.signaturePath)}` : null
      };
      
      return res.json(response);
    }
    
    // Se não existir configurações, cria uma vazia
    const newSettings = await storage.createUserSettings({
      userId,
      logoPath: null,
      signaturePath: null,
      address: null,
      oabNumber: null,
      useWatermark: false
    });
    
    return res.json(newSettings);
  } catch (error) {
    console.error('Erro ao obter configurações:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao obter configurações do usuário' 
    });
  }
});

// Rota para atualizar as configurações do usuário
router.post('/update', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || 'dev-user';
    const { address, oabNumber, useWatermark } = req.body;
    
    // Verifica se as configurações existem
    let settings = await storage.getUserSettings(userId);
    
    if (!settings) {
      // Se não existir, cria uma nova
      settings = await storage.createUserSettings({
        userId,
        logoPath: null,
        signaturePath: null,
        address: address || null,
        oabNumber: oabNumber || null,
        useWatermark: useWatermark || false
      });
    } else {
      // Atualiza as configurações existentes
      settings = await storage.updateUserSettings(settings.id, {
        address: address !== undefined ? address : settings.address,
        oabNumber: oabNumber !== undefined ? oabNumber : settings.oabNumber,
        useWatermark: useWatermark !== undefined ? useWatermark : settings.useWatermark
      });
    }
    
    return res.json({ 
      success: true, 
      message: 'Configurações atualizadas com sucesso', 
      settings 
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar configurações do usuário' 
    });
  }
});

// Rota para upload de logo
router.post('/upload-logo', isAuthenticated, upload.single('logo'), async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || 'dev-user';
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nenhum arquivo enviado' 
      });
    }
    
    // Verifica se as configurações existem
    let settings = await storage.getUserSettings(userId);
    
    // Caminho do arquivo
    const filePath = req.file.path;
    
    if (!settings) {
      // Se não existir, cria uma nova
      settings = await storage.createUserSettings({
        userId,
        logoPath: filePath,
        signaturePath: null,
        address: null,
        oabNumber: null,
        useWatermark: false
      });
    } else {
      // Se existir um logo anterior, remove
      if (settings.logoPath && fs.existsSync(settings.logoPath)) {
        try {
          fs.unlinkSync(settings.logoPath);
        } catch (err) {
          console.error('Erro ao remover arquivo antigo:', err);
        }
      }
      
      // Atualiza as configurações existentes
      settings = await storage.updateUserSettings(settings.id, {
        logoPath: filePath
      });
    }
    
    // URL da imagem para retornar ao cliente
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const logoUrl = `${baseUrl}/uploads/${path.basename(filePath)}`;
    
    return res.json({ 
      success: true, 
      message: 'Logo atualizado com sucesso', 
      logoUrl,
      settings 
    });
  } catch (error) {
    console.error('Erro ao fazer upload do logo:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao fazer upload do logo' 
    });
  }
});

// Rota para upload de assinatura
router.post('/upload-signature', isAuthenticated, upload.single('signature'), async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub || 'dev-user';
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nenhum arquivo enviado' 
      });
    }
    
    // Verifica se as configurações existem
    let settings = await storage.getUserSettings(userId);
    
    // Caminho do arquivo
    const filePath = req.file.path;
    
    if (!settings) {
      // Se não existir, cria uma nova
      settings = await storage.createUserSettings({
        userId,
        logoPath: null,
        signaturePath: filePath,
        address: null,
        oabNumber: null,
        useWatermark: false
      });
    } else {
      // Se existir uma assinatura anterior, remove
      if (settings.signaturePath && fs.existsSync(settings.signaturePath)) {
        try {
          fs.unlinkSync(settings.signaturePath);
        } catch (err) {
          console.error('Erro ao remover arquivo antigo:', err);
        }
      }
      
      // Atualiza as configurações existentes
      settings = await storage.updateUserSettings(settings.id, {
        signaturePath: filePath
      });
    }
    
    // URL da imagem para retornar ao cliente
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const signatureUrl = `${baseUrl}/uploads/${path.basename(filePath)}`;
    
    return res.json({ 
      success: true, 
      message: 'Assinatura atualizada com sucesso', 
      signatureUrl,
      settings 
    });
  } catch (error) {
    console.error('Erro ao fazer upload da assinatura:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao fazer upload da assinatura' 
    });
  }
});

export default router;