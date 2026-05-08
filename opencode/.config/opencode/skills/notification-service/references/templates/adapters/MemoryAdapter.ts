/**
 * Memory Adapter
 * 
 * Adapter en memoria para testing.
 * NO usar en producción.
 */

import {
  BaseAdapter,
  CreateNotificationDTO,
  UpdateNotificationDTO,
  UpsertTokenDTO,
  CreateClientDTO,
  UpdateClientDTO,
  NotificationFilter,
} from './BaseAdapter';
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
// Storage Types
// ============================================

interface Storage {
  notifications: Map<string, Notification>;
  tokens: Map<string, PushToken>;
  clients: Map<string, Client>;
  externalIdMap: Map<string, string>; // externalId -> id
}

// ============================================
// Memory Adapter
// ============================================

export class MemoryAdapter implements BaseAdapter {
  private storage: Storage;

  constructor() {
    this.storage = {
      notifications: new Map(),
      tokens: new Map(),
      clients: new Map(),
      externalIdMap: new Map(),
    };
  }

  // ==================== NOTIFICATIONS ====================

  async createNotification(data: CreateNotificationDTO): Promise<Notification> {
    const id = this.generateId();
    const now = new Date();

    const notification: Notification = {
      id,
      externalId: data.externalId,
      title: data.title,
      body: data.body,
      data: data.data || {},
      client: data.client,
      status: data.status || 'pending',
      providerTicketId: data.providerTicketId,
      sentAt: data.sentAt,
      deliveredAt: data.deliveredAt,
      createdAt: now,
      updatedAt: now,
    };

    this.storage.notifications.set(id, notification);
    return notification;
  }

  async createNotificationsBulk(data: CreateNotificationDTO[]): Promise<Notification[]> {
    return Promise.all(data.map(d => this.createNotification(d)));
  }

  async findNotificationById(id: string): Promise<Notification | null> {
    return this.storage.notifications.get(id) || null;
  }

  async findNotificationsByClient(
    email: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Notification>> {
    const all = Array.from(this.storage.notifications.values())
      .filter(n => n.client.email === email)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const page = pagination?.page || 1;
    const perPage = pagination?.perPage || 20;
    const start = (page - 1) * perPage;
    const data = all.slice(start, start + perPage);

    return {
      data,
      pagination: {
        page,
        perPage,
        total: all.length,
        totalPages: Math.ceil(all.length / perPage),
        hasNextPage: page * perPage < all.length,
        hasPrevPage: page > 1,
      },
    };
  }

  async findUnreadByClient(email: string): Promise<Notification[]> {
    return Array.from(this.storage.notifications.values())
      .filter(n => n.client.email === email &&
        !['delivered', 'failed', 'error'].includes(n.status))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateNotificationStatus(
    id: string,
    status: NotificationStatus
  ): Promise<Notification | null> {
    const notification = this.storage.notifications.get(id);
    if (!notification) return null;

    const updated: Notification = {
      ...notification,
      status,
      updatedAt: new Date(),
    };

    if (status === 'sent') {
      updated.sentAt = new Date();
    } else if (status === 'delivered') {
      updated.deliveredAt = new Date();
    }

    this.storage.notifications.set(id, updated);
    return updated;
  }

  async markAsRead(id: string): Promise<Notification | null> {
    return this.updateNotificationStatus(id, 'delivered');
  }

  async countNotifications(filter?: NotificationFilter): Promise<NotificationStats> {
    let all = Array.from(this.storage.notifications.values());

    if (filter?.clientEmail) {
      all = all.filter(n => n.client.email === filter.clientEmail);
    }
    if (filter?.clientId) {
      all = all.filter(n => n.client.id === filter.clientId);
    }
    if (filter?.status) {
      all = all.filter(n => n.status === filter.status);
    }

    const byStatus: Record<string, number> = {};
    let total = 0;

    for (const n of all) {
      byStatus[n.status] = (byStatus[n.status] || 0) + 1;
      total++;
    }

    return {
      total,
      sent: byStatus['sent'] || 0,
      delivered: byStatus['delivered'] || 0,
      failed: byStatus['failed'] || 0,
      pending: byStatus['pending'] || 0,
      byStatus: Object.entries(byStatus).map(([status, count]) => ({
        status: status as NotificationStatus,
        count,
      })),
    };
  }

  // ==================== TOKENS ====================

  async findTokenByClient(email: string): Promise<PushToken | null> {
    return Array.from(this.storage.tokens.values())
      .find(t => t.clientEmail === email && t.isValid) || null;
  }

  async findTokensByClients(emails: string[]): Promise<PushToken[]> {
    const emailSet = new Set(emails);
    return Array.from(this.storage.tokens.values())
      .filter(t => emailSet.has(t.clientEmail) && t.isValid);
  }

  async upsertToken(data: UpsertTokenDTO): Promise<PushToken> {
    const existing = Array.from(this.storage.tokens.values())
      .find(t => t.token === data.token);

    if (existing) {
      const updated: PushToken = {
        ...existing,
        clientEmail: data.clientEmail,
        clientId: data.clientId,
        provider: data.provider || existing.provider,
        metadata: data.metadata || existing.metadata,
        isValid: true,
        lastUsedAt: new Date(),
        updatedAt: new Date(),
      };
      this.storage.tokens.set(existing.id, updated);
      return updated;
    }

    const id = this.generateId();
    const now = new Date();

    const token: PushToken = {
      id,
      token: data.token,
      provider: data.provider || 'expo',
      clientEmail: data.clientEmail,
      clientId: data.clientId,
      isValid: true,
      metadata: data.metadata,
      createdAt: now,
      updatedAt: now,
      lastUsedAt: now,
    };

    this.storage.tokens.set(id, token);
    return token;
  }

  async updateTokenUsage(tokenId: string): Promise<void> {
    const token = this.storage.tokens.get(tokenId);
    if (token) {
      token.lastUsedAt = new Date();
      this.storage.tokens.set(tokenId, token);
    }
  }

  async invalidateToken(tokenId: string): Promise<void> {
    const token = this.storage.tokens.get(tokenId);
    if (token) {
      token.isValid = false;
      this.storage.tokens.set(tokenId, token);
    }
  }

  async validateToken(token: string): Promise<boolean> {
    return Array.from(this.storage.tokens.values())
      .some(t => t.token === token && t.isValid);
  }

  // ==================== CLIENTS ====================

  async findClient(email: string): Promise<Client | null> {
    return Array.from(this.storage.clients.values())
      .find(c => c.email === email) || null;
  }

  async findClients(emails: string[]): Promise<Client[]> {
    const emailSet = new Set(emails);
    return Array.from(this.storage.clients.values())
      .filter(c => emailSet.has(c.email));
  }

  async createClient(data: CreateClientDTO): Promise<Client> {
    const id = this.generateId();
    const now = new Date();

    const client: Client = {
      id,
      email: data.email,
      externalId: data.externalId,
      metadata: data.metadata,
      createdAt: now,
      updatedAt: now,
    };

    this.storage.clients.set(id, client);
    return client;
  }

  async updateClient(id: string, data: UpdateClientDTO): Promise<Client | null> {
    const client = this.storage.clients.get(id);
    if (!client) return null;

    const updated: Client = {
      ...client,
      ...data,
      updatedAt: new Date(),
    };

    this.storage.clients.set(id, updated);
    return updated;
  }

  async findAllClients(pagination?: PaginationParams): Promise<PaginatedResult<Client>> {
    const all = Array.from(this.storage.clients.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const page = pagination?.page || 1;
    const perPage = pagination?.perPage || 20;
    const start = (page - 1) * perPage;
    const data = all.slice(start, start + perPage);

    return {
      data,
      pagination: {
        page,
        perPage,
        total: all.length,
        totalPages: Math.ceil(all.length / perPage),
        hasNextPage: page * perPage < all.length,
        hasPrevPage: page > 1,
      },
    };
  }

  async countClients(): Promise<number> {
    return this.storage.clients.size;
  }

  // ==================== UTILITIES ====================

  /**
   * Limpia todos los datos (útil para testing)
   */
  clear(): void {
    this.storage.notifications.clear();
    this.storage.tokens.clear();
    this.storage.clients.clear();
    this.storage.externalIdMap.clear();
  }

  /**
   * Genera un ID único
   */
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
