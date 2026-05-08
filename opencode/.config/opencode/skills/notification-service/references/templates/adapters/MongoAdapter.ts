/**
 * MongoDB Adapter
 * 
 * Implementación de BaseAdapter para MongoDB usando Mongoose.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  BaseAdapter,
  CreateNotificationDTO,
  UpdateNotificationDTO,
  UpsertTokenDTO,
  CreateClientDTO,
  UpdateClientDTO,
  NotificationFilter,
  AdapterStats,
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
// MongoDB Schemas
// ============================================

// Notification Schema
interface NotificationDocument extends Document {
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

const NotificationSchema = new Schema<NotificationDocument>(
  {
    externalId: { type: String, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
    client: {
      email: { type: String, required: true, index: true },
      id: { type: String, index: true },
    },
    status: {
      type: String,
      enum: ['pending', 'queued', 'sent', 'delivered', 'failed', 'error'],
      default: 'pending',
      index: true,
    },
    providerTicketId: { type: String, index: true },
    sentAt: { type: Date },
    deliveredAt: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Índices compuestos para consultas frecuentes
NotificationSchema.index({ 'client.email': 1, createdAt: -1 });
NotificationSchema.index({ status: 1, createdAt: -1 });
NotificationSchema.index({ 'client.email': 1, status: 1 });

// Push Token Schema
interface TokenDocument extends Document {
  token: string;
  provider: 'expo' | 'firebase' | 'custom';
  clientEmail: string;
  clientId?: string;
  isValid: boolean;
  metadata?: Record<string, any>;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TokenSchema = new Schema<TokenDocument>(
  {
    token: { type: String, required: true, unique: true, index: true },
    provider: {
      type: String,
      enum: ['expo', 'firebase', 'custom'],
      default: 'expo',
    },
    clientEmail: { type: String, required: true, index: true },
    clientId: { type: String, index: true },
    isValid: { type: Boolean, default: true },
    metadata: { type: Schema.Types.Mixed },
    lastUsedAt: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

TokenSchema.index({ clientEmail: 1, isValid: 1 });

// Client Schema
interface ClientDocument extends Document {
  email: string;
  externalId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<ClientDocument>(
  {
    email: { type: String, required: true, unique: true, index: true },
    externalId: { type: String, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ============================================
// MongoDB Adapter
// ============================================

export class MongoAdapter implements BaseAdapter {
  private notificationModel: Model<NotificationDocument>;
  private tokenModel: Model<TokenDocument>;
  private clientModel: Model<ClientDocument>;

  constructor(connection: mongoose.Connection) {
    // Inicializar modelos
    this.notificationModel = connection.models.Notification ||
      connection.model<NotificationDocument>('Notification', NotificationSchema);

    this.tokenModel = connection.models.PushToken ||
      connection.model<TokenDocument>('PushToken', TokenSchema);

    this.clientModel = connection.models.Client ||
      connection.model<ClientDocument>('Client', ClientSchema);
  }

  // ==================== NOTIFICATIONS ====================

  async createNotification(data: CreateNotificationDTO): Promise<Notification> {
    const doc = await this.notificationModel.create(data);
    return this.notificationToNotification(doc);
  }

  async createNotificationsBulk(data: CreateNotificationDTO[]): Promise<Notification[]> {
    if (data.length === 0) return [];

    const docs = await this.notificationModel.insertMany(data, { ordered: false });
    return docs.map(doc => this.notificationToNotification(doc));
  }

  async findNotificationById(id: string): Promise<Notification | null> {
    if (!mongoose.isValidObjectId(id)) return null;

    const doc = await this.notificationModel.findById(id).lean();
    return doc ? this.notificationToNotification(doc as NotificationDocument) : null;
  }

  async findNotificationsByClient(
    email: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Notification>> {
    const page = pagination?.page || 1;
    const perPage = pagination?.perPage || 20;

    const [docs, total] = await Promise.all([
      this.notificationModel
        .find({ 'client.email': email })
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .lean(),
      this.notificationModel.countDocuments({ 'client.email': email }),
    ]);

    return {
      data: docs.map(doc => this.notificationToNotification(doc as NotificationDocument)),
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
        hasNextPage: page * perPage < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async findUnreadByClient(email: string): Promise<Notification[]> {
    const docs = await this.notificationModel
      .find({
        'client.email': email,
        status: { $nin: ['delivered', 'failed', 'error'] },
      })
      .sort({ createdAt: -1 })
      .lean();

    return docs.map(doc => this.notificationToNotification(doc as NotificationDocument));
  }

  async updateNotificationStatus(
    id: string,
    status: NotificationStatus
  ): Promise<Notification | null> {
    if (!mongoose.isValidObjectId(id)) return null;

    const updateData: any = { status, updatedAt: new Date() };

    if (status === 'sent') {
      updateData.sentAt = new Date();
    } else if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    const doc = await this.notificationModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .lean();

    return doc ? this.notificationToNotification(doc as NotificationDocument) : null;
  }

  async markAsRead(id: string): Promise<Notification | null> {
    return this.updateNotificationStatus(id, 'delivered');
  }

  async countNotifications(filter?: NotificationFilter): Promise<NotificationStats> {
    const query: any = {};

    if (filter?.clientEmail) {
      query['client.email'] = filter.clientEmail;
    }
    if (filter?.clientId) {
      query['client.id'] = filter.clientId;
    }
    if (filter?.status) {
      query.status = filter.status;
    }
    if (filter?.startDate || filter?.endDate) {
      query.createdAt = {};
      if (filter.startDate) query.createdAt.$gte = filter.startDate;
      if (filter.endDate) query.createdAt.$lte = filter.endDate;
    }

    const stats = await this.notificationModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const byStatus: Record<string, number> = {};
    let total = 0;

    for (const s of stats) {
      byStatus[s._id as string] = s.count;
      total += s.count;
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
    const doc = await this.tokenModel
      .findOne({ clientEmail: email, isValid: true })
      .sort({ lastUsedAt: -1 })
      .lean();

    return doc ? this.tokenToPushToken(doc as TokenDocument) : null;
  }

  async findTokensByClients(emails: string[]): Promise<PushToken[]> {
    const docs = await this.tokenModel
      .find({
        clientEmail: { $in: emails },
        isValid: true,
      })
      .lean();

    return docs.map(doc => this.tokenToPushToken(doc as TokenDocument));
  }

  async upsertToken(data: UpsertTokenDTO): Promise<PushToken> {
    const doc = await this.tokenModel.findOneAndUpdate(
      { token: data.token },
      {
        $set: {
          clientEmail: data.clientEmail,
          clientId: data.clientId,
          provider: data.provider || 'expo',
          metadata: data.metadata,
          isValid: true,
          lastUsedAt: new Date(),
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true }
    ).lean();

    return this.tokenToPushToken(doc as TokenDocument);
  }

  async updateTokenUsage(tokenId: string): Promise<void> {
    await this.tokenModel.updateOne(
      { _id: tokenId },
      { $set: { lastUsedAt: new Date() } }
    );
  }

  async invalidateToken(tokenId: string): Promise<void> {
    await this.tokenModel.updateOne(
      { _id: tokenId },
      { $set: { isValid: false } }
    );
  }

  async validateToken(token: string): Promise<boolean> {
    const count = await this.tokenModel.countDocuments({
      token,
      isValid: true,
    });
    return count > 0;
  }

  // ==================== CLIENTS ====================

  async findClient(email: string): Promise<Client | null> {
    const doc = await this.clientModel.findOne({ email }).lean();
    return doc ? this.clientToClient(doc as ClientDocument) : null;
  }

  async findClients(emails: string[]): Promise<Client[]> {
    const docs = await this.clientModel
      .find({ email: { $in: emails } })
      .lean();

    return docs.map(doc => this.clientToClient(doc as ClientDocument));
  }

  async createClient(data: CreateClientDTO): Promise<Client> {
    const doc = await this.clientModel.create(data);
    return this.clientToClient(doc);
  }

  async updateClient(id: string, data: UpdateClientDTO): Promise<Client | null> {
    if (!mongoose.isValidObjectId(id)) return null;

    const doc = await this.clientModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean();

    return doc ? this.clientToClient(doc as ClientDocument) : null;
  }

  async findAllClients(pagination?: PaginationParams): Promise<PaginatedResult<Client>> {
    const page = pagination?.page || 1;
    const perPage = pagination?.perPage || 20;

    const [docs, total] = await Promise.all([
      this.clientModel
        .find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .lean(),
      this.clientModel.countDocuments(),
    ]);

    return {
      data: docs.map(doc => this.clientToClient(doc as ClientDocument)),
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
        hasNextPage: page * perPage < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async countClients(): Promise<number> {
    return this.clientModel.countDocuments();
  }

  // ==================== HELPERS ====================

  private notificationToNotification(doc: NotificationDocument): Notification {
    return {
      id: doc._id.toString(),
      externalId: doc.externalId,
      title: doc.title,
      body: doc.body,
      data: doc.data,
      client: doc.client,
      status: doc.status,
      providerTicketId: doc.providerTicketId,
      sentAt: doc.sentAt,
      deliveredAt: doc.deliveredAt,
      createdAt: (doc.createdAt as Date),
      updatedAt: (doc.updatedAt as Date),
    };
  }

  private tokenToPushToken(doc: TokenDocument): PushToken {
    return {
      id: doc._id.toString(),
      token: doc.token,
      provider: doc.provider,
      clientEmail: doc.clientEmail,
      clientId: doc.clientId,
      isValid: doc.isValid,
      metadata: doc.metadata,
      createdAt: (doc.createdAt as Date),
      updatedAt: (doc.updatedAt as Date),
      lastUsedAt: doc.lastUsedAt,
    };
  }

  private clientToClient(doc: ClientDocument): Client {
    return {
      id: doc._id.toString(),
      email: doc.email,
      externalId: doc.externalId,
      metadata: doc.metadata,
      createdAt: (doc.createdAt as Date),
      updatedAt: (doc.updatedAt as Date),
    };
  }
}
