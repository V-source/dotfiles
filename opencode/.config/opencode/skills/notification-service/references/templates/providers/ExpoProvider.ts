/**
 * Expo Push Notifications Provider
 * 
 * Implementación de PushProvider para Expo Server SDK.
 * Maneja envío, chunking, validación de tokens y receipts.
 */

import { Expo, ExpoPushToken, ExpoPushTicket } from 'expo-server-sdk';
import {
  PushProvider,
  ProviderConfig,
  ChunkOptions,
  ChunkResult,
} from './BaseProvider';
import {
  RawMessage,
  TicketResult,
  ReceiptResult,
} from '../NotificationTypes';

// ============================================
// Configuración
// ============================================

export interface ExpoProviderConfig extends ProviderConfig {
  /**
   * Access token de Expo
   */
  accessToken?: string;

  /**
   * Usar sandbox (testing) en lugar de producción
   */
  useSandbox?: boolean;

  /**
   * Máximo de mensajes por chunk (límite de Expo: 100)
   */
  chunkSize?: number;

  /**
   * Handler para tickets desconocidos
   */
  onUnknownTicket?: (ticket: ExpoPushTicket) => void;
}

// ============================================
// Expo Provider
// ============================================

export class ExpoProvider implements PushProvider {
  readonly name = 'expo';

  private expo: Expo;
  private config: ExpoProviderConfig;
  private chunkSize: number;

  constructor(config: ExpoProviderConfig = {}) {
    this.config = {
      accessToken: config.accessToken || process.env.EXPO_ACCESS_TOKEN,
      useSandbox: config.useSandbox || false,
      chunkSize: config.chunkSize || 100,
      ...config,
    };

    // Inicializar Expo SDK
    this.expo = new Expo({
      accessToken: this.config.accessToken,
      useSandbox: this.config.useSandbox,
    });

    this.chunkSize = this.config.chunkSize || 100;
  }

  /**
   * Envía mensajes a dispositivos Expo
   */
  async send(messages: RawMessage[]): Promise<TicketResult[]> {
    if (messages.length === 0) {
      return [];
    }

    const chunks = this.chunk(messages);
    const allTickets: TicketResult[] = [];

    for (const chunk of chunks) {
      const result = await this.sendChunk(chunk);
      allTickets.push(...result.tickets);
    }

    return allTickets;
  }

  /**
   * Envía un chunk de mensajes
   */
  private async sendChunk(messages: RawMessage[]): Promise<ChunkResult> {
    const tickets: TicketResult[] = [];
    const errors: Array<{ index: number; error: string }> = [];

    try {
      // Enviar al servidor de Expo
      const ticketChunk = await this.expo.sendPushNotificationsAsync(
        messages.map(msg => this.normalizeMessage(msg))
      );

      // Procesar tickets
      for (let i = 0; i < ticketChunk.length; i++) {
        const ticket = ticketChunk[i];

        if (ticket.status === 'ok') {
          tickets.push({
            notificationId: messages[i].data?._id || `msg_${i}`,
            providerTicketId: ticket.id,
            status: 'sent',
          });
        } else if (ticket.status === 'error') {
          const errorMessage = ticket.message || 'Unknown error';
          errors.push({
            index: i,
            error: errorMessage,
          });

          tickets.push({
            notificationId: messages[i].data?._id || `msg_${i}`,
            status: 'failed',
            error: errorMessage,
          });

          // Log warning para debugging
          if (ticket.details?.error) {
            console.warn(`Expo error [${i}]:`, ticket.details.error);
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Marcar todos como fallidos
      for (let i = 0; i < messages.length; i++) {
        errors.push({
          index: i,
          error: errorMessage,
        });
        tickets.push({
          notificationId: messages[i].data?._id || `msg_${i}`,
          status: 'failed',
          error: errorMessage,
        });
      }
    }

    return { messages, tickets, errors };
  }

  /**
   * Normaliza un mensaje al formato de Expo
   */
  private normalizeMessage(msg: RawMessage): ExpoPushToken {
    return {
      to: msg.to,
      title: msg.title,
      body: msg.body,
      data: msg.data,
      sound: msg.sound,
      badge: msg.badge,
      channelId: msg.channelId,
      priority: msg.priority as 'default' | 'normal' | 'high' || undefined,
      ttl: msg.ttl,
      expiration: msg.expiration,
      subtitle: msg.subtitle,
      categoryId: msg.categoryId,
      mutableContent: msg.mutableContent,
    };
  }

  /**
   * Divide mensajes en chunks para respetar límites de Expo
   */
  chunk(messages: RawMessage[], options: ChunkOptions = {}): RawMessage[][] {
    const maxMessages = options.maxMessages || this.chunkSize;

    const chunks: RawMessage[][] = [];

    for (let i = 0; i < messages.length; i += maxMessages) {
      chunks.push(messages.slice(i, i + maxMessages));
    }

    return chunks;
  }

  /**
   * Valida si un token es un token válido de Expo
   */
  validateToken(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    try {
      return Expo.isExpoPushToken(token);
    } catch {
      return false;
    }
  }

  /**
   * Obtiene receipts para verificar estado de entrega
   */
  async getReceipts(ticketIds: string[]): Promise<ReceiptResult[]> {
    if (ticketIds.length === 0) {
      return [];
    }

    const results: ReceiptResult[] = [];

    // Dividir en chunks para evitar límite de Expo
    const chunks = this.chunkReceipts(ticketIds);

    for (const chunk of chunks) {
      try {
        const receipts = await this.expo.getPushNotificationReceiptsAsync(chunk);

        for (const [ticketId, receipt] of Object.entries(receipts)) {
          if (receipt.status === 'ok') {
            results.push({
              ticketId,
              status: 'delivered',
            });
          } else if (receipt.status === 'error') {
            results.push({
              ticketId,
              status: 'failed',
              message: receipt.message,
              details: receipt.details,
            });
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Marcar tickets del chunk como error
        for (const ticketId of chunk) {
          results.push({
            ticketId,
            status: 'error',
            message: errorMessage,
          });
        }
      }
    }

    return results;
  }

  /**
   * Divide IDs de tickets para receipts
   */
  private chunkReceipts(ticketIds: string[]): string[][] {
    const CHUNK_SIZE = 100; // Límite de Expo
    const chunks: string[][] = [];

    for (let i = 0; i < ticketIds.length; i += CHUNK_SIZE) {
      chunks.push(ticketIds.slice(i, i + CHUNK_SIZE));
    }

    return chunks;
  }

  /**
   * Obtiene estadísticas del provider
   */
  getStats(): { name: string; configured: boolean; sandbox: boolean } {
    return {
      name: this.name,
      configured: !!this.config.accessToken,
      sandbox: this.config.useSandbox || false,
    };
  }
}

// ============================================
// Factory Function
// ============================================

export function createExpoProvider(config?: ExpoProviderConfig): ExpoProvider {
  return new ExpoProvider(config);
}
