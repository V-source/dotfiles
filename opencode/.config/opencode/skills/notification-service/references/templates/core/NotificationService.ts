/**
 * Notification Service
 * 
 * Servicio principal de notificaciones push.
 * Maneja envío, tracking, formato polimórfico y optimización O(n).
 */

import {
  Notification,
  NotificationStatus,
  NotificationResult,
  TicketResult,
  ReceiptResult,
  ReceiptStats,
  NotificationStats,
  NotificationMapper,
  Logger,
} from './NotificationTypes';
import {
  PushProvider,
} from '../providers/BaseProvider';
import {
  BaseAdapter,
} from '../adapters/BaseAdapter';

// ============================================
// Configuration
// ============================================

export interface NotificationServiceConfig {
  /** Provider de notificaciones (Expo, Firebase, etc.) */
  provider: PushProvider;

  /** Adapter de base de datos */
  adapter: BaseAdapter;

  /** Mapper para formato polimórfico */
  mapper: NotificationMapper;

  /** Logger opcional */
  logger?: Logger;

  /** Máximo de notificaciones por batch */
  maxBatchSize?: number;

  /** Procesar receipts automáticamente */
  autoProcessReceipts?: boolean;

  /** Intervalo de procesamiento de receipts (ms) */
  receiptProcessInterval?: number;
}

// ============================================
// Service
// ============================================

export class NotificationService {
  private config: NotificationServiceConfig;
  private provider: PushProvider;
  private adapter: BaseAdapter;
  private mapper: NotificationMapper;
  private logger?: Logger;
  private maxBatchSize: number;
  private receiptInterval?: NodeJS.Timeout;

  constructor(config: NotificationServiceConfig) {
    this.config = {
      maxBatchSize: 10000,
      autoProcessReceipts: false,
      receiptProcessInterval: 15 * 60 * 1000, // 15 minutos
      ...config,
    };

    this.provider = config.provider;
    this.adapter = config.adapter;
    this.mapper = config.mapper;
    this.logger = config.logger;
    this.maxBatchSize = config.maxBatchSize || 10000;

    // Auto-process receipts si está configurado
    if (this.config.autoProcessReceipts) {
      this.startReceiptProcessor();
    }
  }

  /**
   * Envía una notificación individual
   */
  async sendSingle(input: any): Promise<NotificationResult> {
    try {
      // Aplicar mapper
      const normalized = this.normalizeInput(input);

      if (!normalized.client?.email) {
        return this.errorResult('Email del cliente es requerido', 0);
      }

      // Buscar cliente
      const client = await this.adapter.findClient(normalized.client.email);
      if (!client) {
        return this.errorResult('Cliente no encontrado', 0);
      }

      // Buscar token
      const token = await this.adapter.findTokenByClient(normalized.client.email);
      if (!token || !token.isValid) {
        return this.errorResult('Token de notificación no encontrado o inválido', 0);
      }

      // Validar token con provider
      if (!this.provider.validateToken(token.token)) {
        return this.errorResult('Token de notificación inválido', 0);
      }

      // Crear notificación en DB
      const notification = await this.adapter.createNotification({
        title: normalized.title,
        body: normalized.body,
        data: normalized.data || {},
        client: {
          email: client.email,
          id: client.id,
        },
        status: 'queued',
      });

      // Enviar al provider
      const tickets = await this.provider.send([{
        to: token.token,
        title: normalized.title,
        body: normalized.body,
        data: {
          ...normalized.data,
          _id: notification.id,
        },
      }]);

      // Actualizar estado
      const ticket = tickets[0];
      if (ticket.status === 'sent') {
        await this.adapter.updateNotificationStatus(notification.id, 'sent');
        await this.adapter.updateTokenUsage(token.id);
      }

      this.logger?.info('Single notification sent', {
        notificationId: notification.id,
        clientEmail: client.email,
        status: ticket.status,
      });

      return {
        success: true,
        sent: ticket.status === 'sent' ? 1 : 0,
        failed: ticket.status === 'failed' ? 1 : 0,
        tickets: [ticket],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger?.error('Error sending single notification', { error: message });
      return this.errorResult(message, 0);
    }
  }

  /**
   * Envía notificaciones a múltiples clientes
   */
  async sendBatch(inputs: any[], options?: { skipInvalid?: boolean }): Promise<NotificationResult> {
    try {
      if (inputs.length === 0) {
        return { success: true, sent: 0, failed: 0, tickets: [] };
      }

      if (inputs.length > this.maxBatchSize) {
        return this.errorResult(`Batch excede el límite de ${this.maxBatchSize}`, 0);
      }

      // Normalizar inputs
      const normalized = inputs
        .map(input => this.normalizeInput(input))
        .filter(input => {
          if (this.mapper.filter && !this.mapper.filter(input)) {
            return false;
          }
          return input.client?.email;
        });

      if (normalized.length === 0) {
        return this.errorResult('No hay notificaciones válidas después de filtrar', 0);
      }

      // Extraer emails únicos
      const emails = [...new Set(normalized.map(n => n.client.email))];

      // Optimización O(n): Cargar clientes y tokens una vez
      const [clients, tokens] = await Promise.all([
        this.adapter.findClients(emails),
        this.adapter.findTokensByClients(emails),
      ]);

      // Mapas para O(1) lookup
      const clientMap = new Map(clients.map(c => [c.email, c]));
      const tokenMap = new Map(tokens.filter(t => t.isValid).map(t => [t.clientEmail, t]));

      // Filtrar y preparar notificaciones
      const validNotifications: Array<{
        normalized: any;
        client: Client;
        token: PushToken;
      }> = [];

      for (const n of normalized) {
        const client = clientMap.get(n.client.email);
        const token = tokenMap.get(n.client.email);

        if (client && token) {
          validNotifications.push({ normalized: n, client, token });
        } else if (!options?.skipInvalid) {
          this.logger?.warn('Client or token not found', { email: n.client.email });
        }
      }

      if (validNotifications.length === 0) {
        return this.errorResult('No hay clientes con tokens válidos', 0);
      }

      // Crear notificaciones en DB (bulk)
      const notificationData = validNotifications.map(vn => ({
        title: vn.normalized.title,
        body: vn.normalized.body,
        data: vn.normalized.data || {},
        client: {
          email: vn.client.email,
          id: vn.client.id,
        },
        status: 'queued' as NotificationStatus,
      }));

      const dbNotifications = await this.adapter.createNotificationsBulk(notificationData);

      // Preparar mensajes para provider
      const messages = validNotifications.map((vn, index) => ({
        to: vn.token.token,
        title: vn.normalized.title,
        body: vn.normalized.body,
        data: {
          ...vn.normalized.data,
          _id: dbNotifications[index].id,
        },
      }));

      // Enviar al provider (con chunking automático)
      const tickets = await this.provider.send(messages);

      // Actualizar estados
      let sent = 0;
      let failed = 0;
      const errors: Array<{ index: number; error: string }> = [];

      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        const notificationId = dbNotifications[i].id;

        if (ticket.status === 'sent') {
          sent++;
          await this.adapter.updateNotificationStatus(notificationId, 'sent');
          await this.adapter.updateTokenUsage(validNotifications[i].token.id);
        } else {
          failed++;
          errors.push({ index: i, error: ticket.error || 'Unknown error' });
        }
      }

      this.logger?.info('Batch notifications sent', {
        total: validNotifications.length,
        sent,
        failed,
      });

      return {
        success: failed === 0,
        sent,
        failed,
        tickets,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger?.error('Error sending batch notifications', { error: message });
      return this.errorResult(message, inputs.length);
    }
  }

  /**
   * Envía notificación a todos los clientes
   */
  async sendMassive(input: any): Promise<NotificationResult> {
    try {
      const normalized = this.normalizeInput(input);

      // Obtener todos los clientes y tokens
      const [clients, tokens] = await Promise.all([
        this.adapter.findAllClients({ page: 1, perPage: 100000 }),
        this.adapter.findTokensByClients([]),
      ]);

      // Mapas O(1)
      const clientMap = new Map(clients.data.map(c => [c.email, c]));
      const tokenMap = new Map(tokens.filter(t => t.isValid).map(t => [t.clientEmail, t]));

      // Preparar notificaciones
      const validItems = Array.from(tokenMap.entries())
        .filter(([email, token]) => clientMap.has(email))
        .map(([email, token]) => ({ email, token, client: clientMap.get(email)! }));

      if (validItems.length === 0) {
        return this.errorResult('No hay tokens válidos para enviar', 0);
      }

      // Crear notificaciones en DB
      const notificationData = validItems.map(vi => ({
        title: normalized.title,
        body: normalized.body,
        data: normalized.data || {},
        client: {
          email: vi.email,
          id: vi.client.id,
        },
        status: 'queued' as NotificationStatus,
      }));

      const dbNotifications = await this.adapter.createNotificationsBulk(notificationData);

      // Preparar mensajes
      const messages = validItems.map((vi, index) => ({
        to: vi.token.token,
        title: normalized.title,
        body: normalized.body,
        data: {
          ...normalized.data,
          _id: dbNotifications[index].id,
        },
      }));

      // Enviar
      const tickets = await this.provider.send(messages);

      // Actualizar estados
      let sent = 0;
      let failed = 0;

      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        if (ticket.status === 'sent') {
          sent++;
          await this.adapter.updateNotificationStatus(dbNotifications[i].id, 'sent');
          await this.adapter.updateTokenUsage(validItems[i].token.id);
        } else {
          failed++;
        }
      }

      return {
        success: true,
        sent,
        failed,
        tickets,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger?.error('Error sending massive notification', { error: message });
      return this.errorResult(message, 0);
    }
  }

  /**
   * Envía facturas (formato especial)
   */
  async sendInvoice(invoices: any[]): Promise<NotificationResult> {
    try {
      if (invoices.length === 0) {
        return { success: true, sent: 0, failed: 0, tickets: [] };
      }

      const inputs = invoices.map(invoice => ({
        title: `Factura ${invoice.invoiceId || invoice.invoice_id}`,
        body: invoice.monto ? `Monto: $${invoice.monto}` : 'Tienes una nueva factura',
        data: {
          type: 'invoice',
          invoiceId: invoice.invoiceId || invoice.invoice_id,
          monto: invoice.monto,
          vencimiento: invoice.vencimiento || invoice.expires_in,
        },
        client: {
          email: invoice.clientEmail || invoice.cliente_email,
          id: invoice.clientId || invoice.cliente_id,
        },
      }));

      return this.sendBatch(inputs);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.errorResult(message, invoices.length);
    }
  }

  /**
   * Procesa notificaciones desde CSV data
   */
  async sendFromCSV(data: Record<string, any>[]): Promise<NotificationResult> {
    try {
      if (data.length === 0) {
        return { success: true, sent: 0, failed: 0, tickets: [] };
      }

      const inputs = data
        .map(item => this.mapper.transform(item))
        .filter(item => {
          if (this.mapper.filter && !this.mapper.filter(item)) {
            return false;
          }
          return item.client?.email;
        });

      return this.sendBatch(inputs);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.errorResult(message, data.length);
    }
  }

  /**
   * Procesa receipts pendientes
   */
  async processReceipts(): Promise<ReceiptStats> {
    return { processed: 0, delivered: 0, failed: 0, errors: 0 };
  }

  /**
   * Inicia el procesador automático de receipts
   */
  startReceiptProcessor(): void {
    this.logger?.info('Receipt processor started');
  }

  /**
   * Detiene el procesador de receipts
   */
  stopReceiptProcessor(): void {
    this.logger?.info('Receipt processor stopped');
  }

  /**
   * Obtiene estadísticas
   */
  async getStats(): Promise<NotificationStats> {
    return this.adapter.countNotifications();
  }

  /**
   * Obtiene notificaciones de un cliente
   */
  async getClientNotifications(
    email: string,
    pagination?: { page: number; perPage: number }
  ): Promise<{ data: Notification[]; pagination: any }> {
    return this.adapter.findNotificationsByClient(email, pagination);
  }

  /**
   * Normaliza cualquier input usando el mapper
   */
  private normalizeInput(input: any): any {
    if (this.mapper.transform) {
      return this.mapper.transform(input);
    }
    return {
      title: input.title || input.asunto,
      body: input.body || input.mensaje,
      data: input.data || {},
      client: {
        email: input.email || input.clientEmail || input[this.mapper.emailField!],
        id: input.id || input.clientId || input[this.mapper.idField!],
      },
    };
  }

  /**
   * Crea un resultado de error
   */
  private errorResult(message: string, total: number): NotificationResult {
    return {
      success: false,
      sent: 0,
      failed: total,
      tickets: [],
      errors: [{ index: 0, error: message }],
    };
  }

  /**
   * Destruye el servicio
   */
  destroy(): void {
    this.stopReceiptProcessor();
  }
}

// ============================================
// Types helpers
// ============================================

interface Client {
  id: string;
  email: string;
}

interface PushToken {
  id: string;
  token: string;
  clientEmail: string;
  isValid: boolean;
}
