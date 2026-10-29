import express, { Express } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.middleware.js';

export const createApp = (): Express => {
  const app = express();

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

  // JSON Body Parser
  app.use(express.json());

  // Mount API v1 router
  app.use('/api/v1', apiRouter);

  // Catch-all 404 Handler
  app.use(notFoundHandler);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};
