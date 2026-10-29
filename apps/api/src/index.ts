import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectToDatabase, disconnectFromDatabase, database } from './config/database.js';

const app = createApp();

async function startServer() {
  const dbState = await connectToDatabase();

  if (env.NODE_ENV === 'production' && dbState !== 'connected') {
    throw new Error('FATAL: Refusing to start server in production without an active MongoDB connection.');
  }

  const server = app.listen(env.PORT, () => {
    console.log(`[celebration-api] Server running on http://localhost:${env.PORT}`);
    console.log(`[celebration-api] Environment: ${env.NODE_ENV}`);
    console.log(`[celebration-api] Database state: ${database.getState()}`);
    console.log(`[celebration-api] Health check: http://localhost:${env.PORT}/api/v1/health`);
    console.log(`[celebration-api] Templates: http://localhost:${env.PORT}/api/v1/templates`);
    console.log(`[celebration-api] Events API: http://localhost:${env.PORT}/api/v1/events`);
  });

  const gracefulShutdown = async (signal: string) => {
    console.log(`[celebration-api] Received ${signal}. Initiating graceful shutdown...`);
    server.close(async () => {
      await disconnectFromDatabase();
      console.log('[celebration-api] Server and database closed cleanly. Exiting.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('[celebration-api] Failed to start server:', err.message || err);
  process.exit(1);
});
