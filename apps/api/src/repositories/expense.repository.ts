import { Expense } from '@celebration/shared';
import { ExpenseModel } from '../models/Expense.model.js';
import { database } from '../config/database.js';

export interface IExpenseRepository {
  listByEvent(eventId: string): Promise<Expense[]>;
  findById(id: string): Promise<Expense | null>;
  create(expense: Expense): Promise<Expense>;
  delete(id: string): Promise<boolean>;
  deleteByEvent(eventId: string): Promise<number>;
}

const MEMORY_EXPENSES: Map<string, Expense> = new Map([
  [
    'exp-w-01',
    {
      id: 'exp-w-01',
      eventId: 'evt-wedding-01',
      category: 'Venue & Staging',
      amountMinorUnits: 50000000,
      currency: 'INR',
      status: 'actual',
      vendorName: 'Lakeside Palace Estate',
      paymentDate: '2026-10-18T14:00:00.000Z',
      notes: 'Initial venue lock advance deposit (cheque #4019)',
      createdAt: '2026-10-18T14:00:00.000Z'
    }
  ]
]);

export class ExpenseRepository implements IExpenseRepository {
  async listByEvent(eventId: string): Promise<Expense[]>;
  async listByEvent(eventId: string): Promise<Expense[]> {
    if (database.isConnected()) {
      const docs = await ExpenseModel.find({ eventId }).sort({ createdAt: -1 }).lean();
      return docs.map(d => ({ ...d, id: d._id }));
    }
    return Array.from(MEMORY_EXPENSES.values()).filter(e => e.eventId === eventId);
  }

  async findById(id: string): Promise<Expense | null> {
    if (database.isConnected()) {
      const doc = await ExpenseModel.findById(id).lean();
      return doc ? { ...doc, id: doc._id } : null;
    }
    return MEMORY_EXPENSES.get(id) || null;
  }

  async create(expense: Expense): Promise<Expense> {
    if (database.isConnected()) {
      const created = await ExpenseModel.create({
        ...expense,
        _id: expense.id
      });
      return { ...created.toObject(), id: created._id };
    }
    MEMORY_EXPENSES.set(expense.id, expense);
    return expense;
  }

  async delete(id: string): Promise<boolean> {
    if (database.isConnected()) {
      const res = await ExpenseModel.findByIdAndDelete(id);
      return !!res;
    }
    return MEMORY_EXPENSES.delete(id);
  }

  async deleteByEvent(eventId: string): Promise<number> {
    if (database.isConnected()) {
      const res = await ExpenseModel.deleteMany({ eventId });
      return res.deletedCount || 0;
    }
    let count = 0;
    for (const [id, exp] of MEMORY_EXPENSES.entries()) {
      if (exp.eventId === eventId) {
        MEMORY_EXPENSES.delete(id);
        count++;
      }
    }
    return count;
  }
}

export const expenseRepository = new ExpenseRepository();
