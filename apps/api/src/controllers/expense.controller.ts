import { Request, Response } from 'express';
import { expenseService } from '../services/expense.service.js';

export const listExpenses = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id || req.params.eventId;
    const expenses = await expenseService.listExpenses(eventId);

    res.status(200).json({
      success: true,
      data: expenses,
      meta: {
        total: expenses.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve expenses.',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id || req.params.eventId;
    const expense = await expenseService.createExpense(eventId, req.body);

    res.status(201).json({
      success: true,
      data: expense
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to record expense.',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { expenseId } = req.params;
    const deleted = await expenseService.deleteExpense(expenseId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: `Expense '${expenseId}' was not found to delete.`,
          timestamp: new Date().toISOString()
        }
      });
    }

    res.status(200).json({
      success: true,
      data: { expenseId, deleted: true }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete expense.',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
};
