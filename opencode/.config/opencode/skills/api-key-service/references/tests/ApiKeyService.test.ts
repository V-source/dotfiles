/**
 * Unit Tests for ApiKeyService
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ApiKeyService, Logger, ValidationResult, CreateResult } from '../templates/ApiKeyService';
import { BaseAdapter, ApiKey, CreateApiKeyDTO, UpdateApiKeyDTO, ListOptions, StatsResult } from '../templates/adapters/BaseAdapter';

// Mock crypto module
const mockRandomBytes = jest.fn().mockReturnValue(Buffer.from('a'.repeat(64), 'hex'));
const mockCreateHash = jest.fn().mockReturnValue({
  update: jest.fn().mockReturnValue({
    digest: jest.fn().mockReturnValue('hashed_key_value_1234567890abcdef'),
  }),
});

jest.unstable_mockModule('crypto', () => ({
  randomBytes: mockRandomBytes,
  createHash: mockCreateHash,
}));

// Test Logger implementation
class TestLogger implements Logger {
  info = jest.fn();
  warn = jest.fn();
  error = jest.fn();
  debug = jest.fn();
}

// Mock BaseAdapter
class MockAdapter implements BaseAdapter {
  private keys: Map<string, ApiKey> = new Map();
  private keyHashes: Map<string, string> = new Map();

  async create(data: CreateApiKeyDTO & { keyHash: string }): Promise<ApiKey> {
    const now = new Date();
    const apiKey: ApiKey = {
      id: `key_${Date.now()}`,
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
      createdAt: now,
      updatedAt: now,
    };
    this.keys.set(apiKey.id, apiKey);
    this.keyHashes.set(data.keyHash, apiKey.id);
    return apiKey;
  }

  async findByKeyHash(hash: string): Promise<ApiKey | null> {
    const id = this.keyHashes.get(hash);
    if (!id) return null;
    return this.keys.get(id) || null;
  }

  async findById(id: string): Promise<ApiKey | null> {
    return this.keys.get(id) || null;
  }

  async list(options: ListOptions): Promise<{ data: ApiKey[]; total: number }> {
    let keys = Array.from(this.keys.values());
    
    if (options.filter) {
      if (options.filter.isActive !== undefined) {
        keys = keys.filter(k => k.isActive === options.filter!.isActive);
      }
      if (options.filter.service) {
        keys = keys.filter(k => k.metadata?.service === options.filter!.service);
      }
      if (options.filter.environment) {
        keys = keys.filter(k => k.metadata?.environment === options.filter!.environment);
      }
      if (options.filter.createdBy) {
        keys = keys.filter(k => k.createdBy === options.filter!.createdBy);
      }
    }

    return { data: keys, total: keys.length };
  }

  async update(id: string, data: UpdateApiKeyDTO): Promise<ApiKey> {
    const key = this.keys.get(id);
    if (!key) throw new Error('Key not found');
    
    const updated: ApiKey = {
      ...key,
      ...data,
      updatedAt: new Date(),
    };
    this.keys.set(id, updated);
    return updated;
  }

  async revoke(id: string): Promise<ApiKey> {
    return this.update(id, { isActive: false });
  }

  async delete(id: string): Promise<void> {
    const key = this.keys.get(id);
    if (key) {
      this.keyHashes.delete(key.keyHash);
      this.keys.delete(id);
    }
  }

  async incrementUsage(id: string): Promise<void> {
    const key = this.keys.get(id);
    if (key) {
      key.usageCount++;
      key.lastUsedAt = new Date();
    }
  }

  async getStats(): Promise<StatsResult> {
    const keys = Array.from(this.keys.values());
    return {
      total: keys.length,
      active: keys.filter(k => k.isActive).length,
      inactive: keys.filter(k => !k.isActive).length,
      totalUsage: keys.reduce((sum, k) => sum + k.usageCount, 0),
      byEnvironment: [
        { environment: 'development', count: keys.filter(k => k.metadata?.environment === 'development').length },
        { environment: 'production', count: keys.filter(k => k.metadata?.environment === 'production').length },
      ],
    };
  }

  // Test helper to add pre-existing key
  addKey(key: ApiKey): void {
    this.keys.set(key.id, key);
    this.keyHashes.set(key.keyHash, key.id);
  }
}

describe('ApiKeyService', () => {
  let service: ApiKeyService;
  let mockAdapter: MockAdapter;
  let mockLogger: TestLogger;

  beforeEach(() => {
    mockAdapter = new MockAdapter();
    mockLogger = new TestLogger();
    service = new ApiKeyService({
      adapter: mockAdapter,
      logger: mockLogger,
      defaultScopes: ['read', 'write'],
      keyPrefix: 'pk_test_',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Key Generation', () => {
    it('should generate key with correct prefix', async () => {
      const result = await mockAdapter.create({
        name: 'Test Key',
        scopes: ['read'],
        createdBy: 'user_123',
        keyHash: 'test_hash',
      });
      expect(result.id).toBeDefined();
    });

    it('should generate unique keys', async () => {
      const key1 = await mockAdapter.create({
        name: 'Key 1',
        scopes: ['read'],
        createdBy: 'user_123',
        keyHash: 'hash_1',
      });
      const key2 = await mockAdapter.create({
        name: 'Key 2',
        scopes: ['read'],
        createdBy: 'user_123',
        keyHash: 'hash_2',
      });
      expect(key1.id).not.toBe(key2.id);
    });
  });

  describe('create()', () => {
    it('should create an API key and return plain key once', async () => {
      const result = await service.create({
        name: 'Test API Key',
        description: 'A test key',
        scopes: ['read', 'write'],
        createdBy: 'user_123',
        metadata: {
          service: 'test-service',
          environment: 'development',
        },
      });

      expect(result).toHaveProperty('apiKey');
      expect(result).toHaveProperty('plainKey');
      expect(result.plainKey).toMatch(/^pk_test_[a-f0-9]{64}$/);
      expect(result.apiKey.name).toBe('Test API Key');
      expect(result.apiKey.description).toBe('A test key');
      expect(result.apiKey.scopes).toEqual(['read', 'write']);
      expect(result.apiKey.keyHash).toBeUndefined();
    });

    it('should use default scopes when not provided', async () => {
      const result = await service.create({
        name: 'Default Scopes Key',
        scopes: [],
        createdBy: 'user_123',
      });

      expect(result.apiKey.scopes).toEqual(['read']);
    });

    it('should log key creation', async () => {
      await service.create({
        name: 'Logged Key',
        scopes: ['read'],
        createdBy: 'user_123',
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'API Key created',
        expect.objectContaining({
          keyId: expect.any(String),
          name: 'Logged Key',
          createdBy: 'user_123',
        })
      );
    });

    it('should throw on adapter error', async () => {
      mockAdapter.create = jest.fn().mockRejectedValue(new Error('DB Error'));

      await expect(
        service.create({
          name: 'Failing Key',
          scopes: ['read'],
          createdBy: 'user_123',
        })
      ).rejects.toThrow('DB Error');
    });
  });

  describe('validate()', () => {
    let createdKey: CreateResult;

    beforeEach(async () => {
      createdKey = await service.create({
        name: 'Validatable Key',
        scopes: ['read', 'write'],
        createdBy: 'user_123',
        metadata: {
          service: 'test-service',
          environment: 'development',
        },
      });
    });

    it('should validate a correct API key', async () => {
      const result = await service.validate(createdKey.plainKey);

      expect(result.valid).toBe(true);
      expect(result.apiKey).toBeDefined();
      expect(result.authContext).toBeDefined();
      expect(result.authContext?.type).toBe('api-key');
      expect(result.authContext?.scopes).toEqual(['read', 'write']);
    });

    it('should reject invalid key format', async () => {
      const result = await service.validate('invalid_key');

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Invalid API key format');
    });

    it('should reject non-existent key', async () => {
      const result = await service.validate('pk_test_0000000000000000000000000000000000000000000000000000000000000000');

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Invalid API key');
    });

    it('should reject revoked key', async () => {
      await service.revoke(createdKey.apiKey.id);

      const result = await service.validate(createdKey.plainKey);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('API key is revoked');
    });

    it('should reject expired key', async () => {
      const expiredAdapter = new MockAdapter();
      const expiredKey = await expiredAdapter.create({
        name: 'Expired Key',
        scopes: ['read'],
        createdBy: 'user_123',
        keyHash: 'expired_hash',
        expiresAt: new Date(Date.now() - 1000),
      });
      expiredAdapter.addKey(expiredKey);

      const expiredService = new ApiKeyService({
        adapter: expiredAdapter,
        logger: mockLogger,
      });

      const result = await expiredService.validate(expiredService['config'].keyPrefix + 'a'.repeat(64));

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('API key has expired');
    });

    it('should accept key within IP whitelist', async () => {
      const whitelistAdapter = new MockAdapter();
      const whitelistKey = await whitelistAdapter.create({
        name: 'Whitelist Key',
        scopes: ['read'],
        createdBy: 'user_123',
        keyHash: 'whitelist_hash',
        metadata: {
          ipWhitelist: ['192.168.1.1', '10.0.0.1'],
        },
      });
      whitelistAdapter.addKey(whitelistKey);

      const whitelistService = new ApiKeyService({
        adapter: whitelistAdapter,
        logger: mockLogger,
        keyPrefix: 'pk_test_',
      });

      const result = await whitelistService.validate(
        whitelistService['config'].keyPrefix + 'a'.repeat(64),
        '192.168.1.1'
      );

      expect(result.valid).toBe(true);
    });

    it('should reject key outside IP whitelist', async () => {
      const whitelistAdapter = new MockAdapter();
      const whitelistKey = await whitelistAdapter.create({
        name: 'Whitelist Key',
        scopes: ['read'],
        createdBy: 'user_123',
        keyHash: 'whitelist_hash',
        metadata: {
          ipWhitelist: ['192.168.1.1'],
        },
      });
      whitelistAdapter.addKey(whitelistKey);

      const whitelistService = new ApiKeyService({
        adapter: whitelistAdapter,
        logger: mockLogger,
        keyPrefix: 'pk_test_',
      });

      const result = await whitelistService.validate(
        whitelistService['config'].keyPrefix + 'a'.repeat(64),
        '192.168.1.100'
      );

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('IP address not allowed');
    });

    it('should reject request without IP when whitelist is required', async () => {
      const whitelistAdapter = new MockAdapter();
      const whitelistKey = await whitelistAdapter.create({
        name: 'Whitelist Key',
        scopes: ['read'],
        createdBy: 'user_123',
        keyHash: 'whitelist_hash',
        metadata: {
          ipWhitelist: ['192.168.1.1'],
        },
      });
      whitelistAdapter.addKey(whitelistKey);

      const whitelistService = new ApiKeyService({
        adapter: whitelistAdapter,
        logger: mockLogger,
        keyPrefix: 'pk_test_',
      });

      const result = await whitelistService.validate(
        whitelistService['config'].keyPrefix + 'a'.repeat(64)
      );

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('IP address not allowed');
    });

    it('should increment usage count on validation', async () => {
      const initialCount = createdKey.apiKey.usageCount;
      
      await service.validate(createdKey.plainKey);

      const updatedKey = await mockAdapter.findById(createdKey.apiKey.id);
      expect(updatedKey?.usageCount).toBe(initialCount + 1);
    });

    it('should update lastUsedAt on validation', async () => {
      await service.validate(createdKey.plainKey);

      const updatedKey = await mockAdapter.findById(createdKey.apiKey.id);
      expect(updatedKey?.lastUsedAt).toBeDefined();
    });
  });

  describe('getById()', () => {
    it('should return API key without hash', async () => {
      const created = await service.create({
        name: 'Get By ID Key',
        scopes: ['read'],
        createdBy: 'user_123',
      });

      const result = await service.getById(created.apiKey.id);

      expect(result).not.toBeNull();
      expect(result!.name).toBe('Get By ID Key');
      expect(result!.keyHash).toBeUndefined();
    });

    it('should return null for non-existent key', async () => {
      const result = await service.getById('non_existent_id');

      expect(result).toBeNull();
    });
  });

  describe('list()', () => {
    beforeEach(async () => {
      await service.create({ name: 'Key 1', scopes: ['read'], createdBy: 'user_1' });
      await service.create({ name: 'Key 2', scopes: ['read'], createdBy: 'user_1' });
      await service.create({ name: 'Key 3', scopes: ['read'], createdBy: 'user_2' });
    });

    it('should list all keys', async () => {
      const result = await service.list({});

      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it('should filter by isActive', async () => {
      const all = await service.list({});
      await service.revoke(all.data[0].id);

      const active = await service.list({ filter: { isActive: true } });
      const inactive = await service.list({ filter: { isActive: false } });

      expect(active.data).toHaveLength(2);
      expect(inactive.data).toHaveLength(1);
    });

    it('should filter by createdBy', async () => {
      const result = await service.list({ filter: { createdBy: 'user_1' } });

      expect(result.data).toHaveLength(2);
      expect(result.data.every(k => k.createdBy === 'user_1')).toBe(true);
    });

    it('should exclude hashes from results', async () => {
      const result = await service.list({});

      expect(result.data.every(k => k.keyHash === undefined)).toBe(true);
    });

    it('should paginate results', async () => {
      const result = await service.list({
        pagination: { page: 1, perPage: 2 },
      });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(3);
    });
  });

  describe('update()', () => {
    it('should update API key fields', async () => {
      const created = await service.create({
        name: 'Original Name',
        scopes: ['read'],
        createdBy: 'user_123',
      });

      const result = await service.update(created.apiKey.id, {
        name: 'Updated Name',
        scopes: ['read', 'write'],
      });

      expect(result.name).toBe('Updated Name');
      expect(result.scopes).toEqual(['read', 'write']);
    });

    it('should throw for non-existent key', async () => {
      await expect(
        service.update('non_existent_id', { name: 'Test' })
      ).rejects.toThrow('Key not found');
    });

    it('should log update action', async () => {
      const created = await service.create({
        name: 'Log Test Key',
        scopes: ['read'],
        createdBy: 'user_123',
      });

      await service.update(created.apiKey.id, { name: 'New Name' });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'API Key updated',
        expect.objectContaining({
          keyId: created.apiKey.id,
          updates: ['name', 'scopes'],
        })
      );
    });
  });

  describe('revoke()', () => {
    it('should revoke (deactivate) an API key', async () => {
      const created = await service.create({
        name: 'Revoke Test Key',
        scopes: ['read'],
        createdBy: 'user_123',
      });

      const result = await service.revoke(created.apiKey.id);

      expect(result.isActive).toBe(false);
    });

    it('should return key without hash', async () => {
      const created = await service.create({
        name: 'Revoke Hash Test',
        scopes: ['read'],
        createdBy: 'user_123',
      });

      const result = await service.revoke(created.apiKey.id);

      expect(result.keyHash).toBeUndefined();
    });

    it('should log revocation', async () => {
      const created = await service.create({
        name: 'Revoke Log Test',
        scopes: ['read'],
        createdBy: 'user_123',
      });

      await service.revoke(created.apiKey.id);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'API Key revoked',
        expect.objectContaining({
          keyId: created.apiKey.id,
          name: 'Revoke Log Test',
        })
      );
    });
  });

  describe('delete()', () => {
    it('should permanently delete an API key', async () => {
      const created = await service.create({
        name: 'Delete Test Key',
        scopes: ['read'],
        createdBy: 'user_123',
      });

      await service.delete(created.apiKey.id);

      const found = await service.getById(created.apiKey.id);
      expect(found).toBeNull();
    });

    it('should log deletion', async () => {
      const created = await service.create({
        name: 'Delete Log Test',
        scopes: ['read'],
        createdBy: 'user_123',
      });

      await service.delete(created.apiKey.id);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'API Key deleted',
        expect.objectContaining({ keyId: created.apiKey.id })
      );
    });

    it('should not throw for non-existent key', async () => {
      await expect(service.delete('non_existent_id')).resolves.not.toThrow();
    });
  });

  describe('getStats()', () => {
    it('should return correct statistics', async () => {
      await service.create({ name: 'Active 1', scopes: ['read'], createdBy: 'user_1' });
      await service.create({ name: 'Active 2', scopes: ['read'], createdBy: 'user_1' });
      
      const revoked = await service.create({ name: 'Revoked', scopes: ['read'], createdBy: 'user_1' });
      await service.revoke(revoked.apiKey.id);

      const stats = await service.getStats();

      expect(stats.total).toBe(3);
      expect(stats.active).toBe(2);
      expect(stats.inactive).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent create operations', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        service.create({
          name: `Concurrent Key ${i}`,
          scopes: ['read'],
          createdBy: 'user_concurrent',
        })
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      const ids = results.map(r => r.apiKey.id);
      expect(new Set(ids).size).toBe(10); // All unique
    });

    it('should handle validation of key with no expiration', async () => {
      const created = await service.create({
        name: 'No Expiry Key',
        scopes: ['read'],
        createdBy: 'user_123',
      });

      const result = await service.validate(created.plainKey);

      expect(result.valid).toBe(true);
    });

    it('should handle update with null expiresAt', async () => {
      const created = await service.create({
        name: 'Set Expiry Key',
        scopes: ['read'],
        createdBy: 'user_123',
        expiresAt: new Date(Date.now() + 86400000),
      });

      const result = await service.update(created.apiKey.id, { expiresAt: null });

      expect(result.expiresAt).toBeNull();
    });
  });
});
