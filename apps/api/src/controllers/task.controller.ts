import { Request, Response } from 'express';
import { taskService } from '../services/task.service.js';

export const listTasks = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id || req.params.eventId;
    const tasks = await taskService.listTasks(eventId);

    res.status(200).json({
      success: true,
      data: tasks,
      meta: {
        total: tasks.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve tasks.',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id || req.params.eventId;
    const task = await taskService.createTask(eventId, req.body);

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create task.',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const updated = await taskService.updateTask(taskId, req.body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Task '${taskId}' was not found.`,
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
        message: 'Failed to update task.',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const deleted = await taskService.deleteTask(taskId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Task '${taskId}' was not found to delete.`,
          timestamp: new Date().toISOString()
        }
      });
    }

    res.status(200).json({
      success: true,
      data: { taskId, deleted: true }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete task.',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
};
