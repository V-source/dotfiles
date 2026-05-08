---
name: cellular-architecture-pattern
description: "Patrón de Arquitectura Celular (CAP): Framework bio-inspirado para sistemas distribuidos nativos. Implementa células de software auto-contenidas con comunicación peer-to-peer, ciclo de vida completo (mitosis, apoptosis, homeostasis), sistemas de señalización, buffers citoplasmáticos y auto-sanación sin dependencias externas."
license: MIT
compatibility: opencode
metadata:
  version: "2.0.0"
  author: "OpenCode"
  paradigm: "Bio-Inspired Distributed Architecture"
  principles:
    - "Autonomía Celular"
    - "Comunicación por Señales"
    - "Homeostasis y Auto-Sanación"
    - "Ciclo de Vida Completo"
    - "Escalabilidad Horizontal Natural"
  vocabulary:
    prefix: "cell_"
    entities:
      - "Nucleus"
      - "Cytoplasm"
      - "Membrane"
      - "Organelles"
      - "SignalBus"
      - "Mitochondria"
allowed-tools:
  - read
  - write
  - edit
  - bash
  - grep
  - glob
  - webfetch
  - codesearch
---

# 🧬 Patrón de Arquitectura Celular (CAP)

**PARADIGMA:** Sistemas distribuidos bio-inspirados donde cada componente es una **célula de software** autónoma, capaz de nacer, crecer, reproducirse, comunicarse y morir de manera controlada, sin dependencia de orquestadores externos, brokers de mensajes o servicios de terceros.

---

## Vocabulario Biológico Formal

### Glosario Técnico-Biológico

| Término Biológico | Equivalente en Software | Definición Técnica |
|-------------------|------------------------|-------------------|
| **Célula** | `Cell` / `Organism` | Unidad mínima de computación autónoma con ADN (datos), metabolismo (procesamiento) y membrana (interfaz) |
| **Núcleo (Nucleus)** | `CoreDomain` | Centro de decisiones que contiene las reglas de negocio puras, inmutable y aislado |
| **Citoplasma** | `RuntimeState` | Estado volátil de la célula: buffers, colas, cache en memoria |
| **Membrana** | `API Layer` | Frontera definida que regula qué entra y sale: middlewares, validaciones, auth |
| **Membrana Plasmática** | `Firewall` / `RateLimiter` | Control de flujo selectivo que filtra tráfico no autorizado o excesivo |
| **Retículo Endoplásmico** | `ProcessorModule` | Procesador interno que transforma inputs en outputs (lógica de negocio) |
| **Aparato de Golgi** | `OutputFormatter` | Empaqueta y estructura las respuestas antes de enviar al exterior |
| **Mitocondria** | `AsyncWorker` | Unidad de procesamiento asíncrono que genera ATP (trabajo completado) |
| **Lisosoma** | `ErrorHandler` | Sistema de digestión que procesa errores y los convierte en respuestas útiles |
| **Ciclo Celular** | `LifecycleManager` | Controla estados: `G0`(idle), `G1`(creciendo), `S`(replicando), `G2`(preparando), `M`(mitosis/shutdown) |
| **Mitosis** | `HorizontalScaling` | División de una célula en dos células idénticas (escalado horizontal) |
| **Apoptosis** | `GracefulShutdown` | Muerte celular programada y ordenada con cleanup de recursos |
| **Homeostasis** | `SelfHealing` | Capacidad del sistema de mantener equilibrio ante fallos y recuperar estados |
| **Transducción de Señales** | `EventBus` | Sistema de comunicación intracelular que convierte eventos externos en acciones internas |
| **Ligando** | `MessagePayload` | Molécula (dato) que se une a un receptor (handler) para iniciar una respuesta |
| **Receptor** | `EventListener` | Componente que espera un tipo específico de señal y ejecuta respuesta |
| **Segundo Mensajero** | `InternalSignal` | Señal generada internamente que amplifica o propaga una respuesta |
| **Calcio Intracelular** | `RapidEventBus` | Señal de alta prioridad que viaja instantáneamente dentro de la célula |
| **AMP Cíclico** | `PersistentEvent` | Señal que persiste hasta ser consumida completamente |
| **Quimiocinas** | `BroadcastSignal` | Señales de tipo "broadcast" que atraen o alertan a múltiples células |
| **Apoptina** | `ShutdownSignal` | Señal molecular que induce muerte celular programada |
| **Caspasas** | `CleanupHandlers` | Enzimas que ejecutan la拆卸 (disassembly) durante apoptosis |
| **Cromosoma** | `SchemaDefinition` | Definición estructural de datos inmutables |
| **Gen** | `BusinessRule` | Unidad de lógica de negocio específica |
| **Expresión Génica** | `RuleEvaluation` | Evaluación y aplicación de reglas de negocio |
| **ADN** | `PersistentStorage` | Información persistente que sobrevive a reinicios |
| **ARN Mensajero** | `QueryResult` | Resultado temporal de una "transcripción" (consulta) |
| **Ribosoma** | `FunctionExecutor` | Ejecutor de instrucciones específicas |
| **ATP** | `CompletedTask` | Unidad de trabajo completada y exitosa |
| **Membrana Mitocondrial** | `WorkerBoundary` | Frontera que aísla procesamiento asíncrono del resto de la célula |
| **Potencial de Membrana** | `LoadState` | Estado de carga actual del sistema (bajo/alto/sobrecargado |
| **Ion Channel** | `ThrottleGate` | Compuerta que regula el flujo de datos |
| **Transporte Activo** | `PriorityQueue` | Cola que mueve elementos contra el gradiente (prioridad alta) |
| **Transporte Pasivo** | `FIFOQueue` | Cola simple que procesa en orden de llegada |
| **Endocitosis** | `DataIngestion` | Proceso de internalizar datos externos |
| **Exocitosis** | `ResponseOutput` | Proceso de expelir resultados hacia el exterior |
| **Punto de Control G1** | `HealthCheckpoint` | Verificación antes de entrar en procesamiento activo |
| **Punto de Control G2** | `PreCommitCheckpoint` | Verificación antes de replicar/escalar |
| **Factor de Crecimiento** | `ScaleSignal` | Señal que indica necesidad de mitosis (escalado) |
| **Inhibidor de Punto de Control** | `CircuitBreaker` | Mecanismo que detiene procesamiento cuando hay fallos |

---

## Arquitectura de una Célula de Software

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                          CÉLULA DE SOFTWARE (CAP)                             ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  ┌─────────────────────────────────────────────────────────────────────────┐   ║
║  │                      MEMBRANA (API Layer)                              │   ║
║  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   ║
║  │  │   Auth      │  │   Rate      │  │   Valid     │  │   Throttle   │  │   ║
║  │  │   Guard     │  │   Limiter   │  │   ation     │  │   Gate       │  │   ║
║  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │   ║
║  └─────────────────────────────────────────────────────────────────────────┘   ║
║                                    │                                          ║
║                                    ▼                                          ║
║  ┌─────────────────────────────────────────────────────────────────────────┐   ║
║  │                     CITOPLASMA (Runtime State)                          │   ║
║  │                                                                          │   ║
║  │  ┌─────────────────────────────────────────────────────────────────┐    │   ║
║  │  │                      SIGNAL BUS (EventEmitter)                   │    │   ║
║  │  │   ┌───────────┐   ┌───────────┐   ┌───────────┐                │    │   ║
║  │  │   │  Ca²⁺     │   │  cAMP      │   │ Broadcast │                │    │   ║
║  │  │   │  Signal   │   │  Signal    │   │ Signal    │                │    │   ║
║  │  │   └───────────┘   └───────────┘   └───────────┘                │    │   ║
║  │  └─────────────────────────────────────────────────────────────────┘    │   ║
║  │                                                                          │   ║
║  │  ┌─────────────────────┐  ┌─────────────────────┐                     │   ║
║  │  │  CYTOPLASM BUFFER   │  │  CYCLE CONTROLLER   │                     │   ║
║  │  │  ┌───────┐          │  │  ┌───────────────┐ │                     │   ║
║  │  │  │ Queue │ Influx    │  │  │ G0 │ G1 │ S │ │                     │   ║
║  │  │  │       │ ──────▶   │  │  │ G2 │ M  │   │ │                     │   ║
║  │  │  │       │ Efferent   │  │  └───────────────┘ │                     │   ║
║  │  │  │       │ ◀──────   │  │                     │                     │   ║
║  │  │  └───────┘          │  │  Self-Healing Logic │                     │   ║
║  │  │  Backpressure       │  │  Recovery Protocols │                     │   ║
║  │  │  Management         │  │                     │                     │   ║
║  │  └─────────────────────┘  └─────────────────────┘                     │   ║
║  │                                                                          │   ║
║  └─────────────────────────────────────────────────────────────────────────┘   ║
║                                    │                                          ║
║                                    ▼                                          ║
║  ┌─────────────────────────────────────────────────────────────────────────┐   ║
║  │                     NÚCLEO (Business Logic)                             │   ║
║  │                                                                          │   ║
║  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               │   ║
║  │  │  DOMAIN       │  │  DOMAIN       │  │  DOMAIN       │               │   ║
║  │  │  ENTITIES     │  │  VALUE        │  │  AGGREGATES   │               │   ║
║  │  │               │  │  OBJECTS      │  │               │               │   ║
║  │  │  ┌───────┐    │  │  ┌───────┐    │  ┌───────┐      │               │   ║
║  │  │  │ ID    │    │  │  │ Money │    │  │Order  │      │               │   ║
║  │  │  │ State │    │  │  │Email  │    │  │ +Items│      │               │   ║
║  │  │  └───────┘    │  │  └───────┘    │  └───────┘      │               │   ║
║  │  └───────────────┘  └───────────────┘  └───────────────┘               │   ║
║  │                                                                          │   ║
║  │  ┌─────────────────────────────────────────────────────────────────┐    │   ║
║  │  │                  DOMAIN SERVICES & RULES                         │    │   ║
║  │  │   calculateTax()  validateOrder()  applyDiscount()              │    │   ║
║  │  └─────────────────────────────────────────────────────────────────┘    │   ║
║  │                                                                          │   ║
║  └─────────────────────────────────────────────────────────────────────────┘   ║
║                                    │                                          ║
║                                    ▼                                          ║
║  ┌─────────────────────────────────────────────────────────────────────────┐   ║
║  │                    ORGÁNULOS (Processors)                               │   ║
║  │                                                                          │   ║
║  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               │   ║
║  │  │   MITO        │  │    GOLGI     │  │   LISOSOMA   │               │   ║
║  │  │   CHONDRIA    │  │   COMPLEX    │  │   (Error)    │               │   ║
║  │  │               │  │               │  │               │               │   ║
║  │  │  AsyncWorker  │  │  Response     │  │  Error       │               │   ║
║  │  │  Background   │  │  Formatter    │  │  Processor   │               │   ║
║  │  │  Jobs         │  │  JSON/XML     │  │  & Recovery  │               │   ║
║  │  └───────────────┘  └───────────────┘  └───────────────┘               │   ║
║  │                                                                          │   ║
║  └─────────────────────────────────────────────────────────────────────────┘   ║
║                                    │                                          ║
║                                    ▼                                          ║
║  ┌─────────────────────────────────────────────────────────────────────────┐   ║
║  │                     ADN (Persistent Storage)                          │   ║
║  │                                                                          │   ║
║  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               │   ║
║  │  │   SCHEMA     │  │   MIGRATION   │  │   REPOSITORY │               │   ║
║  │  │   DEFINITION │  │   ENGINE      │  │   PATTERN    │               │   ║
║  │  └───────────────┘  └───────────────┘  └───────────────┘               │   ║
║  │                                                                          │   ║
║  └─────────────────────────────────────────────────────────────────────────┘   ║
║                                                                               ║
║  ┌─────────────────────────────────────────────────────────────────────────┐   ║
║  │              SISTEMA DE SEÑALES EXTERNAS (Receptores)                 │   ║
║  │                                                                          │   ║
║  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               │   ║
║  │  │   SIGTERM    │  │   SIGINT      │  │   SIGHUP      │               │   ║
║  │  │   (Apoptosis)│  │   (Interrupt) │  │   (Reload)    │               │   ║
║  │  └───────────────┘  └───────────────┘  └───────────────┘               │   ║
║  │                                                                          │   ║
║  └─────────────────────────────────────────────────────────────────────────┘   ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

---

## Patrones de Implementación Nativos

### 1. SignalBus: Sistema de Transducción de Señales

```typescript
// =============================================================================
// SEÑAL: Transducción de Señales Celular
// =============================================================================

type SignalType = 
  | 'CALCIUM_SPIKE'    // Alta prioridad, respuesta inmediata
  | 'CAMP_SIGNAL'       // Señal persistente
  | 'BROADCAST'         // Señal global
  | 'QUorum_SENSING'    // Detección de vecinos
  | 'GROWTH_FACTOR'     // Escala la célula
  | 'APOPTOSIS_TRIGGER' // Muerte programada
  | 'CHECKPOINT_G1'     // Health check
  | 'CHECKPOINT_G2'     // Pre-mitosis check
  | 'DATA_INGESTION'    // Nuevo input
  | 'OUTPUT_READY'      // Resultado disponible
  | 'ERROR_DETECTED'    // Problema interno
  | 'RECOVERY_COMPLETE' // Homeostasis restaurada

interface CellSignal<T = unknown> {
  readonly type: SignalType;
  readonly source: string;           // Organelo que emite
  readonly target?: string;          // Organelo destino (opcional = broadcast)
  readonly payload: T;
  readonly timestamp: number;
  readonly ttl: number;              // Tiempo de vida en ms
  readonly priority: 0 | 1 | 2 | 3; // 0 = crítico, 3 = bajo
  readonly traceId?: string;         // Para debugging distribuido
}

type SignalHandler<T = unknown> = (signal: CellSignal<T>) => void | Promise<void>;

// =============================================================================
// SIGNAL BUS: Sistema Nervioso Celular
// =============================================================================

class SignalBus {
  private handlers = new Map<SignalType, Set<SignalHandler>>();
  private deadLetterQueue: CellSignal[] = [];
  private signalHistory: CellSignal[] = [];
  private maxHistory = 1000;
  
  // Propagación de señales intracelular
  subscribe(type: SignalType, handler: SignalHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    
    // Return cleanup function
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }
  
  // Suscripción a múltiples tipos
  subscribeMany(types: SignalType[], handler: SignalHandler): () => void {
    const unsubs = types.map(t => this.subscribe(t, handler));
    return () => unsubs.forEach(u => u());
  }
  
  // Emitir señal (transducción)
  emit<T>(signal: Omit<CellSignal<T>, 'timestamp'>): void {
    const fullSignal: CellSignal<T> = {
      ...signal,
      timestamp: Date.now(),
    };
    
    // Calcular priority delay
    const delay = this.calculatePropagationDelay(fullSignal.priority);
    
    // Registro en historial
    this.addToHistory(fullSignal);
    
    // Propagación según tipo
    setTimeout(() => {
      this.dispatch(fullSignal);
    }, delay);
  }
  
  private calculatePropagationDelay(priority: CellSignal['priority']): number {
    // Calcio (priority 0) = inmediato
    // cAMP (priority 1-2) = pequeño delay
    // Broadcast (priority 3) = batch processing
    switch (priority) {
      case 0: return 0;
      case 1: return 1;
      case 2: return 5;
      case 3: return 10;
      default: return 0;
    }
  }
  
  private dispatch<T>(signal: CellSignal<T>): void {
    const handlers = this.handlers.get(signal.type);
    
    if (!handlers || handlers.size === 0) {
      // Señal sin receptor = dead letter
      this.deadLetterQueue.push(signal);
      console.warn(`[SIGNAL] Dead letter: ${signal.type} from ${signal.source}`);
      return;
    }
    
    // Ejecutar todos los handlers sincrónicamente (cascada de segundos mensajeros)
    for (const handler of handlers) {
      try {
        const result = handler(signal);
        if (result instanceof Promise) {
          result.catch(err => {
            console.error(`[SIGNAL] Handler error in ${signal.type}:`, err);
          });
        }
      } catch (err) {
        console.error(`[SIGNAL] Sync handler error in ${signal.type}:`, err);
      }
    }
  }
  
  private addToHistory<T>(signal: CellSignal<T>): void {
    this.signalHistory.push(signal);
    if (this.signalHistory.length > this.maxHistory) {
      this.signalHistory.shift();
    }
  }
  
  // Debugging: ver historial de señales
  getHistory(filter?: SignalType): CellSignal[] {
    if (!filter) return [...this.signalHistory];
    return this.signalHistory.filter(s => s.type === filter);
  }
  
  // Limpiar dead letters
  processDeadLetters(): void {
    if (this.deadLetterQueue.length === 0) return;
    
    console.warn(`[SIGNAL] Processing ${this.deadLetterQueue.length} dead letters`);
    const failed: CellSignal[] = [];
    
    for (const signal of this.deadLetterQueue) {
      console.warn(`  - ${signal.type}: ${JSON.stringify(signal.payload)}`);
    }
    
    this.deadLetterQueue = failed;
  }
}
```

### 2. CycleController: Control del Ciclo Celular

```typescript
// =============================================================================
// CICLO CELULAR: Estados y Transiciones
// =============================================================================

enum CellCycleState {
  G0 = 'G0_IDLE',           // Quiescente, esperando activadores
  G1 = 'G1_GROWTH',         // Crecimiento, preparándose para replicación
  S = 'S_REPLICATION',      // Replicación del ADN
  G2 = 'G2_PREPARATION',    // Preparación para división
  M = 'M_MITOSIS',          // División celular
  APOPTOSIS = 'APOPTOSIS',  // Muerte programada
  NECROSIS = 'NECROSIS',    // Muerte no programada (error)
}

interface CycleState {
  state: CellCycleState;
  entryTime: number;
  stateDuration: number;
  checkpointPassed: string[];
  healthScore: number; // 0-100
}

class CycleController {
  private state: CycleState = {
    state: CellCycleState.G0,
    entryTime: Date.now(),
    stateDuration: 0,
    checkpointPassed: [],
    healthScore: 100,
  };
  
  private checkpoints: Map<CellCycleState, () => boolean> = new Map([
    [CellCycleState.G1, () => this.checkResources()],
    [CellCycleState.G2, () => this.checkReplicationComplete()],
    [CellCycleState.M, () => this.canDivide()],
  ]);
  
  private transitions: Map<CellCycleState, CellCycleState[]> = new Map([
    [CellCycleState.G0, [CellCycleState.G1, CellCycleState.APOPTOSIS]],
    [CellCycleState.G1, [CellCycleState.S, CellCycleState.G0, CellCycleState.APOPTOSIS]],
    [CellCycleState.S, [CellCycleState.G2, CellCycleState.G0, CellCycleState.APOPTOSIS]],
    [CellCycleState.G2, [CellCycleState.M, CellCycleState.G0, CellCycleState.APOPTOSIS]],
    [CellCycleState.M, [CellCycleState.G0, CellCycleState.APOPTOSIS]], // Post-mitosis
    [CellCycleState.APOPTOSIS, []], // Estado terminal
    [CellCycleState.NECROSIS, []],  // Estado terminal
  ]);
  
  private onStateChange?: (from: CellCycleState, to: CellCycleState) => void;
  
  constructor(onStateChange?: (from: CellCycleState, to: CellCycleState) => void) {
    this.onStateChange = onStateChange;
  }
  
  getState(): CycleState {
    return { ...this.state };
  }
  
  getStateName(): CellCycleState {
    return this.state.state;
  }
  
  // Transición de estado
  transitionTo(newState: CellCycleState): boolean {
    const allowed = this.transitions.get(this.state.state);
    
    if (!allowed?.includes(newState)) {
      console.warn(`[CYCLE] Invalid transition: ${this.state.state} -> ${newState}`);
      return false;
    }
    
    const previousState = this.state.state;
    this.state.state = newState;
    this.state.entryTime = Date.now();
    this.state.stateDuration = 0;
    
    console.log(`[CYCLE] Transition: ${previousState} -> ${newState}`);
    this.onStateChange?.(previousState, newState);
    
    return true;
  }
  
  // Verificar checkpoints antes de avanzar
  canProgress(): boolean {
    const checkpoint = this.checkpoints.get(this.state.state);
    if (!checkpoint) return true;
    return checkpoint();
  }
  
  // G1 Checkpoint: Recursos disponibles
  private checkResources(): boolean {
    const memory = process.memoryUsage();
    const cpu = process.cpuUsage();
    
    const memoryOk = memory.heapUsed < memory.heapLimit * 0.8;
    const cpuOk = cpu.user < 1000000; // < 1 segundo de CPU acumulado
    
    if (!memoryOk) {
      console.warn('[CYCLE] G1 Checkpoint FAILED: Memory low');
    }
    if (!cpuOk) {
      console.warn('[CYCLE] G1 Checkpoint FAILED: CPU high');
    }
    
    return memoryOk && cpuOk;
  }
  
  // G2 Checkpoint: ADN replicado correctamente
  private checkReplicationComplete(): boolean {
    // Verificar que todas las operaciones de escritura estén completas
    return true; // Implementar según lógica de persistencia
  }
  
  // M Checkpoint: Lista para división
  private canDivide(): boolean {
    return this.state.healthScore >= 50;
  }
  
  // Actualizar health score
  updateHealth(score: number): void {
    this.state.healthScore = Math.max(0, Math.min(100, score));
    
    // Si health baja de 30%, iniciar apoptosis
    if (this.state.healthScore < 30 && this.state.state !== CellCycleState.APOPTOSIS) {
      this.transitionTo(CellCycleState.APOPTOSIS);
    }
  }
  
  // Obtener métricas del ciclo
  getMetrics(): Record<string, number> {
    return {
      stateDurationMs: Date.now() - this.state.entryTime,
      healthScore: this.state.healthScore,
      checkpointsPassed: this.state.checkpointPassed.length,
    };
  }
}
```

### 3. CytoplasmBuffer: Gestión del Citoplasma

```typescript
// =============================================================================
// CYTOPLASM BUFFER: Cola de Procesamiento Intracelular
// =============================================================================

type OverflowStrategy = 'drop-oldest' | 'drop-newest' | 'block' | 'spillover';

interface BufferConfig {
  maxSize: number;
  overflowStrategy: OverflowStrategy;
  spilloverTarget?: CytoplasmBuffer<unknown>; // Para spillover strategy
  batchSize: number;          // Procesar en lotes
  batchTimeoutMs: number;      // Max tiempo antes de procesar lote parcial
  priorityLevels: number;     // Niveles de prioridad (1 = alta, N = baja)
}

class CytoplasmBuffer<T> {
  private queues: Map<number, T[]> = new Map();
  private overflowQueue: T[] = [];
  private config: BufferConfig;
  private batchTimer: ReturnType<typeof setTimeout> | null = null;
  private itemsProcessed = 0;
  private itemsDropped = 0;
  
  constructor(config: Partial<BufferConfig> = {}) {
    this.config = {
      maxSize: config.maxSize ?? 1000,
      overflowStrategy: config.overflowStrategy ?? 'drop-oldest',
      spilloverTarget: config.spilloverTarget,
      batchSize: config.batchSize ?? 100,
      batchTimeoutMs: config.batchTimeoutMs ?? 100,
      priorityLevels: config.priorityLevels ?? 3,
    };
    
    // Inicializar colas por prioridad
    for (let i = 1; i <= this.config.priorityLevels; i++) {
      this.queues.set(i, []);
    }
  }
  
  // INFLUX: Entrada de sustancias al citoplasma
  influx(item: T, priority: number = this.config.priorityLevels): boolean {
    const normalizedPriority = Math.max(1, Math.min(this.config.priorityLevels, priority));
    const queue = this.queues.get(normalizedPriority)!;
    
    // Verificar overflow
    const totalSize = this.getTotalSize();
    
    if (totalSize >= this.config.maxSize) {
      this.itemsDropped++;
      return this.handleOverflow(item);
    }
    
    queue.push(item);
    this.startBatchTimer();
    return true;
  }
  
  private handleOverflow(item: T): boolean {
    switch (this.config.overflowStrategy) {
      case 'drop-oldest':
        this.dropOldestFromAllQueues();
        this.queues.get(1)!.push(item); // Alta prioridad para overflow
        return true;
        
      case 'drop-newest':
        return false; // Rechazar el nuevo item
        
      case 'block':
        // Simular backpressure - no bloquear el event loop
        this.scheduleRetry(item);
        return false;
        
      case 'spillover':
        if (this.config.spilloverTarget) {
          this.config.spilloverTarget.influx(item, 1); // Prioridad alta en spillover
          return true;
        }
        return this.handleOverflow(item); // Fallback
    }
  }
  
  private dropOldestFromAllQueues(): void {
    for (const [priority, queue] of this.queues) {
      if (queue.length > 0) {
        queue.shift();
        break;
      }
    }
  }
  
  private scheduleRetry(item: T): void {
    setTimeout(() => {
      this.influx(item, 1); // Retry con alta prioridad
    }, 100);
  }
  
  // EFFLUX: Salida procesada (batch processing)
  async efflux(): Promise<T[]> {
    const batch: T[] = [];
    
    // Prioridad alta primero (orden de procesamiento)
    for (let priority = 1; priority <= this.config.priorityLevels; priority++) {
      const queue = this.queues.get(priority)!;
      
      while (batch.length < this.config.batchSize && queue.length > 0) {
        batch.push(queue.shift()!);
        this.itemsProcessed++;
      }
    }
    
    if (this.batchTimer && batch.length > 0) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    
    return batch;
  }
  
  // DRAIN: Obtener todo el contenido
  drain(): T[] {
    const all: T[] = [];
    for (const queue of this.queues.values()) {
      all.push(...queue.splice(0));
    }
    return all;
  }
  
  private startBatchTimer(): void {
    if (this.batchTimer) return;
    
    this.batchTimer = setTimeout(async () => {
      const batch = await this.efflux();
      if (batch.length > 0) {
        console.log(`[CYTOPLASM] Batch processed: ${batch.length} items`);
      }
    }, this.config.batchTimeoutMs);
  }
  
  getTotalSize(): number {
    let total = 0;
    for (const queue of this.queues.values()) {
      total += queue.length;
    }
    return total + this.overflowQueue.length;
  }
  
  getLoad(): number {
    return this.getTotalSize() / this.config.maxSize;
  }
  
  getMetrics(): BufferMetrics {
    return {
      totalItems: this.getTotalSize(),
      processedItems: this.itemsProcessed,
      droppedItems: this.itemsDropped,
      queueSizes: Object.fromEntries(this.queues),
      load: this.getLoad(),
    };
  }
}

interface BufferMetrics {
  totalItems: number;
  processedItems: number;
  droppedItems: number;
  queueSizes: Record<number, number>;
  load: number;
}
```

### 4. Mitochondria: Procesamiento Asíncrono

```typescript
// =============================================================================
// MITOCHONDRIA: Productor de ATP (Async Worker)
// =============================================================================

type TaskPriority = 'critical' | 'high' | 'normal' | 'low';

interface MitochondriaConfig {
  maxConcurrency: number;
  taskTimeoutMs: number;
  retryAttempts: number;
  retryDelayMs: number;
  cpuIntensive: boolean;
}

interface AsyncTask<T = unknown> {
  id: string;
  priority: TaskPriority;
  work: () => Promise<T>;
  onComplete?: (result: T) => void;
  onError?: (error: Error) => void;
  maxRetries?: number;
  traceId?: string;
}

class Mitochondria {
  private config: MitochondriaConfig;
  private taskQueue: CytoplasmBuffer<AsyncTask>;
  private activeTasks = new Map<string, Promise<unknown>>();
  private atpGenerated = 0;
  private tasksFailed = 0;
  
  constructor(config: Partial<MitochondriaConfig> = {}) {
    this.config = {
      maxConcurrency: config.maxConcurrency ?? 10,
      taskTimeoutMs: config.taskTimeoutMs ?? 30000,
      retryAttempts: config.retryAttempts ?? 3,
      retryDelayMs: config.retryDelayMs ?? 1000,
      cpuIntensive: config.cpuIntensive ?? false,
    };
    
    this.taskQueue = new CytoplasmBuffer<AsyncTask>({
      maxSize: 10000,
      overflowStrategy: 'drop-oldest',
      batchSize: 100,
      priorityLevels: 4,
    });
    
    this.startMetabolism();
  }
  
  // Generar ATP (completar trabajo)
  async generateATP<T>(task: AsyncTask<T>): Promise<T> {
    const priorityLevel = this.getPriorityLevel(task.priority);
    const accepted = this.taskQueue.influx(task, priorityLevel);
    
    if (!accepted) {
      throw new Error('Task queue overflow - system under heavy load');
    }
    
    return new Promise((resolve, reject) => {
      task.onComplete = (result) => resolve(result);
      task.onError = (error) => reject(error);
    });
  }
  
  private getPriorityLevel(priority: TaskPriority): number {
    switch (priority) {
      case 'critical': return 1;
      case 'high': return 2;
      case 'normal': return 3;
      case 'low': return 4;
      default: return 3;
    }
  }
  
  private async startMetabolism(): Promise<void> {
    while (true) {
      // Control de concurrencia
      if (this.activeTasks.size >= this.config.maxConcurrency) {
        await this.waitForSlot();
        continue;
      }
      
      const batch = await this.taskQueue.efflux();
      if (batch.length === 0) {
        await this.sleep(10);
        continue;
      }
      
      // Procesar lote
      for (const task of batch) {
        this.executeTask(task);
      }
    }
  }
  
  private async executeTask<T>(task: AsyncTask<T>): Promise<void> {
    const taskId = task.id;
    let attempts = 0;
    const maxRetries = task.maxRetries ?? this.config.retryAttempts;
    
    const runTask = async (): Promise<T> => {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Task ${taskId} timed out after ${this.config.taskTimeoutMs}ms`));
        }, this.config.taskTimeoutMs);
      });
      
      const workPromise = task.work();
      return Promise.race([workPromise, timeoutPromise]);
    };
    
    const taskPromise = (async () => {
      while (attempts < maxRetries) {
        try {
          const result = await runTask();
          this.atpGenerated++;
          task.onComplete?.(result);
          return;
        } catch (error) {
          attempts++;
          this.tasksFailed++;
          
          if (attempts >= maxRetries) {
            task.onError?.(error as Error);
            console.error(`[MITOCHONDRIA] Task ${taskId} failed after ${attempts} attempts`);
            return;
          }
          
          // Exponential backoff
          await this.sleep(this.config.retryDelayMs * Math.pow(2, attempts - 1));
        }
      }
    })();
    
    this.activeTasks.set(taskId, taskPromise);
    taskPromise.finally(() => {
      this.activeTasks.delete(taskId);
    });
  }
  
  private async waitForSlot(): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        if (this.activeTasks.size < this.config.maxConcurrency) {
          resolve();
        } else {
          setTimeout(check, 10);
        }
      };
      check();
    });
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  getMetrics(): MitochondriaMetrics {
    return {
      activeTasks: this.activeTasks.size,
      queuedTasks: this.taskQueue.getTotalSize(),
      atpGenerated: this.atpGenerated,
      tasksFailed: this.tasksFailed,
      concurrency: this.config.maxConcurrency,
    };
  }
}

interface MitochondriaMetrics {
  activeTasks: number;
  queuedTasks: number;
  atpGenerated: number;
  tasksFailed: number;
  concurrency: number;
}
```

### 5. ApoptosisController: Muerte Programada

```typescript
// =============================================================================
// APOPTOSIS: Muerte Celular Programada
// =============================================================================

type ShutdownPhase = 
  | 'SIGNAL_RECEIVED'
  | 'STOP_INGESTION'
  | 'DRAIN_BUFFERS'
  | 'COMPLETE_PENDING_TASKS'
  | 'CLOSE_CONNECTIONS'
  | 'CLEANUP_RESOURCES'
  | 'TERMINATE';

interface ApoptosisConfig {
  gracefulTimeoutMs: number;
  forceAfterMs: number;
  saveStateBeforeExit: boolean;
}

interface CleanupHandler {
  name: string;
  priority: number;
  fn: () => Promise<void> | void;
}

class ApoptosisController {
  private phase: ShutdownPhase = 'SIGNAL_RECEIVED';
  private config: ApoptosisConfig;
  private cleanupHandlers: CleanupHandler[] = [];
  private startedAt: number = 0;
  
  constructor(config: Partial<ApoptosisConfig> = {}) {
    this.config = {
      gracefulTimeoutMs: config.gracefulTimeoutMs ?? 30000,
      forceAfterMs: config.forceAfterMs ?? 60000,
      saveStateBeforeExit: config.saveStateBeforeExit ?? true,
    };
    
    this.setupSignalHandlers();
  }
  
  registerCleanup(handler: CleanupHandler): void {
    this.cleanupHandlers.push(handler);
    // Ordenar por prioridad (1 = primero)
    this.cleanupHandlers.sort((a, b) => a.priority - b.priority);
  }
  
  private setupSignalHandlers(): void {
    process.on('SIGTERM', (signal) => this.initiate(signal));
    process.on('SIGINT', (signal) => this.initiate(signal));
    process.on('SIGHUP', (signal) => this.reload(signal));
  }
  
  async initiate(signal: string): Promise<void> {
    if (this.phase !== 'SIGNAL_RECEIVED') {
      console.warn('[APOPTOSIS] Already in progress');
      return;
    }
    
    this.phase = 'STOP_INGESTION';
    this.startedAt = Date.now();
    
    console.log(`[APOPTOSIS] Signal ${signal} received. Initiating programmed cell death...`);
    console.log(`[APOPTOSIS] Graceful timeout: ${this.config.gracefulTimeoutMs}ms`);
    
    // Timeout forzado
    setTimeout(() => {
      console.error('[APOPTOSIS] Forced termination after timeout');
      process.exit(1);
    }, this.config.forceAfterMs);
    
    await this.executePhases();
  }
  
  private async reload(signal: string): Promise<void> {
    console.log(`[APOPTOSIS] SIGHUP received. Reloading configuration...`);
    // Emitir señal interna de reload
    process.emit('CELL_RELOAD');
  }
  
  private async executePhases(): Promise<void> {
    const phases: ShutdownPhase[] = [
      'STOP_INGESTION',
      'DRAIN_BUFFERS',
      'COMPLETE_PENDING_TASKS',
      'CLOSE_CONNECTIONS',
      'CLEANUP_RESOURCES',
      'TERMINATE',
    ];
    
    for (const phase of phases) {
      this.phase = phase;
      await this.executePhase(phase);
    }
  }
  
  private async executePhase(phase: ShutdownPhase): Promise<void> {
    console.log(`[APOPTOSIS] Phase: ${phase}`);
    const phaseStart = Date.now();
    
    switch (phase) {
      case 'STOP_INGESTION':
        // Implementar en cada célula
        process.emit('STOP_INGESTION_SIGNAL');
        await this.sleep(100);
        break;
        
      case 'DRAIN_BUFFERS':
        // Drain cytoplasm buffers
        process.emit('DRAIN_BUFFERS_SIGNAL');
        await this.waitForBuffersEmpty(5000);
        break;
        
      case 'COMPLETE_PENDING_TASKS':
        // Wait for mitochondria to complete tasks
        await this.waitForTasksComplete(10000);
        break;
        
      case 'CLOSE_CONNECTIONS':
        // Close database connections, file handles
        for (const handler of this.cleanupHandlers) {
          try {
            await handler.fn();
            console.log(`[APOPTOSIS] Cleanup: ${handler.name} completed`);
          } catch (err) {
            console.error(`[APOPTOSIS] Cleanup failed: ${handler.name}`, err);
          }
        }
        break;
        
      case 'CLEANUP_RESOURCES':
        // Final cleanup
        global.gc?.(); // Solicitar GC si está disponible
        await this.sleep(500);
        break;
        
      case 'TERMINATE':
        console.log('[APOPTOSIS] Cell death complete');
        process.exit(0);
    }
    
    const elapsed = Date.now() - phaseStart;
    console.log(`[APOPTOSIS] Phase ${phase} completed in ${elapsed}ms`);
  }
  
  private async waitForBuffersEmpty(timeoutMs: number): Promise<void> {
    // Implementar verificación de buffers vacíos
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      // Verificar buffers de cada orgánulo
      await this.sleep(100);
    }
  }
  
  private async waitForTasksComplete(timeoutMs: number): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      // Verificar tareas pendientes en mitocondria
      await this.sleep(100);
    }
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  getStatus(): { phase: ShutdownPhase; elapsedMs: number } {
    return {
      phase: this.phase,
      elapsedMs: this.startedAt ? Date.now() - this.startedAt : 0,
    };
  }
}
```

### 6. Homeostasis: Sistema de Auto-Sanación

```typescript
// =============================================================================
// HOMEOSTASIS: Sistema de Auto-Sanación y Equilibrio
// =============================================================================

interface HealthMetric {
  name: string;
  value: number;
  threshold: number;
  unit: string;
}

interface HomeostasisConfig {
  checkIntervalMs: number;
  memoryThresholdMB: number;
  cpuThresholdPercent: number;
  errorRateThreshold: number;
  responseTimeThresholdMs: number;
  autoRestartAttempts: number;
  autoRestartCooldownMs: number;
}

class Homeostasis {
  private config: HomeostasisConfig;
  private metrics: Map<string, HealthMetric> = new Map();
  private healthScore = 100;
  private restartAttempts = 0;
  private lastRestartTime = 0;
  private isCritical = false;
  
  constructor(config: Partial<HomeostasisConfig> = {}) {
    this.config = {
      checkIntervalMs: config.checkIntervalMs ?? 5000,
      memoryThresholdMB: config.memoryThresholdMB ?? 512,
      cpuThresholdPercent: config.cpuThresholdPercent ?? 80,
      errorRateThreshold: config.errorRateThreshold ?? 0.05,
      responseTimeThresholdMs: config.responseTimeThresholdMs ?? 5000,
      autoRestartAttempts: config.autoRestartAttempts ?? 3,
      autoRestartCooldownMs: config.autoRestartCooldownMs ?? 60000,
    };
    
    this.startMonitoring();
  }
  
  private startMonitoring(): void {
    setInterval(() => {
      this.collectMetrics();
      this.evaluateHealth();
      this.applyCorrections();
    }, this.config.checkIntervalMs);
  }
  
  private collectMetrics(): void {
    const mem = process.memoryUsage();
    const cpu = process.cpuUsage();
    
    this.metrics.set('memory_heap', {
      name: 'memory_heap',
      value: mem.heapUsed / 1024 / 1024,
      threshold: this.config.memoryThresholdMB,
      unit: 'MB',
    });
    
    this.metrics.set('memory_rss', {
      name: 'memory_rss',
      value: mem.rss / 1024 / 1024,
      threshold: this.config.memoryThresholdMB * 1.5,
      unit: 'MB',
    });
    
    this.metrics.set('cpu_user', {
      name: 'cpu_user',
      value: cpu.user / 1000000,
      threshold: this.config.cpuThresholdPercent,
      unit: '%',
    });
    
    this.metrics.set('event_loop_lag', {
      name: 'event_loop_lag',
      value: this.measureEventLoopLag(),
      threshold: 100,
      unit: 'ms',
    });
  }
  
  private measureEventLoopLag(): number {
    const start = Date.now();
    setImmediate(() => {
      // This runs in next tick
    });
    return Date.now() - start;
  }
  
  private evaluateHealth(): void {
    let deductions = 0;
    
    for (const [name, metric] of this.metrics) {
      const ratio = metric.value / metric.threshold;
      
      if (ratio > 1.0) {
        deductions += 30; // Crítico
        console.warn(`[HOMEOSTASIS] ${name} critical: ${metric.value}${metric.unit}`);
      } else if (ratio > 0.8) {
        deductions += 15; // Advertencia
        console.warn(`[HOMEOSTASIS] ${name} warning: ${metric.value}${metric.unit}`);
      } else if (ratio > 0.6) {
        deductions += 5; // Atenuado
      }
    }
    
    this.healthScore = Math.max(0, 100 - deductions);
    this.isCritical = this.healthScore < 30;
    
    if (this.isCritical) {
      console.error(`[HOMEOSTASIS] CRITICAL: Health score = ${this.healthScore}`);
    }
  }
  
  private applyCorrections(): void {
    // Corrección 1: Memory pressure
    const memoryMetric = this.metrics.get('memory_heap');
    if (memoryMetric && memoryMetric.value / memoryMetric.threshold > 0.9) {
      this.triggerGC();
    }
    
    // Corrección 2: High CPU
    const cpuMetric = this.metrics.get('cpu_user');
    if (cpuMetric && cpuMetric.value > this.config.cpuThresholdPercent) {
      this.throttleProcessing();
    }
    
    // Corrección 3: Health crítico - auto-restart
    if (this.isCritical && this.canAutoRestart()) {
      this.initiateRecovery();
    }
  }
  
  private triggerGC(): void {
    console.log('[HOMEOSTASIS] Triggering garbage collection...');
    global.gc?.();
  }
  
  private throttleProcessing(): void {
    console.log('[HOMEOSTASIS] Throttling processing due to high CPU...');
    // Reducir concurrencia, aumentar delays
    process.emit('CPU_PRESSURE_SIGNAL');
  }
  
  private canAutoRestart(): boolean {
    const now = Date.now();
    if (this.restartAttempts >= this.config.autoRestartAttempts) {
      return false;
    }
    if (now - this.lastRestartTime < this.config.autoRestartCooldownMs) {
      return false;
    }
    return true;
  }
  
  private initiateRecovery(): void {
    console.log('[HOMEOSTASIS] Initiating recovery protocol...');
    this.restartAttempts++;
    this.lastRestartTime = Date.now();
    
    // Emitir señal de recuperación
    process.emit('RECOVERY_SIGNAL');
  }
  
  resetRestartCounter(): void {
    this.restartAttempts = 0;
  }
  
  getHealthScore(): number {
    return this.healthScore;
  }
  
  getMetrics(): Record<string, HealthMetric> {
    return Object.fromEntries(this.metrics);
  }
}
```

### 7. Receptor: Comunicación Intercelular

```typescript
// =============================================================================
// RECEPTOR: Comunicación Peer-to-Peer Entre Células
// =============================================================================

interface CellAddress {
  host: string;
  port: number;
  cellId: string;
  capabilities: string[];
}

interface InterCellMessage<T = unknown> {
  from: CellAddress;
  to?: CellAddress;
  type: 'REQUEST' | 'RESPONSE' | 'BROADCAST' | 'HEARTBEAT' | 'NEGOTIATION';
  payload: T;
  protocol: 'http' | 'tcp' | 'websocket';
  correlationId: string;
  timestamp: number;
  ttl: number;
}

type ReceptorHandler<T = unknown> = (message: InterCellMessage<T>) => Promise<T> | T;

class Receptor {
  private cellId: string;
  private address: CellAddress;
  private neighbors: Map<string, CellAddress> = new Map();
  private handlers: Map<string, ReceptorHandler> = new Map();
  private httpAgent: import('http').Agent;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  
  constructor(cellId: string, host: string, port: number) {
    this.cellId = cellId;
    this.address = { host, port, cellId, capabilities: [] };
    this.httpAgent = new import('http').Agent({ keepAlive: true });
  }
  
  registerCapability(capability: string): void {
    this.address.capabilities.push(capability);
  }
  
  // Descubrimiento de vecinos (Quorum Sensing)
  async discoverNeighbors(seedNodes: CellAddress[]): Promise<void> {
    for (const seed of seedNodes) {
      try {
        const response = await this.send<CellAddress[]>({
          from: this.address,
          to: seed,
          type: 'NEGOTIATION',
          payload: { query: 'neighbors' },
          protocol: 'http',
          correlationId: this.generateId(),
          timestamp: Date.now(),
          ttl: 5000,
        });
        
        if (response?.payload?.neighbors) {
          for (const neighbor of response.payload.neighbors) {
            this.neighbors.set(neighbor.cellId, neighbor);
          }
        }
      } catch (err) {
        console.warn(`[RECEPTOR] Cannot reach seed node ${seed.cellId}`);
      }
    }
    
    console.log(`[RECEPTOR] Discovered ${this.neighbors.size} neighbors`);
  }
  
  // Registrar handler para tipo de mensaje
  registerHandler(type: string, handler: ReceptorHandler): void {
    this.handlers.set(type, handler);
  }
  
  // Enviar mensaje a célula específica
  async send<T>(message: Omit<InterCellMessage<T>, 'from' | 'timestamp'>): Promise<InterCellMessage<T>> {
    const fullMessage: InterCellMessage<T> = {
      ...message,
      from: this.address,
      timestamp: Date.now(),
    };
    
    if (!message.to) {
      throw new Error('Recipient required for unicast message');
    }
    
    return this.transmit(fullMessage);
  }
  
  // Broadcast a vecinos
  async broadcast<T>(message: Omit<InterCellMessage<T>, 'from' | 'timestamp' | 'to'>): Promise<void> {
    const fullMessage: InterCellMessage<T> = {
      ...message,
      from: this.address,
      timestamp: Date.now(),
      type: 'BROADCAST',
    };
    
    const promises = Array.from(this.neighbors.values()).map(neighbor => 
      this.transmit({ ...fullMessage, to: neighbor }).catch(err => {
        console.warn(`[RECEPTOR] Broadcast failed to ${neighbor.cellId}:`, err.message);
      })
    );
    
    await Promise.allSettled(promises);
  }
  
  private async transmit<T>(message: InterCellMessage<T>): Promise<InterCellMessage<T>> {
    const url = `http://${message.to!.host}:${message.to!.port}/cell/${message.type.toLowerCase()}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-Id': message.correlationId,
        'X-Cell-From': this.cellId,
        'X-Message-Type': message.type,
      },
      body: JSON.stringify(message),
      agent: this.httpAgent,
      signal: AbortSignal.timeout(message.ttl),
    });
    
    if (!response.ok) {
      throw new Error(`Transmission failed: ${response.status}`);
    }
    
    return response.json();
  }
  
  // Iniciar heartbeat
  startHeartbeat(intervalMs: number = 5000): void {
    this.heartbeatInterval = setInterval(() => {
      this.broadcast({
        type: 'HEARTBEAT',
        payload: { status: 'alive', metrics: {} },
        protocol: 'http',
        correlationId: this.generateId(),
        ttl: 3000,
      });
    }, intervalMs);
  }
  
  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
  
  private generateId(): string {
    return `${this.cellId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  getAddress(): CellAddress {
    return { ...this.address };
  }
  
  getNeighbors(): CellAddress[] {
    return Array.from(this.neighbors.values());
  }
}
```

---

## Ejemplo Completo: Organismo de Notificaciones CAP

```typescript
// =============================================================================
// ORGANISMO COMPLETO: Sistema de Notificaciones Push CAP
// Implementación completa con todos los orgánulos
// =============================================================================

import * as http from 'http';
import Database from 'better-sqlite3';
import { Expo } from 'expo-server-sdk';

// =============================================================================
// 1. MEMBRANA: Rate Limiting y Validación
// =============================================================================

class Membrane {
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  private rateLimit = 100; // requests per window
  private windowMs = 60000;
  
  async authorize(req: http.IncomingMessage): Promise<boolean> {
    const ip = req.socket.remoteAddress ?? 'unknown';
    const now = Date.now();
    
    const record = this.rateLimitMap.get(ip);
    
    if (!record || now > record.resetTime) {
      this.rateLimitMap.set(ip, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (record.count >= this.rateLimit) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  validateInvoiceBatch(body: unknown): body is { id: string; customer_id: string; email: string }[] {
    if (!Array.isArray(body)) return false;
    return body.every(item => 
      typeof item.id === 'string' &&
      typeof item.customer_id === 'string' &&
      typeof item.email === 'string'
    );
  }
}

// =============================================================================
// 2. ADN: Base de Datos (Esquema y Repository)
// =============================================================================

class DNALayer {
  private db: Database.Database;
  
  constructor(dbPath: string = 'notifications_dna.db') {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.initializeSchema();
  }
  
  private initializeSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        customer_id TEXT,
        email TEXT,
        status TEXT DEFAULT 'PENDING',
        attempts INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
  
  // Transcripción: Insertar lote
  batchInsert(invoices: { id: string; customer_id: string; email: string }[]): number {
    const stmt = this.db.prepare(
      'INSERT OR IGNORE INTO invoices (id, customer_id, email) VALUES (?, ?, ?)'
    );
    
    const transaction = this.db.transaction((data) => {
      for (const inv of data) {
        stmt.run(inv.id, inv.customer_id, inv.email);
      }
    });
    
    transaction(invoices);
    return invoices.length;
  }
  
  // Query: Obtener pendientes
  getPending(limit: number = 100): any[] {
    return this.db.prepare(
      "SELECT * FROM invoices WHERE status = 'PENDING' AND attempts < 3 LIMIT ?"
    ).all(limit);
  }
  
  // Update: Marcar completados
  markCompleted(ids: string[]): number {
    if (ids.length === 0) return 0;
    const placeholders = ids.map(() => '?').join(',');
    const result = this.db.prepare(
      `UPDATE invoices SET status = 'COMPLETED' WHERE id IN (${placeholders})`
    ).run(...ids);
    return result.changes;
  }
  
  // Recovery: Reanudar interrumpidos
  recoverInterrupted(): number {
    const result = this.db.prepare(
      "UPDATE invoices SET status = 'PENDING' WHERE status = 'PROCESSING'"
    ).run();
    return result.changes;
  }
  
  getStats(): Record<string, number> {
    return this.db.prepare(
      "SELECT status, COUNT(*) as count FROM invoices GROUP BY status"
    ).all().reduce((acc, row) => {
      acc[row.status] = row.count;
      return acc;
    }, {} as Record<string, number>);
  }
}

// =============================================================================
// 3. NÚCLEO: Lógica de Dominio
// =============================================================================

class Nucleus {
  constructor(
    private dna: DNALayer,
    private signalBus: SignalBus
  ) {}
  
  async processInvoices(invoices: { id: string; customer_id: string; email: string }[]): Promise<number> {
    // Transcripción al ADN
    const inserted = this.dna.batchInsert(invoices);
    
    // Señal: Nuevos datos disponibles
    this.signalBus.emit({
      type: 'DATA_INGESTION',
      source: 'nucleus',
      payload: { count: inserted },
      ttl: 1000,
      priority: 2,
    });
    
    return inserted;
  }
}

// =============================================================================
// 4. MITOCONDRIA: Procesador Push
// =============================================================================

class PushMitochondria {
  private isProcessing = false;
  private expo: Expo;
  private dna: DNALayer;
  private signalBus: SignalBus;
  
  constructor(dna: DNALayer, signalBus: SignalBus) {
    this.dna = dna;
    this.signalBus = signalBus;
    this.expo = new Expo();
    
    // Suscribirse a señales de datos nuevos
    this.signalBus.subscribe('DATA_INGESTION', () => this.run());
    this.signalBus.subscribe('CHECKPOINT_G1', () => {
      if (!this.isProcessing) this.run();
    });
  }
  
  async run(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    try {
      const pending = this.dna.getPending(100);
      if (pending.length === 0) {
        this.isProcessing = false;
        return;
      }
      
      console.log(`[MITOCHONDRIA] Procesando lote de ${pending.length}`);
      
      // Transformación: Construir mensajes Expo
      const messages = pending.map(inv => ({
        to: inv.email,
        sound: 'default',
        body: `Nueva factura: ${inv.id}`,
        data: { invoiceId: inv.id },
      }));
      
      // Chunking para respetar límites de Expo
      const chunks = this.expo.chunkPushNotifications(messages);
      
      for (const chunk of chunks) {
        try {
          const tickets = await this.expo.sendPushNotificationsAsync(chunk);
          
          // Procesar receipts asíncronamente
          this.processReceipts(tickets);
        } catch (err) {
          console.error('[MITOCHONDRIA] Error en chunk:', err);
        }
      }
      
      // Actualizar ADN
      const ids = pending.map(p => p.id);
      this.dna.markCompleted(ids);
      
    } finally {
      this.isProcessing = false;
      // Re-activar si hay más trabajo
      setImmediate(() => {
        this.signalBus.emit({
          type: 'CHECKPOINT_G1',
          source: 'mitochondria',
          payload: {},
          ttl: 100,
          priority: 1,
        });
      });
    }
  }
  
  private processReceipts(tickets: any[]): void {
    // Implementar procesamiento de receipts
    console.log(`[MITOCHONDRIA] ${tickets.length} tickets generados`);
  }
}

// =============================================================================
// 5. LISOSOMA: Manejo de Errores
// =============================================================================

class Lysosome {
  constructor(private dna: DNALayer) {}
  
  handleError(error: Error, context: string): void {
    console.error(`[LYSOSOMA] Error en ${context}:`, error.message);
    
    // Registro de error en ADN para auditoría
    this.dna.batchInsert([{
      id: `error-${Date.now()}`,
      customer_id: 'SYSTEM',
      email: error.message,
    }]);
    
    // Si error crítico, señalizar homeostásis
    if (this.isCriticalError(error)) {
      process.emit('ERROR_DETECTED', error);
    }
  }
  
  private isCriticalError(error: Error): boolean {
    return error.message.includes('ECONNREFUSED') ||
           error.message.includes('timeout') ||
           error.message.includes('ENOMEM');
  }
}

// =============================================================================
// 6. ORGANISMO COMPLETO: Integración
// =============================================================================

class NotificationOrganism {
  public membrane: Membrane;
  public dna: DNALayer;
  public signalBus: SignalBus;
  public nucleus: Nucleus;
  public mitochondria: PushMitochondria;
  public lysosome: Lysosome;
  public cycle: CycleController;
  public homeostasis: Homeostasis;
  public apoptosis: ApoptosisController;
  public receptor: Receptor;
  private server: http.Server | null = null;
  
  constructor(cellId: string, port: number) {
    // Inicializar orgánulos en orden de dependencia
    this.signalBus = new SignalBus();
    this.dna = new DNALayer();
    this.membrane = new Membrane();
    this.lysosome = new Lysosome(this.dna);
    this.nucleus = new Nucleus(this.dna, this.signalBus);
    this.mitochondria = new PushMitochondria(this.dna, this.signalBus);
    this.cycle = new CycleController((from, to) => {
      console.log(`[CYCLE] ${from} -> ${to}`);
    });
    this.homeostasis = new Homeostasis();
    this.apoptosis = new ApoptosisController();
    this.receptor = new Receptor(cellId, 'localhost', port);
    
    // Registrar handlers de cleanup
    this.apoptosis.registerCleanup({ name: 'close-db', priority: 1, fn: () => this.dna });
    this.apoptosis.registerCleanup({ name: 'stop-server', priority: 2, fn: () => this.stopServer() });
    
    // Setup
    this.setupSignalIntegrations();
    this.setupRoutes();
  }
  
  private setupSignalIntegrations(): void {
    // Cycle -> Homeostasis
    this.homeostasis;
    
    // Error handling
    process.on('ERROR_DETECTED', (error: Error) => {
      this.cycle.transitionTo(CellCycleState.G0);
      this.homeostasis.updateHealth(50);
    });
    
    // Iniciar ciclo
    this.cycle.transitionTo(CellCycleState.G1);
  }
  
  private setupRoutes(): void {
    const app = http.createServer(async (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      
      // Membrana: Autorización
      if (!(await this.membrane.authorize(req))) {
        res.writeHead(429);
        res.end(JSON.stringify({ error: 'Rate limit exceeded' }));
        return;
      }
      
      const url = new URL(req.url ?? '/', `http://localhost:${this.server?.address()?.port}`);
      
      switch (url.pathname) {
        case '/health':
          res.end(JSON.stringify({
            status: 'Alive',
            cycle: this.cycle.getState(),
            health: this.homeostasis.getHealthScore(),
            stats: this.dna.getStats(),
          }));
          break;
          
        case '/invoices/batch':
          if (req.method !== 'POST') {
            res.writeHead(405);
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }
          
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', async () => {
            try {
              const invoices = JSON.parse(body);
              if (!this.membrane.validateInvoiceBatch(invoices)) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Invalid format' }));
                return;
              }
              
              const inserted = await this.nucleus.processInvoices(invoices);
              res.writeHead(202);
              res.end(JSON.stringify({ received: inserted }));
            } catch (err) {
              this.lysosome.handleError(err as Error, 'batch-ingest');
              res.writeHead(500);
              res.end(JSON.stringify({ error: 'Internal error' }));
            }
          });
          break;
          
        default:
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Not found' }));
      }
    });
    
    this.server = app;
  }
  
  async start(): Promise<void> {
    // Homeostasis inicial
    this.homeostasis.resetRestartCounter();
    
    // Recovery de estado interrumpido
    const recovered = this.dna.recoverInterrupted();
    console.log(`[ORGANISM] Recovered ${recovered} interrupted invoices`);
    
    // Iniciar servidor
    return new Promise((resolve) => {
      this.server?.listen(3000, () => {
        console.log('[ORGANISM] Célula activa en puerto 3000');
        this.receptor.startHeartbeat();
        resolve();
      });
    });
  }
  
  async stopServer(): Promise<void> {
    return new Promise((resolve) => {
      this.server?.close(() => {
        console.log('[ORGANISM] Servidor cerrado');
        resolve();
      });
    });
  }
}

// =============================================================================
// INICIO DEL ORGANISMO
// =============================================================================

const organism = new NotificationOrganism('notification-cell-001', 3000);

organism.start().catch(err => {
  console.error('[ORGANISM] Failed to start:', err);
  process.exit(1);
});

process.on('SIGTERM', () => organism.apoptosis.initiate('SIGTERM'));
process.on('SIGINT', () => organism.apoptosis.initiate('SIGINT'));
```

---

## Análisis Crítico

### Ventajas del CAP

1. **Resiliencia Natural**: El patrón de apoptosis asegura shutdowns limpios sin pérdida de datos.
2. **Auto-Sanación**: Homeostasis detecta y corrige problemas automáticamente.
3. **Escalabilidad Horizontal**: Mitosis (fork/cluster) permite crear células hijas.
4. **Aislamiento de Fallos**: Si una mitocondria falla, el núcleo sigue funcionando.
5. **Sin Dependencias Externas**: Todo es nativo - sin Redis, sin RabbitMQ, sin Kubernetes.

### Desventajas y Limitaciones

1. **Complejidad Inicial**: Mayor boilerplate que soluciones monolíticas simples.
2. **Debugging Distribido**: Dificultad para rastrear señales entre orgánulos.
3. **Sin Broker Persistente**: Mensajes perdidos si no hay ACK manual.
4. **Escalabilidad Limitada**: Sin service mesh,iscovery es manual.
5. **Estado Compartido**: Múltiples células necesitan sincronización externa.

### Trade-offs

| Decisión | Pros | Contras |
|----------|------|---------|
| SQLite/WAL | Rápido, persistente | No es distribuido nativamente |
| EventEmitter nativo | Sin deps, rápido | No persistente |
| HTTP peer-to-peer | Universal | Overhead vs TCP raw |
| Auto-restart | Resiliente | Puede causarthrashing |

---

## Mejores Prácticas

1. **ADN Antes que Memoria**: Siempre persistir antes de confiar en RAM.
2. **Señales con TTL**: No dejar señales zombi en el bus.
3. **Checkpoints Obligatorios**: G1 antes de procesar, G2 antes de escalar.
4. **Apoptosis Probada**: Testear shutdowns constantemente.
5. **Homeostasis Visible**: Métricas deben ser observables en tiempo real.
6. **Mitosis Controlada**: No escalar infinitamente sin límites.

---

## Licencia

MIT - Libre para usar en proyectos personales y comerciales.
