# Guía de Implementación CAP

**Versión:** 1.0  
**Audiencia:** Desarrolladores implementando el backend  
**Tiempo Estimado:** 40-60 horas (Fases 0-4)

---

## 🚀 Quick Start

### Prerrequisitos

```bash
# Node.js 20+ (LTS)
node --version  # v20.11.0 o superior

# pnpm (recomendado)
npm install -g pnpm

# Git
git --version
```

### Setup Inicial

```bash
# Crear proyecto
mkdir cap-backend
cd cap-backend
pnpm init

# Instalar dependencias
pnpm add fastify better-sqlite3 zod
pnpm add -D typescript @types/node vitest @types/better-sqlite3

# Configurar TypeScript
npx tsc --init

# Estructura inicial
mkdir -p src/{core,membrane,organelles,config,utils}
touch src/index.ts
```

---

## FASE 0: Fundación (8-12 horas)

### Paso 1: Configuración TypeScript (30 min)

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Paso 2: Tipos Base (45 min)

**src/core/types/index.ts:**
```typescript
// Tipos de Señales
export type SignalType = 
  | 'REQUEST_RECEIVED'
  | 'DATA_INGESTED'
  | 'PROCESSING_STARTED'
  | 'PROCESSING_COMPLETED'
  | 'ERROR_DETECTED'
  | 'SHUTDOWN_REQUESTED';

export interface Signal<T = unknown> {
  id: string;
  type: SignalType;
  source: string;
  payload: T;
  timestamp: number;
  priority: 0 | 1 | 2 | 3;
  traceId?: string;
}

// Estados del Ciclo Celular
export enum CellState {
  G0_IDLE = 'G0_IDLE',
  G1_GROWTH = 'G1_GROWTH',
  S_REPLICATION = 'S_REPLICATION',
  G2_PREPARATION = 'G2_PREPARATION',
  M_MITOSIS = 'M_MITOSIS',
  APOPTOSIS = 'APOPTOSIS'
}

// Configuración
export interface CellConfig {
  id: string;
  port: number;
  dbPath: string;
  maxConcurrency: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}
```

### Paso 3: SignalBus (1.5 horas)

**src/core/SignalBus.ts:**
```typescript
import { EventEmitter } from 'events';
import { Signal, SignalType } from './types/index.js';

export class SignalBus extends EventEmitter {
  private history: Signal[] = [];
  private maxHistory = 1000;

  emit<T>(signal: Omit<Signal<T>, 'id' | 'timestamp'>): void {
    const fullSignal: Signal<T> = {
      ...signal,
      id: this.generateId(),
      timestamp: Date.now()
    };

    this.addToHistory(fullSignal);

    // Prioridad 0 = síncrono e inmediato
    if (signal.priority === 0) {
      super.emit(fullSignal.type, fullSignal);
    } else {
      // Otras prioridades = async según delay
      setTimeout(() => {
        super.emit(fullSignal.type, fullSignal);
      }, this.getDelay(signal.priority));
    }
  }

  on<T>(type: SignalType, handler: (signal: Signal<T>) => void): () => void {
    super.on(type, handler);
    return () => this.off(type, handler);
  }

  private addToHistory<T>(signal: Signal<T>): void {
    this.history.push(signal);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  getHistory(type?: SignalType, limit = 100): Signal[] {
    let filtered = this.history;
    if (type) {
      filtered = filtered.filter(s => s.type === type);
    }
    return filtered.slice(-limit);
  }

  private getDelay(priority: number): number {
    switch (priority) {
      case 1: return 1;
      case 2: return 5;
      case 3: return 10;
      default: return 0;
    }
  }

  private generateId(): string {
    return `sig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### Paso 4: CycleController (1 hora)

**src/core/CycleController.ts:**
```typescript
import { CellState } from './types/index.js';

interface Checkpoint {
  validate(): boolean;
}

export class CycleController {
  private state: CellState = CellState.G0_IDLE;
  private entryTime: number = Date.now();
  private checkpoints: Map<CellState, Checkpoint> = new Map();

  constructor() {
    this.setupDefaultCheckpoints();
  }

  private setupDefaultCheckpoints(): void {
    this.checkpoints.set(CellState.G1_GROWTH, {
      validate: () => this.checkResources()
    });
  }

  transitionTo(newState: CellState): boolean {
    const validTransitions: Record<CellState, CellState[]> = {
      [CellState.G0_IDLE]: [CellState.G1_GROWTH, CellState.APOPTOSIS],
      [CellState.G1_GROWTH]: [CellState.S_REPLICATION, CellState.G0_IDLE, CellState.APOPTOSIS],
      [CellState.S_REPLICATION]: [CellState.G2_PREPARATION, CellState.APOPTOSIS],
      [CellState.G2_PREPARATION]: [CellState.M_MITOSIS, CellState.APOPTOSIS],
      [CellState.M_MITOSIS]: [CellState.G0_IDLE, CellState.APOPTOSIS],
      [CellState.APOPTOSIS]: []
    };

    const allowed = validTransitions[this.state];
    if (!allowed?.includes(newState)) {
      console.warn(`[CycleController] Invalid transition: ${this.state} -> ${newState}`);
      return false;
    }

    // Verificar checkpoint si existe
    const checkpoint = this.checkpoints.get(newState);
    if (checkpoint && !checkpoint.validate()) {
      console.warn(`[CycleController] Checkpoint failed for ${newState}`);
      return false;
    }

    console.log(`[CycleController] ${this.state} -> ${newState}`);
    this.state = newState;
    this.entryTime = Date.now();
    return true;
  }

  getState(): CellState {
    return this.state;
  }

  getTimeInState(): number {
    return Date.now() - this.entryTime;
  }

  private checkResources(): boolean {
    const mem = process.memoryUsage();
    return mem.heapUsed < mem.heapTotal * 0.8;
  }
}
```

### Paso 5: DNALayer (1.5 horas)

**src/core/DNALayer.ts:**
```typescript
import Database from 'better-sqlite3';

export class DNALayer {
  private db: Database.Database;

  constructor(dbPath: string = 'cap.db') {
    this.db = new Database(dbPath);
    this.configure();
  }

  private configure(): void {
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('busy_timeout = 5000');
    this.db.pragma('cache_size = 10000');
  }

  initializeSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS signals (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        source TEXT,
        payload TEXT,
        timestamp INTEGER,
        processed BOOLEAN DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_signals_type ON signals(type);
      CREATE INDEX IF NOT EXISTS idx_signals_processed ON signals(processed);
    `);
  }

  query<T>(sql: string, params?: any[]): T[] {
    return this.db.prepare(sql).all(params || []) as T[];
  }

  get<T>(sql: string, params?: any[]): T | null {
    return this.db.prepare(sql).get(params || []) as T | null;
  }

  run(sql: string, params?: any[]): { changes: number } {
    return this.db.prepare(sql).run(params || []);
  }

  transaction<T>(operations: () => T): T {
    return this.db.transaction(operations)();
  }

  close(): void {
    this.db.close();
  }
}
```

### Paso 6: Mitochondria (1.5 horas)

**src/organelles/Mitochondria.ts:**
```typescript
interface Task<T = unknown> {
  id: string;
  type: string;
  payload: T;
  priority: number;
  timeout?: number;
  retries?: number;
}

type TaskHandler<T = unknown> = (task: Task<T>) => Promise<T>;

export class Mitochondria {
  private queue: Task[] = [];
  private active = new Map<string, Promise<unknown>>();
  private handlers = new Map<string, TaskHandler>();
  private maxConcurrency: number;
  private isRunning = true;

  constructor(maxConcurrency = 5) {
    this.maxConcurrency = maxConcurrency;
    this.startProcessing();
  }

  submit<T>(task: Task<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      // Agregar a cola ordenada por prioridad
      const insertIndex = this.queue.findIndex(t => t.priority > task.priority);
      if (insertIndex === -1) {
        this.queue.push(task);
      } else {
        this.queue.splice(insertIndex, 0, task);
      }

      // Resolver cuando se complete
      const checkCompletion = () => {
        const index = this.queue.findIndex(t => t.id === task.id);
        if (index === -1) {
          // Ya se procesó
          resolve(this.active.get(task.id) as Promise<T>);
        } else {
          setTimeout(checkCompletion, 100);
        }
      };
      checkCompletion();
    });
  }

  registerHandler<T>(type: string, handler: TaskHandler<T>): void {
    this.handlers.set(type, handler as TaskHandler);
  }

  private async startProcessing(): Promise<void> {
    while (this.isRunning) {
      if (this.active.size >= this.maxConcurrency || this.queue.length === 0) {
        await this.sleep(10);
        continue;
      }

      const task = this.queue.shift()!;
      this.processTask(task);
    }
  }

  private async processTask<T>(task: Task<T>): Promise<void> {
    const handler = this.handlers.get(task.type);
    if (!handler) {
      console.error(`[Mitochondria] No handler for task type: ${task.type}`);
      return;
    }

    const promise = this.executeWithRetry(task, handler);
    this.active.set(task.id, promise);

    try {
      await promise;
    } finally {
      this.active.delete(task.id);
    }
  }

  private async executeWithRetry<T>(
    task: Task<T>,
    handler: TaskHandler<T>
  ): Promise<T> {
    const maxRetries = task.retries ?? 3;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const timeout = task.timeout ?? 30000;
        return await Promise.race([
          handler(task),
          new Promise<T>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), timeout)
          )
        ]);
      } catch (err) {
        lastError = err as Error;
        if (attempt < maxRetries) {
          await this.sleep(1000 * Math.pow(2, attempt)); // Exponential backoff
        }
      }
    }

    throw lastError;
  }

  getStatus(): { queued: number; active: number } {
    return {
      queued: this.queue.length,
      active: this.active.size
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Paso 7: Membrane (1.5 horas)

**src/membrane/Membrane.ts:**
```typescript
import Fastify from 'fastify';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SignalBus } from '../core/SignalBus.js';
import { CycleController } from '../core/CycleController.js';

export class Membrane {
  private app: FastifyInstance;
  private signalBus: SignalBus;
  private cycle: CycleController;

  constructor(signalBus: SignalBus, cycle: CycleController) {
    this.signalBus = signalBus;
    this.cycle = cycle;
    this.app = Fastify({
      logger: true
    });

    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', async () => ({
      status: 'healthy',
      cell: {
        state: this.cycle.getState(),
        uptime: process.uptime()
      }
    }));

    // Status detallado
    this.app.get('/status', async () => ({
      state: this.cycle.getState(),
      stateDuration: this.cycle.getTimeInState(),
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }));

    // Emitir señal (para testing)
    this.app.post('/signals', async (request: FastifyRequest, reply: FastifyReply) => {
      const body = request.body as { type: string; payload: unknown };
      
      this.signalBus.emit({
        type: body.type as any,
        source: 'http-api',
        payload: body.payload,
        priority: 1
      });

      return { emitted: true, timestamp: Date.now() };
    });
  }

  async listen(port: number): Promise<void> {
    await this.app.listen({ port });
    console.log(`[Membrane] Listening on port ${port}`);
  }

  async close(): Promise<void> {
    await this.app.close();
  }
}
```

### Paso 8: Cell (Orquestador) (1 hora)

**src/core/Cell.ts:**
```typescript
import { CellConfig, CellState } from './types/index.js';
import { SignalBus } from './SignalBus.js';
import { CycleController } from './CycleController.js';
import { DNALayer } from './DNALayer.js';
import { Mitochondria } from '../organelles/Mitochondria.js';
import { Membrane } from '../membrane/Membrane.js';

export class Cell {
  private config: CellConfig;
  private signalBus: SignalBus;
  private cycle: CycleController;
  private dna: DNALayer;
  private mitochondria: Mitochondria;
  private membrane: Membrane;

  constructor(config: CellConfig) {
    this.config = config;
    this.signalBus = new SignalBus();
    this.cycle = new CycleController();
    this.dna = new DNALayer(config.dbPath);
    this.mitochondria = new Mitochondria(config.maxConcurrency);
    this.membrane = new Membrane(this.signalBus, this.cycle);
  }

  async start(): Promise<void> {
    console.log(`[Cell ${this.config.id}] Starting...`);

    // Inicializar ADN
    this.dna.initializeSchema();

    // Transicionar a G1
    this.cycle.transitionTo(CellState.G1_GROWTH);

    // Iniciar membrana
    await this.membrane.listen(this.config.port);

    console.log(`[Cell ${this.config.id}] Started successfully`);
  }

  async stop(): Promise<void> {
    console.log(`[Cell ${this.config.id}] Stopping...`);

    // Apoptosis
    this.cycle.transitionTo(CellState.APOPTOSIS);

    // Cerrar membrana
    await this.membrane.close();

    // Cerrar ADN
    this.dna.close();

    console.log(`[Cell ${this.config.id}] Stopped`);
  }

  getStatus() {
    return {
      id: this.config.id,
      state: this.cycle.getState(),
      uptime: process.uptime(),
      mitochondria: this.mitochondria.getStatus()
    };
  }
}
```

### Paso 9: Entry Point (30 min)

**src/index.ts:**
```typescript
import { Cell } from './core/Cell.js';

const cell = new Cell({
  id: 'cell-001',
  port: 3000,
  dbPath: 'cap.db',
  maxConcurrency: 5,
  logLevel: 'info'
});

// Iniciar
cell.start().catch(err => {
  console.error('Failed to start cell:', err);
  process.exit(1);
});

// Apoptosis graceful
process.on('SIGTERM', () => cell.stop());
process.on('SIGINT', () => cell.stop());
```

### Paso 10: Primer Test (30 min)

**Test básico:**
```bash
# Iniciar servidor
pnpm tsx src/index.ts

# En otra terminal:
curl http://localhost:3000/health
# Debe responder: {"status":"healthy","cell":{...}}

curl -X POST http://localhost:3000/signals \
  -H "Content-Type: application/json" \
  -d '{"type":"DATA_INGESTED","payload":{"test":true}}'
# Debe responder: {"emitted":true,"timestamp":...}
```

---

## FASE 1: Persistencia y Resiliencia (12-16 horas)

### Paso 11: PersistentSignalBus (2 horas)

Extender SignalBus para persistir señales críticas.

**Implementación:** Ver archivo `ANALISIS_CRITICO.md` sección Fase 1.1

### Paso 12: AtomicWriteQueue (2 horas)

Resolver limitación de 1 escritor SQLite.

**Implementación:** Ver archivo `ANALISIS_CRITICO.md` sección Fase 1.2

### Paso 13: ApoptosisController (2 horas)

Shutdown graceful con fases.

**Implementación:** Ver archivo `ANALISIS_CRITICO.md` sección Fase 1.3

### Paso 14: Integrar Todo (2 horas)

Conectar nuevos componentes a Cell.

### Paso 15: Tests de Resiliencia (4 horas)

- Test de shutdown graceful
- Test de recuperación de señales
- Test de crash simulado
- Test de carga

---

## FASE 2: CRUD Completo (16-20 horas)

### Paso 16: Repository Pattern (3 horas)

Implementar base repository genérico.

### Paso 17: Schemas con Zod (2 horas)

Definir schemas de validación.

### Paso 18: Resource Controller (3 horas)

Controlador genérico CRUD.

### Paso 19: Endpoints CRUD (4 horas)

Implementar rutas REST completas.

### Paso 20: Paginación y Filtros (2 horas)

Query params y sorting.

### Paso 21: Tests de Integración (4 horas)

Tests end-to-end de CRUD.

---

## FASE 3: Procesamiento Avanzado (8-12 horas)

### Paso 22: CytoplasmBuffer (2 horas)

Buffer con backpressure.

### Paso 23: Circuit Breaker (2 horas)

Protección contra fallos externos.

### Paso 24: Webhook Processor (2 horas)

Manejo de webhooks.

### Paso 25: Tests de Carga (4 horas)

Benchmarks y optimización.

---

## FASE 4: Observabilidad (4-6 horas)

### Paso 26: CellMetrics (2 horas)

Exportación Prometheus.

### Paso 27: CellTracer (2 horas)

Distributed tracing.

### Paso 28: Dashboard (2 horas)

HTML simple con métricas.

---

## 🧪 Testing

### Unit Tests con Vitest

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node'
  }
});
```

**Ejemplo test:**
```typescript
// tests/SignalBus.test.ts
import { describe, it, expect } from 'vitest';
import { SignalBus } from '../src/core/SignalBus.js';

describe('SignalBus', () => {
  it('should emit and receive signals', () => {
    const bus = new SignalBus();
    const signals: any[] = [];

    bus.on('TEST', (signal) => signals.push(signal));
    bus.emit({
      type: 'TEST',
      source: 'test',
      payload: { data: 123 },
      priority: 1
    });

    expect(signals).toHaveLength(1);
    expect(signals[0].payload.data).toBe(123);
  });
});
```

### Integration Tests

```typescript
// tests/integration/cell.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Cell } from '../../src/core/Cell.js';

describe('Cell Integration', () => {
  let cell: Cell;

  beforeAll(async () => {
    cell = new Cell({
      id: 'test-cell',
      port: 3001,
      dbPath: 'test.db',
      maxConcurrency: 2
    });
    await cell.start();
  });

  afterAll(async () => {
    await cell.stop();
  });

  it('should respond to health check', async () => {
    const res = await fetch('http://localhost:3001/health');
    const data = await res.json();
    expect(data.status).toBe('healthy');
  });
});
```

---

## 🐛 Troubleshooting

### Problema: SQLite database is locked

**Causa:** Múltiples escritores concurrentes

**Solución:** Implementar AtomicWriteQueue

### Problema: Memory leak

**Causa:** SignalBus history sin límite

**Solución:** Configurar maxHistory y cleanup periódico

### Problema: Event loop bloqueado

**Causa:** Operaciones síncronas pesadas

**Solución:** Usar setImmediate o procesamiento async

### Problema: Tests fallan intermitentemente

**Causa:** Race conditions en async

**Solución:** Usar async/await consistente, evitar callbacks

---

## 📈 Optimizaciones

### Performance Checklist

- [ ] SQLite WAL mode habilitado
- [ ] Índices en queries frecuentes
- [ ] Batch inserts > individual inserts
- [ ] Async processing para operaciones pesadas
- [ ] Rate limiting implementado
- [ ] Caching para reads frecuentes
- [ ] Connection pooling
- [ ] Garbage collection tuning

### Benchmarks

```bash
# Instalar autocannon
npm install -g autocannon

# Benchmark básico
autocannon -c 100 -d 10 http://localhost:3000/health

# Benchmark con body
autocannon -c 50 -d 30 \
  -m POST \
  -H "Content-Type: application/json" \
  -b '{"type":"TEST","payload":{}}' \
  http://localhost:3000/signals
```

---

## 🚀 Deployment Checklist

### Pre-deployment

- [ ] Todos los tests pasan
- [ ] Cobertura > 80%
- [ ] Documentación actualizada
- [ ] Variables de entorno configuradas
- [ ] Logs configurados
- [ ] Health checks funcionando

### Deployment

- [ ] Backup de base de datos
- [ ] Rollback plan listo
- [ ] Monitoring activo
- [ ] Alertas configuradas

### Post-deployment

- [ ] Health checks pasan
- [ ] Métricas normales
- [ ] No errores en logs
- [ ] Performance aceptable

---

## 📚 Recursos Adicionales

- [Documentación Arquitectura](./CAP_ARCHITECTURE.md)
- [Roadmap](./CAP_ROADMAP.md)
- [Análisis Crítico](./ANALISIS_CRITICO.md)

---

**Guía creada para implementación práctica del proyecto CAP.**
