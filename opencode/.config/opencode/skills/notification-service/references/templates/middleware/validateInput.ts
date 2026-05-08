/**
 * Validation Middleware
 * 
 * Middleware para validar inputs de notificaciones.
 */

import { Request, Response, NextFunction } from 'express';

// ============================================
// Validation Schema
// ============================================

export interface NotificationValidationSchema {
  required?: string[];
  maxBatchSize?: number;
  maxDataSize?: number;
  allowedFields?: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// ============================================
// Validation Middleware Factory
// ============================================

export function createValidationMiddleware(schema: NotificationValidationSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = validate(req.body, schema);

    if (!result.valid) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: result.errors,
      });
      return;
    }

    next**
 * Val();
  };
}

/ida un payload de notificación
 */
export function validate(body: any, schema: NotificationValidationSchema): ValidationResult {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Invalid body'] };
  }

  // Verificar campos requeridos
  if (schema.required) {
    for (const field of schema.required) {
      if (!hasNestedProperty(body, field)) {
        errors.push(`Field '${field}' is required`);
      }
    }
  }

  // Verificar tamaño de batch
  if (schema.maxBatchSize && Array.isArray(body.notifications)) {
    if (body.notifications.length > schema.maxBatchSize) {
      errors.push(`Batch size exceeds maximum of ${schema.maxBatchSize}`);
    }
  }

  // Verificar tamaño de data
  if (schema.maxDataSize && body.data) {
    const dataSize = JSON.stringify(body.data).length;
    if (dataSize > schema.maxDataSize) {
      errors.push(`Data size exceeds maximum of ${schema.maxDataSize} bytes`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Verifica si existe una propiedad anidada
 */
function hasNestedProperty(obj: any, path: string): boolean {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return false;
    }
    current = current[key];
  }

  return current !== null && current !== undefined;
}

// ============================================
// Validation Schemas
// ============================================

export const singleNotificationSchema: NotificationValidationSchema = {
  required: ['title', 'body'],
  maxDataSize: 10000, // 10KB
};

export const batchNotificationSchema: NotificationValidationSchema = {
  required: ['notifications'],
  maxBatchSize: 10000,
};

export const massiveNotificationSchema: NotificationValidationSchema = {
  required: ['title', 'body'],
  maxDataSize: 10000,
};

export const invoiceNotificationSchema: NotificationValidationSchema = {
  required: ['data'],
  maxBatchSize: 10000,
};

export const csvNotificationSchema: NotificationValidationSchema = {
  required: ['data'],
  maxBatchSize: 5000,
};
