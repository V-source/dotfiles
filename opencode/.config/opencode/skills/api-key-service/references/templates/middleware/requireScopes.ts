/**
 * Require Scopes Middleware
 * 
 * Middleware para validar que el usuario/API Key tenga los scopes requeridos.
 * 
 * - API Keys: Deben tener TODOS los scopes requeridos
 * - JWT users: Pasan automáticamente (roles manejan acceso)
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authenticate';

/**
 * Logger opcional
 */
interface Logger {
  warn(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
}

/**
 * Crea el middleware de validación de scopes
 */
export function requireScopes(...requiredScopes: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Verificar autenticación
    if (!req.auth) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // JWT users: pasan automáticamente (roles manejan acceso)
    if (req.auth.type === 'jwt') {
      // Opcional: Verificar que JWT tenga rol admin para ciertos scopes
      // if (requiredScopes.some(scope => scope.startsWith('admin:')) && req.auth.role !== 'admin') {
      //   return res.status(403).json({ success: false, message: 'Admin role required' });
      // }
      return next();
    }

    // API Keys: validar que tenga TODOS los scopes requeridos
    if (req.auth.type === 'api-key') {
      const userScopes = req.auth.scopes || [];
      
      const hasAllScopes = requiredScopes.every(scope => 
        userScopes.includes(scope)
      );

      if (!hasAllScopes) {
        const logger: Logger | undefined = (req as any).app.get('logger');
        
        logger?.warn('Insufficient scopes', {
          apiKeyId: req.auth.apiKeyId,
          required: requiredScopes,
          has: userScopes,
          path: req.path,
        });

        return res.status(403).json({
          success: false,
          message: `Insufficient permissions. Required: ${requiredScopes.join(', ')}`,
        });
      }

      return next();
    }

    // Tipo de auth desconocido
    return res.status(403).json({
      success: false,
      message: 'Invalid authentication type',
    });
  };
}

/**
 * Crea middleware que requiere CUALQUIERA de los scopes (OR en lugar de AND)
 */
export function requireAnyScope(...scopes: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // JWT users: pasan automáticamente
    if (req.auth.type === 'jwt') {
      return next();
    }

    // API Keys: validar que tenga AL MENOS UNO de los scopes
    if (req.auth.type === 'api-key') {
      const userScopes = req.auth.scopes || [];
      
      const hasAnyScope = scopes.some(scope => 
        userScopes.includes(scope)
      );

      if (!hasAnyScope) {
        return res.status(403).json({
          success: false,
          message: `Permission denied. Requires at least one of: ${scopes.join(', ')}`,
        });
      }

      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Invalid authentication type',
    });
  };
}

/**
 * Crea middleware que requiere un rol específico (solo para JWT)
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // API Keys no tienen roles
    if (req.auth.type === 'api-key') {
      return res.status(403).json({
        success: false,
        message: 'Role-based access not available for API Keys',
      });
    }

    const userRole = req.auth.role;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
      });
    }

    next();
  };
}
