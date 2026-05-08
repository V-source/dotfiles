/**
 * API Key Service
 * 
 * Servicio principal para gestión de API Keys.
 * Agnóstico de base de datos mediante el patrón Adapter.
 */

import { 
  BaseAdapter, 
  ApiKey, 
  CreateApiKeyDTO, 
  UpdateApiKeyDTO,
  ListOptions 
} from './adapters/BaseAdapter';

/**
 * Logger interface - puede ser cualquier logger compatible
 */
export interface Logger {
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  debug?(message: string, meta?: any): void;
}

/**
 * Configuración del servicio
 */
export interface ApiKeyServiceConfig {
  /** Adapter de base de datos */
  adapter: BaseAdapter;
  
  /** Logger opcional */
  logger?: Logger;
  
  /** Scopes por defecto si no se especifican */
  defaultScopes?: string[];
  
  /** Prefijo para las keys generadas */
  keyPrefix?: string;
}

/**
 * Resultado de la creación de una API Key
 */
export interface CreateResult {
  /** Documento de la API Key (sin el hash) */
  apiKey: Omit<ApiKey, 'keyHash'>;
  
  /** Key en texto plano (SOLO SE MUESTRA UNA VEZ) */
  plainKey: string;
}

/**
 * Resultado de la validación
 */
export interface ValidationResult {
  /** Si la validación fue exitosa */
  valid: boolean;
  
  /** API Key encontrada (si válida) */
  apiKey?: ApiKey;
  
  /** Motivo del rechazo (si inválida) */
  reason?: string;
  
  /** Contexto de autenticación */
  authContext?: {
    type: 'api-key';
    apiKeyId: string;
    name: string;
    scopes: string[];
    service?: string;
    environment?: string;
  };
}

/**
 * Servicio de gestión de API Keys
 */
export class ApiKeyService {
  private config: ApiKeyServiceConfig;
  
  constructor(config: ApiKeyServiceConfig) {
    this.config = {
      defaultScopes: ['read'],
      keyPrefix: 'pk_live_',
      ...config,
    };
  }
  
  /**
   * Crea una nueva API Key
   * 
   * @param data - Datos de la API Key
   * @returns La API Key creada y la key en texto plano
   * 
   * IMPORTANTE: La key en texto plano solo se muestra UNA VEZ.
   * Guárdala inmediatamente porque no se podrá recuperar después.
   */
  async create(data: CreateApiKeyDTO): Promise<CreateResult> {
    try {
      // Generar key aleatoria
      const plainKey = this.generateKey();
      
      // Hashear la key para almacenar
      const keyHash = this.hashKey(plainKey);
      
      // Crear en base de datos
      const apiKey = await this.config.adapter.create({
        ...data,
        keyHash,
      });
      
      this.log('info', 'API Key created', {
        keyId: apiKey.id,
        name: apiKey.name,
        createdBy: apiKey.createdBy,
      });
      
      // Retornar sin el hash
      const { keyHash: _, ...apiKeyWithoutHash } = apiKey;
      
      return {
        apiKey: apiKeyWithoutHash,
        plainKey,
      };
    } catch (error) {
      this.log('error', 'Failed to create API Key', { error, data });
      throw error;
    }
  }
  
  /**
   * Valida una API Key
   * 
   * @param apiKey - La API Key en texto plano
   * @param clientIp - IP del cliente (opcional, para validar whitelist)
   * @returns Resultado de la validación
   */
  async validate(apiKey: string, clientIp?: string): Promise<ValidationResult> {
    try {
      // Validar formato
      if (!this.isValidKeyFormat(apiKey)) {
        return {
          valid: false,
          reason: 'Invalid API key format',
        };
      }
      
      // Hashear la key recibida
      const keyHash = this.hashKey(apiKey);
      
      // Buscar en base de datos
      const keyDoc = await this.config.adapter.findByKeyHash(keyHash);
      
      if (!keyDoc) {
        return {
          valid: false,
          reason: 'Invalid API key',
        };
      }
      
      // Verificar si está activa
      if (!keyDoc.isActive) {
        return {
          valid: false,
          reason: 'API key is revoked',
        };
      }
      
      // Verificar expiración
      if (keyDoc.expiresAt && new Date() > keyDoc.expiresAt) {
        return {
          valid: false,
          reason: 'API key has expired',
        };
      }
      
      // Verificar IP whitelist
      if (keyDoc.metadata?.ipWhitelist?.length) {
        if (!clientIp || !keyDoc.metadata.ipWhitelist.includes(clientIp)) {
          return {
            valid: false,
            reason: 'IP address not allowed',
          };
        }
      }
      
      // Actualizar estadísticas de uso (async, no bloquear)
      this.config.adapter.incrementUsage(keyDoc.id).catch((err: Error) => {
        this.log('error', 'Failed to increment usage count', {
          keyId: keyDoc.id,
          error: err.message,
        });
      });
      
      this.log('debug', 'API Key validated successfully', {
        keyId: keyDoc.id,
        name: keyDoc.name,
      });
      
      return {
        valid: true,
        apiKey: keyDoc,
        authContext: {
          type: 'api-key',
          apiKeyId: keyDoc.id,
          name: keyDoc.name,
          scopes: keyDoc.scopes,
          service: keyDoc.metadata?.service,
          environment: keyDoc.metadata?.environment,
        },
      };
    } catch (error) {
      this.log('error', 'Error validating API Key', { error });
      return {
        valid: false,
        reason: 'Validation error',
      };
    }
  }
  
  /**
   * Obtiene una API Key por ID
   */
  async getById(id: string): Promise<Omit<ApiKey, 'keyHash'> | null> {
    try {
      const apiKey = await this.config.adapter.findById(id);
      
      if (!apiKey) {
        return null;
      }
      
      // Excluir el hash
      const { keyHash: _, ...withoutHash } = apiKey;
      return withoutHash;
    } catch (error) {
      this.log('error', 'Error getting API Key by ID', { id, error });
      throw error;
    }
  }
  
  /**
   * Lista API Keys con filtros y paginación
   */
  async list(options: ListOptions): Promise<{ data: Omit<ApiKey, 'keyHash'>[]; total: number }> {
    try {
      const result = await this.config.adapter.list(options);
      
      // Excluir hashes de todas las keys
      const data = result.data.map(apiKey => {
        const { keyHash: _, ...withoutHash } = apiKey;
        return withoutHash;
      });
      
      return { data, total: result.total };
    } catch (error) {
      this.log('error', 'Error listing API Keys', { options, error });
      throw error;
    }
  }
  
  /**
   * Actualiza una API Key
   */
  async update(id: string, data: UpdateApiKeyDTO): Promise<Omit<ApiKey, 'keyHash'>> {
    try {
      const apiKey = await this.config.adapter.update(id, data);
      
      this.log('info', 'API Key updated', {
        keyId: id,
        updates: Object.keys(data),
      });
      
      const { keyHash: _, ...withoutHash } = apiKey;
      return withoutHash;
    } catch (error) {
      this.log('error', 'Error updating API Key', { id, error });
      throw error;
    }
  }
  
  /**
   * Revoca (desactiva) una API Key
   */
  async revoke(id: string): Promise<Omit<ApiKey, 'keyHash'>> {
    try {
      const apiKey = await this.config.adapter.revoke(id);
      
      this.log('info', 'API Key revoked', {
        keyId: id,
        name: apiKey.name,
      });
      
      const { keyHash: _, ...withoutHash } = apiKey;
      return withoutHash;
    } catch (error) {
      this.log('error', 'Error revoking API Key', { id, error });
      throw error;
    }
  }
  
  /**
   * Elimina permanentemente una API Key
   */
  async delete(id: string): Promise<void> {
    try {
      await this.config.adapter.delete(id);
      
      this.log('info', 'API Key deleted', { keyId: id });
    } catch (error) {
      this.log('error', 'Error deleting API Key', { id, error });
      throw error;
    }
  }
  
  /**
   * Obtiene estadísticas de uso
   */
  async getStats(): Promise<import('./adapters/BaseAdapter').StatsResult> {
    try {
      return await this.config.adapter.getStats();
    } catch (error) {
      this.log('error', 'Error getting stats', { error });
      throw error;
    }
  }
  
  /**
   * Genera una nueva API Key aleatoria
   */
  private generateKey(): string {
    const randomBytes = crypto.randomBytes(32); // 32 bytes = 64 hex chars
    const hexString = randomBytes.toString('hex');
    return `${this.config.keyPrefix}${hexString}`;
  }
  
  /**
   * Hashea una API Key usando SHA256
   */
  private hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }
  
  /**
   * Valida el formato de una API Key
   */
  private isValidKeyFormat(key: string): boolean {
    const pattern = new RegExp(`^${this.config.keyPrefix}[a-f0-9]{64}$`);
    return pattern.test(key);
  }
  
  /**
   * Helper para logging
   */
  private log(level: 'info' | 'warn' | 'error' | 'debug', message: string, meta?: any) {
    if (this.config.logger && level in this.config.logger) {
      this.config.logger[level](message, meta);
    }
  }
}

// Import crypto al final para evitar problemas de hoisting
import * as crypto from 'crypto';
