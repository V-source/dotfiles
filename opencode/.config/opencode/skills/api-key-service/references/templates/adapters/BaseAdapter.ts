/**
 * Base Adapter Interface
 * 
 * Define el contrato que deben implementar todos los adapters
 * de base de datos para el API Key Service.
 */

export interface ApiKey {
  /** ID único de la API Key */
  id: string;
  
  /** Hash SHA256 de la API Key (nunca el texto plano) */
  keyHash: string;
  
  /** Nombre descriptivo de la key */
  name: string;
  
  /** Descripción opcional */
  description?: string;
  
  /** Scopes/permisos asignados */
  scopes: string[];
  
  /** Estado activo/inactivo */
  isActive: boolean;
  
  /** Fecha de expiración (opcional) */
  expiresAt?: Date;
  
  /** Última vez que se usó */
  lastUsedAt?: Date;
  
  /** Contador de uso */
  usageCount: number;
  
  /** Metadata adicional */
  metadata?: {
    service?: string;
    environment?: 'development' | 'staging' | 'production';
    ipWhitelist?: string[];
  };
  
  /** ID del usuario que creó la key */
  createdBy: string;
  
  /** Fecha de creación */
  createdAt: Date;
  
  /** Fecha de última actualización */
  updatedAt: Date;
}

export interface CreateApiKeyDTO {
  name: string;
  description?: string;
  scopes: string[];
  expiresAt?: Date;
  metadata?: {
    service?: string;
    environment?: 'development' | 'staging' | 'production';
    ipWhitelist?: string[];
  };
  createdBy: string;
}

export interface UpdateApiKeyDTO {
  name?: string;
  description?: string;
  scopes?: string[];
  isActive?: boolean;
  expiresAt?: Date | null;
  metadata?: {
    service?: string;
    environment?: 'development' | 'staging' | 'production';
    ipWhitelist?: string[];
  };
}

export interface ListOptions {
  filter?: {
    isActive?: boolean;
    service?: string;
    environment?: string;
    createdBy?: string;
  };
  pagination?: {
    page: number;
    perPage: number;
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export interface StatsResult {
  total: number;
  active: number;
  inactive: number;
  totalUsage: number;
  byEnvironment: Array<{
    environment: string;
    count: number;
  }>;
}

/**
 * Interface que deben implementar todos los adapters
 */
export interface BaseAdapter {
  /**
   * Crea una nueva API Key
   */
  create(data: CreateApiKeyDTO & { keyHash: string }): Promise<ApiKey>;
  
  /**
   * Busca una API Key por su hash
   */
  findByKeyHash(hash: string): Promise<ApiKey | null>;
  
  /**
   * Busca una API Key por su ID
   */
  findById(id: string): Promise<ApiKey | null>;
  
  /**
   * Lista API Keys con filtros y paginación
   */
  list(options: ListOptions): Promise<{ data: ApiKey[]; total: number }>;
  
  /**
   * Actualiza una API Key
   */
  update(id: string, data: UpdateApiKeyDTO): Promise<ApiKey>;
  
  /**
   * Revoca (desactiva) una API Key
   */
  revoke(id: string): Promise<ApiKey>;
  
  /**
   * Elimina permanentemente una API Key
   */
  delete(id: string): Promise<void>;
  
  /**
   * Incrementa el contador de uso
   */
  incrementUsage(id: string): Promise<void>;
  
  /**
   * Obtiene estadísticas de uso
   */
  getStats(): Promise<StatsResult>;
}
