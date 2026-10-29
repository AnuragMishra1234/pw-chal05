import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error occurred.';
  const code = err.code || (statusCode === 404 ? 'RESOURCE_NOT_FOUND' : 'INTERNAL_SERVER_ERROR');

  // Log error without exposing secrets
  console.error(`[celebration-api] [ERROR] ${statusCode} ${code}: ${message}`);

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      timestamp: new Date().toISOString()
    }
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
      timestamp: new Date().toISOString()
    }
  });
};
