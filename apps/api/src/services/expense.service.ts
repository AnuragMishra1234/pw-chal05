import { Expense } from '@celebration/shared';
import { expenseRepository } from '../repositories/expense.repository.js';
import { budgetRepository } from '../repositories/budget.repository.js';

export class ExpenseService {
  async listExpenses(eventId: string): Promise<Expense[]> {
    return expenseRepository.listByEvent(eventId);
  }

  async createExpense(eventId: string, input: any): Promise<Expense> {
    const id = `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const expense: Expense = {
      ...input,
      id,
      eventId,
      status: input.status || 'actual',
      createdAt: now
    };

    const saved = await expenseRepository.create(expense);

    // Update actual spent in matching category of budget if present
    const budget = await budgetRepository.findByEventId(eventId);
    if (budget && budget.categoryAllocations) {
      const cat = budget.categoryAllocations.find(c => c.category === input.category);
      if (cat) {
        cat.actualSpentMinorUnits = (cat.actualSpentMinorUnits || 0) + input.amountMinorUnits;
        await budgetRepository.update(eventId, {
          categoryAllocations: budget.categoryAllocations
        });
      }
    }

    return saved;
  }

  async deleteExpense(id: string): Promise<boolean> {
    return expenseRepository.delete(id);
  }
}

export const expenseService = new ExpenseService();
