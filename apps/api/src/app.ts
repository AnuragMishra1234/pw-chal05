import express, { Express } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.middleware.js';
import { securityHeadersMiddleware } from './middleware/security-headers.middleware.js';
import { generalApiRateLimiter } from './middleware/rate-limiter.middleware.js';

export const createApp = (): Express => {
  const app = express();

  // Apply Security Headers (CSP, HSTS, X-Frame-Options, nosniff, etc.)
  app.use(securityHeadersMiddleware);

  // Cross-Origin Resource Sharing
  const allowedOrigin = env.FRONTEND_ORIGIN;
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server) or matching origin
      if (!origin || origin === allowedOrigin || env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true
  }));

  // JSON Body Parser with 1MB payload ceiling
  app.use(express.json({ limit: '1mb' }));

  // General API Rate Limiting (100 req/min)
  app.use('/api/v1', generalApiRateLimiter);

  // Mount API v1 router
  app.use('/api/v1', apiRouter);

  // Catch-all 404 Handler
  app.use(notFoundHandler);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};
