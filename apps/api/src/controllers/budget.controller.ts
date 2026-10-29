import { Request, Response } from 'express';
import { budgetService } from '../services/budget.service.js';

export const getBudget = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id || req.params.eventId;
    const budget = await budgetService.getBudget(eventId);

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Budget for event '${eventId}' was not found.`,
          timestamp: new Date().toISOString()
        }
      });
    }

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve event budget.',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
};

export const updateBudget = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id || req.params.eventId;
    const updated = await budgetService.updateBudget(eventId, req.body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Budget for event '${eventId}' was not found to update.`,
          timestamp: new Date().toISOString()
        }
      });
    }

    res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update event budget.',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
};
