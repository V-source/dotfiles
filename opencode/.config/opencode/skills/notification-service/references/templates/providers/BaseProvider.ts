/**
 * Base Provider Interface
 * 
 * Interface base que deben implementar todos los providers de notificaciones.
 * Actualmente implementado: Expo. Extensible a Firebase, APNs, etc.
 */

import {
  RawMessage,
  TicketResult,
  ReceiptResult,
  ValidationResult,
} from '../NotificationTypes';

/**
 * Interface que deben implementar los providers de push notifications
 */
export interface PushProvider {
  /**
   * Nombre del provider
   */
  readonly name: string;

  /**
   * Envía mensajes a los dispositivos
   */
  send(messages: RawMessage[]): Promise<TicketResult[]>;

  /**
   * Divide mensajes en chunks para respetar límites del provider
   */
  chunk(messages: RawMessage[]): RawMessage[][];

  /**
   * Valida si un token es válido para este provider
   */
  validateToken(token: string): boolean;

  /**
   * Obtiene el estado de entrega de tickets
   */
  getReceipts(ticketIds: string[]): Promise<ReceiptResult[]>;
}

/**
 * Configuración base para providers
 */
export interface ProviderConfig {
  /**
   * Access token para autenticación con el provider
   */
  accessToken?: string;

  /**
   * Usar sandbox/development en lugar de producción
   */
  useSandbox?: boolean;

  /**
   * Timeout para requests
   */
  timeout?: number;

  /**
   * Número máximo de reintentos
   */
  maxRetries?: number;
}

/**
 * Opciones de chunking
 */
export interface ChunkOptions {
  /**
   * Máximo de mensajes por chunk
   */
  maxMessages?: number;

  /**
   * Tamaño máximo en bytes por chunk
   */
  maxSizeBytes?: number;
}

/**
 * Resultado del envío de un chunk
 */
export interface ChunkResult {
  messages: RawMessage[];
  tickets: TicketResult[];
  errors: Array<{
    index: number;
    error: string;
  }>;
}

/**
 * Helper para crear providers con configuración estándar
 */
export function createProviderConfig(options: ProviderConfig = {}): ProviderConfig {
  return {
    useSandbox: false,
    timeout: 30000,
    maxRetries: 3,
    ...options,
  };
}
