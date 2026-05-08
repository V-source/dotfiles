/**
 * Rate Limit Middleware
 * 
 * Integración con express-rate-limit para rate limiting por API Key.
 */

import rateLimit, { Options } from 'express-rate-limit';
import { AuthenticatedRequest } from './authenticate';

/**
 * Opciones del rate limiter
 */
export interface ApiKeyRateLimitOptions {
  /** Ventana de tiempo en milisegundos (default: 1 minuto) */
  windowMs?: number;
  
  /** Máximo de requests por ventana (default: 100) */
  max?: number;
  
  /** Mensaje de error cuando se excede el límite */
  message?: string;
  
  /** Headers estándar (default: true) */
  standardHeaders?: boolean;
  
  /** Headers legacy (default: false) */
  legacyHeaders?: boolean;
}

/**
 * Crea un rate limiter basado en API Key
 * 
 * Si el request tiene una API Key válida, usa el ID de la key.
 * Si no, usa la IP del cliente.
 */
export function createApiKeyRateLimit(options: ApiKeyRateLimitOptions = {}) {
  const {
    windowMs = 60 * 1000, // 1 minuto
    max = 100,
    message = 'Too many requests, please try again later',
    standardHeaders = true,
    legacyHeaders = false,
  } = options;

  return rateLimit({
    windowMs,
    max,
    standardHeaders,
    legacyHeaders,
    
    /**
     * Generador de keys para rate limiting
     * 
     * Prioridad:
     * 1. API Key ID (si está autenticado con API Key)
     * 2. User ID (si está autenticado con JWT)
     * 3. IP del cliente
     */
    keyGenerator: (req: AuthenticatedRequest, res): string => {
      // Usar API Key ID si está disponible
      if (req.auth?.type === 'api-key' && req.auth.apiKeyId) {
        return `apikey:${req.auth.apiKeyId}`;
      }
      
      // Usar User ID si está disponible
      if (req.auth?.type === 'jwt' && req.auth.userId) {
        return `user:${req.auth.userId}`;
      }
      
      // Fallback a IP
      // Usar connection.remoteAddress para evitar problemas con IPv6
      const ip = req.connection?.remoteAddress || 
                 req.socket?.remoteAddress || 
                 'unknown';
      
      return `ip:${ip}`;
    },
    
    /**
     * Handler cuando se excede el límite
     */
    handler: (req: AuthenticatedRequest, res, next, options) => {
      res.status(options.statusCode || 429).json({
        success: false,
        message,
        retryAfter: Math.ceil(options.windowMs / 1000),
      });
    },
    
    /**
     * Skip successful requests (opcional)
     * Si quieres contar solo requests fallidos, descomenta esto:
     */
    // skipSuccessfulRequests: false,
    
    /**
     * Validaciones adicionales
     */
    validate: {
      // Deshabilitar validación de X-Forwarded-For para evitar errores
      xForwardedForHeader: false,
    },
  });
}

/**
 * Rate limiter específico para endpoints de alta sensibilidad
 * 
 * Más restrictivo que el general
 */
export function createStrictRateLimit(options: ApiKeyRateLimitOptions = {}) {
  return createApiKeyRateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 10, // Solo 10 requests por minuto
    message: 'Rate limit exceeded for this endpoint',
    ...options,
  });
}

/**
 * Rate limiter para endpoints de invoice/alto volumen
 * 
 * Más permisivo para permitir procesamiento batch
 */
export function createInvoiceRateLimit(options: ApiKeyRateLimitOptions = {}) {
  return createApiKeyRateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 120, // 120 requests por minuto (2 por segundo)
    message: 'Too many invoice requests, please slow down',
    ...options,
  });
}

/**
 * Rate limiter personalizado por endpoint
 * 
 * Permite diferentes límites según el endpoint
 */
export function createCustomRateLimit(
  limits: { [endpoint: string]: { windowMs: number; max: number } },
  defaultOptions: ApiKeyRateLimitOptions = {}
) {
  return (req: AuthenticatedRequest, res, next) => {
    const endpoint = req.path;
    const limit = limits[endpoint] || {
      windowMs: defaultOptions.windowMs || 60 * 1000,
      max: defaultOptions.max || 100,
    };

    const limiter = createApiKeyRateLimit({
      ...defaultOptions,
      ...limit,
    });

    return limiter(req, res, next);
  };
}
