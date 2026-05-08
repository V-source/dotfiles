/**
 * PostgreSQL Adapter
 * 
 * Implementación del BaseAdapter usando PostgreSQL con Prisma.
 * Para usar sin Prisma, ver la sección de customization al final.
 */

import {
  BaseAdapter,
  CreateNotificationDTO,
  UpdateNotificationDTO,
  NotificationFilter,
  UpsertTokenDTO,
  CreateClientDTO,
  UpdateClientDTO,
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
// Configuration
// ============================================

export interface PostgresAdapterConfig {
  /** URL de conexión de PostgreSQL */
  connectionString: string;
  
  /** Tabla para notificaciones (default: 'notifications') */
  notificationsTable?: string;
  
  /** Tabla para tokens (default: 'push_tokens') */
  tokensTable?: string;
  
  /** Tabla para clientes (default: 'clients') */
  clientsTable?: string;
  
  /** Logger opcional */
  logger?: {
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
  };
}

// ============================================
// Row Types (from PostgreSQL)
// ============================================

interface NotificationRow {
  id: string;
  external_id: string | null;
  title: string;
  body: string;
  data: any;
  client_email: string;
  client_id: string | null;
  status: string;
  provider_ticket_id: string | null;
  sent_at: Date | null;
  delivered_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface TokenRow {
  id: string;
  token: string;
  provider: string;
  client_email: string;
  client_id: string | null;
  is_valid: boolean;
  metadata: any;
  created_at: Date;
  updated_at: Date;
  last_used_at: Date | null;
}

interface ClientRow {
  id: string;
  email: string;
  external_id: string | null;
  metadata: any;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// Adapter Implementation
// ============================================

export class PostgresAdapter implements BaseAdapter {
  private pool: any;
  private config: Required<PostgresAdapterConfig>;
  private initialized: boolean = false;

  constructor(config: PostgresAdapterConfig) {
    this.config = {
      notificationsTable: 'notifications',
      tokensTable: 'push_tokens',
      clientsTable: 'clients',
      ...config,
    } as Required<PostgresAdapterConfig>;
  }

  /**
   * Inicializa la conexión a PostgreSQL
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Usar pg (node-postgres) directamente
      const { Pool } = await import('pg');
      this.pool = new Pool({ connectionString: this.config.connectionString });
      
      // Verificar conexión
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();

      // Crear tablas si no existen
      await this.createTables();
      
      this.initialized = true;
      this.config.logger?.info('PostgreSQL adapter initialized');
    } catch (error) {
      this.config.logger?.error('Failed to initialize PostgreSQL adapter', { error });
      throw error;
    }
  }

  /**
   * Crea las tablas necesarias
   */
  private async createTables(): Promise<void> {
    const notificationsTable = this.config.notificationsTable;
    const tokensTable = this.config.tokensTable;
    const clientsTable = this.config.clientsTable;

    // Tabla de clientes
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS ${clientsTable} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        external_id VARCHAR(255),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Tabla de tokens
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS ${tokensTable} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        token TEXT NOT NULL,
        provider VARCHAR(50) NOT NULL DEFAULT 'custom',
        client_email VARCHAR(255) NOT NULL REFERENCES ${clientsTable}(email) ON DELETE CASCADE,
        client_id UUID REFERENCES ${clientsTable}(id) ON DELETE SET NULL,
        is_valid BOOLEAN DEFAULT TRUE,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_used_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(token)
      )
    `);

    // Tabla de notificaciones
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS ${notificationsTable} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        external_id VARCHAR(255),
        title VARCHAR(500) NOT NULL,
        body TEXT,
        data JSONB DEFAULT '{}',
        client_email VARCHAR(255) NOT NULL REFERENCES ${clientsTable}(email) ON DELETE CASCADE,
        client_id UUID REFERENCES ${clientsTable}(id) ON DELETE SET NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        provider_ticket_id TEXT,
        sent_at TIMESTAMP WITH TIME ZONE,
        delivered_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Índices
    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS idx_${notificationsTable}_client_email 
      ON ${notificationsTable}(client_email)
    `);
    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS idx_${notificationsTable}_status 
      ON ${notificationsTable}(status)
    `);
    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS idx_${tokensTable}_client_email 
      ON ${tokensTable}(client_email)
    `);
    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS idx_${tokensTable}_is_valid 
      ON ${tokensTable}(is_valid)
    `);
  }

  // ============================================
  // Notifications
  // ============================================

  async createNotification(data: CreateNotificationDTO): Promise<Notification> {
    await this.initialize();
    
    const result = await this.pool.query(
      `INSERT INTO ${this.config.notificationsTable}
       (external_id, title, body, data, client_email, client_id, status, provider_ticket_id, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.externalId || null,
        data.title,
        data.body || '',
        JSON.stringify(data.data || {}),
        data.client.email,
        data.client.id || null,
        data.status || 'pending',
        data.providerTicketId || null,
        data.sentAt || null,
      ]
    );

    return this.mapNotificationRow(result.rows[0]);
  }

  async createNotificationsBulk(data: CreateNotificationDTO[]): Promise<Notification[]> {
    await this.initialize();

    if (data.length === 0) return [];

    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      const notifications: Notification[] = [];
      
      for (const item of data) {
        const result = await client.query(
          `INSERT INTO ${this.config.notificationsTable}
           (external_id, title, body, data, client_email, client_id, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING *`,
          [
            item.externalId || null,
            item.title,
            item.body || '',
            JSON.stringify(item.data || {}),
            item.client.email,
            item.client.id || null,
            item.status || 'queued',
          ]
        );
        notifications.push(this.mapNotificationRow(result.rows[0]));
      }

      await client.query('COMMIT');
      return notifications;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findNotificationById(id: string): Promise<Notification | null> {
    await this.initialize();

    const result = await this.pool.query(
      `SELECT * FROM ${this.config.notificationsTable} WHERE id = $1`,
      [id]
    );

    return result.rows.length > 0 ? this.mapNotificationRow(result.rows[0]) : null;
  }

  async findNotificationsByClient(
    email: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Notification>> {
    await this.initialize();

    const page = pagination?.page || 1;
    const perPage = pagination?.perPage || 20;
    const offset = (page - 1) * perPage;

    const [dataResult, countResult] = await Promise.all([
      this.pool.query(
        `SELECT * FROM ${this.config.notificationsTable}
         WHERE client_email = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [email, perPage, offset]
      ),
      this.pool.query(
        `SELECT COUNT(*) as total FROM ${this.config.notificationsTable} WHERE client_email = $1`,
        [email]
      ),
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / perPage);

    return {
      data: dataResult.rows.map(row => this.mapNotificationRow(row)),
      pagination: {
        page,
        perPage,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findUnreadByClient(email: string): Promise<Notification[]> {
    await this.initialize();

    const result = await this.pool.query(
      `SELECT * FROM ${this.config.notificationsTable}
       WHERE client_email = $1 AND status NOT IN ('read', 'delivered')
       ORDER BY created_at DESC`,
      [email]
    );

    return result.rows.map(row => this.mapNotificationRow(row));
  }

  async updateNotificationStatus(
    id: string,
    status: NotificationStatus
  ): Promise<Notification | null> {
    await this.initialize();

    const sentAt = status === 'sent' ? 'NOW()' : null;
    
    const result = await this.pool.query(
      `UPDATE ${this.config.notificationsTable}
       SET status = $1, sent_at = COALESCE($2, sent_at), updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, sentAt, id]
    );

    return result.rows.length > 0 ? this.mapNotificationRow(result.rows[0]) : null;
  }

  async markAsRead(id: string): Promise<Notification | null> {
    await this.initialize();

    const result = await this.pool.query(
      `UPDATE ${this.config.notificationsTable}
       SET status = 'read', delivered_at = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    return result.rows.length > 0 ? this.mapNotificationRow(result.rows[0]) : null;
  }

  async countNotifications(filter?: NotificationFilter): Promise<NotificationStats> {
    await this.initialize();

    let whereClause = '1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filter?.clientEmail) {
      whereClause += ` AND client_email = $${paramIndex++}`;
      params.push(filter.clientEmail);
    }
    if (filter?.status) {
      whereClause += ` AND status = $${paramIndex++}`;
      params.push(filter.status);
    }

    const [totalResult, sentResult, deliveredResult, failedResult, pendingResult] = await Promise.all([
      this.pool.query(
        `SELECT COUNT(*) as count FROM ${this.config.notificationsTable} WHERE ${whereClause}`,
        params
      ),
      this.pool.query(
        `SELECT COUNT(*) as count FROM ${this.config.notificationsTable} WHERE ${whereClause} AND status = 'sent'`,
        params
      ),
      this.pool.query(
        `SELECT COUNT(*) as count FROM ${this.config.notificationsTable} WHERE ${whereClause} AND status = 'delivered'`,
        params
      ),
      this.pool.query(
        `SELECT COUNT(*) as count FROM ${this.config.notificationsTable} WHERE ${whereClause} AND status = 'failed'`,
        params
      ),
      this.pool.query(
        `SELECT COUNT(*) as count FROM ${this.config.notificationsTable} WHERE ${whereClause} AND status IN ('pending', 'queued')`,
        params
      ),
    ]);

    const total = parseInt(totalResult.rows[0].count);
    
    return {
      total,
      sent: parseInt(sentResult.rows[0].count),
      delivered: parseInt(deliveredResult.rows[0].count),
      failed: parseInt(failedResult.rows[0].count),
      pending: parseInt(pendingResult.rows[0].count),
      byStatus: [
        { status: 'sent', count: parseInt(sentResult.rows[0].count) },
        { status: 'delivered', count: parseInt(deliveredResult.rows[0].count) },
        { status: 'failed', count: parseInt(failedResult.rows[0].count) },
        { status: 'pending', count: parseInt(pendingResult.rows[0].count) },
      ],
      byDay: [],
    };
  }

  // ============================================
  // Tokens
  // ============================================

  async findTokenByClient(email: string): Promise<PushToken | null> {
    await this.initialize();

    const result = await this.pool.query(
      `SELECT * FROM ${this.config.tokensTable}
       WHERE client_email = $1 AND is_valid = TRUE
       ORDER BY created_at DESC
       LIMIT 1`,
      [email]
    );

    return result.rows.length > 0 ? this.mapTokenRow(result.rows[0]) : null;
  }

  async findTokensByClients(emails: string[]): Promise<PushToken[]> {
    await this.initialize();

    if (emails.length === 0) return [];

    const result = await this.pool.query(
      `SELECT * FROM ${this.config.tokensTable}
       WHERE client_email = ANY($1) AND is_valid = TRUE`,
      [emails]
    );

    return result.rows.map(row => this.mapTokenRow(row));
  }

  async upsertToken(data: UpsertTokenDTO): Promise<PushToken> {
    await this.initialize();

    const result = await this.pool.query(
      `INSERT INTO ${this.config.tokensTable}
       (token, provider, client_email, client_id, metadata)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (token) DO UPDATE SET
         client_email = EXCLUDED.client_email,
         client_id = EXCLUDED.client_id,
         metadata = EXCLUDED.metadata,
         is_valid = TRUE,
         updated_at = NOW()
       RETURNING *`,
      [
        data.token,
        data.provider || 'custom',
        data.clientEmail,
        data.clientId || null,
        JSON.stringify(data.metadata || {}),
      ]
    );

    return this.mapTokenRow(result.rows[0]);
  }

  async updateTokenUsage(tokenId: string): Promise<void> {
    await this.initialize();

    await this.pool.query(
      `UPDATE ${this.config.tokensTable}
       SET last_used_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [tokenId]
    );
  }

  async invalidateToken(tokenId: string): Promise<void> {
    await this.initialize();

    await this.pool.query(
      `UPDATE ${this.config.tokensTable}
       SET is_valid = FALSE, updated_at = NOW()
       WHERE id = $1`,
      [tokenId]
    );
  }

  async validateToken(token: string): Promise<boolean> {
    await this.initialize();

    const result = await this.pool.query(
      `SELECT is_valid FROM ${this.config.tokensTable} WHERE token = $1`,
      [token]
    );

    return result.rows.length > 0 && result.rows[0].is_valid === true;
  }

  // ============================================
  // Clients
  // ============================================

  async findClient(email: string): Promise<Client | null> {
    await this.initialize();

    const result = await this.pool.query(
      `SELECT * FROM ${this.config.clientsTable} WHERE email = $1`,
      [email]
    );

    return result.rows.length > 0 ? this.mapClientRow(result.rows[0]) : null;
  }

  async findClients(emails: string[]): Promise<Client[]> {
    await this.initialize();

    if (emails.length === 0) return [];

    const result = await this.pool.query(
      `SELECT * FROM ${this.config.clientsTable} WHERE email = ANY($1)`,
      [emails]
    );

    return result.rows.map(row => this.mapClientRow(row));
  }

  async createClient(data: CreateClientDTO): Promise<Client> {
    await this.initialize();

    const result = await this.pool.query(
      `INSERT INTO ${this.config.clientsTable} (email, external_id, metadata)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        data.email,
        data.externalId || null,
        JSON.stringify(data.metadata || {}),
      ]
    );

    return this.mapClientRow(result.rows[0]);
  }

  async updateClient(id: string, data: UpdateClientDTO): Promise<Client | null> {
    await this.initialize();

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      params.push(data.email);
    }
    if (data.externalId !== undefined) {
      updates.push(`external_id = $${paramIndex++}`);
      params.push(data.externalId);
    }
    if (data.metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`);
      params.push(JSON.stringify(data.metadata));
    }

    if (updates.length === 0) {
      return this.findClient(id);
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const result = await this.pool.query(
      `UPDATE ${this.config.clientsTable}
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      params
    );

    return result.rows.length > 0 ? this.mapClientRow(result.rows[0]) : null;
  }

  async findAllClients(pagination?: PaginationParams): Promise<PaginatedResult<Client>> {
    await this.initialize();

    const page = pagination?.page || 1;
    const perPage = pagination?.perPage || 20;
    const offset = (page - 1) * perPage;

    const [dataResult, countResult] = await Promise.all([
      this.pool.query(
        `SELECT * FROM ${this.config.clientsTable}
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [perPage, offset]
      ),
      this.pool.query(`SELECT COUNT(*) as total FROM ${this.config.clientsTable}`),
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / perPage);

    return {
      data: dataResult.rows.map(row => this.mapClientRow(row)),
      pagination: {
        page,
        perPage,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async countClients(): Promise<number> {
    await this.initialize();

    const result = await this.pool.query(
      `SELECT COUNT(*) as total FROM ${this.config.clientsTable}`
    );

    return parseInt(result.rows[0].total);
  }

  // ============================================
  // Cleanup
  // ============================================

  async destroy(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.initialized = false;
    }
  }

  // ============================================
  // Private Mappers
  // ============================================

  private mapNotificationRow(row: NotificationRow): Notification {
    return {
      id: row.id,
      externalId: row.external_id || undefined,
      title: row.title,
      body: row.body,
      data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data,
      client: {
        email: row.client_email,
        id: row.client_id || undefined,
      },
      status: row.status as NotificationStatus,
      providerTicketId: row.provider_ticket_id || undefined,
      sentAt: row.sent_at || undefined,
      deliveredAt: row.delivered_at || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapTokenRow(row: TokenRow): PushToken {
    return {
      id: row.id,
      token: row.token,
      provider: row.provider as 'expo' | 'firebase' | 'custom',
      clientEmail: row.client_email,
      clientId: row.client_id || undefined,
      isValid: row.is_valid,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastUsedAt: row.last_used_at || undefined,
    };
  }

  private mapClientRow(row: ClientRow): Client {
    return {
      id: row.id,
      email: row.email,
      externalId: row.external_id || undefined,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

// ============================================
// Customization Guide (Without Prisma)
// ============================================

/**
 * CUSTOMIZATION OPTIONS:
 * 
 * 1. With Prisma instead of raw SQL:
 *    - Install: npm install prisma @prisma/client
 *    - Initialize: this.prisma = new PrismaClient()
 *    - Use: this.prisma.notifications.create({ data: {...} })
 * 
 * 2. With TypeORM:
 *    - Install: npm install typeorm reflect-metadata
 *    - Define entities with @Entity() decorators
 *    - Use repository pattern
 * 
 * 3. With Drizzle ORM:
 *    - Install: npm install drizzle-orm drizzle-kit
 *    - Define schema in TypeScript
 *    - Use query builder
 * 
 * Example with Prisma:
 * 
 * import { PrismaClient } from '@prisma/client';
 * 
 * class PrismaNotificationAdapter implements BaseAdapter {
 *   private prisma: PrismaClient;
 *   
 *   constructor() {
 *     this.prisma = new PrismaClient();
 *   }
 *   
 *   async createNotification(data: CreateNotificationDTO): Promise<Notification> {
 *     const result = await this.prisma.notification.create({
 *       data: {
 *         title: data.title,
 *         body: data.body,
 *         data: data.data,
 *         client: { connect: { email: data.client.email } },
 *       }
 *     });
 *     return this.mapPrismaNotification(result);
 *   }
 *   
 *   // ... implement other methods
 * }
 */
