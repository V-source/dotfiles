/**
 * MongoDB + Express Example
 * 
 * Implementación completa del Notification Service con MongoDB y Express.
 */

import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import {
  NotificationService,
  ExpoProvider,
  MongoAdapter,
  NotificationMapper,
} from '../templates/index.js';

import {
  createValidationMiddleware,
  singleNotificationSchema,
  batchNotificationSchema,
  massiveNotificationSchema,
} from '../templates/middleware/validateInput';

import {
  createNotificationRateLimit,
  createBatchNotificationRateLimit,
} from '../templates/middleware/rateLimit';

import {
  authenticate,
  requireScopes,
  requireRole,
} from './auth.middleware.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ============================================
// CONFIGURACIÓN
// ============================================

const CONFIG = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/notifications',
  expoAccessToken: process.env.EXPO_ACCESS_TOKEN,
};

// ============================================
// MAPPERS POLIMÓRFICOS
// ============================================

// Mapper para sistema de facturación
const invoiceMapper: NotificationMapper = {
  emailField: 'cliente_email',
  idField: 'cliente_id',
  externalIdField: 'invoice_id',
  transform: (input) => ({
    title: `Factura ${input.invoice_id || input.factura_id}`,
    body: input.monto 
      ? `Monto: $${input.monto}` 
      : 'Tienes una nueva factura',
    data: {
      type: 'invoice',
      invoice_id: input.invoice_id || input.factura_id,
      monto: input.monto,
      vencimiento: input.vencimiento || input.expires_in,
    },
  }),
};

// Mapper genérico
const genericMapper: NotificationMapper = {
  emailField: 'email',
  transform: (input) => ({
    title: input.title || input.asunto,
    body: input.body || input.mensaje,
    data: input.data || {},
  }),
};

// ============================================
// APP EXPRESS
// ============================================

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

// ============================================
// CONEXIÓN A DB
// ============================================

await mongoose.connect(CONFIG.mongoUri);
console.log('✅ Conectado a MongoDB');

// ============================================
// NOTIFICATION SERVICE
// ============================================

const mongoAdapter = new MongoAdapter(mongoose.connection);

const expoProvider = new ExpoProvider({
  accessToken: CONFIG.expoAccessToken,
});

const notificationService = new NotificationService({
  provider: expoProvider,
  adapter: mongoAdapter,
  mapper: invoiceMapper, // Usar mapper de facturas
  logger: console,
  maxBatchSize: 10000,
  autoProcessReceipts: false, // Activar en producción
});

// ============================================
// MIDDLEWARES
// ============================================

// Rate limiting general
app.use('/api/notifications', createNotificationRateLimit());

// Rate limiting batch
app.use('/api/notifications/batch', createBatchNotificationRateLimit());

// Autenticación global para /api/notifications
app.use('/api/notifications', authenticate);

// ============================================
// RUTAS
// ============================================

// POST /send - Notificación individual
app.post('/api/notifications/send',
  requireScopes('notifications:send'),
  createValidationMiddleware(singleNotificationSchema),
  async (req: Request, res: Response) => {
    try {
      const result = await notificationService.sendSingle(req.body);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.errors?.[0]?.error || 'Error sending notification',
        });
      }

      res.json({
        success: true,
        data: {
          sent: result.sent,
          failed: result.failed,
          tickets: result.tickets,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }
);

// POST /batch - Notificaciones batch
app.post('/api/notifications/batch',
  requireScopes('notifications:send-batch'),
  createValidationMiddleware(batchNotificationSchema),
  async (req: Request, res: Response) => {
    try {
      const result = await notificationService.sendBatch(req.body.notifications, {
        skipInvalid: true,
      });

      res.json({
        success: true,
        data: {
          total: req.body.notifications.length,
          sent: result.sent,
          failed: result.failed,
          errors: result.errors,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }
);

// POST /massive - Notificación masiva
app.post('/api/notifications/massive',
  requireScopes('notifications:send-massive'),
  createValidationMiddleware(massiveNotificationSchema),
  async (req: Request, res: Response) => {
    try {
      const result = await notificationService.sendMassive(req.body);

      res.json({
        success: true,
        data: {
          sent: result.sent,
          failed: result.failed,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }
);

// POST /invoice - Facturas (usa invoiceMapper)
app.post('/api/notifications/invoice',
  requireScopes('notifications:send'),
  async (req: Request, res: Response) => {
    try {
      const result = await notificationService.sendInvoice(req.body.data || req.body.invoices || []);

      res.json({
        success: true,
        data: {
          total: req.body.data?.length || 0,
          sent: result.sent,
          failed: result.failed,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }
);

// GET /stats - Estadísticas
app.get('/api/notifications/stats',
  requireScopes('notifications:read'),
  async (req: Request, res: Response) => {
    try {
      const stats = await notificationService.getStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// GET /receipts/process - Procesar receipts manualmente
app.post('/api/notifications/receipts/process',
  requireScopes('notifications:manage'),
  async (req: Request, res: Response) => {
    try {
      const stats = await notificationService.processReceipts();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// GET /:email - Notificaciones de un cliente
app.get('/api/notifications/:email',
  async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.perPage as string) || 20;

      const result = await notificationService.getClientNotifications(
        req.params.email,
        { page, perPage }
      );

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);

// ============================================
// RUTAS DE TOKENS (para dispositivos)
// ============================================

// POST /tokens - Registrar token
app.post('/api/tokens', async (req: Request, res: Response) => {
  try {
    const { token, email, clientId } = req.body;

    if (!token || !email) {
      return res.status(400).json({
        success: false,
        message: 'Token and email are required',
      });
    }

    const result = await mongoAdapter.upsertToken({
      token,
      clientEmail: email,
      clientId,
      provider: 'expo',
    });

    res.json({
      success: true,
      data: {
        id: result.id,
        isValid: result.isValid,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering token',
    });
  }
});

// DELETE /tokens/:id - Invalidar token
app.delete('/api/tokens/:id', async (req: Request, res: Response) => {
  try {
    await mongoAdapter.invalidateToken(req.params.id);

    res.json({
      success: true,
      message: 'Token invalidated',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error invalidating token',
    });
  }
});

// ============================================
// RUTAS DE CLIENTES
// ============================================

// POST /clients - Crear cliente
app.post('/api/clients', async (req: Request, res: Response) => {
  try {
    const { email, externalId } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const client = await mongoAdapter.createClient({
      email,
      externalId,
    });

    res.status(201).json({
      success: true,
      data: client,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating client',
    });
  }
});

// GET /clients - Listar clientes
app.get('/api/clients', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.perPage as string) || 20;

    const result = await mongoAdapter.findAllClients({ page, perPage });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error listing clients',
    });
  }
});

// ============================================
// ERROR HANDLER
// ============================================

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// ============================================
// INICIO
// ============================================

app.listen(CONFIG.port, () => {
  console.log(`🚀 Notification Service running on http://localhost:${CONFIG.port}`);
  console.log(`📱 Endpoints:`);
  console.log(`   POST /api/notifications/send`);
  console.log(`   POST /api/notifications/batch`);
  console.log(`   POST /api/notifications/massive`);
  console.log(`   POST /api/notifications/invoice`);
  console.log(`   GET /api/notifications/:email`);
  console.log(`   GET /api/notifications/stats`);
});

export default app;
