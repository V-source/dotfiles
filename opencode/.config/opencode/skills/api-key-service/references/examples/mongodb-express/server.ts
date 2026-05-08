/**
 * MongoDB + Express Example
 * 
 * Implementación completa del API Key Service con MongoDB y Express.
 * Copia esta estructura a tu proyecto.
 */

import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Imports del API Key Service
import {
  ApiKeyService,
  MongoAdapter,
  createAuthenticateMiddleware,
  requireAuth,
  requireScopes,
  requireRole,
  createApiKeyRateLimit,
} from './templates/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ============================================
// CONFIGURACIÓN
// ============================================

const CONFIG = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/api-keys',
  jwtSecret: process.env.JWT_SECRET || 'tu-secreto-jwt-aqui',
};

// ============================================
// SCHEMA MONGODB
// ============================================

// Nota: MongoAdapter crea el modelo automáticamente, pero puedes definirlo aquí

// ============================================
// APP EXPRESS
// ============================================

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

// ============================================
// API KEY SERVICE
// ============================================

// Conectar a MongoDB
await mongoose.connect(CONFIG.mongoUri);
console.log('✅ Conectado a MongoDB');

// Inicializar adapter y servicio
const mongoAdapter = new MongoAdapter(mongoose.connection);
const apiKeyService = new ApiKeyService({
  adapter: mongoAdapter,
  logger: {
    info: (msg, meta) => console.log(`[INFO] ${msg}`, meta || ''),
    warn: (msg, meta) => console.warn(`[WARN] ${msg}`, meta || ''),
    error: (msg, meta) => console.error(`[ERROR] ${msg}`, meta || ''),
  },
  defaultScopes: ['read'],
  keyPrefix: 'pk_live_',
});

// ============================================
// MIDDLEWARES DE AUTENTICACIÓN
// ============================================

// Rate limiter general
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
}));

// Middleware de autenticación dual
const authenticate = createAuthenticateMiddleware({
  apiKeyService,
  jwtSecret: CONFIG.jwtSecret,
  logger: {
    info: (msg, meta) => console.log(`[AUTH] ${msg}`, meta || ''),
    warn: (msg, meta) => console.warn(`[AUTH WARN] ${msg}`, meta || ''),
    error: (msg, meta) => console.error(`[AUTH ERROR] ${msg}`, meta || ''),
  },
});

app.use('/api', authenticate);

// ============================================
// RUTAS DE API KEYS (ADMIN)
// ============================================

// Middleware solo para admin
const requireAdmin = requireRole('admin');

// GET /api/admin/api-keys - Listar todas las keys
app.get('/api/admin/api-keys', requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.perPage as string) || 15;

    const result = await apiKeyService.list({
      pagination: { page, perPage },
      filter: {
        isActive: req.query.isActive === 'true' ? true : 
                  req.query.isActive === 'false' ? false : undefined,
        service: req.query.service as string,
        environment: req.query.environment as string,
      },
    });

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page,
        perPage,
        total: result.total,
        totalPages: Math.ceil(result.total / perPage),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error listing API keys',
      error: error.message,
    });
  }
});

// POST /api/admin/api-keys - Crear nueva key
app.post('/api/admin/api-keys', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, description, scopes, expiresAt, metadata } = req.body;

    if (!name || name.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Name is required (minimum 3 characters)',
      });
    }

    if (!scopes || !Array.isArray(scopes) || scopes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one scope is required',
      });
    }

    // Extraer userId del JWT (req.auth está configurado por el middleware)
    const createdBy = (req as any).auth?.userId || 'system';

    const result = await apiKeyService.create({
      name,
      description,
      scopes,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      metadata,
      createdBy,
    });

    res.status(201).json({
      success: true,
      message: 'API Key created. SAVE THIS KEY NOW - it will not be shown again!',
      data: {
        id: result.apiKey.id,
        name: result.apiKey.name,
        key: result.plainKey, // SOLO SE MUESTRA AHORA
        scopes: result.apiKey.scopes,
        expiresAt: result.apiKey.expiresAt,
        createdAt: result.apiKey.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating API key',
      error: error.message,
    });
  }
});

// GET /api/admin/api-keys/:id - Obtener detalle de una key
app.get('/api/admin/api-keys/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const apiKey = await apiKeyService.getById(req.params.id);

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API Key not found',
      });
    }

    res.json({
      success: true,
      data: apiKey,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting API key',
      error: error.message,
    });
  }
});

// PUT /api/admin/api-keys/:id - Actualizar una key
app.put('/api/admin/api-keys/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, description, scopes, isActive, expiresAt, metadata } = req.body;

    const updated = await apiKeyService.update(req.params.id, {
      name,
      description,
      scopes,
      isActive,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      metadata,
    });

    res.json({
      success: true,
      message: 'API Key updated',
      data: updated,
    });
  } catch (error) {
    if (error.message === 'API Key not found') {
      return res.status(404).json({
        success: false,
        message: 'API Key not found',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating API key',
      error: error.message,
    });
  }
});

// POST /api/admin/api-keys/:id/revoke - Revocar una key
app.post('/api/admin/api-keys/:id/revoke', requireAdmin, async (req: Request, res: Response) => {
  try {
    const revoked = await apiKeyService.revoke(req.params.id);

    res.json({
      success: true,
      message: 'API Key revoked',
      data: revoked,
    });
  } catch (error) {
    if (error.message === 'API Key not found') {
      return res.status(404).json({
        success: false,
        message: 'API Key not found',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error revoking API key',
      error: error.message,
    });
  }
});

// DELETE /api/admin/api-keys/:id - Eliminar una key
app.delete('/api/admin/api-keys/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    await apiKeyService.delete(req.params.id);

    res.json({
      success: true,
      message: 'API Key deleted permanently',
    });
  } catch (error) {
    if (error.message === 'API Key not found') {
      return res.status(404).json({
        success: false,
        message: 'API Key not found',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error deleting API key',
      error: error.message,
    });
  }
});

// GET /api/admin/api-keys/stats - Estadísticas
app.get('/api/admin/api-keys/stats', requireAdmin, async (req: Request, res: Response) => {
  try {
    const stats = await apiKeyService.getStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting stats',
      error: error.message,
    });
  }
});

// ============================================
// ENDPOINTS PROTEGIDOS
// ============================================

// Endpoint que requiere scope 'read:data'
app.get('/api/data', requireScopes('read:data'), (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      message: 'Datos accesibles con scope read:data',
      accessedBy: (req as any).auth,
    },
  });
});

// Endpoint que requiere scope 'write:data'
app.post('/api/data', requireScopes('write:data'), (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Datos creados',
    data: req.body,
  });
});

// ============================================
// RUTAS DE AUTH (EJEMPLO SIMPLIFICADO)
// ============================================

// Este es un ejemplo simplificado - en producción usa tu sistema de auth real
app.post('/api/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  // TODO: Validar credenciales contra tu base de datos de usuarios
  // Este es solo un ejemplo
  
  const jwt = await import('jsonwebtoken');
  const token = jwt.default.sign(
    { userId: 'user123', email, role: 'admin' },
    CONFIG.jwtSecret,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    token,
  });
});

// ============================================
// INICIO DEL SERVIDOR
// ============================================

app.listen(CONFIG.port, () => {
  console.log(`🚀 Server running on http://localhost:${CONFIG.port}`);
  console.log(`📋 API Keys Admin: POST /api/admin/api-keys`);
  console.log(`📋 Protected: GET /api/data (requires read:data scope)`);
});

export default app;
