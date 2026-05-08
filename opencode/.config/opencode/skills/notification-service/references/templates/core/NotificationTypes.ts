/**
 * Notification Types
 * 
 * Tipos e interfaces agnósticos para el servicio de notificaciones.
 */

// ============================================
// Core Types
// ============================================

export interface RawMessage {
  to: string;
  title?: string;
  body?: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
  priority?: 'default' | 'normal' | 'high';
  ttl?: number;
  expiration?: number;
  subtitle?: string;
  categoryId?: string;
  mutableContent?: boolean;
  [key: string]: any;
}

export interface Notification {
  id: string;
  externalId?: string;
  title: string;
  body: string;
  data: Record<string, any>;
  client: {
    email: string;
    id?: string;
  };
  status: NotificationStatus;
  providerTicketId?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationStatus = 
  | 'pending'
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'error';

// ============================================
// Push Token Types
// ============================================

export interface PushToken {
  id: string;
  token: string;
  provider: 'expo' | 'firebase' | 'custom';
  clientEmail: string;
  clientId?: string;
  isValid: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
}

// ============================================
// Client Types
// ============================================

export interface Client {
  id: string;
  email: string;
  externalId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// DTOs - Input Types
// ============================================

export interface SingleNotificationDTO {
  title: string;
  body: string;
  data?: Record<string, any>;
  client: {
    email: string;
    id?: string;
  };
  options?: NotificationOptionsDTO;
}

export interface BatchNotificationDTO {
  notifications: Array<{
    title: string;
    body: string;
    data?: Record<string, any>;
    client: {
      email: string;
      id?: string;
    };
  }>;
  options?: NotificationOptionsDTO;
}

export interface MassiveNotificationDTO {
  title: string;
  body: string;
  data?: Record<string, any>;
  options?: NotificationOptionsDTO;
}

export interface InvoiceNotificationDTO {
  invoices: Array<{
    invoiceId: string;
    clientEmail: string;
    clientId?: string;
    monto?: number;
    vencimiento?: string;
    [key: string]: any;
  }>;
  options?: NotificationOptionsDTO;
}

export interface CSVNotificationDTO {
  data: Array<Record<string, any>>;
  options?: NotificationOptionsDTO;
}

export interface NotificationOptionsDTO {
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
  priority?: 'default' | 'normal' | 'high';
  ttl?: number;
}

// ============================================
// Result Types
// ============================================

export interface NotificationResult {
  success: boolean;
  sent: number;
  failed: number;
  tickets: TicketResult[];
  errors?: NotificationError[];
}

export interface TicketResult {
  notificationId: string;
  providerTicketId?: string;
  status: 'sent' | 'failed';
  error?: string;
}

export interface NotificationError {
  index: number;
  clientEmail?: string;
  error: string;
}

export interface ReceiptResult {
  ticketId: string;
  status: 'delivered' | 'failed' | 'error';
  message?: string;
  details?: Record<string, any>;
}

export interface ReceiptStats {
  processed: number;
  delivered: number;
  failed: number;
  errors: number;
}

// ============================================
// Polimorphic Mapper Types
// ============================================

export interface NotificationMapper {
  /**
   * Campo que identifica al cliente por email
   */
  emailField?: string;
  
  /**
   * Campo que identifica al cliente por ID
   */
  idField?: string;
  
  /**
   * Transformación de entrada → formato estándar
   */
  transform: (input: any) => {
    title: string;
    body: string;
    data?: Record<string, any>;
    [key: string]: any;
  };
  
  /**
   * Filtro opcional para excluir elementos
   */
  filter?: (input: any) => boolean;
  
  /**
   * Campo para ID externo (invoice_id, etc.)
   */
  externalIdField?: string;
}

// ============================================
// Pagination Types
// ============================================

export interface PaginationParams {
  page: number;
  perPage: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ============================================
// Statistics Types
// ============================================

export interface NotificationStats {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  pending: number;
  byStatus: Array<{
    status: NotificationStatus;
    count: number;
  }>;
  byDay: Array<{
    date: string;
    count: number;
  }>;
}

// ============================================
// Logger Interface
// ============================================

export interface Logger {
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  debug?(message: string, meta?: any): void;
}

// ============================================
// Validation Types
// ============================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface NotificationValidationSchema {
  required?: string[];
  maxBatchSize?: number;
  maxDataSize?: number;
  allowedFields?: string[];
}
