import { Request, Response } from 'express';
import { isConnectedToDatabase } from '../config/database.js';

export const getHealth = (_req: Request, res: Response) => {
  const dbConnected = isConnectedToDatabase();
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      service: 'celebration-api',
      version: '1.0.0',
      database: dbConnected ? 'connected' : 'in-memory',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    }
  });
};
