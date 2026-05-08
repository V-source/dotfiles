# Integración con Express

Guía paso a paso para integrar el API Key Service en una aplicación Express existente.

## Instalación de Dependencias

```bash
npm install express mongoose cors helmet express-rate-limit jsonwebtoken
npm install -D typescript @types/express @types/node
```

## Estructura del Proyecto

```
src/
├── api-keys/
│   ├── index.ts                    # Exports
│   ├── ApiKeyService.ts            # Servicio
│   ├── adapters/
│   │   ├── BaseAdapter.ts          # Interface
│   │   ├── MongoAdapter.ts         # MongoDB
│   │   └── PostgresAdapter.ts      # PostgreSQL
│   └── middleware/
│       ├── authenticate.ts         # Auth dual
│       ├── requireScopes.ts        # Scopes
│       └── rateLimit.ts           # Rate limiting
└── routes/
    └── admin.routes.ts            # Rutas admin
```

## Configuración Básica

### 1. Crear el Servicio

```typescript
// src/api-keys/index.ts
import { ApiKeyService } from './ApiKeyService';
import { MongoAdapter } from './adapters/MongoAdapter';
import mongoose from 'mongoose';

const adapter = new MongoAdapter(mongoose.connection);

export const apiKeyService = new ApiKeyService({
  adapter,
  logger: console,
  defaultScopes: ['read'],
});
```

### 2. Configurar Middleware de Autenticación

```typescript
// src/middleware/auth.ts
import { createAuthenticateMiddleware } from '../api-keys/middleware/authenticate';
import { apiKeyService } from '../api-keys';

export const authenticate = createAuthenticateMiddleware({
  apiKeyService,
  jwtSecret: process.env.JWT_SECRET!,
});
```

### 3. Proteger Endpoints

```typescript
// src/routes/data.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireScopes } from '../api-keys/middleware/requireScopes';

const router = Router();

// Proteger todas las rutas de /api/data
router.use(authenticate);

// Leer datos (requiere scope read:data)
router.get('/', requireScopes('read:data'), (req, res) => {
  res.json({ data: [...] });
});

// Crear datos (requiere scope write:data)
router.post('/', requireScopes('write:data'), (req, res) => {
  res.status(201).json({ message: 'Created' });
});

export default router;
```

### 4. Rutas de Administración

```typescript
// src/routes/admin.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../api-keys/middleware/requireScopes';
import { apiKeyService } from '../api-keys';

const router = Router();

// Middleware para verificar rol admin
const requireAdmin = requireRole('admin');

// Aplicar auth + rol admin
router.use(authenticate);
router.use(requireAdmin);

// Listar API Keys
router.get('/api-keys', async (req, res) => {
  const keys = await apiKeyService.list({});
  res.json({ data: keys.data });
});

// Crear API Key
router.post('/api-keys', async (req, res) => {
  const result = await apiKeyService.create({
    name: req.body.name,
    scopes: req.body.scopes,
    createdBy: (req as any).auth.userId,
  });
  
  // ⚠️ La key solo se muestra aquí
  res.status(201).json({ key: result.plainKey });
});

export default router;
```

## Uso del Cliente

### Con API Key

```bash
curl -X GET http://localhost:3000/api/data \
  -H "X-Api-Key: pk_live_abc123..."
```

### Con JWT

```bash
curl -X GET http://localhost:3000/api/data \
  -H "Authorization: Bearer eyJhbGci..."
```

## Rate Limiting

### Rate Limiter General

```typescript
import rateLimit from 'express-rate-limiter';

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
}));
```

### Rate Limiter por API Key

```typescript
import { createApiKeyRateLimit } from '../api-keys/middleware/rateLimit';

// Endpoints críticos con rate limiting por key
app.use('/api/critical', createApiKeyRateLimit({
  windowMs: 60 * 1000,
  max: 10,
}));
```

## Manejo de Errores

```typescript
// Middleware de error global
app.use((err: Error, req, res, next) => {
  console.error(err);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// Error handler específico para auth
app.use('/api', (err: Error, req, res, next) => {
  if (err.message === 'Authentication required') {
    return res.status(401).json({
      success: false,
      message: 'Please provide API Key or JWT',
    });
  }
  next(err);
});
```

## Configuración de Producción

```typescript
// environment variables
process.env.NODE_ENV = 'production';
process.env.JWT_SECRET = 'use-a-strong-secret';
process.env.MONGODB_URI = 'mongodb+srv://...';

// HTTPS obligatorio
// Tu reverse proxy (nginx, etc.) debe redirigir HTTP a HTTPS

// Rate limiting estricto
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // Reducir límite en producción
}));
```

## Verificación de Integración

```bash
# 1. Iniciar servidor
npm run dev

# 2. Login como admin (reemplazar con tu sistema de auth)
POST /api/login
{ "email": "admin@example.com", "password": "..." }

# 3. Crear API Key
POST /api/admin/api-keys
Authorization: Bearer <jwt-token>
{ "name": "My Service", "scopes": ["read:data", "write:data"] }

# 4. Probar endpoint protegido con la key
GET /api/data
X-Api-Key: pk_live_...
```

## Troubleshooting

### "Authentication required"

asegúrate de enviar el header correcto:
- `X-Api-Key` para API Keys
- `Authorization: Bearer <token>` para JWT

### "Insufficient permissions"

Verifica que el scope requerido esté en la lista de scopes de la API Key.

### MongoDB connection refused

Asegúrate de que MongoDB esté corriendo y la URI sea correcta.

### Transaction errors

Si ves errores de transacciones, recuerda que MongoDB standalone no soporta transacciones. Usa un replica set.
