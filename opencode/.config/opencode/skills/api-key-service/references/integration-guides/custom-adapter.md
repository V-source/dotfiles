# Crear un Adapter Personalizado

Guía para implementar BaseAdapter con cualquier base de datos.

## Cuándo Crear un Adapter

- Usar PostgreSQL sin ORM
- Usar MySQL
- Usar SQLite
- Usar base de datos en memoria
- Usar API externa como storage

## Estructura del Adapter

```typescript
import {
  BaseAdapter,
  ApiKey,
  CreateApiKeyDTO,
  UpdateApiKeyDTO,
  ListOptions,
  StatsResult,
} from './BaseAdapter';

export class CustomAdapter implements BaseAdapter {
  constructor(private db: YourDatabaseConnection) {}

  async create(data: CreateApiKeyDTO & { keyHash: string }): Promise<ApiKey> {
    // Tu implementación
  }

  async findByKeyHash(hash: string): Promise<ApiKey | null> {
    // Tu implementación
  }

  // ... implementar todos los métodos
}
```

## Ejemplo: SQLite Adapter

```typescript
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import {
  BaseAdapter,
  ApiKey,
  CreateApiKeyDTO,
  UpdateApiKeyDTO,
  ListOptions,
  StatsResult,
} from './BaseAdapter';

export class SQLiteAdapter implements BaseAdapter {
  private db: Database;

  constructor(dbPath: string) {
    this.db = new sqlite3.Database(dbPath);
    this.initSchema();
  }

  private async initSchema() {
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id TEXT PRIMARY KEY,
        key_hash TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        scopes TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        expires_at TEXT,
        last_used_at TEXT,
        usage_count INTEGER DEFAULT 0,
        metadata TEXT,
        created_by TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
  }

  async create(data: CreateApiKeyDTO & { keyHash: string }): Promise<ApiKey> {
    const id = `key_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();

    await this.db.run(
      `INSERT INTO api_keys VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.keyHash,
        data.name,
        data.description || null,
        JSON.stringify(data.scopes),
        data.isActive ?? 1,
        data.expiresAt?.toISOString() || null,
        null,
        0,
        JSON.stringify(data.metadata || {}),
        data.createdBy,
        now,
        now,
      ]
    );

    return this.rowToApiKey({ ...data, id, createdAt: now, updatedAt: now });
  }

  async findByKeyHash(hash: string): Promise<ApiKey | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM api_keys WHERE key_hash = ?`,
        [hash],
        (err, row) => {
          if (err) reject(err);
          else resolve(row ? this.rowToApiKey(row) : null);
        }
      );
    });
  }

  async findById(id: string): Promise<ApiKey | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM api_keys WHERE id = ?`,
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row ? this.rowToApiKey(row) : null);
        }
      );
    });
  }

  async list(options: ListOptions): Promise<{ data: ApiKey[]; total: number }> {
    const { filter = {}, pagination = { page: 1, perPage: 15 } } = options;

    let whereClause = '1=1';
    const params: any[] = [];

    if (filter.isActive !== undefined) {
      whereClause += ' AND is_active = ?';
      params.push(filter.isActive ? 1 : 0);
    }

    const total = await new Promise<number>((resolve) => {
      this.db.get(
        `SELECT COUNT(*) as count FROM api_keys WHERE ${whereClause}`,
        params,
        (err, row: any) => resolve(row?.count || 0)
      );
    });

    const offset = (pagination.page - 1) * pagination.perPage;
    params.push(pagination.perPage, offset);

    const rows = await new Promise<any[]>((resolve, reject) => {
      this.db.all(
        `SELECT * FROM api_keys WHERE ${whereClause} LIMIT ? OFFSET ?`,
        params,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    return {
      data: rows.map(row => this.rowToApiKey(row)),
      total,
    };
  }

  async update(id: string, data: UpdateApiKeyDTO): Promise<ApiKey> {
    const existing = await this.findById(id);
    if (!existing) throw new Error('API Key not found');

    const updates: any = {};
    const now = new Date().toISOString();

    if (data.name !== undefined) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;
    if (data.scopes !== undefined) updates.scopes = JSON.stringify(data.scopes);
    if (data.isActive !== undefined) updates.is_active = data.isActive ? 1 : 0;
    if (data.expiresAt !== undefined) updates.expires_at = data.expiresAt?.toISOString() || null;
    if (data.metadata !== undefined) updates.metadata = JSON.stringify(data.metadata);
    updates.updated_at = now;

    const keys = Object.keys(updates);
    const values = Object.values(updates);

    await this.db.run(
      `UPDATE api_keys SET ${keys.map(k => `${k} = ?`).join(', ')} WHERE id = ?`,
      [...values, id]
    );

    return this.findById(id) as Promise<ApiKey>;
  }

  async revoke(id: string): Promise<ApiKey> {
    return this.update(id, { isActive: false });
  }

  async delete(id: string): Promise<void> {
    await this.db.run(`DELETE FROM api_keys WHERE id = ?`, [id]);
  }

  async incrementUsage(id: string): Promise<void> {
    await this.db.run(
      `UPDATE api_keys SET usage_count = usage_count + 1, last_used_at = ? WHERE id = ?`,
      [new Date().toISOString(), id]
    );
  }

  async getStats(): Promise<StatsResult> {
    const total = await new Promise<number>((resolve) => {
      this.db.get(`SELECT COUNT(*) as count FROM api_keys`, (_err, row: any) => resolve(row?.count || 0));
    });

    const active = await new Promise<number>((resolve) => {
      this.db.get(`SELECT COUNT(*) as count FROM api_keys WHERE is_active = 1`, (_err, row: any) => resolve(row?.count || 0));
    });

    return {
      total,
      active,
      inactive: total - active,
      totalUsage: 0, // Simplified
      byEnvironment: [],
    };
  }

  private rowToApiKey(row: any): ApiKey {
    return {
      id: row.id,
      keyHash: row.key_hash,
      name: row.name,
      description: row.description,
      scopes: typeof row.scopes === 'string' ? JSON.parse(row.scopes) : row.scopes,
      isActive: row.is_active === 1,
      expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
      lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : undefined,
      usageCount: row.usage_count || 0,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
```

## Ejemplo: MySQL Adapter

```typescript
import mysql, { Pool, RowDataPacket } from 'mysql2/promise';
import {
  BaseAdapter,
  ApiKey,
  CreateApiKeyDTO,
  UpdateApiKeyDTO,
  ListOptions,
  StatsResult,
} from './BaseAdapter';

export class MySQLAdapter implements BaseAdapter {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = mysql.createPool({
      connectionString,
      waitForConnections: true,
      queueLimit: 0,
    });
    this.initSchema();
  }

  private async initSchema() {
    await this.pool.execute(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id VARCHAR(64) PRIMARY KEY,
        key_hash VARCHAR(64) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        scopes JSON NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        expires_at DATETIME,
        last_used_at DATETIME,
        usage_count INT DEFAULT 0,
        metadata JSON,
        created_by VARCHAR(64) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_is_active_created (is_active, created_at),
        INDEX idx_created_by (created_by)
      )
    `);
  }

  async create(data: CreateApiKeyDTO & { keyHash: string }): Promise<ApiKey> {
    const id = `key_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    await this.pool.execute(
      `INSERT INTO api_keys (id, key_hash, name, description, scopes, is_active, expires_at, metadata, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.keyHash,
        data.name,
        data.description || null,
        JSON.stringify(data.scopes),
        true,
        data.expiresAt || null,
        JSON.stringify(data.metadata || {}),
        data.createdBy,
      ]
    );

    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT * FROM api_keys WHERE id = ?`,
      [id]
    );

    return this.rowToApiKey(rows[0]);
  }

  async findByKeyHash(hash: string): Promise<ApiKey | null> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT * FROM api_keys WHERE key_hash = ?`,
      [hash]
    );
    return rows[0] ? this.rowToApiKey(rows[0]) : null;
  }

  // ... implementar demás métodos

  private rowToApiKey(row: RowDataPacket): ApiKey {
    return {
      id: row.id,
      keyHash: row.key_hash,
      name: row.name,
      description: row.description,
      scopes: typeof row.scopes === 'string' ? JSON.parse(row.scopes) : row.scopes,
      isActive: Boolean(row.is_active),
      expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
      lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : undefined,
      usageCount: row.usage_count || 0,
      metadata: row.metadata ? (typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata) : undefined,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
```

## Uso del Adapter Personalizado

```typescript
import { ApiKeyService } from './ApiKeyService';
import { SQLiteAdapter } from './SQLiteAdapter';
import { MySQLAdapter } from './MySQLAdapter';

// Con SQLite
const adapter = new SQLiteAdapter('./data/api-keys.db');
const service = new ApiKeyService({ adapter });

// Con MySQL
const mysqlAdapter = new MySQLAdapter('mysql://user:pass@localhost:3306/mydb');
const service2 = new ApiKeyService({ adapter: mysqlAdapter });
```

## Checklist para Nuevos Adapters

- [ ] Implementar `create()`
- [ ] Implementar `findByKeyHash()`
- [ ] Implementar `findById()`
- [ ] Implementar `list()` con paginación
- [ ] Implementar `update()`
- [ ] Implementar `revoke()`
- [ ] Implementar `delete()`
- [ ] Implementar `incrementUsage()`
- [ ] Implementar `getStats()`
- [ ] Manejar errores apropiadamente
- [ ] Usar tipos correctos de TypeScript
- [ ] Documentar requisitos de schema
