# Integración con Express

Guía paso a paso para integrar el Notification Service en una aplicación Express.

## Instalación

```bash
npm install express mongoose expo-server-sdk cors helmet express-rate-limit
npm install -D typescript @types/express @types/node
```

## Estructura del Proyecto

```
src/
├── notifications/
│   ├── core/
│   │   ├── NotificationService.ts
│   │   └── NotificationTypes.ts
│   ├── adapters/
│   │   ├── BaseAdapter.ts
│   │   └── MongoAdapter.ts
│   ├── providers/
│   │   ├── BaseProvider.ts
│   │   └── ExpoProvider.ts
│   └── middleware/
│       ├── validateInput.ts
│       └── rateLimit.ts
└── routes/
    └── notifications.routes.ts
```

## Configuración Básica

### 1. Crear el Mapper

```typescript
// src/notifications/mappers.ts
import { NotificationMapper } from './NotificationTypes';

export const invoiceMapper: NotificationMapper = {
  emailField: 'cliente_email',
  idField: 'cliente_id',
  externalIdField: 'invoice_id',
  transform: (input) => ({
    title: `Factura ${input.invoice_id}`,
    body: input.monto ? `Monto: $${input.monto}` : 'Nueva factura',
    data: {
      type: 'invoice',
      invoice_id: input.invoice_id,
      monto: input.monto,
    }
  })
};
```

### 2. Inicializar el Servicio

```typescript
// src/notifications/index.ts
import { NotificationService } from './core/NotificationService';
import { MongoAdapter } from './adapters/MongoAdapter';
import { ExpoProvider } from './providers/ExpoProvider';
import { invoiceMapper } from './mappers';

const adapter = new MongoAdapter(mongoose.connection);
const provider = new ExpoProvider();

export const notificationService = new NotificationService({
  adapter,
  provider,
  mapper: invoiceMapper,
  logger: console,
  maxBatchSize: 10000,
});
```

### 3. Configurar Middlewares

```typescript
// src/middleware/auth.ts
import { authenticate, requireScopes } from './auth.middleware';
import { requireRole } from 'api-key-service'; // Reutiliza

export const requireNotificationAuth = authenticate;
export const requireNotificationScopes = (...scopes: string[]) => 
  requireScopes(...scopes);

export const requireAdmin = requireRole('admin');
```

### 4. Crear Rutas

```typescript
// src/routes/notifications.routes.ts
import { Router } from 'express';
import { notificationService } from '../notifications';
import { requireNotificationAuth, requireNotificationScopes } from '../middleware/auth';

const router = Router();

// Notificación individual
router.post('/send',
  requireNotificationAuth,
  requireNotificationScopes('notifications:send'),
  async (req, res) => {
    const result = await notificationService.sendSingle(req.body);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  }
);

// Notificaciones batch
router.post('/batch',
  requireNotificationAuth,
  requireNotificationScopes('notifications:send-batch'),
  async (req, res) => {
    const result = await notificationService.sendBatch(req.body.notifications);
    res.json(result);
  }
);

// Notificación masiva
router.post('/massive',
  requireNotificationAuth,
  requireNotificationScopes('notifications:send-massive'),
  async (req, res) => {
    const result = await notificationService.sendMassive(req.body);
    res.json(result);
  }
);

// Facturas
router.post('/invoice',
  requireNotificationAuth,
  requireNotificationScopes('notifications:send'),
  async (req, res) => {
    const result = await notificationService.sendInvoice(req.body.invoices);
    res.json(result);
  }
);

// Estadísticas
router.get('/stats',
  requireNotificationAuth,
  requireNotificationScopes('notifications:read'),
  async (req, res) => {
    const stats = await notificationService.getStats();
    res.json({ success: true, data: stats });
  }
);

export default router;
```

### 5. Registrar Rutas

```typescript
// src/app.ts
import express from 'express';
import notificationRoutes from './routes/notifications.routes';

const app = express();

app.use(express.json());
app.use('/api/notifications', notificationRoutes);

app.listen(3000, () => {
  console.log('Server running');
});
```

## Uso del Cliente

### Notificación Individual

```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: pk_live_..." \
  -d '{
    "title": "Hola!",
    "body": "Tienes una nueva notificación",
    "data": { "type": "alert" },
    "client": {
      "email": "cliente@email.com"
    }
  }'
```

### Batch de Notificaciones

```bash
curl -X POST http://localhost:3000/api/notifications/batch \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: pk_live_..." \
  -d '{
    "notifications": [
      { "title": "Notificación 1", "body": "Hola 1", "client": { "email": "cliente1@email.com" }},
      { "title": "Notificación 2", "body": "Hola 2", "client": { "email": "cliente2@email.com" }}
    ]
  }'
```

### Facturas

```bash
curl -X POST http://localhost:3000/api/notifications/invoice \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: pk_live_..." \
  -d '{
    "invoices": [
      { "invoice_id": "INV-001", "cliente_email": "cliente@email.com", "monto": 1500 }
    ]
  }'
```

## Mappers Polimórficos

El servicio se adapta a cualquier estructura de entrada:

```typescript
// Sistema CRM
const crmMapper: NotificationMapper = {
  emailField: 'contact_email',
  transform: (lead) => ({
    title: `Nuevo lead: ${lead.name}`,
    body: lead.notes,
    data: {
      type: 'lead',
      lead_id: lead.id,
      source: lead.source
    }
  })
};

// Sistema de inventarior
const inventoryMapper: NotificationMapper = {
  emailField: 'user_email',
  transform: (alert) => ({
    title: `Alerta de inventario: ${alert.product_name}`,
    body: `Quedan ${alert.quantity} unidades`,
    data: {
      type: 'inventory',
      product_id: alert.product_id,
      quantity: alert.quantity
    }
  })
};
```

## Configuración de Producción

```typescript
// environment
process.env.NODE_ENV = 'production';
process.env.EXPO_ACCESS_TOKEN = '...';

// Rate limiting estricto
app.use('/api/notifications', rateLimit({
  windowMs: 60 * 1000,
  max: 50,
}));

// Receipt processing automático
const service = new NotificationService({
  adapter,
  provider,
  mapper,
  autoProcessReceipts: true,
  receiptProcessInterval: 15 * 60 * 1000, // 15 minutos
});
```

## Troubleshooting

### "Token no encontrado"

Verifica que el cliente tenga un token registrado:

```typescript
// Registrar token
await adapter.upsertToken({
  token: 'ExponentPushToken[...]',
  clientEmail: 'cliente@email.com',
});
```

### "Cliente no encontrado"

Crea el cliente primero:

```typescript
// Crear cliente
await adapter.createClient({
  email: 'cliente@email.com',
  externalId: 'CRM-123',
});
```

### Timeouts con batches grandes

```typescript
// Procesar en chunks
const CHUNK_SIZE = 1000;

for (let i = 0; i < allNotifications.length; i += CHUNK_SIZE) {
  const chunk = allNotifications.slice(i, i + CHUNK_SIZE);
  await service.sendBatch(chunk);
}
```
