import { Router } from 'express';
import { isAuthenticated } from '../simpleAuth';
import { storage } from '../storage';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { z } from 'zod';

const router = Router();

// Configurar multer para upload de arquivos
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadDir;
      
      // Separar uploads de logo e assinatura em diretórios diferentes
      if (file.fieldname === 'logo') {
        uploadDir = path.join(process.cwd(), 'uploads', 'logos');
      } else if (file.fieldname === 'signature') {
        uploadDir = path.join(process.cwd(), 'uploads', 'signatures');
      } else {
        uploadDir = path.join(process.cwd(), 'uploads');
      }
      
      // Criar diretório se não existir
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Garantir nomes de arquivos únicos
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de 5MB
  },
  fileFilter: (req, file, cb) => {
    // Permitir apenas imagens
    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo inválido. Apenas JPG, PNG e SVG são permitidos.'));
    }
  }
});

// Schema de validação para configurações de texto
const updateSettingsSchema = z.object({
  address: z.string().optional(),
  oabNumber: z.string().optional(),
  useWatermark: z.boolean().optional()
});

// Obter configurações do usuário
router.get('/', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Obter configurações atuais
    let userSettings = await storage.getUserSettings(userId);
    
    if (!userSettings) {
      // Se não existir, criar um novo registro de configurações vazio
      userSettings = await storage.createUserSettings({
        id: uuidv4(),
        userId,
        logoPath: null,
        signaturePath: null,
        address: '',
        oabNumber: '',
        useWatermark: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Converter caminhos de arquivos em URLs acessíveis
    const baseUrl = process.env.NODE_ENV === 'production'
      ? `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`
      : 'http://localhost:5000';
    
    const response = {
      ...userSettings,
      logoUrl: userSettings.logoPath ? `${baseUrl}/${userSettings.logoPath.replace(/\\/g, '/')}` : null,
      signatureUrl: userSettings.signaturePath ? `${baseUrl}/${userSettings.signaturePath.replace(/\\/g, '/')}` : null
    };
    
    res.json(response);
  } catch (error) {
    console.error('Erro ao obter configurações:', error);
    res.status(500).json({ message: 'Erro ao obter configurações do usuário' });
  }
});

// Atualizar configurações de texto (endereço, OAB, uso de marca d'água)
router.post('/update', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Validar dados de entrada
    const validatedData = updateSettingsSchema.parse(req.body);
    
    // Obter configurações atuais
    let userSettings = await storage.getUserSettings(userId);
    
    if (!userSettings) {
      // Se não existir, criar um novo registro
      userSettings = await storage.createUserSettings({
        id: uuidv4(),
        userId,
        logoPath: null,
        signaturePath: null,
        address: validatedData.address || '',
        oabNumber: validatedData.oabNumber || '',
        useWatermark: validatedData.useWatermark || false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      res.json(userSettings);
      return;
    }
    
    // Atualizar configurações existentes
    const updatedSettings = await storage.updateUserSettings(userSettings.id, {
      address: validatedData.address !== undefined ? validatedData.address : userSettings.address,
      oabNumber: validatedData.oabNumber !== undefined ? validatedData.oabNumber : userSettings.oabNumber,
      useWatermark: validatedData.useWatermark !== undefined ? validatedData.useWatermark : userSettings.useWatermark
    });
    
    res.json(updatedSettings);
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
    }
    
    res.status(500).json({ message: 'Erro ao atualizar configurações do usuário' });
  }
});

// Upload de logo
router.post('/upload-logo', isAuthenticated, upload.single('logo'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }
    
    const userId = req.user.claims.sub;
    
    // Obter configurações atuais
    let userSettings = await storage.getUserSettings(userId);
    
    // Caminho relativo do arquivo para armazenar no banco
    const relativePath = path.relative(process.cwd(), req.file.path);
    
    if (!userSettings) {
      // Se não existir, criar um novo registro
      userSettings = await storage.createUserSettings({
        id: uuidv4(),
        userId,
        logoPath: relativePath,
        signaturePath: null,
        address: '',
        oabNumber: '',
        useWatermark: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else {
      // Se já existir, atualizar apenas o caminho do logo
      // Excluir arquivo antigo se existir
      if (userSettings.logoPath) {
        const oldFilePath = path.join(process.cwd(), userSettings.logoPath);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      userSettings = await storage.updateUserSettings(userSettings.id, {
        logoPath: relativePath
      });
    }
    
    res.json({
      success: true,
      logoPath: relativePath,
      message: 'Logo atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao fazer upload do logo:', error);
    res.status(500).json({ message: 'Erro ao fazer upload do logo' });
  }
});

// Upload de assinatura
router.post('/upload-signature', isAuthenticated, upload.single('signature'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }
    
    const userId = req.user.claims.sub;
    
    // Obter configurações atuais
    let userSettings = await storage.getUserSettings(userId);
    
    // Caminho relativo do arquivo para armazenar no banco
    const relativePath = path.relative(process.cwd(), req.file.path);
    
    if (!userSettings) {
      // Se não existir, criar um novo registro
      userSettings = await storage.createUserSettings({
        id: uuidv4(),
        userId,
        logoPath: null,
        signaturePath: relativePath,
        address: '',
        oabNumber: '',
        useWatermark: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else {
      // Se já existir, atualizar apenas o caminho da assinatura
      // Excluir arquivo antigo se existir
      if (userSettings.signaturePath) {
        const oldFilePath = path.join(process.cwd(), userSettings.signaturePath);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      userSettings = await storage.updateUserSettings(userSettings.id, {
        signaturePath: relativePath
      });
    }
    
    res.json({
      success: true,
      signaturePath: relativePath,
      message: 'Assinatura atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao fazer upload da assinatura:', error);
    res.status(500).json({ message: 'Erro ao fazer upload da assinatura' });
  }
});

export default router;