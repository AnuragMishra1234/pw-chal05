import { Budget } from '@celebration/shared';
import { BudgetModel } from '../models/Budget.model.js';
import { database } from '../config/database.js';

export interface IBudgetRepository {
  findByEventId(eventId: string): Promise<Budget | null>;
  create(budget: Budget): Promise<Budget>;
  update(eventId: string, budget: Partial<Budget>): Promise<Budget | null>;
  deleteByEventId(eventId: string): Promise<boolean>;
}

const MEMORY_BUDGETS: Map<string, Budget> = new Map([
  [
    'evt-wedding-01',
    {
      id: 'bdg-w-01',
      eventId: 'evt-wedding-01',
      currency: 'INR',
      totalLimitMinorUnits: 350000000,
      allocatedMinorUnits: 332500000,
      contingencyMinorUnits: 17500000,
      categoryAllocations: [
        { category: 'Venue & Staging', allocatedMinorUnits: 140000000, percentage: 40, actualSpentMinorUnits: 50000000 },
        { category: 'Catering & Beverages', allocatedMinorUnits: 105000000, percentage: 30, actualSpentMinorUnits: 25000000 },
        { category: 'Photography & Film', allocatedMinorUnits: 35000000, percentage: 10, actualSpentMinorUnits: 10000000 }
      ],
      updatedAt: '2026-10-20T12:00:00.000Z'
    }
  ]
]);

export class BudgetRepository implements IBudgetRepository {
  async findByEventId(eventId: string): Promise<Budget | null> {
    if (database.isConnected()) {
      const doc = await BudgetModel.findOne({ eventId }).lean();
      return doc ? { ...doc, id: doc._id } : null;
    }
    return MEMORY_BUDGETS.get(eventId) || null;
  }

  async create(budget: Budget): Promise<Budget> {
    if (database.isConnected()) {
      const created = await BudgetModel.create({
        ...budget,
        _id: budget.id
      });
      return { ...created.toObject(), id: created._id };
    }
    MEMORY_BUDGETS.set(budget.eventId, budget);
    return budget;
  }

  async update(eventId: string, updates: Partial<Budget>): Promise<Budget | null> {
    if (database.isConnected()) {
      const updated = await BudgetModel.findOneAndUpdate(
        { eventId },
        { ...updates, updatedAt: new Date().toISOString() },
        { new: true, runValidators: true }
      ).lean();
      return updated ? { ...updated, id: updated._id } : null;
    }

    const existing = MEMORY_BUDGETS.get(eventId);
    if (!existing) return null;

    const modified: Budget = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    MEMORY_BUDGETS.set(eventId, modified);
    return modified;
  }

  async deleteByEventId(eventId: string): Promise<boolean> {
    if (database.isConnected()) {
      const res = await BudgetModel.deleteOne({ eventId });
      return res.deletedCount > 0;
    }
    return MEMORY_BUDGETS.delete(eventId);
  }
}

export const budgetRepository = new BudgetRepository();
