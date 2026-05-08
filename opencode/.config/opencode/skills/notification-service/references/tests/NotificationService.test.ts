/**
 * Unit Tests for NotificationService
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { NotificationService, NotificationServiceConfig } from '../templates/core/NotificationService';
import { NotificationMapper, Logger, NotificationStatus } from '../templates/core/NotificationTypes';
import { PushProvider, TicketResult } from '../templates/providers/BaseProvider';
import { BaseAdapter, Client, PushToken, Notification } from '../templates/adapters/BaseAdapter';

// Test Logger implementation
class TestLogger implements Logger {
  info = jest.fn();
  warn = jest.fn();
  error = jest.fn();
  debug = jest.fn();
}

// Mock PushProvider
class MockProvider implements PushProvider {
  private tokens: Map<string, boolean> = new Map();

  async send(messages: Array<{ to: string; title?: string; body?: string; data?: Record<string, any> }>): Promise<TicketResult[]> {
    return messages.map((msg, index) => {
      const isValid = this.tokens.get(msg.to) !== false;
      return {
        notificationId: `notif_${Date.now()}_${index}`,
        providerTicketId: `ticket_${index}`,
        status: isValid ? 'sent' : 'failed',
        error: isValid ? undefined : 'Invalid token',
      };
    });
  }

  async validateToken(token: string): Promise<boolean> {
    return this.tokens.get(token) !== false;
  }

  async processReceipts(ticketIds: string[]): Promise<any[]> {
    return ticketIds.map(ticketId => ({
      ticketId,
      status: 'delivered',
    }));
  }

  registerValidToken(token: string): void {
    this.tokens.set(token, true);
  }

  registerInvalidToken(token: string): void {
    this.tokens.set(token, false);
  }
}

// Mock BaseAdapter
class MockAdapter implements BaseAdapter {
  private clients: Map<string, Client> = new Map();
  private tokens: Map<string, PushToken> = new Map();
  private notifications: Map<string, Notification> = new Map();

  async findClient(email: string): Promise<Client | null> {
    return this.clients.get(email) || null;
  }

  async findClients(emails: string[]): Promise<Client[]> {
    return emails
      .map(email => this.clients.get(email))
      .filter((c): c is Client => c !== undefined);
  }

  async findAllClients(params: { page: number; perPage: number }): Promise<{ data: Client[]; total: number }> {
    const all = Array.from(this.clients.values());
    return {
      data: all,
      total: all.length,
    };
  }

  async findTokenByClient(clientEmail: string): Promise<PushToken | null> {
    return Array.from(this.tokens.values()).find(t => t.clientEmail === clientEmail && t.isValid) || null;
  }

  async findTokensByClients(clientEmails: string[]): Promise<PushToken[]> {
    return Array.from(this.tokens.values()).filter(
      t => clientEmails.includes(t.clientEmail) && t.isValid
    );
  }

  async createNotification(data: {
    title: string;
    body: string;
    data: Record<string, any>;
    client: { email: string; id?: string };
    status: NotificationStatus;
  }): Promise<Notification> {
    const now = new Date();
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: data.title,
      body: data.body,
      data: data.data,
      client: data.client,
      status: data.status,
      createdAt: now,
      updatedAt: now,
    };
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async createNotificationsBulk(data: Array<{
    title: string;
    body: string;
    data: Record<string, any>;
    client: { email: string; id?: string };
    status: NotificationStatus;
  }>): Promise<Notification[]> {
    return Promise.all(data.map(d => this.createNotification(d)));
  }

  async updateNotificationStatus(id: string, status: NotificationStatus): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.status = status;
      notification.updatedAt = new Date();
    }
  }

  async updateTokenUsage(tokenId: string): Promise<void> {
    const token = this.tokens.get(tokenId);
    if (token) {
      token.lastUsedAt = new Date();
    }
  }

  async findNotificationsByClient(
    email: string,
    pagination?: { page: number; perPage: number }
  ): Promise<{ data: Notification[]; pagination: any }> {
    const all = Array.from(this.notifications.values()).filter(n => n.client.email === email);
    return {
      data: all,
      pagination: {
        page: pagination?.page || 1,
        perPage: pagination?.perPage || 20,
        total: all.length,
        totalPages: Math.ceil(all.length / (pagination?.perPage || 20)),
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }

  async countNotifications(): Promise<{
    total: number;
    sent: number;
    delivered: number;
    failed: number;
    pending: number;
    byStatus: Array<{ status: NotificationStatus; count: number }>;
    byDay: Array<{ date: string; count: number }>;
  }> {
    const all = Array.from(this.notifications.values());
    return {
      total: all.length,
      sent: all.filter(n => n.status === 'sent').length,
      delivered: all.filter(n => n.status === 'delivered').length,
      failed: all.filter(n => n.status === 'failed').length,
      pending: all.filter(n => n.status === 'pending' || n.status === 'queued').length,
      byStatus: [
        { status: 'sent', count: all.filter(n => n.status === 'sent').length },
        { status: 'delivered', count: all.filter(n => n.status === 'delivered').length },
        { status: 'failed', count: all.filter(n => n.status === 'failed').length },
      ],
      byDay: [],
    };
  }

  // Test helpers
  addClient(client: Client): void {
    this.clients.set(client.email, client);
  }

  addToken(token: PushToken): void {
    this.tokens.set(token.id, token);
  }

  getNotifications(): Notification[] {
    return Array.from(this.notifications.values());
  }
}

// Default mapper
const defaultMapper: NotificationMapper = {
  emailField: 'email',
  idField: 'id',
  transform: (input: any) => ({
    title: input.title || input.asunto || 'Notification',
    body: input.body || input.mensaje || '',
    data: input.data || {},
    client: {
      email: input.email || input.clientEmail || input[this.emailField!],
      id: input.id || input.clientId || input[this.idField!],
    },
  }),
};

describe('NotificationService', () => {
  let service: NotificationService;
  let mockProvider: MockProvider;
  let mockAdapter: MockAdapter;
  let mockLogger: TestLogger;

  beforeEach(() => {
    mockProvider = new MockProvider();
    mockAdapter = new MockAdapter();
    mockLogger = new TestLogger();

    const config: NotificationServiceConfig = {
      provider: mockProvider,
      adapter: mockAdapter,
      mapper: defaultMapper,
      logger: mockLogger,
      maxBatchSize: 10000,
      autoProcessReceipts: false,
    };

    service = new NotificationService(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
    service.destroy();
  });

  describe('Constructor', () => {
    it('should initialize with default config', () => {
      expect(service['maxBatchSize']).toBe(10000);
      expect(service['config'].autoProcessReceipts).toBe(false);
    });

    it('should start receipt processor if autoProcessReceipts is true', () => {
      const config: NotificationServiceConfig = {
        provider: mockProvider,
        adapter: mockAdapter,
        mapper: defaultMapper,
        logger: mockLogger,
        autoProcessReceipts: true,
      };

      const serviceWithProcessor = new NotificationService(config);
      expect(mockLogger.info).toHaveBeenCalledWith('Receipt processor started');
      serviceWithProcessor.destroy();
    });
  });

  describe('sendSingle()', () => {
    it('should send a single notification successfully', async () => {
      const client = { id: 'client_1', email: 'test@example.com', createdAt: new Date(), updatedAt: new Date() };
      const token: PushToken = {
        id: 'token_1',
        token: 'ExponentPushToken[valid_token]',
        provider: 'expo',
        clientEmail: 'test@example.com',
        clientId: 'client_1',
        isValid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAdapter.addClient(client);
      mockAdapter.addToken(token);
      mockProvider.registerValidToken(token.token);

      const result = await service.sendSingle({
        title: 'Test Notification',
        body: 'This is a test',
        email: 'test@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.sent).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.tickets).toHaveLength(1);
    });

    it('should fail when client is not found', async () => {
      const result = await service.sendSingle({
        title: 'Test',
        body: 'Test body',
        email: 'nonexistent@example.com',
      });

      expect(result.success).toBe(false);
      expect(result.failed).toBe(1);
      expect(result.errors![0].error).toBe('Cliente no encontrado');
    });

    it('should fail when token is invalid', async () => {
      const client = { id: 'client_1', email: 'test@example.com', createdAt: new Date(), updatedAt: new Date() };
      const token: PushToken = {
        id: 'token_1',
        token: 'ExponentPushToken[invalid_token]',
        provider: 'expo',
        clientEmail: 'test@example.com',
        clientId: 'client_1',
        isValid: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAdapter.addClient(client);
      mockAdapter.addToken(token);
      mockProvider.registerInvalidToken(token.token);

      const result = await service.sendSingle({
        title: 'Test',
        body: 'Test body',
        email: 'test@example.com',
      });

      expect(result.success).toBe(false);
      expect(result.failed).toBe(1);
      expect(result.errors![0].error).toBe('Token de notificación no encontrado o inválido');
    });

    it('should fail when email is missing', async () => {
      const result = await service.sendSingle({
        title: 'Test',
        body: 'Test body',
      });

      expect(result.success).toBe(false);
      expect(result.errors![0].error).toBe('Email del cliente es requerido');
    });

    it('should log successful send', async () => {
      const client = { id: 'client_1', email: 'test@example.com', createdAt: new Date(), updatedAt: new Date() };
      const token: PushToken = {
        id: 'token_1',
        token: 'ExponentPushToken[valid]',
        provider: 'expo',
        clientEmail: 'test@example.com',
        isValid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAdapter.addClient(client);
      mockAdapter.addToken(token);
      mockProvider.registerValidToken(token.token);

      await service.sendSingle({
        title: 'Test',
        body: 'Test body',
        email: 'test@example.com',
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Single notification sent',
        expect.objectContaining({
          notificationId: expect.any(String),
          clientEmail: 'test@example.com',
          status: 'sent',
        })
      );
    });
  });

  describe('sendBatch()', () => {
    beforeEach(() => {
      const clients = [
        { id: 'client_1', email: 'user1@example.com', createdAt: new Date(), updatedAt: new Date() },
        { id: 'client_2', email: 'user2@example.com', createdAt: new Date(), updatedAt: new Date() },
        { id: 'client_3', email: 'user3@example.com', createdAt: new Date(), updatedAt: new Date() },
      ];

      const tokens = [
        { id: 'token_1', token: 'ExponentPushToken[token1]', provider: 'expo' as const, clientEmail: 'user1@example.com', isValid: true, createdAt: new Date(), updatedAt: new Date() },
        { id: 'token_2', token: 'ExponentPushToken[token2]', provider: 'expo' as const, clientEmail: 'user2@example.com', isValid: true, createdAt: new Date(), updatedAt: new Date() },
        { id: 'token_3', token: 'ExponentPushToken[token3]', provider: 'expo' as const, clientEmail: 'user3@example.com', isValid: true, createdAt: new Date(), updatedAt: new Date() },
      ];

      clients.forEach(c => mockAdapter.addClient(c));
      tokens.forEach(t => {
        mockAdapter.addToken(t);
        mockProvider.registerValidToken(t.token);
      });
    });

    it('should send batch notifications successfully (O(n) optimization)', async () => {
      const inputs = [
        { title: 'Notification 1', body: 'Body 1', email: 'user1@example.com' },
        { title: 'Notification 2', body: 'Body 2', email: 'user2@example.com' },
        { title: 'Notification 3', body: 'Body 3', email: 'user3@example.com' },
      ];

      const result = await service.sendBatch(inputs);

      expect(result.success).toBe(true);
      expect(result.sent).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.tickets).toHaveLength(3);
    });

    it('should return early for empty batch', async () => {
      const result = await service.sendBatch([]);

      expect(result.success).toBe(true);
      expect(result.sent).toBe(0);
      expect(result.failed).toBe(0);
    });

    it('should fail when batch exceeds max size', async () => {
      const largeInputs = Array(10001).fill({
        title: 'Test',
        body: 'Test body',
        email: 'test@example.com',
      });

      const result = await service.sendBatch(largeInputs);

      expect(result.success).toBe(false);
      expect(result.errors![0].error).toContain('Batch excede el límite');
    });

    it('should skip invalid entries when skipInvalid is true', async () => {
      const inputs = [
        { title: 'Valid 1', body: 'Body', email: 'user1@example.com' },
        { title: 'Invalid', body: 'Body', email: 'nonexistent@example.com' },
        { title: 'Valid 2', body: 'Body', email: 'user2@example.com' },
      ];

      const result = await service.sendBatch(inputs, { skipInvalid: true });

      expect(result.sent).toBe(2);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Client or token not found',
        expect.objectContaining({ email: 'nonexistent@example.com' })
      );
    });

    it('should handle partial failures', async () => {
      const inputs = [
        { title: 'Valid 1', body: 'Body', email: 'user1@example.com' },
        { title: 'Valid 2', body: 'Body', email: 'user2@example.com' },
        { title: 'Valid 3', body: 'Body', email: 'user3@example.com' },
      ];

      mockProvider.registerInvalidToken('ExponentPushToken[token2]');

      const result = await service.sendBatch(inputs);

      expect(result.sent).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.success).toBe(false);
    });
  });

  describe('sendMassive()', () => {
    it('should send to all clients with valid tokens', async () => {
      const clients = Array.from({ length: 5 }, (_, i) => ({
        id: `client_${i}`,
        email: `user${i}@example.com`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const tokens = Array.from({ length: 5 }, (_, i) => ({
        id: `token_${i}`,
        token: `ExponentPushToken[token${i}]`,
        provider: 'expo' as const,
        clientEmail: `user${i}@example.com`,
        isValid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      clients.forEach(c => mockAdapter.addClient(c));
      tokens.forEach(t => {
        mockAdapter.addToken(t);
        mockProvider.registerValidToken(t.token);
      });

      const result = await service.sendMassive({
        title: 'Massive Notification',
        body: 'Sent to all users',
      });

      expect(result.success).toBe(true);
      expect(result.sent).toBe(5);
      expect(result.failed).toBe(0);
    });

    it('should return error when no valid tokens exist', async () => {
      const clients = Array.from({ length: 3 }, (_, i) => ({
        id: `client_${i}`,
        email: `user${i}@example.com`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      clients.forEach(c => mockAdapter.addClient(c));

      const result = await service.sendMassive({
        title: 'Test',
        body: 'Test body',
      });

      expect(result.success).toBe(false);
      expect(result.errors![0].error).toBe('No hay tokens válidos para enviar');
    });
  });

  describe('sendInvoice()', () => {
    it('should process and send invoice notifications', async () => {
      const client = {
        id: 'client_1',
        email: 'customer@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const token: PushToken = {
        id: 'token_1',
        token: 'ExponentPushToken[invoice_token]',
        provider: 'expo',
        clientEmail: 'customer@example.com',
        isValid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAdapter.addClient(client);
      mockAdapter.addToken(token);
      mockProvider.registerValidToken(token.token);

      const invoices = [
        {
          invoice_id: 'INV-001',
          cliente_email: 'customer@example.com',
          cliente_id: 'client_1',
          monto: 150.50,
          vencimiento: '2024-03-15',
        },
      ];

      const result = await service.sendInvoice(invoices);

      expect(result.success).toBe(true);
      expect(result.sent).toBe(1);
    });

    it('should handle invoices with different field names', async () => {
      const client = {
        id: 'client_1',
        email: 'customer@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const token: PushToken = {
        id: 'token_1',
        token: 'ExponentPushToken[invoice_token]',
        provider: 'expo',
        clientEmail: 'customer@example.com',
        isValid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAdapter.addClient(client);
      mockAdapter.addToken(token);
      mockProvider.registerValidToken(token.token);

      const invoices = [
        {
          invoiceId: 'INV-002',
          clientEmail: 'customer@example.com',
          clientId: 'client_1',
          monto: 200.00,
        },
      ];

      const result = await service.sendInvoice(invoices);

      expect(result.success).toBe(true);
      expect(result.sent).toBe(1);
    });

    it('should return early for empty invoices array', async () => {
      const result = await service.sendInvoice([]);

      expect(result.success).toBe(true);
      expect(result.sent).toBe(0);
      expect(result.failed).toBe(0);
    });
  });

  describe('sendFromCSV()', () => {
    it('should process CSV data using mapper', async () => {
      const client = {
        id: 'client_csv',
        email: 'csvuser@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const token: PushToken = {
        id: 'token_csv',
        token: 'ExponentPushToken[csv_token]',
        provider: 'expo',
        clientEmail: 'csvuser@example.com',
        isValid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAdapter.addClient(client);
      mockAdapter.addToken(token);
      mockProvider.registerValidToken(token.token);

      const csvData = [
        {
          nombre: 'Juan',
          email: 'csvuser@example.com',
          titulo: 'Titulo CSV',
          mensaje: 'Mensaje CSV',
        },
      ];

      const customMapper: NotificationMapper = {
        emailField: 'email',
        idField: 'id',
        transform: (input: any) => ({
          title: input.titulo || 'Notification',
          body: input.mensaje || '',
          data: { nombre: input.nombre },
          client: {
            email: input.email,
          },
        }),
      };

      const csvService = new NotificationService({
        provider: mockProvider,
        adapter: mockAdapter,
        mapper: customMapper,
        logger: mockLogger,
      });

      const result = await csvService.sendFromCSV(csvData);

      expect(result.success).toBe(true);
      expect(result.sent).toBe(1);
    });
  });

  describe('getClientNotifications()', () => {
    it('should return notifications for a client', async () => {
      const client = {
        id: 'client_notifs',
        email: 'notifs@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAdapter.addClient(client);

      await mockAdapter.createNotification({
        title: 'Notif 1',
        body: 'Body 1',
        data: {},
        client: { email: 'notifs@example.com', id: 'client_notifs' },
        status: 'sent',
      });

      await mockAdapter.createNotification({
        title: 'Notif 2',
        body: 'Body 2',
        data: {},
        client: { email: 'notifs@example.com', id: 'client_notifs' },
        status: 'sent',
      });

      const result = await service.getClientNotifications('notifs@example.com');

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });
  });

  describe('getStats()', () => {
    it('should return notification statistics', async () => {
      const stats = await service.getStats();

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('sent');
      expect(stats).toHaveProperty('delivered');
      expect(stats).toHaveProperty('failed');
      expect(stats).toHaveProperty('pending');
      expect(stats).toHaveProperty('byStatus');
    });
  });

  describe('processReceipts()', () => {
    it('should return empty stats by default', async () => {
      const stats = await service.processReceipts();

      expect(stats.processed).toBe(0);
      expect(stats.delivered).toBe(0);
      expect(stats.failed).toBe(0);
      expect(stats.errors).toBe(0);
    });
  });

  describe('destroy()', () => {
    it('should stop receipt processor', () => {
      service.destroy();

      expect(mockLogger.info).toHaveBeenCalledWith('Receipt processor stopped');
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent batch sends', async () => {
      const clients = Array.from({ length: 10 }, (_, i) => ({
        id: `client_${i}`,
        email: `user${i}@example.com`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const tokens = Array.from({ length: 10 }, (_, i) => ({
        id: `token_${i}`,
        token: `ExponentPushToken[concurrent${i}]`,
        provider: 'expo' as const,
        clientEmail: `user${i}@example.com`,
        isValid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      clients.forEach(c => mockAdapter.addClient(c));
      tokens.forEach(t => {
        mockAdapter.addToken(t);
        mockProvider.registerValidToken(t.token);
      });

      const inputs = Array.from({ length: 10 }, (_, i) => ({
        title: `Concurrent ${i}`,
        body: 'Body',
        email: `user${i}@example.com`,
      }));

      const results = await Promise.all([
        service.sendBatch(inputs.slice(0, 5)),
        service.sendBatch(inputs.slice(5)),
      ]);

      expect(results[0].sent + results[1].sent).toBe(10);
    });

    it('should handle token with null client ID', async () => {
      const client = {
        id: 'client_null',
        email: 'null@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const token: PushToken = {
        id: 'token_null',
        token: 'ExponentPushToken[null_id]',
        provider: 'expo',
        clientEmail: 'null@example.com',
        clientId: undefined,
        isValid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAdapter.addClient(client);
      mockAdapter.addToken(token);
      mockProvider.registerValidToken(token.token);

      const result = await service.sendSingle({
        title: 'Test',
        body: 'Body',
        email: 'null@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.sent).toBe(1);
    });

    it('should handle notification with custom data', async () => {
      const client = {
        id: 'client_data',
        email: 'data@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const token: PushToken = {
        id: 'token_data',
        token: 'ExponentPushToken[data_token]',
        provider: 'expo',
        clientEmail: 'data@example.com',
        isValid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAdapter.addClient(client);
      mockAdapter.addToken(token);
      mockProvider.registerValidToken(token.token);

      const customData = {
        customField: 'value',
        nested: { deep: 'value' },
        numbers: [1, 2, 3],
      };

      const result = await service.sendSingle({
        title: 'Custom Data',
        body: 'Body',
        email: 'data@example.com',
        data: customData,
      });

      expect(result.success).toBe(true);
      const notifications = mockAdapter.getNotifications();
      expect(notifications[0].data).toEqual(customData);
    });
  });
});
