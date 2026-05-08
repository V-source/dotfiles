/**
 * API Key Service - Exports
 * 
 * Punto de entrada principal para importar del servicio de API Keys.
 */

// Core
export { ApiKeyService, ApiKeyServiceConfig, CreateResult, ValidationResult } from './ApiKeyService';
export * from './adapters/BaseAdapter';

// Adapters
export { MongoAdapter } from './adapters/MongoAdapter';
export { PostgresAdapter } from './adapters/PostgresAdapter';
export { MemoryAdapter } from './adapters/MemoryAdapter';

// Middleware
export {
  createAuthenticateMiddleware,
  AuthMiddlewareConfig,
  AuthenticatedRequest,
  requireAuth,
  requireJwtAuth,
  requireApiKeyAuth,
} from './middleware/authenticate';

export {
  requireScopes,
  requireAnyScope,
  requireRole,
} from './middleware/requireScopes';

export {
  createApiKeyRateLimit,
  createStrictRateLimit,
  createInvoiceRateLimit,
  createCustomRateLimit,
} from './middleware/rateLimit';

/**
 * Ejemplo de uso:
 * 
 * ```typescript
 * import { ApiKeyService, MongoAdapter } from './api-keys';
 * import express from 'express';
 * 
 * const app = express();
 * 
 * // Configurar servicio
 * const apiKeyService = new ApiKeyService({
 *   adapter: new MongoAdapter(mongoose.connection),
 *   logger: console,
 * });
 * 
 * // Middleware de autenticación
 * app.use(createAuthMiddleware({
 *   apiKeyService,
 *   jwtSecret: process.env.JWT_SECRET!,
 * }));
 * 
 * // Proteger endpoint
 * app.get('/api/data',
 *   requireScopes('read:data'),
 *   (req, res) => res.json({ data: '...' })
 * );
 * ```
 */
