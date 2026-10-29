import { Budget } from '@celebration/shared';
import { budgetRepository } from '../repositories/budget.repository.js';

export class BudgetService {
  async getBudget(eventId: string): Promise<Budget | null> {
    return budgetRepository.findByEventId(eventId);
  }

  async updateBudget(eventId: string, updates: Partial<Budget>): Promise<Budget | null> {
    const existing = await budgetRepository.findByEventId(eventId);
    if (!existing) return null;

    // Deterministic recalculation if allocations provided
    let allocatedMinorUnits = existing.allocatedMinorUnits;
    if (updates.categoryAllocations) {
      allocatedMinorUnits = updates.categoryAllocations.reduce(
        (sum, c) => sum + c.allocatedMinorUnits,
        0
      );
    }

    return budgetRepository.update(eventId, {
      ...updates,
      allocatedMinorUnits
    });
  }
}

export const budgetService = new BudgetService();
