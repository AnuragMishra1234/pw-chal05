import { Request, Response } from 'express';
import { eventService } from '../services/event.service.js';

export const listEvents = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user?.id || 'usr-organizer-default';
    const { status, eventType, search } = req.query;

    const filters = {
      status: status as any,
      eventType: eventType as any,
      search: search as string | undefined
    };

    const events = await eventService.listEvents(ownerId, filters);
    res.status(200).json({
      success: true,
      data: events,
      meta: {
        total: events.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve events.',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
};

export const getEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await eventService.getEventById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Event '${id}' was not found.`,
          timestamp: new Date().toISOString()
        }
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve event.',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user?.id || 'usr-organizer-default';
    const event = await eventService.createEvent(ownerId, req.body);

    res.status(201).json({
      success: true,
      data: event,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create event.',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await eventService.updateEvent(id, req.body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Event '${id}' was not found to update.`,
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
        message: 'Failed to update event.',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
};

export const archiveEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const archived = await eventService.archiveEvent(id);

    if (!archived) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Event '${id}' was not found to archive.`,
          timestamp: new Date().toISOString()
        }
      });
    }

    res.status(200).json({
      success: true,
      data: { id, status: 'archived' }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to archive event.',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await eventService.deleteEvent(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Event '${id}' was not found to delete.`,
          timestamp: new Date().toISOString()
        }
      });
    }

    res.status(200).json({
      success: true,
      data: { id, deleted: true }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete event.',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
};
