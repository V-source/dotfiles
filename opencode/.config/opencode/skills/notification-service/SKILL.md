---
name: notification-service
description: Implementa un servicio completo de notificaciones push con Expo. Envío single, batch, massive, invoice y CSV. Formato polimórfico, scheduler injectable y adapter de base de datos agnóstico.
license: MIT
compatibility: opencode
metadata:
  version: "1.0.0"
  author: "OpenCode"
  providers: ["expo"]
  databases: ["mongodb", "postgresql", "custom"]
  frameworks: ["express", "fastify"]
allowed-tools:
  - read
  - write
  - edit
  - bash
---

# Notification Service

Implementa un servicio completo de notificaciones push para aplicaciones Node.js con soporte para múltiples tipos de envío, formato polimórfico y arquitectura extensible.

## What I do

- **Envío de notificaciones** push via Expo Server SDK
- **Tipos de envío**: Single, Batch, Massive, Invoice, CSV, Template
- **Formato polimórfico**: Se adapta a cualquier estructura de entrada
- **Matching optimizado**: Algoritmo O(n) con Mapas en lugar de O(n³)
- **Receipt processing**: Procesamiento asíncrono de estados de entrega
- **Scheduler injectable**: In-memory por defecto, extensible a Bull/node-cron
- **Base de datos agnóstica**: MongoDB, PostgreSQL o adapter personalizado
- **Rate limiting**: Por API Key o IP

## When to use me

Usa esta skill cuando necesites:

- **Notificaciones push** a dispositivos móviles (iOS/Android via Expo)
- **Envíos masivos** a todos los clientes registrados
- **Facturas/notificaciones** automáticas desde sistemas externos
- **Procesamiento batch** desde archivos CSV
- **Tracking de entrega** con receipts de Expo
- **Sistema escalable** que soporte miles de notificaciones por minuto

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Notification Service                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐    ┌────────────────┐    ┌─────────────────────────┐  │
│  │  Controller │───▶│    Service     │───▶│    Provider Factory    │  │
│  │   Layer     │    │    Layer       │    │    (Expo, Firebase)    │  │
│  └─────────────┘    └────────────────┘    └─────────────────────────┘  │
│         │                   │                         │                   │
│         ▼                   ▼                         ▼                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Notification Adapters                            │   │
│  │  • MongoAdapter    • PostgresAdapter    • Custom Adapter           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Scheduler Adapter                              │   │
│  │  • InMemory (default)  • Bull  • node-cron  • Cloud Scheduler  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Notification Types

| Tipo | Descripción | Endpoint | Auth |
|------|-------------|----------|------|
| **Single** | Un cliente específico | `/send` | API Key + scope |
| **Batch** | Múltiples clientes | `/batch` | API Key + scope |
| **Massive** | Todos los clientes | `/massive` | API Key + scope |
| **Invoice** | Formato facturas | `/invoice` | API Key + scope |
| **CSV** | Desde archivo CSV | `/csv` | JWT |
| **Template** | Plantillas | `/template` | API Key + scope |

## Formato Polimórfico

El servicio se adapta a cualquier estructura de entrada mediante **mappers configurables**:

```typescript
interface NotificationMapper {
  // Campo que identifica al cliente
  emailField?: string;
  idField?: string;
  
  // Transformación de datos
  transform?: (input: any) => {
    title: string;
    body: string;
    data?: Record<string, any>;
    [key: string]: any;
  };
  
  // Filtros opcionales
  filter?: (input: any) => boolean;
}

const invoiceMapper: NotificationMapper = {
  emailField: 'cliente_email',
  transform: (invoice) => ({
    title: `Factura ${invoice.invoice_id}`,
    body: `Monto: $${invoice.monto}`,
    data: {
      type: 'invoice',
      invoice_id: invoice.invoice_id,
      monto: invoice.monto,
      vencimiento: invoice.vencimiento
    }
  })
};

const service = new NotificationService({
  provider: new ExpoProvider(),
  mapper: invoiceMapper
});
```

## Provider Pattern

### Expo Provider

```typescript
import { ExpoProvider } from './providers/ExpoProvider';

const expoProvider = new ExpoProvider({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
  useSandbox: false // true for testing
});
```

### Agregar Nuevos Providers

```typescript
interface PushProvider {
  name: string;
  send(messages: RawMessage[]): Promise<Ticket[]>;
  chunk(messages: RawMessage[]): RawMessage[][];
  validateToken(token: string): boolean;
  getReceipts(ticketIds: string[]): Promise<Receipt[]>;
}

// Firebase example:
class FirebaseProvider implements PushProvider {
  name = 'firebase';
  // ...
}
```

## Database Adapters

### Interface BaseAdapter

```typescript
interface BaseAdapter {
  // Notifications
  createNotification(data: CreateNotificationDTO): Promise<Notification>;
  findNotificationsByClient(email: string): Promise<Notification[]>;
  findUnreadByClient(email: string): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
  updateStatus(id: string, status: NotificationStatus): Promise<void>;
  
  // Tokens
  findTokenByClient(email: string): Promise<PushToken | null>;
  findTokensByClients(emails: string[]): Promise<PushToken[]>;
  upsertToken(data: UpsertTokenDTO): Promise<PushToken>;
  validateToken(token: string): boolean;
  
  // Clients
  findClient(email: string): Promise<Client | null>;
  findClients(emails: string[]): Promise<Client[]>;
  createClient(data: CreateClientDTO): Promise<Client>;
}
```

### Adapters Incluidos

- **MongoAdapter**: MongoDB con Mongoose
- **PostgresAdapter**: PostgreSQL con Prisma/TypeORM
- **MemoryAdapter**: Para testing

## Scheduler Adapter

### Interface SchedulerAdapter

```typescript
interface SchedulerAdapter {
  schedule(job: {
    id: string;
    data: any;
    intervalMs: number;
    callback: (data: any) => Promise<void>;
  }): void;
  
  remove(id: string): void;
  clear(): void;
  
  start(): void;
  stop(): void;
}
```

### Implementaciones

| Adapter | Caso de Uso | Dependencias |
|---------|-------------|--------------|
| **InMemory** | Development, testing | Ninguna |
| **Bull** | Producción con Redis | bull, ioredis |
| **NodeCron** | Producción simple | node-cron |
| **CloudScheduler** | Serverless | @google-cloud/scheduler |

```typescript
// Default - Zero dependencies
const scheduler = new InMemorySchedulerAdapter();

// Production - With Redis
const scheduler = new BullSchedulerAdapter({
  redis: { host: 'localhost', port: 6379 },
  prefix: 'notifications'
});
```

## Performance: O(n) vs O(n³)

```typescript
// ❌ ANTES: O(n³) - Timeouts con >1000 clientes
for (const notification of notifications) {
  for (const client of clients) {
    for (const token of tokens) {
      if (notification.email === token.email) {
        // send notification
      }
    }
  }
}

// ✅ DESPUÉS: O(n) - Soporta 10,000+ clientes
const clientMap = new Map(clients.map(c => [c.email, c]));
const tokenMap = new Map(tokens.map(t => [t.email, t]));

for (const notification of notifications) {
  const client = clientMap.get(notification.email);
  const token = tokenMap.get(notification.email);
  if (client && token) {
    // send notification
  }
}
```

## Implementation Steps

### 1. Copiar Templates

Copia los templates desde `references/templates/` a tu proyecto:

```bash
src/
├── notifications/
│   ├── core/
│   │   ├── NotificationService.ts
│   │   ├── NotificationTypes.ts
│   │   └── ReceiptProcessor.ts
│   ├── adapters/
│   │   ├── BaseAdapter.ts
│   │   └── MongoAdapter.ts
│   ├── providers/
│   │   ├── ExpoProvider.ts
│   │   └── BaseProvider.ts
│   └── middleware/
│       ├── validateInput.ts
│       └── rateLimit.ts
└── routes/
    └── notifications.routes.ts
```

### 2. Configurar Provider

```typescript
import { ExpoProvider } from './notifications/providers/ExpoProvider';

const expoProvider = new ExpoProvider({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
  useSandbox: process.env.NODE_ENV !== 'production'
});
```

### 3. Configurar Adapter

```typescript
import { MongoAdapter } from './notifications/adapters/MongoAdapter';

const mongoAdapter = new MongoAdapter(mongoose.connection);
```

### 4. Configurar Mapper (Polimórfico)

```typescript
const myMapper = {
  emailField: 'cliente_email',
  idField: 'cliente_id',
  transform: (input) => ({
    title: input.asunto,
    body: input.mensaje,
    data: {
      type: input.tipo,
      referencia: input.ref
    }
  })
};
```

### 5. Inicializar Servicio

```typescript
import { NotificationService } from './notifications/core/NotificationService';

const notificationService = new NotificationService({
  provider: expoProvider,
  adapter: mongoAdapter,
  mapper: myMapper,
  scheduler: new InMemorySchedulerAdapter(),
  logger: console
});
```

### 6. Configurar Rutas

```typescript
import { createNotificationRoutes } from './routes/notifications.routes';

const router = createNotificationRoutes(notificationService);
app.use('/api/notifications', router);
```

## Middlewares

### Rate Limiting

```typescript
import { createNotificationRateLimit } from './notifications/middleware/rateLimit';

app.use('/api/notifications', createNotificationRateLimit({
  windowMs: 60 * 1000,
  max: 100 // notifications per minute
}));
```

### Validación de Input

```typescript
import { createValidationMiddleware } from './notifications/middleware/validateInput';

const singleNotificationSchema = {
  emailField: 'email',
  required: ['title', 'body', 'email'],
  maxBatchSize: 10000
};

router.post('/send', 
  createValidationMiddleware(singleNotificationSchema),
  controller.sendSingle
);
```

## Receipt Processing

```typescript
// Receipt processor integrado
const processor = new ReceiptProcessor({
  provider: expoProvider,
  adapter: mongoAdapter,
  intervalMs: 15 * 60 * 1000 // cada 15 minutos
});

// Programar procesamiento
processor.schedule();

// O ejecutar manualmente
await processor.processPending();
```

## Error Handling

```typescript
// Respuestas consistentes
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Errores específicos
- ValidationError: 400
- AuthenticationError: 401
- AuthorizationError: 403
- NotFoundError: 404
- RateLimitError: 429
- ProviderError: 502
```

## Security Features

1. **Autenticación dual**: JWT o API Key
2. **Scopes granulares**: `notifications:send`, `notifications:send-massive`, etc.
3. **Rate limiting**: Por endpoint y por cliente
4. **Token validation**: Verificación antes de envío
5. **Receipt tracking**: Seguimiento de entrega
6. **Audit logging**: Registro de todas las operaciones

## Available Scopes

| Scope | Descripción |
|-------|-------------|
| `notifications:send` | Enviar notificaciones single/batch |
| `notifications:send-massive` | Enviar a todos los clientes |
| `notifications:send-batch` | Envío batch de notificaciones |
| `notifications:read` | Leer historial de notificaciones |
| `notifications:manage` | Gestión completa (incluye templates) |

## Logging

Inyecta tu logger compatible:

```typescript
interface Logger {
  info(msg: string, meta?: any): void;
  warn(msg: string, meta?: any): void;
  error(msg: string, meta?: any): void;
  debug(msg: string, meta?: any): void;
}

// Winston
const logger = winston.createLogger({...});
notificationService = new NotificationService({..., logger});

// Console
notificationService = new NotificationService({..., logger: console});

// Sin logger
notificationService = new NotificationService({...});
```

## Testing

Usa el MemoryAdapter y scheduler in-memory:

```typescript
import { NotificationService } from './notifications/core/NotificationService';
import { MemoryAdapter } from './notifications/adapters/MemoryAdapter';
import { InMemorySchedulerAdapter } from './notifications/scheduler/InMemoryScheduler';
import { ExpoProvider } from './notifications/providers/ExpoProvider';

const adapter = new MemoryAdapter();
const scheduler = new InMemorySchedulerAdapter();
const provider = new ExpoProvider(); // Expo sin credenciales para testing

const service = new NotificationService({
  adapter,
  scheduler,
  provider,
  mapper: {...}
});

// Tests
describe('NotificationService', () => {
  test('sends single notification', async () => {
    const result = await service.sendSingle({...});
    expect(result.success).toBe(true);
  });
});
```

## References

- `references/templates/`: Templates base para copiar
- `references/examples/`: Ejemplos completos funcionales
- `references/integration-guides/`: Guías de integración

## License

MIT - Libre para usar en proyectos personales y comerciales.
