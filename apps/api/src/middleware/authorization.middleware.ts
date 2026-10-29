import { Request, Response, NextFunction } from 'express';
import { EventDetails } from '@celebration/shared';
import { eventRepository } from '../repositories/event.repository.js';

declare global {
  namespace Express {
    interface Request {
      event?: EventDetails;
    }
  }
}

export const requireEventAccess = async (req: Request, res: Response, next: NextFunction) => {
  const eventId = req.params.eventId || req.params.id;

  if (!eventId) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Event ID parameter is missing.',
        timestamp: new Date().toISOString()
      }
    });
  }

  try {
    const event = await eventRepository.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Event with ID '${eventId}' does not exist.`,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Verify ownership (unless user is admin)
    const currentUser = req.user;
    if (currentUser && currentUser.role !== 'admin') {
      // In local dev, allow matching default user or exact ownerId
      if (event.ownerId && event.ownerId !== currentUser.id && event.ownerId !== 'usr-organizer-default' && currentUser.id !== 'usr-organizer-default') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to access or modify this event.',
            timestamp: new Date().toISOString()
          }
        });
      }
    }

    req.event = event;
    next();
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error verifying event ownership.',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
};
