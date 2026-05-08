/**
 * Memory Adapter
 * 
 * Adapter en memoria para testing.
 * NO usar en producción.
 */

import {
  BaseAdapter,
  ApiKey,
  CreateApiKeyDTO,
  UpdateApiKeyDTO,
  ListOptions,
  StatsResult,
} from './BaseAdapter';

/**
 * Storage en memoria
 */
interface MemoryStorage {
  keys: Map<string, ApiKey>;
  keyHashes: Map<string, string>; // hash -> id
  usageStats: Map<string, number>; // id -> usage count
}

/**
 * Adapter para testing (datos en memoria)
 */
export class MemoryAdapter implements BaseAdapter {
  private storage: MemoryStorage;

  constructor() {
    this.storage = {
      keys: new Map(),
      keyHashes: new Map(),
      usageStats: new Map(),
    };
  }

  async create(data: CreateApiKeyDTO & { keyHash: string }): Promise<ApiKey> {
    // Verificar que el hash no exista
    if (this.storage.keyHashes.has(data.keyHash)) {
      throw new Error('API Key hash already exists');
    }

    const apiKey: ApiKey = {
      id: this.generateId(),
      keyHash: data.keyHash,
      name: data.name,
      description: data.description,
      scopes: data.scopes,
      isActive: true,
      expiresAt: data.expiresAt,
      lastUsedAt: undefined,
      usageCount: 0,
      metadata: data.metadata,
      createdBy: data.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.storage.keys.set(apiKey.id, apiKey);
    this.storage.keyHashes.set(data.keyHash, apiKey.id);
    this.storage.usageStats.set(apiKey.id, 0);

    return apiKey;
  }

  async findByKeyHash(hash: string): Promise<ApiKey | null> {
    const id = this.storage.keyHashes.get(hash);
    if (!id) return null;

    const key = this.storage.keys.get(id);
    return key || null;
  }

  async findById(id: string): Promise<ApiKey | null> {
    return this.storage.keys.get(id) || null;
  }

  async list(options: ListOptions): Promise<{ data: ApiKey[]; total: number }> {
    const { filter = {}, pagination = { page: 1, perPage: 15 } } = options;

    let keys = Array.from(this.storage.keys.values());

    // Aplicar filtros
    if (filter.isActive !== undefined) {
      keys = keys.filter(k => k.isActive === filter.isActive);
    }
    if (filter.service) {
      keys = keys.filter(k => k.metadata?.service === filter.service);
    }
    if (filter.environment) {
      keys = keys.filter(k => k.metadata?.environment === filter.environment);
    }
    if (filter.createdBy) {
      keys = keys.filter(k => k.createdBy === filter.createdBy);
    }

    const total = keys.length;
    const skip = (pagination.page - 1) * pagination.perPage;
    const data = keys.slice(skip, skip + pagination.perPage);

    return { data, total };
  }

  async update(id: string, data: UpdateApiKeyDTO): Promise<ApiKey> {
    const key = this.storage.keys.get(id);
    if (!key) {
      throw new Error('API Key not found');
    }

    const updated: ApiKey = {
      ...key,
      ...data,
      updatedAt: new Date(),
    };

    this.storage.keys.set(id, updated);
    return updated;
  }

  async revoke(id: string): Promise<ApiKey> {
    return this.update(id, { isActive: false });
  }

  async delete(id: string): Promise<void> {
    const key = this.storage.keys.get(id);
    if (!key) {
      throw new Error('API Key not found');
    }

    this.storage.keyHashes.delete(key.keyHash);
    this.storage.usageStats.delete(id);
    this.storage.keys.delete(id);
  }

  async incrementUsage(id: string): Promise<void> {
    const current = this.storage.usageStats.get(id) || 0;
    this.storage.usageStats.set(id, current + 1);

    const key = this.storage.keys.get(id);
    if (key) {
      key.usageCount = current + 1;
      key.lastUsedAt = new Date();
      this.storage.keys.set(id, key);
    }
  }

  async getStats(): Promise<StatsResult> {
    const keys = Array.from(this.storage.keys.values());

    const active = keys.filter(k => k.isActive).length;
    const inactive = keys.length - active;
    const totalUsage = keys.reduce((sum, k) => sum + k.usageCount, 0);

    const byEnvironment = keys.reduce((acc, k) => {
      const env = k.metadata?.environment || 'unknown';
      const existing = acc.find(item => item.environment === env);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ environment: env, count: 1 });
      }
      return acc;
    }, [] as Array<{ environment: string; count: number }>);

    return {
      total: keys.length,
      active,
      inactive,
      totalUsage,
      byEnvironment,
    };
  }

  /**
   * Limpia todos los datos (útil para testing)
   */
  clear(): void {
    this.storage.keys.clear();
    this.storage.keyHashes.clear();
    this.storage.usageStats.clear();
  }

  /**
   * Genera un ID único
   */
  private generateId(): string {
    return `key_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
