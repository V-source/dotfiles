/**
 * PostgreSQL Adapter
 * 
 * Implementación de BaseAdapter para PostgreSQL.
 * Compatible con Prisma, TypeORM o pg nativo.
 * 
 * Este ejemplo usa Prisma, pero fácilmente adaptable a otros ORMs.
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
 * Interface para el cliente Prisma (o cualquier ORM)
 * 
 * Si usas Prisma, esto se inyecta automáticamente.
 * Si usas otro ORM, adapta esta interface.
 */
export interface DatabaseClient {
  apiKey: {
    create(data: { data: any }): Promise<any>;
    findUnique(args: { where: any }): Promise<any>;
    findFirst(args: { where: any }): Promise<any>;
    findMany(args?: { where?: any; skip?: number; take?: number; orderBy?: any }): Promise<any[]>;
    count(args?: { where?: any }): Promise<number>;
    update(args: { where: any; data: any }): Promise<any>;
    delete(args: { where: any }): Promise<any>;
    aggregate(args?: { _sum?: any; _groupBy?: any; where?: any }): Promise<any>;
  };
  $queryRaw?: (query: any, ...values: any[]) => Promise<any>;
}

/**
 * Adapter para PostgreSQL (con Prisma)
 */
export class PostgresAdapter implements BaseAdapter {
  constructor(private prisma: DatabaseClient) {}

  async create(data: CreateApiKeyDTO & { keyHash: string }): Promise<ApiKey> {
    const record = await this.prisma.apiKey.create({
      data: {
        keyHash: data.keyHash,
        name: data.name,
        description: data.description,
        scopes: data.scopes,
        expiresAt: data.expiresAt,
        metadata: data.metadata || {},
        createdBy: data.createdBy,
      },
    });

    return this.recordToApiKey(record);
  }

  async findByKeyHash(hash: string): Promise<ApiKey | null> {
    const record = await this.prisma.apiKey.findUnique({
      where: { keyHash: hash },
    });

    return record ? this.recordToApiKey(record) : null;
  }

  async findById(id: string): Promise<ApiKey | null> {
    const record = await this.prisma.apiKey.findUnique({
      where: { id },
    });

    return record ? this.recordToApiKey(record) : null;
  }

  async list(options: ListOptions): Promise<{ data: ApiKey[]; total: number }> {
    const { filter = {}, pagination = { page: 1, perPage: 15 }, sort = { field: 'createdAt', order: 'desc' } } = options;

    const where: any = {};

    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive;
    }
    if (filter.service) {
      where.metadata = { path: ['service'], equals: filter.service };
    }
    if (filter.environment) {
      where.metadata = { path: ['environment'], equals: filter.environment };
    }
    if (filter.createdBy) {
      where.createdBy = filter.createdBy;
    }

    const skip = (pagination.page - 1) * pagination.perPage;

    const [records, total] = await Promise.all([
      this.prisma.apiKey.findMany({
        where,
        skip,
        take: pagination.perPage,
        orderBy: { [sort.field]: sort.order },
      }),
      this.prisma.apiKey.count({ where }),
    ]);

    return {
      data: records.map((record: any) => this.recordToApiKey(record)),
      total,
    };
  }

  async update(id: string, data: UpdateApiKeyDTO): Promise<ApiKey> {
    const record = await this.prisma.apiKey.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return this.recordToApiKey(record);
  }

  async revoke(id: string): Promise<ApiKey> {
    const record = await this.prisma.apiKey.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return this.recordToApiKey(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.apiKey.delete({
      where: { id },
    });
  }

  async incrementUsage(id: string): Promise<void> {
    if (this.prisma.$queryRaw) {
      // Usar query raw para operación atómica
      await this.prisma.$queryRaw`
        UPDATE "ApiKey" 
        SET "lastUsedAt" = NOW(), 
            "usageCount" = "usageCount" + 1 
        WHERE id = ${id}
      `;
    } else {
      // Fallback: actualización normal
      const record = await this.prisma.apiKey.findUnique({ where: { id } });
      if (record) {
        await this.prisma.apiKey.update({
          where: { id },
          data: {
            lastUsedAt: new Date(),
            usageCount: record.usageCount + 1,
          },
        });
      }
    }
  }

  async getStats(): Promise<StatsResult> {
    const stats = await this.prisma.apiKey.aggregate({
      _count: { id: true },
      _sum: { usageCount: true },
      where: { isActive: true },
    });

    const totalActive = stats._count.id;
    const totalUsage = stats._sum.usageCount || 0;

    // Contar inactivos
    const inactiveStats = await this.prisma.apiKey.aggregate({
      _count: { id: true },
      where: { isActive: false },
    });
    const totalInactive = inactiveStats._count.id;

    // Agrupar por ambiente
    const byEnv = await this.prisma.apiKey.groupBy({
      by: ['metadata'],
      _count: { id: true },
    });

    // Procesar agrupación por ambiente (ajustar según estructura real)
    const byEnvironment = byEnv.map((item: any) => ({
      environment: item.metadata?.environment || 'unknown',
      count: item._count.id,
    }));

    return {
      total: totalActive + totalInactive,
      active: totalActive,
      inactive: totalInactive,
      totalUsage,
      byEnvironment,
    };
  }

  /**
   * Convierte un registro de DB a ApiKey
   */
  private recordToApiKey(record: any): ApiKey {
    return {
      id: record.id,
      keyHash: record.keyHash,
      name: record.name,
      description: record.description,
      scopes: record.scopes,
      isActive: record.isActive,
      expiresAt: record.expiresAt,
      lastUsedAt: record.lastUsedAt,
      usageCount: record.usageCount,
      metadata: record.metadata,
      createdBy: record.createdBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}

/**
 * Schema Prisma recomendado
 * 
 * Copia esto a tu schema.prisma:
 * 
model ApiKey {
  id          String   @id @default(uuid())
  keyHash     String   @unique
  name        String
  description String?
  scopes      String[] // PostgreSQL array
  isActive    Boolean  @default(true)
  expiresAt   DateTime?
  lastUsedAt  DateTime?
  usageCount  Int      @default(0)
  metadata    Json?    // { service, environment, ipWhitelist }
  createdBy   String   // ID del usuario creador
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([isActive, createdAt])
  @@index([createdBy])
  @@map("api_keys")
}
 */
