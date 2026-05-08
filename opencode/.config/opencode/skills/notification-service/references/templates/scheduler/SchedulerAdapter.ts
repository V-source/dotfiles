/**
 * Scheduler Adapter Interface
 * 
 * Interface para schedulers de receipt processing.
 * Permite usar diferentes implementaciones según el caso de uso.
 */

export interface SchedulerAdapter {
  /**
   * Programa un job recurrente
   */
  schedule(job: {
    id: string;
    intervalMs: number;
    callback: (data?: any) => Promise<void>;
  }): void;

  /**
   * Elimina un job programado
   */
  remove(id: string): void;

  /**
   * Limpia todos los jobs
   */
  clear(): void;

  /**
   * Inicia el scheduler
   */
  start(): void;

  /**
   * Detiene el scheduler
   */
  stop(): void;

  /**
   * Verifica si está ejecutándose
   */
  isRunning(): boolean;
}

/**
 * Job programado
 */
export interface ScheduledJob {
  id: string;
  intervalMs: number;
  callback: (data?: any) => Promise<void>;
  interval?: NodeJS.Timeout;
}
