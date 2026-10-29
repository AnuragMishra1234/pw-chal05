import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectToDatabase } from './config/database.js';

const app = createApp();

async function startServer() {
  await connectToDatabase();

  app.listen(env.PORT, () => {
    console.log(`[celebration-api] Server running on http://localhost:${env.PORT}`);
    console.log(`[celebration-api] Environment: ${env.NODE_ENV}`);
    console.log(`[celebration-api] Health check: http://localhost:${env.PORT}/api/v1/health`);
    console.log(`[celebration-api] Templates: http://localhost:${env.PORT}/api/v1/templates`);
    console.log(`[celebration-api] Events API: http://localhost:${env.PORT}/api/v1/events`);
  });
}

startServer().catch((err) => {
  console.error('[celebration-api] Failed to start server:', err);
  process.exit(1);
});
