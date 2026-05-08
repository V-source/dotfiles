# Roadmap: Backend Multi-Endpoint con Arquitectura Celular (CAP)

**Versión:** 1.0  
**Fecha:** 2026-02-12  
**Estado:** Planificación  
**Duración Estimada:** 8-10 semanas

---

## 🎯 Visión

Construir un backend HTTP multi-endpoint que implemente el Patrón de Arquitectura Celular (CAP), combinando:
- ✅ Arquitectura bio-inspirada (células, señales, orgánulos)
- ✅ Resiliencia extrema (auto-sanación, apoptosis graceful)
- ✅ Performance optimizada (SQLite WAL, procesamiento async)
- ✅ Escalabilidad horizontal futura (service discovery, sharding)
- ✅ Observabilidad completa (métricas Prometheus, tracing)

---

## 📊 Resumen de Fases

| Fase | Semana | Enfoque | Endpoints Clave | Deliverable |
|------|--------|---------|-----------------|-------------|
| 0 | 1 | Fundación | `/health`, `/signals`, `/status` | Célula base funcional |
| 1 | 2-3 | Persistencia | `/data/batch`, `/shutdown` | Resiliencia completa |
| 2 | 4-5 | CRUD | `/resource/*` | API REST completa |
| 3 | 6-7 | Procesamiento | `/process/*`, `/webhooks/*` | Workers avanzados |
| 4 | 8 | Observabilidad | `/metrics`, `/dashboard` | Monitoring |
| 5 | Futuro | Escalabilidad | Multi-nodo | Cluster CAP |

---

## FASE 0: Fundación (Semana 1)

### 🎯 Objetivo
Estructura base funcional con célula madre operativa.

### 📁 Estructura de Carpetas
```
src/
├── core/
│   ├── Cell.ts                    ← Célula madre (orquestador)
│   ├── SignalBus.ts               ← EventEmitter nativo mejorado
│   ├── CycleController.ts         ← Estados G0-G1-S-G2-M
│   ├── DNALayer.ts               ← SQLite wrapper
│   └── types/
│       ├── signals.ts            ← Tipos de señales
│       └── cycles.ts             ← Tipos de ciclo celular
├── membrane/
│   ├── Router.ts                 ← Express/Fastify wrapper
│   ├── RateLimiter.ts            ← Token bucket por IP
│   ├── Validator.ts              ← Validación de schemas
│   └── middleware/
│       ├── auth.ts               ← Autenticación (placeholder)
│       ├── errorHandler.ts       ← Manejo centralizado
│       └── requestLogger.ts      ← Logging de requests
├── organelles/
│   ├── Mitochondria.ts           ← Async worker básico
│   └── Nucleus.ts                ← Lógica de dominio
├── config/
│   ├── database.ts               ← Config SQLite
│   └── server.ts                 ← Config servidor
├── utils/
│   ├── logger.ts                 ← Logger simple
│   └── helpers.ts                ← Funciones utilitarias
└── index.ts                      ← Entry point
```

### 🔧 Componentes a Implementar

#### 1. Cell.ts - Célula Madre
```typescript
interface CellConfig {
  id: string;
  port: number;
  dbPath: string;
  maxConcurrency: number;
}

class Cell {
  private id: string;
  private cycle: CycleController;
  private signalBus: SignalBus;
  private dna: DNALayer;
  private mitochondria: Mitochondria;
  private membrane: Membrane;
  
  constructor(config: CellConfig);
  async start(): Promise<void>;
  async stop(): Promise<void>; // Apoptosis
  getStatus(): CellStatus;
}
```

**Responsabilidades:**
- Inicializar todos los orgánulos
- Gestionar ciclo de vida (G0→G1→S→G2→M)
- Orquestar comunicación entre componentes
- Exponer API de health y status

#### 2. SignalBus.ts - Sistema de Señales
```typescript
interface Signal<T = unknown> {
  type: SignalType;
  source: string;
  payload: T;
  timestamp: number;
  priority: 0 | 1 | 2 | 3;
}

type SignalType = 
  | 'REQUEST_RECEIVED'
  | 'DATA_INGESTED'
  | 'PROCESSING_STARTED'
  | 'PROCESSING_COMPLETED'
  | 'ERROR_DETECTED'
  | 'SHUTDOWN_REQUESTED';

class SignalBus extends EventEmitter {
  emit<T>(signal: Omit<Signal<T>, 'timestamp'>): void;
  on<T>(type: SignalType, handler: (signal: Signal<T>) => void): void;
  getHistory(limit?: number): Signal[];
}
```

**Características:**
- Prioridades: 0=critical, 1=high, 2=normal, 3=low
- Historial configurable (últimos 1000)
- Síncrono para señales críticas
- Async para baja prioridad

#### 3. CycleController.ts - Control de Ciclo
```typescript
enum CellState {
  G0_IDLE = 'G0_IDLE',
  G1_GROWTH = 'G1_GROWTH',
  S_REPLICATION = 'S_REPLICATION',
  G2_PREPARATION = 'G2_PREPARATION',
  M_MITOSIS = 'M_MITOSIS',
  APOPTOSIS = 'APOPTOSIS'
}

class CycleController {
  private state: CellState;
  transitionTo(newState: CellState): boolean;
  canProgress(): boolean;
  getState(): CellState;
  getTimeInState(): number;
}
```

**Checkpoints:**
- G1: Recursos suficientes (memoria <80%)
- G2: Preparado para división (si aplica)
- M: División celular (fork si es necesario)

#### 4. DNALayer.ts - Persistencia
```typescript
interface DNALayerConfig {
  dbPath: string;
  walMode: boolean;
  busyTimeout: number;
}

class DNALayer {
  private db: Database;
  
  initialize(): void;
  query(sql: string, params?: any[]): any[];
  run(sql: string, params?: any[]): { changes: number };
  transaction(operations: () => void): void;
  close(): void;
}
```

**Configuración SQLite:**
```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA busy_timeout = 5000;
PRAGMA cache_size = 10000;
PRAGMA temp_store = MEMORY;
```

#### 5. Mitochondria.ts - Async Worker
```typescript
interface Task {
  id: string;
  type: string;
  payload: unknown;
  priority: number;
  timeout?: number;
}

class Mitochondria {
  private queue: Task[];
  private active: Map<string, Promise<unknown>>;
  private maxConcurrency: number;
  
  submit(task: Task): Promise<unknown>;
  cancel(taskId: string): boolean;
  getStatus(): { queued: number; active: number };
}
```

**Características:**
- Cola priorizada
- Límite de concurrencia
- Timeouts por tarea
- Retry automático (3 intentos)

#### 6. Membrane.ts - Router
```typescript
interface Route {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  handler: RequestHandler;
  middlewares?: Middleware[];
}

class Membrane {
  private app: Express;
  private rateLimiter: RateLimiter;
  private validator: Validator;
  
  register(route: Route): void;
  listen(port: number): Promise<void>;
  close(): Promise<void>;
}
```

### 🌐 Endpoints Fase 0

#### GET /health
```json
{
  "status": "healthy",
  "cell": {
    "id": "cell-001",
    "state": "G1_GROWTH",
    "uptime": 3600,
    "healthScore": 95
  },
  "organelles": {
    "mitochondria": {
      "queued": 0,
      "active": 2
    },
    "dna": {
      "connected": true,
      "transactions": 150
    }
  }
}
```

#### POST /signals
Emitir señal de prueba.

**Request:**
```json
{
  "type": "DATA_INGESTED",
  "payload": { "test": true }
}
```

**Response:**
```json
{
  "emitted": true,
  "timestamp": 1707782400000
}
```

#### GET /status
Estado detallado del ciclo celular.

```json
{
  "state": "G1_GROWTH",
  "stateDuration": 1800,
  "healthScore": 95,
  "memory": {
    "used": 128000000,
    "total": 512000000,
    "percentage": 25
  },
  "signals": {
    "emitted": 1500,
    "processed": 1498,
    "failed": 2
  },
  "checkpoints": {
    "G1": "passed",
    "G2": "pending"
  }
}
```

### ✅ Checklist Fase 0

- [ ] Estructura de carpetas creada
- [ ] Cell.ts implementado (orquestador)
- [ ] SignalBus.ts con tipado fuerte
- [ ] CycleController con estados G0-M
- [ ] DNALayer con SQLite WAL
- [ ] Mitochondria con queue y concurrencia
- [ ] Membrane con Express básico
- [ ] Endpoint /health funcionando
- [ ] Endpoint /signals funcionando
- [ ] Endpoint /status funcionando
- [ ] Tests unitarios (70%+ coverage)
- [ ] Documentación de setup

### 🎓 Métricas de Éxito

- Latencia /health < 10ms
- Throughput señales > 10,000/seg
- Memoria estable (< 200MB)
- Tiempo de startup < 3 segundos

---

## FASE 1: Persistencia y Resiliencia (Semanas 2-3)

### 🎯 Objetivo
Agregar persistencia de señales, queue atómica y apoptosis graceful.

### 📦 Nuevos Componentes

#### 1. PersistentSignalBus
Extensión de SignalBus que persiste señales críticas.

**Señales persistentes:**
- DATA_INGESTED
- PROCESSING_STARTED
- ERROR_DETECTED
- SHUTDOWN_REQUESTED

**Tabla SQLite:**
```sql
CREATE TABLE signals (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  source TEXT,
  payload TEXT,
  timestamp INTEGER,
  processed BOOLEAN DEFAULT 0
);
```

**Features:**
- Recuperación automática al iniciar
- Cleanup de señales viejas (>24h)
- Batch insert para performance

#### 2. AtomicWriteQueue
Resuelve limitación de 1 escritor SQLite.

```typescript
interface WriteOperation {
  id: string;
  sql: string;
  params: any[];
  priority: number;
}

class AtomicWriteQueue {
  private queue: WriteOperation[];
  private batchSize: number;
  private flushInterval: number;
  
  enqueue(op: WriteOperation): Promise<void>;
  flush(): Promise<void>;
  getMetrics(): QueueMetrics;
}
```

**Estrategias:**
- Batch processing (100 ops/batch)
- Prioridad alta = flush inmediato
- Retry automático en fallo

#### 3. ApoptosisController
Shutdown graceful con fases.

```typescript
interface ApoptosisConfig {
  phases: PhaseConfig[];
  timeoutPerPhase: number;
}

class ApoptosisController {
  private phases: ApoptosisPhase[];
  
  initiate(reason: string): Promise<void>;
  registerCleanup(name: string, fn: () => Promise<void>): void;
}

enum ApoptosisPhase {
  STOP_INGESTION = 'STOP_INGESTION',
  DRAIN_SIGNALS = 'DRAIN_SIGNALS',
  COMPLETE_TASKS = 'COMPLETE_TASKS',
  CLOSE_CONNECTIONS = 'CLOSE_CONNECTIONS',
  CLEANUP = 'CLEANUP',
  TERMINATE = 'TERMINATE'
}
```

**Handlers registrados:**
- Detener aceptación de requests nuevos
- Drenar SignalBus
- Esperar Mitochondria
- Cerrar conexiones DB
- Cleanup archivos temporales

### 🌐 Nuevos Endpoints

#### POST /data/batch
Ingesta masiva con queue.

**Request:**
```json
{
  "items": [
    { "id": "1", "data": "..." },
    { "id": "2", "data": "..." }
  ]
}
```

**Response:**
```json
{
  "received": 100,
  "queued": true,
  "estimatedTime": "5s"
}
```

#### GET /signals/pending
Ver señales no procesadas.

```json
{
  "count": 5,
  "signals": [
    {
      "id": "sig-001",
      "type": "DATA_INGESTED",
      "timestamp": "2024-01-12T10:00:00Z"
    }
  ]
}
```

#### POST /shutdown
Iniciar apoptosis.

**Request:**
```json
{
  "reason": "maintenance",
  "force": false
}
```

**Response:**
```json
{
  "initiated": true,
  "phase": "STOP_INGESTION",
  "estimatedDuration": "10s"
}
```

### ✅ Checklist Fase 1

- [ ] PersistentSignalBus implementado
- [ ] Tabla signals en SQLite
- [ ] Recuperación de señales al iniciar
- [ ] AtomicWriteQueue con batching
- [ ] Métricas de queue
- [ ] ApoptosisController con fases
- [ ] Handlers de cleanup registrados
- [ ] Endpoint /data/batch
- [ ] Endpoint /signals/pending
- [ ] Endpoint /shutdown
- [ ] Tests de shutdown graceful
- [ ] Tests de recuperación de señales

### 📊 Métricas

- Batch insert: > 1000 ops/seg
- Shutdown graceful: < 30s
- Señales recuperadas: 100%
- Zero data loss en crash simulado

---

## FASE 2: CRUD Completo (Semanas 4-5)

### 🎯 Objetivo
Implementar API REST completa con todas las operaciones.

### 📦 Nuevos Componentes

#### 1. Repository Pattern
```typescript
interface Repository<T> {
  findAll(options: QueryOptions): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  count(filter?: Filter): Promise<number>;
}

class BaseRepository<T> implements Repository<T> {
  protected table: string;
  protected schema: z.ZodSchema<T>;
  protected dna: DNALayer;
}
```

#### 2. Resource Controllers
```typescript
class ResourceController<T> {
  private repository: Repository<T>;
  private validator: Validator;
  
  list(req: Request, res: Response): Promise<void>;
  get(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  remove(req: Request, res: Response): Promise<void>;
}
```

#### 3. Schema Validation
Usar Zod para validación:

```typescript
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2),
  createdAt: z.date()
});

type User = z.infer<typeof UserSchema>;
```

### 🌐 Endpoints CRUD

#### GET /{resource}
Listar con filtros y paginación.

**Query params:**
```
?page=1&limit=20&sort=createdAt:desc&filter=status:active
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### GET /{resource}/:id
Obtener uno.

**Response:**
```json
{
  "id": "...",
  "email": "user@example.com",
  "name": "John",
  "createdAt": "2024-01-12T10:00:00Z"
}
```

#### POST /{resource}
Crear (async via Mitochondria).

**Request:**
```json
{
  "email": "new@example.com",
  "name": "Jane"
}
```

**Response:**
```json
{
  "id": "...",
  "status": "pending",
  "estimatedCompletion": "2s"
}
```

#### PUT /{resource}/:id
Actualizar.

**Request:**
```json
{
  "name": "Jane Updated"
}
```

#### DELETE /{resource}/:id
Soft delete (marcar como apoptótico).

**Response:**
```json
{
  "deleted": true,
  "markedAt": "2024-01-12T10:00:00Z"
}
```

### ✅ Checklist Fase 2

- [ ] Repository pattern implementado
- [ ] BaseRepository con operaciones CRUD
- [ ] Zod schemas para validación
- [ ] ResourceController genérico
- [ ] Rate limiting por endpoint
- [ ] Paginación implementada
- [ ] Filtros y sorting
- [ ] Soft delete (apoptosis de registros)
- [ ] Tests de integración CRUD
- [ ] Documentación API (OpenAPI)

---

## FASE 3: Procesamiento Avanzado (Semanas 6-7)

### 🎯 Objetivo
Agregar procesamiento masivo, webhooks y buffers avanzados.

### 📦 Nuevos Componentes

#### 1. CytoplasmBuffer
Buffer con backpressure.

```typescript
interface BufferConfig {
  maxSize: number;
  overflowStrategy: 'drop-oldest' | 'drop-newest' | 'block';
  batchSize: number;
  batchTimeout: number;
}

class CytoplasmBuffer<T> {
  private queue: T[];
  private config: BufferConfig;
  
  influx(item: T): boolean;
  efflux(): T[];
  getLoad(): number; // 0.0 - 1.0
}
```

#### 2. Circuit Breaker
Para APIs externas.

```typescript
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  private failureThreshold: number;
  private timeout: number;
  
  execute<T>(fn: () => Promise<T>): Promise<T>;
}
```

#### 3. Webhook Processor
Manejo de webhooks externos.

```typescript
class WebhookProcessor {
  private circuitBreakers: Map<string, CircuitBreaker>;
  
  register(provider: string, endpoint: string): void;
  process(provider: string, payload: unknown): Promise<void>;
}
```

### 🌐 Nuevos Endpoints

#### POST /process/batch
Procesamiento masivo.

#### POST /webhooks/:provider
Recepción de webhooks.

#### GET /queue/status
Estado de buffers.

```json
{
  "buffers": {
    "ingestion": {
      "load": 0.3,
      "size": 300,
      "maxSize": 1000
    },
    "processing": {
      "load": 0.8,
      "warning": true
    }
  }
}
```

### ✅ Checklist Fase 3

- [ ] CytoplasmBuffer implementado
- [ ] Backpressure management
- [ ] Circuit Breaker por provider
- [ ] Webhook processor
- [ ] Batch processing optimizado
- [ ] Métricas de buffers
- [ ] Tests de carga
- [ ] Tests de circuit breaker

---

## FASE 4: Observabilidad (Semana 8)

### 🎯 Objetivo
Agregar métricas Prometheus, tracing y dashboard.

### 📦 Nuevos Componentes

#### 1. CellMetrics
Exportación Prometheus.

#### 2. CellTracer
Distributed tracing.

#### 3. Dashboard
HTML simple con métricas.

### 🌐 Nuevos Endpoints

#### GET /metrics
Formato Prometheus.

#### GET /traces/:traceId
Ver trace completo.

#### GET /dashboard
HTML con gráficos.

### ✅ Checklist Fase 4

- [ ] CellMetrics implementado
- [ ] CellTracer implementado
- [ ] Dashboard HTML
- [ ] Alertas configurables
- [ ] Tests de observabilidad

---

## FASE 5: Escalabilidad Horizontal (Futuro)

### 🎯 Objetivo
Multi-nodo con service discovery y sharding.

### 📦 Componentes

- GossipDiscovery
- ConsistentHashRing
- Distributed consensus

### Nota
Esta fase requiere análisis adicional y no está incluida en el roadmap inicial.

---

## 📈 Métricas de Proyecto

### Objetivos Globales

| Métrica | Objetivo |
|---------|----------|
| Latencia p99 | < 50ms |
| Throughput | > 1000 req/seg |
| Uptime | > 99.9% |
| Data loss | 0% |
| Test coverage | > 80% |

### Métricas por Fase

- **Fase 0:** Startup < 3s, Memory < 200MB
- **Fase 1:** Shutdown < 30s, Recovery 100%
- **Fase 2:** CRUD < 20ms, Batch > 1000/s
- **Fase 3:** Buffer load < 80%
- **Fase 4:** Metrics export < 5ms

---

## 🛠️ Stack Tecnológico

### Core
- **Runtime:** Node.js 20+ (LTS)
- **Lenguaje:** TypeScript 5.x
- **Framework:** Fastify (performance)
- **DB:** SQLite 3 (WAL mode)

### Testing
- **Unit:** Vitest
- **Integration:** Supertest
- **E2E:** Playwright
- **Coverage:** c8

### DevOps
- **Package Manager:** pnpm
- **Linting:** ESLint + Prettier
- **Git Hooks:** husky
- **CI/CD:** GitHub Actions

---

## 🎓 Recursos de Aprendizaje

### Documentación Interna
- `/docs/architecture/` - Decisiones arquitectónicas
- `/docs/api/` - OpenAPI specs
- `/docs/deployment/` - Guías de deploy

### Documentación Externa
- [CAP Pattern Specification](./CAP_ARCHITECTURE.md)
- [Implementation Guide](./CAP_IMPLEMENTATION_GUIDE.md)
- [Analysis & Improvements](./ANALISIS_CRITICO.md)

---

## 📝 Notas

### Decisiones Arquitectónicas

1. **SQLite sobre PostgreSQL:** Para simplicidad inicial. Migración posible en Fase 5.
2. **Fastify sobre Express:** 20% más rápido, mejor async/await.
3. **Zod sobre Joi:** Mejor TypeScript inference.
4. **No ORM:** Query builders simples para control total.

### Riesgos

1. **Complejidad:** Equipo necesita entender analogía celular.
2. **Over-engineering:** Para CRUD simple, CAP es excesivo.
3. **Debugging:** Más difícil tracear flujos con señales.

### Mitigaciones

1. Documentación extensiva y ejemplos.
2. Empezar con endpoints críticos solo.
3. Logging distribuido desde día 1.

---

**Documento creado para planificación del proyecto.**
