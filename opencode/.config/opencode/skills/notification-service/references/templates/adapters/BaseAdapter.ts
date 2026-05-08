/**
 * Base Adapter Interface
 * 
 * Interface que deben implementar los adapters de base de datos.
 * Agnóstico a la base de datos usada.
 */

import {
  Notification,
  NotificationStatus,
  PushToken,
  Client,
  PaginationParams,
  PaginatedResult,
  NotificationStats,
} from '../NotificationTypes';

// ============================================
// Notification DTOs
// ============================================

export interface CreateNotificationDTO {
  externalId?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  client: {
    email: string;
    id?: string;
  };
  status?: NotificationStatus;
  providerTicketId?: string;
  sentAt?: Date;
}

export interface UpdateNotificationDTO {
  status?: NotificationStatus;
  providerTicketId?: string;
  deliveredAt?: Date;
}

export interface NotificationFilter {
  clientEmail?: string;
  clientId?: string;
  status?: NotificationStatus;
  startDate?: Date;
  endDate?: Date;
}

// ============================================
// Token DTOs
// ============================================

export interface UpsertTokenDTO {
  token: string;
  clientEmail: string;
  clientId?: string;
  provider?: 'expo' | 'firebase' | 'custom';
  metadata?: Record<string, any>;
}

// ============================================
// Client DTOs
// ============================================

export interface CreateClientDTO {
  email: string;
  externalId?: string;
  metadata?: Record<string, any>;
}

export interface UpdateClientDTO {
  email?: string;
  externalId?: string;
  metadata?: Record<string, any>;
}

// ============================================
// Base Adapter Interface
// ============================================

export interface BaseAdapter {
  // ==================== NOTIFICATIONS ====================

  /**
   * Crea una notificación
   */
  createNotification(data: CreateNotificationDTO): Promise<Notification>;

  /**
   * Crea múltiples notificaciones en bulk
   */
  createNotificationsBulk(data: CreateNotificationDTO[]): Promise<Notification[]>;

  /**
   * Obtiene una notificación por ID
   */
  findNotificationById(id: string): Promise<Notification | null>;

  /**
   * Obtiene notificaciones por cliente
   */
  findNotificationsByClient(
    email: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Notification>>;

  /**
   * Obtiene notificaciones no leídas por cliente
   */
  findUnreadByClient(email: string): Promise<Notification[]>;

  /**
   * Actualiza el estado de una notificación
   */
  updateNotificationStatus(
    id: string,
    status: NotificationStatus
  ): Promise<Notification | null>;

  /**
   * Marca una notificación como leída
   */
  markAsRead(id: string): Promise<Notification | null>;

  /**
   * Cuenta notificaciones por estado
   */
  countNotifications(filter?: NotificationFilter): Promise<NotificationStats>;

  // ==================== TOKENS ====================

  /**
   * Busca un token por cliente
   */
  findTokenByClient(email: string): Promise<PushToken | null>;

  /**
   * Busca múltiples tokens por lista de emails
   */
  findTokensByClients(emails: string[]): Promise<PushToken[]>;

  /**
   * Busca o crea un token
   */
  upsertToken(data: UpsertTokenDTO): Promise<PushToken>;

  /**
   * Actualiza el uso de un token
   */
  updateTokenUsage(tokenId: string): Promise<void>;

  /**
   * Invalida un token
   */
  invalidateToken(tokenId: string): Promise<void>;

  /**
   * Valida si un token existe y es válido
   */
  validateToken(token: string): Promise<boolean>;

  // ==================== CLIENTS ====================

  /**
   * Busca un cliente por email
   */
  findClient(email: string): Promise<Client | null>;

  /**
   * Busca múltiples clientes por lista de emails
   */
  findClients(emails: string[]): Promise<Client[]>;

  /**
   * Crea un cliente
   */
  createClient(data: CreateClientDTO): Promise<Client>;

  /**
   * Actualiza un cliente
   */
  updateClient(id: string, data: UpdateClientDTO): Promise<Client | null>;

  /**
   * Obtiene todos los clientes (con paginación)
   */
  findAllClients(pagination?: PaginationParams): Promise<PaginatedResult<Client>>;

  /**
   * Cuenta clientes totales
   */
  countClients(): Promise<number>;
}

// ============================================
// Helper Types
// ============================================

export interface AdapterStats {
  notifications: {
    total: number;
    byStatus: Record<NotificationStatus, number>;
  };
  tokens: {
    total: number;
    valid: number;
    invalid: number;
  };
  clients: {
    total: number;
  };
}
