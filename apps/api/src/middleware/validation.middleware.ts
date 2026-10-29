import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'The request body failed schema validation.',
          details: result.error.errors.map(err => ({
            field: err.path.join('.'),
            issue: err.message
          })),
          timestamp: new Date().toISOString()
        }
      });
    }
    req.body = result.data;
    next();
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'The request query parameters failed validation.',
          details: result.error.errors.map(err => ({
            field: err.path.join('.'),
            issue: err.message
          })),
          timestamp: new Date().toISOString()
        }
      });
    }
    req.query = result.data;
    next();
  };
};
