# Arquitectura CAP: Backend Multi-Endpoint

**Versión:** 1.0  
**Tipo:** Documentación Arquitectónica  
**Audiencia:** Desarrolladores y Arquitectos

---

## 📋 Resumen Ejecutivo

Esta documentación describe la arquitectura de un backend HTTP que implementa el **Patrón de Arquitectura Celular (CAP)**. El sistema está diseñado como un **organismo de software** compuesto por células autónomas que se comunican mediante señales, procesan trabajo de forma asíncrona y mantienen estado persistente.

### Principios Fundamentales

1. **Autonomía Celular:** Cada componente es una célula auto-contenida
2. **Comunicación por Señales:** Eventos asíncronos con prioridades
3. **Homeostasis:** Auto-sanación y equilibrio dinámico
4. **Ciclo de Vida Completo:** Nacimiento, crecimiento, división, muerte
5. **Persistencia Nativa:** Sin dependencias de terceros para almacenamiento

---

## 🧬 Analogía Biológica-Tecnológica

| Concepto Biológico | Implementación Software | Responsabilidad |
|-------------------|------------------------|-----------------|
| **Célula** | `Cell` | Unidad mínima de computación autónoma |
| **Membrana** | `Membrane` | Control de acceso, rate limiting, validación |
| **Citoplasma** | `Runtime State` | Buffers, colas, estado volátil |
| **Núcleo** | `Nucleus` | Lógica de dominio pura |
| **ADN** | `DNALayer` | Persistencia SQLite |
| **Mitocondria** | `Mitochondria` | Procesamiento asíncrono |
| **Señales** | `SignalBus` | Comunicación intracelular |
| **Ciclo Celular** | `CycleController` | Estados G0→G1→S→G2→M |
| **Apoptosis** | `ApoptosisController` | Shutdown graceful |
| **Homeostasis** | `Homeostasis` | Monitoreo y auto-recuperación |

---

## 🏗️ Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ORGANISMO (Aplicación)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         MEMBRANA (API Layer)                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │   Router     │  │   Rate       │  │   Validator  │                │  │
│  │  │   (Fastify)  │──│   Limiter    │──│   (Zod)      │                │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                │  │
│  │         │                                                             │  │
│  │         ▼                                                             │  │
│  │  ┌────────────────────────────────────────────────────────────────┐  │  │
│  │  │                     SIGNAL BUS (EventEmitter)                   │  │  │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │  │  │
│  │  │  │ REQUEST  │  │ DATA     │  │ PROCESS  │  │ ERROR    │        │  │  │
│  │  │  │ RECEIVED │  │ INGESTED │  │ COMPLETE │  │ DETECTED │        │  │  │
│  │  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │  │  │
│  │  └────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      CITOPLASMA (Runtime State)                       │  │
│  │                                                                        │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │  │
│  │  │  CYTOPLASM       │  │  CYCLE           │  │  ATOMIC          │   │  │
│  │  │  BUFFER          │  │  CONTROLLER      │  │  WRITE QUEUE     │   │  │
│  │  │  (Backpressure)  │  │  (G0→M States)   │  │  (SQLite)        │   │  │
│  │  │                  │  │                  │  │                  │   │  │
│  │  │  Load: 0.3       │  │  State: G1       │  │  Queue: 5        │   │  │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘   │  │
│  │                                                                        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                       NÚCLEO (Domain Logic)                           │  │
│  │                                                                        │  │
│  │  ┌──────────────────────────────────────────────────────────────┐    │  │
│  │  │                    DOMAIN SERVICES                            │    │  │
│  │  │   validateEntity()  processRequest()  handleError()         │    │  │
│  │  └──────────────────────────────────────────────────────────────┘    │  │
│  │                                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │  │
│  │  │ REPOSITORY   │  │ REPOSITORY   │  │ REPOSITORY   │              │  │
│  │  │ Users        │  │ Orders       │  │ Resources    │              │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │  │
│  │                                                                        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      ORGÁNULOS (Processors)                           │  │
│  │                                                                        │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │  │
│  │  │  MITOCHONDRIA    │  │  CIRCUIT         │  │  WEBHOOK         │   │  │
│  │  │  (Async Worker)  │  │  BREAKER         │  │  PROCESSOR       │   │  │
│  │  │                  │  │                  │  │                  │   │  │
│  │  │  Active: 2       │  │  State: CLOSED   │  │  Providers: 3    │   │  │
│  │  │  Queued: 10      │  │  Failures: 0     │  │  Success: 95%    │   │  │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘   │  │
│  │                                                                        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│                                    ▼                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        ADN (Persistent Storage)                       │  │
│  │                                                                        │  │
│  │  ┌────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    SQLITE (WAL Mode)                            │  │  │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │  │  │
│  │  │  │  users   │  │  orders  │  │ signals  │  │  backups │       │  │  │
│  │  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │  │  │
│  │  │                                                                │  │  │
│  │  │  WAL Mode: ENABLED                                             │  │  │
│  │  │  Cache Size: 10000 pages                                       │  │  │
│  │  │  Sync: NORMAL                                                  │  │  │
│  │  └────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                   SISTEMAS DE SUPERVIVENCIA                           │  │
│  │                                                                        │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │  │
│  │  │  HOMEOSTASIS     │  │  APOPTOSIS       │  │  DNA REPLICATION │   │  │
│  │  │  (Self-healing)  │  │  (Shutdown)      │  │  (Backup)        │   │  │
│  │  │                  │  │                  │  │                  │   │  │
│  │  │  Health: 95%     │  │  Phase: READY    │  │  Last: 5m ago    │   │  │
│  │  │  Memory: OK      │  │  Timeout: 30s    │  │  Backups: 10     │   │  │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘   │  │
│  │                                                                        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Componentes Detallados

### 1. Cell (Célula Madre)

**Responsabilidad:** Orquestador principal que gestiona el ciclo de vida completo.

```typescript
class Cell {
  // Identidad
  private readonly id: string;
  private readonly config: CellConfig;
  
  // Componentes Core
  private cycle: CycleController;
  private signalBus: PersistentSignalBus;
  private dna: DNALayer;
  
  // Membrana
  private membrane: Membrane;
  
  // Orgánulos
  private mitochondria: Mitochondria;
  private nucleus: Nucleus;
  
  // Sistemas de Supervivencia
  private homeostasis: Homeostasis;
  private apoptosis: ApoptosisController;
  private replication: DNAReplication;
  
  // Ciclo de Vida
  async start(): Promise<void>;
  async stop(): Promise<void>;
  async pause(): Promise<void>;
  async resume(): Promise<void>;
  
  // Status
  getStatus(): CellStatus;
  getHealth(): number;
}
```

**Flujo de Inicialización:**
```
1. LOAD_CONFIG → Cargar configuración
2. INIT_DNA → Conectar SQLite
3. INIT_SIGNAL_BUS → Crear bus de señales
4. RECOVER_STATE → Recuperar señales pendientes
5. INIT_ORGANELLES → Crear mitocondrias, núcleo
6. INIT_MEMBRANE → Configurar rutas
7. START_HOMEOSTASIS → Iniciar monitoreo
8. TRANSITION_G1 → Listo para procesar
```

### 2. Membrane (Capa API)

**Responsabilidad:** Interfaz externa, control de acceso, validación.

```typescript
class Membrane {
  private app: FastifyInstance;
  private rateLimiter: DistributedRateLimiter;
  private validator: ZodValidator;
  
  // Registro de rutas
  register(route: RouteConfig): void;
  
  // Middlewares globales
  use(middleware: Middleware): void;
  
  // Control de flujo
  checkRateLimit(key: string): Promise<boolean>;
  validate(schema: ZodSchema, data: unknown): ValidationResult;
  
  // Lifecycle
  listen(port: number): Promise<void>;
  close(): Promise<void>;
}
```

**Pipeline de Request:**
```
REQUEST → Rate Limit → Auth → Validation → Handler → Response
            ↓            ↓         ↓
        (429)        (401)     (400)
```

### 3. SignalBus (Sistema de Señales)

**Responsabilidad:** Comunicación intracelular mediante eventos tipados.

```typescript
interface Signal<T = unknown> {
  id: string;
  type: SignalType;
  source: string;
  payload: T;
  timestamp: number;
  priority: 0 | 1 | 2 | 3;
  traceId?: string;
}

class PersistentSignalBus {
  // Emisión
  emit<T>(signal: Omit<Signal<T>, 'id' | 'timestamp'>): void;
  
  // Suscripción
  on<T>(type: SignalType, handler: SignalHandler<T>): () => void;
  once<T>(type: SignalType, handler: SignalHandler<T>): void;
  
  // Persistencia
  private persistSignal<T>(signal: Signal<T>): void;
  async recoverPendingSignals(): Promise<number>;
  
  // Historial
  getHistory(type?: SignalType, limit?: number): Signal[];
}
```

**Prioridades:**
- **0 (Critical):** Se ejecuta síncronamente e inmediatamente
- **1 (High):** Se ejecuta en microtask queue
- **2 (Normal):** Se ejecuta en macrotask queue
- **3 (Low):** Batch processing

### 4. CycleController (Control de Ciclo)

**Responsabilidad:** Gestión de estados del ciclo celular con checkpoints.

```typescript
enum CellState {
  G0_IDLE = 'G0_IDLE',              // Quiescente
  G1_GROWTH = 'G1_GROWTH',          // Creciendo
  S_REPLICATION = 'S_REPLICATION',  // Replicando ADN
  G2_PREPARATION = 'G2_PREPARATION', // Preparando división
  M_MITOSIS = 'M_MITOSIS',          // Dividiéndose
  APOPTOSIS = 'APOPTOSIS'           // Muriendo
}

class CycleController {
  private state: CellState;
  private entryTime: number;
  private checkpoints: Map<CellState, Checkpoint>;
  
  // Transiciones
  transitionTo(newState: CellState): boolean;
  
  // Checkpoints
  canProgress(): boolean;
  runCheckpoint(state: CellState): CheckResult;
  
  // Queries
  getState(): CellState;
  getTimeInState(): number;
  getNextState(): CellState | null;
}
```

**Checkpoints por Estado:**

| Estado | Checkpoint | Validación |
|--------|-----------|------------|
| G0→G1 | Resource Check | Memoria < 80%, CPU < 70% |
| G1→S | Ready Check | Sin errores críticos, buffer < 50% |
| S→G2 | Replication Check | Todos los datos replicados |
| G2→M | Division Check | Capacidad de escalar disponible |
| Any→Apoptosis | Shutdown Check | Tareas completables en timeout |

### 5. DNALayer (Persistencia)

**Responsabilidad:** Acceso a datos SQLite optimizado.

```typescript
class DNALayer {
  private db: Database;
  private writeQueue: AtomicWriteQueue;
  
  // Configuración
  initialize(): void;
  configureWAL(): void;
  
  // Lectura
  query<T>(sql: string, params?: any[]): T[];
  get<T>(sql: string, params?: any[]): T | null;
  
  // Escritura
  run(sql: string, params?: any[]): { changes: number };
  transaction(operations: () => void): void;
  
  // Batch
  batchInsert(table: string, rows: any[]): number;
  batchUpdate(table: string, updates: any[]): number;
  
  // Señales
  persistSignal(signal: Signal): void;
  getPendingSignals(): Signal[];
  markSignalProcessed(id: string): void;
  
  // Backup
  createSnapshot(path: string): void;
  restoreFromSnapshot(path: string): void;
  
  // Cleanup
  close(): void;
}
```

**Optimizaciones SQLite:**
```sql
-- WAL Mode para concurrencia lectura/escritura
PRAGMA journal_mode = WAL;

-- Synchronous NORMAL para balance velocidad/seguridad
PRAGMA synchronous = NORMAL;

-- Busy timeout para evitar errores de bloqueo
PRAGMA busy_timeout = 5000;

-- Cache size en memoria
PRAGMA cache_size = -10000; -- 10MB

-- Temp store en memoria
PRAGMA temp_store = MEMORY;

-- Memory map para lecturas rápidas
PRAGMA mmap_size = 30000000000; -- 30GB
```

### 6. Mitochondria (Async Worker)

**Responsabilidad:** Procesamiento asíncrono con control de concurrencia.

```typescript
interface Task<T = unknown> {
  id: string;
  type: string;
  payload: T;
  priority: number;
  timeout?: number;
  retries?: number;
  traceId?: string;
}

class Mitochondria {
  private queue: CytoplasmBuffer<Task>;
  private active: Map<string, Promise<unknown>>;
  private maxConcurrency: number;
  private circuitBreakers: Map<string, CircuitBreaker>;
  
  // Submisión
  submit<T>(task: Task<T>): Promise<T>;
  submitBatch<T>(tasks: Task<T>[]): Promise<T[]>;
  
  // Control
  cancel(taskId: string): boolean;
  pause(): void;
  resume(): void;
  
  // Registro de handlers
  registerHandler(type: string, handler: TaskHandler): void;
  
  // Status
  getStatus(): MitochondriaStatus;
  getMetrics(): MitochondriaMetrics;
}

interface MitochondriaStatus {
  queued: number;
  active: number;
  completed: number;
  failed: number;
  isPaused: boolean;
}
```

**Flujo de Ejecución:**
```
Task Submitted → Prioritized Queue → Available Worker?
                                          ↓
                                    NO → Wait in Queue
                                          ↓
                                    YES → Execute Task
                                          ↓
                              Success → Emit COMPLETED
                                          ↓
                              Failure → Retry (if < max)
                                          ↓
                              Max Retries → Emit ERROR
```

### 7. CytoplasmBuffer (Buffer con Backpressure)

**Responsabilidad:** Cola de procesamiento con gestión de presión.

```typescript
interface BufferConfig {
  maxSize: number;
  overflowStrategy: 'drop-oldest' | 'drop-newest' | 'block' | 'spillover';
  batchSize: number;
  batchTimeout: number;
  priorityLevels: number;
}

class CytoplasmBuffer<T> {
  private queues: Map<number, T[]>;
  private config: BufferConfig;
  private metrics: BufferMetrics;
  
  // Entrada
  influx(item: T, priority?: number): boolean;
  
  // Salida
  efflux(): T[];
  drain(): T[];
  
  // Control de presión
  getLoad(): number; // 0.0 - 1.0
  isFull(): boolean;
  isOverloaded(): boolean;
  
  // Estrategias de overflow
  private handleOverflow(item: T): boolean;
  private dropOldest(): void;
  private dropNewest(): boolean;
  private blockAndRetry(item: T): void;
  private spillover(item: T): boolean;
  
  // Métricas
  getMetrics(): BufferMetrics;
}
```

**Estrategias de Overflow:**

1. **drop-oldest:** Eliminar items más antiguos (logs, métricas)
2. **drop-newest:** Rechazar items nuevos (requests no críticos)
3. **block:** Esperar hasta que haya espacio (requests críticos)
4. **spillover:** Enviar a buffer secundario (escalado horizontal)

### 8. ApoptosisController (Shutdown Graceful)

**Responsabilidad:** Muerte celular programada con cleanup ordenado.

```typescript
interface ApoptosisPhase {
  name: string;
  timeout: number;
  required: boolean;
}

class ApoptosisController {
  private phases: ApoptosisPhase[];
  private cleanupHandlers: CleanupHandler[];
  private currentPhase: number;
  private isShuttingDown: boolean;
  
  // Fases
  private phases: ApoptosisPhase[] = [
    { name: 'STOP_INGESTION', timeout: 5000, required: true },
    { name: 'DRAIN_SIGNALS', timeout: 10000, required: true },
    { name: 'COMPLETE_TASKS', timeout: 30000, required: true },
    { name: 'CLOSE_CONNECTIONS', timeout: 5000, required: true },
    { name: 'CLEANUP', timeout: 5000, required: false },
    { name: 'TERMINATE', timeout: 1000, required: true }
  ];
  
  // Inicio
  async initiate(reason: string): Promise<void>;
  
  // Registro de cleanup
  registerCleanup(name: string, fn: () => Promise<void>, priority?: number): void;
  
  // Status
  getStatus(): ApoptosisStatus;
}

interface ApoptosisStatus {
  isShuttingDown: boolean;
  currentPhase: string;
  progress: number; // 0-100
  reason?: string;
}
```

**Flujo de Apoptosis:**
```
SIGTERM Received
       ↓
STOP_INGESTION: Rechazar nuevos requests
       ↓ (timeout: 5s)
DRAIN_SIGNALS: Procesar señales pendientes
       ↓ (timeout: 10s)
COMPLETE_TASKS: Esperar Mitochondria
       ↓ (timeout: 30s)
CLOSE_CONNECTIONS: Cerrar DB y conexiones
       ↓ (timeout: 5s)
CLEANUP: Borrar archivos temporales
       ↓ (timeout: 5s)
TERMINATE: process.exit(0)
```

### 9. Homeostasis (Auto-sanación)

**Responsabilidad:** Monitoreo continuo y corrección automática.

```typescript
interface HealthCheck {
  name: string;
  check(): HealthStatus;
  interval: number;
  autoFix?: () => Promise<void>;
}

class Homeostasis {
  private checks: HealthCheck[];
  private healthScore: number;
  private lastCheck: number;
  private alertHandlers: AlertHandler[];
  
  // Registro
  registerCheck(check: HealthCheck): void;
  registerAlertHandler(handler: AlertHandler): void;
  
  // Monitoreo
  startMonitoring(): void;
  stopMonitoring(): void;
  
  // Evaluación
  evaluate(): HealthReport;
  getHealthScore(): number;
  
  // Acciones
  private checkMemory(): HealthStatus;
  private checkCPU(): HealthStatus;
  private checkEventLoop(): HealthStatus;
  private checkBufferLoad(): HealthStatus;
  
  // Correcciones
  private triggerGC(): void;
  private throttleProcessing(): void;
  private requestApoptosis(): void;
}

interface HealthReport {
  score: number; // 0-100
  status: 'healthy' | 'warning' | 'critical';
  checks: Record<string, HealthStatus>;
  recommendations: string[];
}
```

**Métricas Monitoreadas:**

| Métrica | Umbral Warning | Umbral Critical | Acción |
|---------|----------------|-----------------|--------|
| Memory Usage | > 70% | > 85% | GC + throttle |
| CPU Usage | > 60% | > 80% | Throttle |
| Event Loop Lag | > 50ms | > 100ms | Scale/alert |
| Buffer Load | > 70% | > 90% | Backpressure |
| Error Rate | > 1% | > 5% | Circuit breaker |

---

## 🔄 Flujos de Datos

### Flujo 1: Request HTTP Simple

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Client  │────▶│   Membrane   │────▶│  Rate Limit  │────▶│  Validation  │
└──────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                                   │
                                                                   ▼
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Client  │◀────│   Response   │◀────│   Handler    │◀────│ SignalBus    │
└──────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                            │
                                            ▼
                                     ┌──────────────┐
                                     │    Nucleus   │
                                     │   (Domain)   │
                                     └──────────────┘
                                            │
                                            ▼
                                     ┌──────────────┐
                                     │     DNA      │
                                     │   (Query)    │
                                     └──────────────┘
```

### Flujo 2: Procesamiento Asíncrono

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Client  │────▶│  POST /batch │────▶│   Validate   │────▶│  Ingest to   │
└──────────┘     └──────────────┘     └──────────────┘     │   Buffer     │
                                                           └──────────────┘
                                                                  │
                    ┌─────────────────────────────────────────────┘
                    │
                    ▼
           ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
           │ SignalBus    │────▶│  Mitochondria│────▶│  Process     │
           │  (BATCH_IN)  │     │   (Queue)    │     │   Task       │
           └──────────────┘     └──────────────┘     └──────────────┘
                                                          │
                    ┌─────────────────────────────────────┘
                    │
                    ▼
           ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
           │     DNA      │◀────│   Handler    │◀────│ SignalBus    │
           │   (Insert)   │     │   (Update)   │     │  (COMPLETE)  │
           └──────────────┘     └──────────────┘     └──────────────┘
```

### Flujo 3: Shutdown Graceful

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  SIGTERM │────▶│  Apoptosis   │────▶│  Stop Accept │────▶│  Drain Queue │
│  SIGINT  │     │  Controller  │     │  New Requests│     │   (Signals)  │
└──────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                                  │
                    ┌─────────────────────────────────────────────┘
                    │
                    ▼
           ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
           │  Complete    │────▶│   Close      │────▶│   Cleanup    │
           │   Tasks      │     │   Database   │     │   & Exit     │
           └──────────────┘     └──────────────┘     └──────────────┘
```

---

## 📊 Decisiones Arquitectónicas

### ADR-001: SQLite sobre PostgreSQL

**Estado:** Accepted  
**Contexto:** Necesitamos persistencia sin dependencias externas  
**Decisión:** Usar SQLite con WAL mode  
**Consecuencias:**
- ✅ Zero config, zero deps
- ✅ Performance excelente para single-node
- ✅ WAL mode permite concurrencia lectura/escritura
- ❌ No escala horizontal fácilmente
- ❌ 1 escritor concurrente (resuelto con AtomicWriteQueue)

### ADR-002: Fastify sobre Express

**Estado:** Accepted  
**Contexto:** Framework HTTP para la membrana  
**Decisión:** Usar Fastify  
**Consecuencias:**
- ✅ 20% más rápido que Express
- ✅ Mejor soporte async/await
- ✅ Schema validation integrado
- ✅ Plugin ecosystem robusto
- ❌ Learning curve más pronunciado
- ❌ Menos middlewares disponibles

### ADR-003: EventEmitter sobre RabbitMQ/Redis

**Estado:** Accepted  
**Contexto:** Sistema de mensajería interna  
**Decisión:** Usar EventEmitter nativo + persistencia selectiva en SQLite  
**Consecuencias:**
- ✅ Zero overhead de red
- ✅ Millones de ops/seg
- ✅ Tipado fuerte con TypeScript
- ✅ Persistencia manual para críticos
- ❌ No distribuido nativamente
- ❌ Se pierden mensajes en crash (mitigado con persistencia)

### ADR-004: No ORM (Query Builder Manual)

**Estado:** Accepted  
**Contexto:** Acceso a base de datos  
**Decisión:** Usar SQL directo + better-sqlite3  
**Consecuencias:**
- ✅ Control total de queries
- ✅ Performance óptima
- ✅ Menos dependencias
- ❌ Más código boilerplate
- ❌ Riesgo de SQL injection (mitigado con prepared statements)

---

## 🔒 Seguridad

### 1. Rate Limiting
- Por IP: 100 req/min default
- Por API key: 1000 req/min
- Por endpoint: Configurable

### 2. Validación
- Todos los inputs validados con Zod
- Sanitización automática
- Type safety garantizado

### 3. Autenticación (Fase 2+)
- JWT para usuarios
- API keys para servicios
- Rate limiting por token

### 4. SQL Injection Prevention
- Solo prepared statements
- No concatenación de strings
- Validación de schemas

---

## 📈 Escalabilidad

### Vertical (Single Node)
- ✅ Optimizado para máximo uso de recursos
- ✅ SQLite WAL permite concurrencia
- ✅ Mitochondria usa todos los cores

### Horizontal (Multi-Node)
- ⚠️ Requiere trabajo adicional (Fase 5)
- ⚠️ Service discovery manual o gossip
- ⚠️ Consistent hashing para sharding
- ⚠️ Replicación de ADN necesaria

### Límites Conocidos

| Recurso | Límite Single-Node | Mitigación |
|---------|-------------------|------------|
| Throughput | ~2000 req/seg | Caching, CDN |
| Concurrent Users | ~10,000 | Connection pooling |
| Data Size | ~1TB (SQLite) | Sharding (Fase 5) |
| Memory | 16GB óptimo | Swap, scaling |

---

## 🧪 Testing Strategy

### Unit Tests
- Cada componente aislado
- Mocks para dependencias
- 80%+ coverage

### Integration Tests
- Flujos completos
- Database real (test DB)
- API endpoints

### E2E Tests
- Escenarios usuario
- Load testing
- Chaos engineering (simular fallos)

### Testing Checklist

```
✓ Cell lifecycle (start/stop/pause/resume)
✓ SignalBus (emit/on/persist/recover)
✓ CycleController (transitions/checkpoints)
✓ DNALayer (CRUD/transactions/batch)
✓ Mitochondria (submit/cancel/retry)
✓ CytoplasmBuffer (influx/efflux/overflow)
✓ ApoptosisController (phases/cleanup)
✓ Homeostasis (checks/corrections)
✓ Membrane (routing/validation/rate limiting)
✓ End-to-end flows
```

---

## 🚀 Deployment

### Opción 1: PM2 (Recomendado)

```json
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'cap-backend',
    script: './dist/index.js',
    instances: 1, // CAP es single-node por ahora
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      CELL_ID: 'cell-001'
    },
    max_memory_restart: '1G',
    shutdown_with_message: true,
    kill_timeout: 30000 // 30s para apoptosis
  }]
};
```

### Opción 2: Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Opción 3: Systemd

```ini
# /etc/systemd/system/cap-backend.service
[Unit]
Description=CAP Backend
After=network.target

[Service]
Type=simple
User=cap
WorkingDirectory=/opt/cap-backend
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=5
TimeoutStopSec=35
KillSignal=SIGTERM

[Install]
WantedBy=multi-user.target
```

---

## 📚 Referencias

### Documentación Interna
- [Roadmap](./CAP_ROADMAP.md)
- [Implementation Guide](./CAP_IMPLEMENTATION_GUIDE.md)
- [Critical Analysis](./ANALISIS_CRITICO.md)

### Recursos Externos
- [Fastify Docs](https://www.fastify.io/docs/latest/)
- [SQLite WAL Mode](https://sqlite.org/wal.html)
- [Node.js Event Loop](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [CAP Pattern Paper](https://example.com/cap-paper) (placeholder)

---

**Documento creado para guía arquitectónica del proyecto.**
