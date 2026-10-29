import { Request, Response } from 'express';
import { statsService } from '../services/stats.service.js';

export const getStats = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user?.id || 'usr-organizer-default';
    const stats = await statsService.getDashboardStats(ownerId);
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to aggregate dashboard statistics.',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
};
