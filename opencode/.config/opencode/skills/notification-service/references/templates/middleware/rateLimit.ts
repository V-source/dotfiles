/**
 * Rate Limit Middleware
 * 
 * Rate limiting específico para notificaciones.
 */

import rateLimit, { Options } from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authenticate';

// ============================================
// Rate Limit Options
// ============================================

export interface NotificationRateLimitOptions {
  /** Ventana de tiempo en ms */
  windowMs?: number;
  
  /** Máximo requests por ventana */
  max?: number;
  
  /** Máximo requests por API Key */
  maxPerApiKey?: number;
  
  /** Mensaje de error */
  message?: string;
  
  /** Headers estándar */
  standardHeaders?: boolean;
  
  /** Headers legacy */
  legacyHeaders?: boolean;
}

// ============================================
// Rate Limit Factory
// ============================================

export function createNotificationRateLimit(options: NotificationRateLimitOptions = {}) {
  const {
    windowMs = 60 * 1000, // 1 minuto
    max = 100,
    maxPerApiKey = 1000,
    message = 'Too many notification requests',
    standardHeaders = true,
    legacyHeaders = false,
  } = options;

  return rateLimit({
    windowMs,
    max: (req: AuthenticatedRequest) => {
      // Por API Key o por IP
      if (req.auth?.type === 'api-key' && req.auth.apiKeyId) {
        return maxPerApiKey;
      }
      return max;
    },
    standardHeaders,
    legacyHeaders,
    
    keyGenerator: (req: AuthenticatedRequest) => {
      if (req.auth?.type === 'api-key' && req.auth.apiKeyId) {
        return `apikey:${req.auth.apiKeyId}`;
      }
      const ip = req.connection?.remoteAddress || 
                 req.socket?.remoteAddress || 
                 'unknown';
      return `ip:${ip}`;
    },
    
    handler: (req: AuthenticatedRequest, res: Response) => {
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
    
    skip: (req: AuthenticatedRequest) => {
      // Skip para endpoints de lectura
      const method = req.method.toUpperCase();
      if (method === 'GET') {
        return true; // No limitar lecturas
      }
      return false;
    },
    
    validate: {
      xForwardedForHeader: false,
    },
  });
}

/**
 * Rate limiter estricto para endpoints sensibles
 */
export function createStrictNotificationRateLimit(options: NotificationRateLimitOptions = {}) {
  return createNotificationRateLimit({
    windowMs: 60 * 1000,
    max: 10, // Muy restrictivo
    maxPerApiKey: 100,
    message: 'Rate limit exceeded for this endpoint',
    ...options,
  });
}

/**
 * Rate limiter permisivo para invoice/batch
 */
export function createBatchNotificationRateLimit(options: NotificationRateLimitOptions = {}) {
  return createNotificationRateLimit({
    windowMs: 60 * 1000,
    max: 50,
    maxPerApiKey: 500,
    message: 'Too many batch notifications',
    ...options,
  });
}
