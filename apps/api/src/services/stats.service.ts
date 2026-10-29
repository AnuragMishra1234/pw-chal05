import { DashboardStats } from '@celebration/shared';
import { eventRepository } from '../repositories/event.repository.js';
import { taskRepository } from '../repositories/task.repository.js';

export class StatsService {
  async getDashboardStats(ownerId: string): Promise<DashboardStats> {
    const events = await eventRepository.list(ownerId, { status: 'active' });
    const now = new Date().getTime();

    const upcomingEventsCount = events.filter(e => new Date(e.startDate).getTime() >= now).length;
    const pendingTasksCount = await taskRepository.countPending();
    const completedTasksCount = await taskRepository.countCompleted();

    const totalPlannedBudgetMinorUnits = events.reduce(
      (sum, e) => sum + (e.currency === 'INR' ? e.budgetLimitMinorUnits : 0),
      0
    );

    return {
      totalEvents: events.length,
      upcomingEventsCount,
      pendingTasksCount,
      completedTasksCount,
      totalPlannedBudgetMinorUnits,
      defaultCurrency: 'INR'
    };
  }
}

export const statsService = new StatsService();
