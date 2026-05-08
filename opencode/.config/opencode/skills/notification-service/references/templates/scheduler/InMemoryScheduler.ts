/**
 * In-Memory Scheduler Adapter
 * 
 * Scheduler en memoria para desarrollo y testing.
 * NO usar en producción.
 */

import {
  SchedulerAdapter,
  ScheduledJob,
} from './SchedulerAdapter';

// ============================================
// In-Memory Scheduler
// ============================================

export class InMemorySchedulerAdapter implements SchedulerAdapter {
  private jobs: Map<string, ScheduledJob>;
  private isRunning: boolean;

  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  schedule(job: {
    id: string;
    intervalMs: number;
    callback: (data?: any) => Promise<void>;
  }): void {
    // Remover job existente si hay
    this.remove(job.id);

    // Crear nuevo job
    const scheduled: ScheduledJob = {
      id: job.id,
      intervalMs: job.intervalMs,
      callback: job.callback,
    };

    if (this.isRunning) {
      // Iniciar inmediatamente si el scheduler está corriendo
      scheduled.interval = setInterval(() => {
        this.executeJob(scheduled);
      }, job.intervalMs);
    }

    this.jobs.set(job.id, scheduled);
  }

  remove(id: string): void {
    const job = this.jobs.get(id);
    if (job?.interval) {
      clearInterval(job.interval);
    }
    this.jobs.delete(id);
  }

  clear(): void {
    for (const job of this.jobs.values()) {
      if (job.interval) {
        clearInterval(job.interval);
      }
    }
    this.jobs.clear();
  }

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;

    // Iniciar todos los jobs
    for (const job of this.jobs.values()) {
      job.interval = setInterval(() => {
        this.executeJob(job);
      }, job.intervalMs);
    }
  }

  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;

    // Detener todos los jobs
    for (const job of this.jobs.values()) {
      if (job.interval) {
        clearInterval(job.interval);
        job.interval = undefined;
      }
    }
  }

  isRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Ejecuta un job
   */
  private async executeJob(job: ScheduledJob): Promise<void> {
    try {
      await job.callback();
    } catch (error) {
      console.error(`Scheduler job [${job.id}] error:`, error);
    }
  }

  /**
   * Obtiene el estado de todos los jobs
   */
  getStatus(): Array<{ id: string; intervalMs: number; running: boolean }> {
    return Array.from(this.jobs.values()).map(job => ({
      id: job.id,
      intervalMs: job.intervalMs,
      running: !!job.interval,
    }));
  }
}
