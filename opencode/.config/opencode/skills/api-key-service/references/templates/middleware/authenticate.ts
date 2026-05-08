/**
 * Authentication Middleware
 * 
 * Middleware de autenticación dual que soporta:
 * - API Keys (header X-Api-Key)
 * - JWT (header Authorization: Bearer <token>)
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiKeyService } from '../ApiKeyService';

/**
 * Configuración del middleware
 */
export interface AuthMiddlewareConfig {
  /** Instancia del ApiKeyService */
  apiKeyService: ApiKeyService;
  
  /** Secreto JWT para validación */
  jwtSecret: string;
  
  /** Logger opcional */
  logger?: {
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
  };
}

/**
 * Tipo para Request autenticado
 */
export interface AuthenticatedRequest extends Request {
  auth?: {
    type: 'api-key' | 'jwt';
    [key: string]: any;
  };
  // Backward compatibility
  user?: any;
  userId?: string;
}

/**
 * Crea el middleware de autenticación dual
 */
export function createAuthenticateMiddleware(config: AuthMiddlewareConfig) {
  const { apiKeyService, jwtSecret, logger } = config;

  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const apiKeyHeader = req.headers['x-api-key'] as string;
      const authHeader = req.headers.authorization;

      // 1. Intentar API Key primero
      if (apiKeyHeader) {
        return await handleApiKeyAuth(apiKeyHeader, req, res, next);
      }

      // 2. Intentar JWT
      if (authHeader && authHeader.startsWith('Bearer ')) {
        return handleJwtAuth(authHeader, req, res, next);
      }

      // 3. Sin credenciales - continuar (endpoint puede ser público o requerir auth)
      return next();

    } catch (error) {
      logger?.error('Authentication error', { error, path: req.path });
      return res.status(500).json({
        success: false,
        message: 'Authentication error',
      });
    }
  };

  /**
   * Maneja autenticación por API Key
   */
  async function handleApiKeyAuth(
    apiKey: string,
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    const clientIp = req.connection?.remoteAddress || req.socket?.remoteAddress;
    
    const result = await apiKeyService.validate(apiKey, clientIp);

    if (!result.valid) {
      logger?.warn('Invalid API Key attempt', {
        ip: clientIp,
        path: req.path,
        reason: result.reason,
      });

      return res.status(401).json({
        success: false,
        message: result.reason || 'Invalid API Key',
      });
    }

    // Attach auth context
    req.auth = result.authContext;

    logger?.info('API Key authentication successful', {
      keyId: result.authContext?.apiKeyId,
      name: result.authContext?.name,
      path: req.path,
    });

    return next();
  }

  /**
   * Maneja autenticación JWT
   */
  function handleJwtAuth(
    authHeader: string,
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token not provided',
      });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as any;

      // Attach auth context
      req.auth = {
        type: 'jwt',
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions || [],
      };

      // Backward compatibility
      req.user = decoded;
      req.userId = decoded.userId;

      logger?.info('JWT authentication successful', {
        userId: decoded.userId,
        path: req.path,
      });

      return next();

    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          success: false,
          message: 'Token expired',
        });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token',
        });
      }

      logger?.error('JWT verification error', { error });
      return res.status(401).json({
        success: false,
        message: 'Token verification failed',
      });
    }
  }
}

/**
 * Middleware que requiere autenticación
 * 
 * Si no hay req.auth, retorna 401
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.auth) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }
  next();
}

/**
 * Middleware que requiere autenticación JWT específicamente
 * 
 * Útil para endpoints de admin que no deben ser accedidos por API Keys
 */
export function requireJwtAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.auth) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (req.auth.type !== 'jwt') {
    return res.status(403).json({
      success: false,
      message: 'JWT authentication required',
    });
  }

  next();
}

/**
 * Middleware que requiere autenticación API Key específicamente
 * 
 * Útil para endpoints de servicios que solo deben usar API Keys
 */
export function requireApiKeyAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.auth) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (req.auth.type !== 'api-key') {
    return res.status(403).json({
      success: false,
      message: 'API Key authentication required',
    });
  }

  next();
}
