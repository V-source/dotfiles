/**
 * MongoDB Adapter
 * 
 * Implementación de BaseAdapter para MongoDB usando Mongoose.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  BaseAdapter,
  ApiKey,
  CreateApiKeyDTO,
  UpdateApiKeyDTO,
  ListOptions,
  StatsResult,
} from './BaseAdapter';

/**
 * Interface del documento Mongoose
 */
interface ApiKeyDocument extends Document {
  keyHash: string;
  name: string;
  description?: string;
  scopes: string[];
  isActive: boolean;
  expiresAt?: Date;
  lastUsedAt?: Date;
  usageCount: number;
  metadata?: {
    service?: string;
    environment?: string;
    ipWhitelist?: string[];
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema de Mongoose para API Keys
 */
const ApiKeySchema = new Schema<ApiKeyDocument>(
  {
    keyHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    scopes: [{
      type: String,
      required: true,
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    metadata: {
      service: String,
      environment: {
        type: String,
        enum: ['development', 'staging', 'production'],
        default: 'production',
      },
      ipWhitelist: [String],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Índices adicionales para consultas frecuentes
ApiKeySchema.index({ isActive: 1, createdAt: -1 });
ApiKeySchema.index({ 'metadata.environment': 1 });

/**
 * Adapter para MongoDB/Mongoose
 */
export class MongoAdapter implements BaseAdapter {
  private model: Model<ApiKeyDocument>;

  constructor(connection: mongoose.Connection) {
    // Usar modelo existente o crear nuevo
    this.model = connection.models.ApiKey || 
      connection.model<ApiKeyDocument>('ApiKey', ApiKeySchema);
  }

  async create(data: CreateApiKeyDTO & { keyHash: string }): Promise<ApiKey> {
    const doc = await this.model.create(data);
    return this.documentToApiKey(doc);
  }

  async findByKeyHash(hash: string): Promise<ApiKey | null> {
    const doc = await this.model.findOne({ keyHash: hash }).lean();
    return doc ? this.documentToApiKey(doc as ApiKeyDocument) : null;
  }

  async findById(id: string): Promise<ApiKey | null> {
    if (!mongoose.isValidObjectId(id)) {
      return null;
    }
    const doc = await this.model.findById(id).lean();
    return doc ? this.documentToApiKey(doc as ApiKeyDocument) : null;
  }

  async list(options: ListOptions): Promise<{ data: ApiKey[]; total: number }> {
    const { filter = {}, pagination = { page: 1, perPage: 15 }, sort = { field: 'createdAt', order: 'desc' } } = options;

    const query: any = {};
    
    if (filter.isActive !== undefined) {
      query.isActive = filter.isActive;
    }
    if (filter.service) {
      query['metadata.service'] = filter.service;
    }
    if (filter.environment) {
      query['metadata.environment'] = filter.environment;
    }
    if (filter.createdBy) {
      query.createdBy = filter.createdBy;
    }

    const skip = (pagination.page - 1) * pagination.perPage;
    const sortOrder = sort.order === 'asc' ? 1 : -1;

    const [docs, total] = await Promise.all([
      this.model
        .find(query)
        .sort({ [sort.field]: sortOrder })
        .skip(skip)
        .limit(pagination.perPage)
        .lean(),
      this.model.countDocuments(query),
    ]);

    return {
      data: docs.map(doc => this.documentToApiKey(doc as ApiKeyDocument)),
      total,
    };
  }

  async update(id: string, data: UpdateApiKeyDTO): Promise<ApiKey> {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error('Invalid API Key ID');
    }

    const doc = await this.model.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();

    if (!doc) {
      throw new Error('API Key not found');
    }

    return this.documentToApiKey(doc as ApiKeyDocument);
  }

  async revoke(id: string): Promise<ApiKey> {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error('Invalid API Key ID');
    }

    const doc = await this.model.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    ).lean();

    if (!doc) {
      throw new Error('API Key not found');
    }

    return this.documentToApiKey(doc as ApiKeyDocument);
  }

  async delete(id: string): Promise<void> {
    if (!mongoose.isValidObjectId(id)) {
      throw new Error('Invalid API Key ID');
    }

    const result = await this.model.findByIdAndDelete(id);
    if (!result) {
      throw new Error('API Key not found');
    }
  }

  async incrementUsage(id: string): Promise<void> {
    if (!mongoose.isValidObjectId(id)) {
      return;
    }

    await this.model.updateOne(
      { _id: id },
      {
        $set: { lastUsedAt: new Date() },
        $inc: { usageCount: 1 },
      }
    );
  }

  async getStats(): Promise<StatsResult> {
    const stats = await this.model.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
          },
          inactive: {
            $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] },
          },
          totalUsage: { $sum: '$usageCount' },
        },
      },
    ]);

    const byEnvironment = await this.model.aggregate([
      {
        $group: {
          _id: '$metadata.environment',
          count: { $sum: 1 },
        },
      },
    ]);

    const overview = stats[0] || { total: 0, active: 0, inactive: 0, totalUsage: 0 };

    return {
      total: overview.total,
      active: overview.active,
      inactive: overview.inactive,
      totalUsage: overview.totalUsage,
      byEnvironment: byEnvironment.map((item: any) => ({
        environment: item._id || 'unknown',
        count: item.count,
      })),
    };
  }

  /**
   * Convierte un documento Mongoose a ApiKey
   */
  private documentToApiKey(doc: ApiKeyDocument | any): ApiKey {
    return {
      id: doc._id.toString(),
      keyHash: doc.keyHash,
      name: doc.name,
      description: doc.description,
      scopes: doc.scopes,
      isActive: doc.isActive,
      expiresAt: doc.expiresAt,
      lastUsedAt: doc.lastUsedAt,
      usageCount: doc.usageCount,
      metadata: doc.metadata,
      createdBy: doc.createdBy.toString(),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
