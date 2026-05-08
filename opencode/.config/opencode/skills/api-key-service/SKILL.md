---
name: api-key-service
description: Implementa un servicio completo de gestión de API Keys con autenticación dual, scopes, rate limiting y estadísticas. Agnóstico de base de datos.
license: MIT
compatibility: opencode
metadata:
  version: "1.0.0"
  author: "OpenCode"
  databases: ["mongodb", "postgresql", "custom"]
  frameworks: ["express", "fastify"]
allowed-tools:
  - read
  - write
  - edit
  - bash
---

# API Key Service

Implementa un sistema completo de gestión de API Keys para aplicaciones Node.js/Express con autenticación dual, control de scopes, rate limiting y estadísticas de uso.

## What I do

- **Generación segura** de API Keys (formato: `pk_live_...`)
- **Autenticación dual**: Soporta API Keys (para servicios) y JWT (para usuarios)
- **Control de acceso granular** mediante scopes/permisos
- **Rate limiting** por API Key o IP
- **Tracking completo**: Contador de uso, última vez usada, estadísticas
- **Gestión administrativa**: CRUD completo de API Keys
- **Agnóstico de base de datos**: Funciona con MongoDB, PostgreSQL o cualquier DB

## When to use me

Usa esta skill cuando necesites:

- **Autenticar servicios de terceros** que consumen tu API
- **Control de acceso granular** con diferentes niveles de permisos
- **Rate limiting por cliente** para proteger tus recursos
- **Auditoría y tracking** de quién usa tu API y cuándo
- **Capacidad de revocación** de acceso inmediata
- **Separar autenticación de usuarios vs servicios**

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     API Key Service                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌────────────────┐    ┌──────────────┐ │
│  │   Service    │───▶│    Adapter     │───▶│  Database    │ │
│  │   Layer      │    │    Pattern     │    │  (Any)       │ │
│  └──────────────┘    └────────────────┘    └──────────────┘ │
│         │                                                    │
│         ▼                                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Authentication Middleware                  │ │
│  │  • authenticate()     - Detecta API Key o JWT          │ │
│  │  • requireScopes()    - Valida permisos                │ │
│  │  • rateLimit()        - Limita por key/IP              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Key Format

Las API Keys siguen el formato: `pk_live_<64 caracteres hexadecimales>`

**Ejemplo:** `pk_live_a3f5b2c8d9e1f4a7b6c3d8e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9`

## Security Features

1. **Hashing**: Solo se almacena SHA256 hash, nunca el texto plano
2. **One-time display**: La key se muestra solo al crearla
3. **Expiración opcional**: Puedes definir fecha de expiración
4. **IP Whitelist**: Restricción por IP opcional
5. **Revocación**: Desactivación inmediata sin eliminar registro
6. **Auditoría**: Tracking completo de uso

## Database Adapters

El sistema usa el patrón Adapter para ser agnóstico de base de datos.

### Interface BaseAdapter

```typescript
interface BaseAdapter {
  // CRUD Operations
  create(data: CreateApiKeyDTO): Promise<ApiKey>;
  findByKeyHash(hash: string): Promise<ApiKey | null>;
  findById(id: string): Promise<ApiKey | null>;
  list(options: ListOptions): Promise<{ data: ApiKey[]; total: number }>;
  update(id: string, data: UpdateDTO): Promise<ApiKey>;
  revoke(id: string): Promise<ApiKey>;
  delete(id: string): Promise<void>;
  
  // Usage tracking
  incrementUsage(id: string): Promise<void>;
  
  // Statistics
  getStats(): Promise<StatsResult>;
}
```

### Adapters incluidos

- **MongoAdapter**: Para MongoDB con Mongoose
- **PostgresAdapter**: Para PostgreSQL con Prisma/TypeORM
- **MemoryAdapter**: Para testing (en memoria)

## Available Scopes

Define tus propios scopes según tus necesidades. Ejemplos comunes:

| Scope | Descripción |
|-------|-------------|
| `read:users` | Leer información de usuarios |
| `write:users` | Crear/actualizar usuarios |
| `read:data` | Leer datos generales |
| `write:data` | Crear/actualizar datos |
| `admin:*` | Acceso administrativo completo |

## Implementation Steps

Para implementar el API Key Service en tu proyecto:

### 1. Copiar Templates

Copia los templates desde `references/templates/` a tu proyecto:

```bash
# Estructura sugerida en tu proyecto:
src/
├── api-keys/
│   ├── ApiKeyService.ts
│   ├── adapters/
│   │   └── MongoAdapter.ts  # o PostgresAdapter.ts
│   ├── middleware/
│   │   ├── authenticate.ts
│   │   ├── requireScopes.ts
│   │   └── rateLimit.ts
│   └── types.ts
└── routes/
    └── api-keys.routes.ts
```

### 2. Implementar Adapter

Elige tu base de datos y copia el adapter correspondiente:

**Para MongoDB:**
- Copia `references/templates/adapters/MongoAdapter.ts`
- Define tu schema Mongoose
- Implementa los métodos de BaseAdapter

**Para PostgreSQL:**
- Copia `references/templates/adapters/PostgresAdapter.ts`
- Define tu schema Prisma/TypeORM
- Implementa los métodos de BaseAdapter

### 3. Configurar Middlewares

En tu aplicación Express:

```typescript
import { createAuthenticateMiddleware } from './api-keys/middleware/authenticate';
import { ApiKeyService } from './api-keys/ApiKeyService';
import { MongoAdapter } from './api-keys/adapters/MongoAdapter';

// Inicializar servicio
const apiKeyService = new ApiKeyService({
  adapter: new MongoAdapter(mongoose.connection),
  logger: console,  // Opcional: tu logger
});

// Middleware global de autenticación
app.use(createAuthenticateMiddleware(apiKeyService));
```

### 4. Crear Rutas Admin

Para que los administradores gestionen API Keys:

```typescript
import { createApiKeyRoutes } from './routes/api-keys.routes';

// Rutas protegidas (solo admin)
app.use('/api/admin/api-keys', 
  authenticateJWT,  // Tu middleware JWT
  requireRole('admin'),  // Tu middleware de roles
  createApiKeyRoutes(apiKeyService)
);
```

### 5. Proteger Endpoints

Protege tus endpoints con scopes:

```typescript
import { requireScopes } from './api-keys/middleware/requireScopes';

// Endpoint que requiere API Key con scope específico
app.get('/api/users',
  requireScopes('read:users'),
  async (req, res) => {
    // req.auth contiene: { type: 'api-key', apiKeyId, scopes, ... }
    // o { type: 'jwt', userId, role, ... }
    const users = await getUsers();
    res.json(users);
  }
);
```

## Authentication Flow

### Flujo de Autenticación API Key

```
1. Cliente envía request
   Headers: X-Api-Key: pk_live_abc123...

2. Middleware authenticate()
   ├── Detecta header X-Api-Key
   ├── Hashea la key: SHA256(apiKey)
   ├── Busca en DB: findOne({ keyHash })
   ├── Valida expiración
   ├── Valida IP whitelist (si aplica)
   ├── Incrementa usageCount (async)
   └── Attach req.auth = { type: 'api-key', ... }

3. Middleware requireScopes('scope1', 'scope2')
   ├── Si type === 'jwt': pass (roles manejan acceso)
   ├── Si type === 'api-key': 
   │   └── Verifica que todos los scopes requeridos estén en req.auth.scopes
   └── Si falta algún scope: 403 Forbidden

4. Ejecuta handler
```

### Flujo de Autenticación JWT (mantenido para compatibilidad)

```
1. Cliente envía request
   Headers: Authorization: Bearer <jwt-token>

2. Middleware authenticate()
   ├── Detecta Authorization: Bearer
   ├── Verifica JWT con jwt.verify()
   └── Attach req.auth = { type: 'jwt', userId, role, ... }
```

## Critical Rules

1. **NUNCA almacenar API keys en texto plano**
   - Siempre hashear con SHA256 antes de guardar
   - Comparar hashes, nunca strings directos

2. **NUNCA exponer el hash en respuestas**
   - El campo `keyHash` nunca debe salir en JSON
   - Solo usar `keyHash` internamente para búsqueda

3. **SIEMPRE mostrar key solo UNA VEZ al crear**
   - En respuesta de POST /api/admin/api-keys
   - Después, imposible recuperar la key original
   - Si se pierde, solo opción es crear nueva

4. **SIEMPRE validar scopes antes de permitir acceso**
   - No asumir que autenticado = autorizado
   - Verificar scopes explícitamente en cada endpoint protegido

5. **SIEMPRE usar HTTPS en producción**
   - Las API Keys van en headers
   - HTTP expone las keys a interceptación

6. **NUNCA loguear API keys completas**
   - Usar función de masking: mostrar solo primeros 8 y últimos 8 caracteres
   - Ejemplo: `pk_live_a3f5...8f9a`

7. **SIEMPRE manejar errores de autenticación**
   - 401: No autenticado (falta credencial)
   - 403: No autorizado (falta scope/permiso)
   - No exponer información sensible en mensajes de error

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

## Examples

Ver directorio `references/examples/` para implementaciones completas:

- `mongodb-express/`: Implementación completa con MongoDB y Express
- `postgres-express/`: Implementación completa con PostgreSQL y Express

Cada ejemplo incluye:
- Configuración inicial
- Models/Schemas
- Controllers
- Routes
- Tests

## Integration with express-rate-limit

Ejemplo de integración:

```typescript
import rateLimit from 'express-rate-limit';
import { createApiKeyRateLimit } from './api-keys/middleware/rateLimit';

// Rate limit general
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 100,  // 100 requests por IP
}));

// Rate limit específico por API Key
app.use('/api/critical', createApiKeyRateLimit({
  windowMs: 60 * 1000,  // 1 minuto
  max: 10,  // 10 requests por API Key
}));
```

## Logger Injection

El servicio acepta un logger inyectable:

```typescript
interface Logger {
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

// Ejemplo con Winston
import winston from 'winston';
const apiKeyService = new ApiKeyService({
  adapter: mongoAdapter,
  logger: winston,
});

// Ejemplo con consola simple
const apiKeyService = new ApiKeyService({
  adapter: mongoAdapter,
  logger: console,
});

// Sin logger (default)
const apiKeyService = new ApiKeyService({
  adapter: mongoAdapter,
});
```

## Testing

Para testing, usa el MemoryAdapter:

```typescript
import { ApiKeyService } from './api-keys/ApiKeyService';
import { MemoryAdapter } from './api-keys/adapters/MemoryAdapter';

describe('API Key Service', () => {
  let service: ApiKeyService;
  
  beforeEach(() => {
    service = new ApiKeyService({
      adapter: new MemoryAdapter(),
    });
  });
  
  test('should create API key', async () => {
    const result = await service.create({
      name: 'Test Key',
      scopes: ['read:data'],
      createdBy: 'user123',
    });
    
    expect(result.plainKey).toMatch(/^pk_live_[a-f0-9]{64}$/);
  });
});
```

## References

- `references/templates/`: Templates base para copiar
- `references/examples/`: Ejemplos completos funcionales
- `references/integration-guides/`: Guías de integración con diferentes frameworks

## License

MIT - Libre para usar en proyectos personales y comerciales.
