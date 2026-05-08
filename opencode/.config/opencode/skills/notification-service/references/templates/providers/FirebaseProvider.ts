/**
 * Firebase Cloud Messaging Provider
 * 
 * Implementación del PushProvider usando Firebase Admin SDK.
 * Soporta notificaciones push para Android e iOS.
 */

import {
  PushProvider,
  ProviderConfig,
  ChunkOptions,
  TicketResult,
  ReceiptResult,
  RawMessage,
  createProviderConfig,
} from './BaseProvider';

// ============================================
// Configuration
// ============================================

export interface FirebaseProviderConfig {
  /** Credenciales de Firebase Admin (JSON del service account) */
  credentials: {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
  } | string; // Path al archivo JSON o el objeto directamente

  /** Project ID de Firebase */
  projectId?: string;

  /** Timeout para requests (ms) */
  timeout?: number;

  /** Logger opcional */
  logger?: {
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
  };
}

// ============================================
// Provider Implementation
// ============================================

export class FirebaseProvider implements PushProvider {
  readonly name: string = 'firebase';
  
  private config: Required<FirebaseProviderConfig>;
  private admin: any;
  private defaultApp: any;

  constructor(config: FirebaseProviderConfig) {
    this.config = {
      timeout: 30000,
      projectId: typeof config.credentials === 'string' 
        ? undefined 
        : config.credentials.project_id,
      ...config,
    } as Required<FirebaseProviderConfig>;
  }

  /**
   * Inicializa el SDK de Firebase Admin
   */
  async initialize(): Promise<void> {
    try {
      const admin = await import('firebase-admin');
      
      // Si ya está inicializado, usar esa instancia
      if (admin.apps.length > 0) {
        this.admin = admin;
        this.defaultApp = admin.apps[0];
        return;
      }

      let serviceAccount: any;
      
      if (typeof this.config.credentials === 'string') {
        // Cargar desde archivo
        const fs = await import('fs');
        const path = await import('path');
        const filePath = path.resolve(this.config.credentials);
        serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } else {
        serviceAccount = this.config.credentials;
      }

      this.admin = admin;
      this.defaultApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: this.config.projectId,
      });

      this.config.logger?.info('Firebase Admin SDK initialized');
    } catch (error) {
      this.config.logger?.error('Failed to initialize Firebase Admin SDK', { error });
      throw error;
    }
  }

  /**
   * Envía mensajes a través de Firebase Cloud Messaging
   */
  async send(messages: RawMessage[]): Promise<TicketResult[]> {
    await this.initialize();

    if (messages.length === 0) return [];

    // Firebase tiene límite de 500 mensajes por llamada
    const chunks = this.chunk(messages, { maxMessages: 500 });
    const allResults: TicketResult[] = [];

    for (const chunk of chunks) {
      const results = await this.sendChunk(chunk);
      allResults.push(...results);
    }

    return allResults;
  }

  /**
   * Envía un chunk de mensajes a Firebase
   */
  private async sendChunk(messages: RawMessage[]): Promise<TicketResult[]> {
    try {
      // Convertir al formato de Firebase
      const firebaseMessages = messages.map((msg, index) => {
        const firebaseMessage: any = {
          token: msg.to,
          notification: {
            title: msg.title,
            body: msg.body,
            imageUrl: msg.imageUrl,
          },
          data: this.sanitizeData(msg.data),
          android: {
            priority: msg.priority === 'high' ? 'high' : 'normal',
            notification: {
              sound: msg.sound || 'default',
              clickAction: msg.clickAction,
              channelId: msg.channelId,
              notificationCount: msg.badge,
            },
          },
          apns: {
            payload: {
              aps: {
                sound: msg.sound || 'default',
                badge: msg.badge,
                'content-available': msg.priority === 'high' ? 1 : undefined,
                'mutable-content': msg.mutableContent ? 1 : undefined,
                category: msg.categoryId,
                subtitle: msg.subtitle,
              },
            },
          },
          webpush: {
            headers: {
              TTL: msg.ttl?.toString() || '2419200',
            },
          },
        };

        // Eliminar campos undefined/null
        this.cleanUndefined(firebaseMessage);
        this.cleanUndefined(firebaseMessage.android.notification);
        this.cleanUndefined(firebaseMessage.apns.payload.aps);

        return { message: firebaseMessage, index };
      });

      // Enviar con Multicast para Android/iOS tokens mixtos
      const validMessages = firebaseMessages.filter(m => 
        m.message.token && m.message.token.startsWith('ExponentPushToken') === false
      );

      if (validMessages.length === 0) {
        // Todos son tokens de Expo, retornar como fallidos
        return messages.map((msg, i) => ({
          notificationId: `notif_${Date.now()}_${i}`,
          status: 'failed' as const,
          error: 'Firebase does not support Expo tokens',
        }));
      }

      // Enviar a Firebase
      const response = await this.admin.messaging().sendEachForMulticast(
        validMessages.map(vm => vm.message)
      );

      // Mapear resultados
      const results: TicketResult[] = [];
      let resultIndex = 0;

      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        
        // Buscar si es un mensaje válido de Firebase
        const firebaseMsg = validMessages.find(vm => vm.message.token === msg.to);

        if (!firebaseMsg) {
          results.push({
            notificationId: `notif_${Date.now()}_${i}`,
            status: 'failed',
            error: 'Invalid token type for Firebase',
          });
        } else {
          const responseMsg = response.responses[resultIndex];
          
          if (responseMsg.success) {
            results.push({
              notificationId: `notif_${Date.now()}_${i}`,
              providerTicketId: responseMsg.messageId?.toString(),
              status: 'sent',
            });
          } else {
            results.push({
              notificationId: `notif_${Date.now()}_${i}`,
              status: 'failed',
              error: responseMsg.error?.message || 'Unknown error',
            });
          }
          resultIndex++;
        }
      }

      return results;
    } catch (error: any) {
      this.config.logger?.error('Firebase send error', { error: error.message });
      
      return messages.map((msg, i) => ({
        notificationId: `notif_${Date.now()}_${i}`,
        status: 'failed' as const,
        error: error.message || 'Unknown error',
      }));
    }
  }

  /**
   * Divide mensajes en chunks
   */
  chunk(messages: RawMessage[], options: ChunkOptions = {}): RawMessage[][] {
    const maxMessages = options.maxMessages || 500;
    
    if (messages.length <= maxMessages) {
      return [messages];
    }

    const chunks: RawMessage[][] = [];
    for (let i = 0; i < messages.length; i += maxMessages) {
      chunks.push(messages.slice(i, i + maxMessages));
    }
    return chunks;
  }

  /**
   * Valida si un token es válido para Firebase
   */
  validateToken(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // Tokens de Firebase tienen formato específico
    // fcmToken: típicamente tiene ~153 caracteres
    // deviceToken iOS: ~64 caracteres hex
    // deviceToken Android: ~163 caracteres

    // Rechazar tokens de Expo
    if (token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken[')) {
      return false;
    }

    // Longitud mínima y máxima razonable
    if (token.length < 32 || token.length > 400) {
      return false;
    }

    // Tokens FCM son alfanuméricos con algunos caracteres especiales
    const fcmPattern = /^[a-zA-Z0-9_-]+$/;
    return fcmPattern.test(token);
  }

  /**
   * Obtiene receipts para verificar entrega
   */
  async getReceipts(ticketIds: string[]): Promise<ReceiptResult[]> {
    await this.initialize();

    if (ticketIds.length === 0) return [];

    try {
      // Firebase no tiene API de receipts como Expo
      // Retornamos estado basado en información disponible
      const results: ReceiptResult[] = [];

      for (const ticketId of ticketIds) {
        // Intentar verificar usando Firebase Admin
        results.push({
          ticketId,
          status: 'delivered',
          message: 'Firebase does not provide delivery receipts for messages sent via sendEachForMulticast. Use topic messages or implement server-side tracking.',
        });
      }

      return results;
    } catch (error: any) {
      return ticketIds.map(ticketId => ({
        ticketId,
        status: 'error' as const,
        message: error.message,
      }));
    }
  }

  /**
   * Envía notificación a un topic
   */
  async sendToTopic(topic: string, message: RawMessage): Promise<TicketResult[]> {
    await this.initialize();

    try {
      const firebaseMessage: any = {
        topic,
        notification: {
          title: message.title,
          body: message.body,
        },
        data: this.sanitizeData(message.data),
        android: {
          priority: message.priority === 'high' ? 'high' : 'normal',
        },
      };

      const response = await this.admin.messaging().send(firebaseMessage);

      return [{
        notificationId: `topic_${Date.now()}`,
        providerTicketId: response,
        status: 'sent',
      }];
    } catch (error: any) {
      return [{
        notificationId: `topic_${Date.now()}`,
        status: 'failed',
        error: error.message,
      }];
    }
  }

  /**
   * Suscribe dispositivos a un topic
   */
  async subscribeToTopic(tokens: string[], topic: string): Promise<{ success: number; failed: number }> {
    await this.initialize();

    try {
      // Filtrar tokens válidos para Firebase
      const validTokens = tokens.filter(t => this.validateToken(t));

      if (validTokens.length === 0) {
        return { success: 0, failed: tokens.length };
      }

      const response = await this.admin.messaging().subscribeToTopic(validTokens, topic);

      return {
        success: response.successCount,
        failed: response.failureCount,
      };
    } catch (error: any) {
      this.config.logger?.error('Subscribe to topic error', { error: error.message });
      return { success: 0, failed: tokens.length };
    }
  }

  /**
   * Desuscribe dispositivos de un topic
   */
  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<{ success: number; failed: number }> {
    await this.initialize();

    try {
      const validTokens = tokens.filter(t => this.validateToken(t));

      if (validTokens.length === 0) {
        return { success: 0, failed: tokens.length };
      }

      const response = await this.admin.messaging().unsubscribeFromTopic(validTokens, topic);

      return {
        success: response.successCount,
        failed: response.failureCount,
      };
    } catch (error: any) {
      this.config.logger?.error('Unsubscribe from topic error', { error: error.message });
      return { success: 0, failed: tokens.length };
    }
  }

  /**
   * Limpia recursos
   */
  async destroy(): Promise<void> {
    if (this.defaultApp) {
      await this.defaultApp.delete();
    }
  }

  // ============================================
  // Private Helpers
  // ============================================

  /**
   * Sanitiza datos para Firebase (valores deben ser strings)
   */
  private sanitizeData(data?: Record<string, any>): Record<string, string> {
    if (!data) return {};

    const sanitized: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined) {
        sanitized[key] = typeof value === 'string' ? value : JSON.stringify(value);
      }
    }

    return sanitized;
  }

  /**
   * Elimina campos undefined/null de un objeto
   */
  private cleanUndefined(obj: any): void {
    for (const key of Object.keys(obj)) {
      if (obj[key] === undefined || obj[key] === null) {
        delete obj[key];
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.cleanUndefined(obj[key]);
      }
    }
  }
}

// ============================================
// Usage Examples
// ============================================

/**
 * EJEMPLOS DE USO:
 * 
 * 1. Con archivo de credenciales:
 * 
 * const firebaseProvider = new FirebaseProvider({
 *   credentials: './path/to/service-account.json',
 *   projectId: 'my-project-id',
 * });
 * 
 * 2. Con credenciales en variables de entorno:
 * 
 * const firebaseProvider = new FirebaseProvider({
 *   credentials: {
 *     type: 'service_account',
 *     project_id: process.env.FIREBASE_PROJECT_ID,
 *     private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
 *     client_email: process.env.FIREBASE_CLIENT_EMAIL,
 *   },
 * });
 * 
 * 3. Integración con NotificationService:
 * 
 * const notificationService = new NotificationService({
 *   provider: firebaseProvider,
 *   adapter: mongoAdapter,
 *   mapper: defaultMapper,
 * });
 */

// ============================================
// Customization Guide
// ============================================

/**
 * CUSTOMIZATION OPTIONS:
 * 
 * 1. Con firebase-admin ya inicializado:
 * 
 * import { initializeApp, cert } from 'firebase-admin/app';
 * 
 * class CustomFirebaseProvider extends FirebaseProvider {
 *   async initialize(): Promise<void> {
 *     if (this.admin?.apps?.length) return;
 *     
 *     const existingApp = getApps().find(a => a.name === '[DEFAULT]');
 *     if (existingApp) {
 *       this.admin = { messaging: () => existingApp.messaging() };
 *       return;
 *     }
 *     // ... tu inicialización
 *   }
 * }
 * 
 * 2. Con Firebase Cloud Messaging HTTP v1 API:
 * 
 * - Usar OAuth 2.0 en lugar de service account
 * - Obtener access token dinámicamente
 * - Endpoint: https://fcm.googleapis.com/v1/projects/{projectId}/messages:send
 * 
 * 3. Para dispositivos específicos:
 * 
 * await admin.messaging().send({
 *   token: deviceToken,
 *   // ... opciones
 * });
 * 
 * await admin.messaging().sendAll(messages);
 * 
 * await admin.messaging().sendEachForMulticast(multicastMessage);
 */
