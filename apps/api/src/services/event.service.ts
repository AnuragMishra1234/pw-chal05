import {
  EventDetails,
  EventFilterOptions,
  getTemplateById,
  getModulesForTemplate
} from '@celebration/shared';
import { eventRepository } from '../repositories/event.repository.js';
import { budgetRepository } from '../repositories/budget.repository.js';
import { taskRepository } from '../repositories/task.repository.js';
import { expenseRepository } from '../repositories/expense.repository.js';

export class EventService {
  async listEvents(ownerId: string, filters?: EventFilterOptions): Promise<EventDetails[]> {
    return eventRepository.list(ownerId, filters);
  }

  async getEventById(id: string): Promise<EventDetails | null> {
    return eventRepository.findById(id);
  }

  async createEvent(ownerId: string, input: any): Promise<EventDetails> {
    const id = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const activeModules = getModulesForTemplate(input.templateId);

    const event: EventDetails = {
      ...input,
      id,
      ownerId,
      activeModules,
      status: 'active',
      createdAt: now,
      updatedAt: now
    };

    const savedEvent = await eventRepository.create(event);

    // Initialize default budget allocations from template guidance
    const template = getTemplateById(input.templateId);
    const guidance = template?.planningRules.budgetAllocationGuidance || {
      'Primary Operations': 60,
      'Hospitality & Catering': 25,
      'Contingency Reserve': 15
    };

    const categoryAllocations = Object.entries(guidance).map(([category, percentage]) => ({
      category,
      percentage,
      allocatedMinorUnits: Math.round(input.budgetLimitMinorUnits * (percentage / 100)),
      actualSpentMinorUnits: 0
    }));

    await budgetRepository.create({
      id: `bdg-${id}`,
      eventId: id,
      currency: input.currency,
      totalLimitMinorUnits: input.budgetLimitMinorUnits,
      allocatedMinorUnits: categoryAllocations.reduce((acc, c) => acc + c.allocatedMinorUnits, 0),
      contingencyMinorUnits: Math.round(input.budgetLimitMinorUnits * 0.1),
      categoryAllocations,
      updatedAt: now
    });

    // Initialize suggested tasks from template
    if (template?.suggestedTasks) {
      const eventTimestamp = new Date(input.startDate).getTime();
      for (let i = 0; i < template.suggestedTasks.length; i++) {
        const st = template.suggestedTasks[i];
        const dueAt = new Date(eventTimestamp - st.daysBeforeEvent * 24 * 60 * 60 * 1000).toISOString();
        await taskRepository.create({
          id: `tsk-${id}-${i + 1}`,
          eventId: id,
          title: st.title,
          category: st.category,
          status: 'pending',
          priority: st.priority,
          dueAt,
          dependencyTaskIds: [],
          source: 'template',
          createdAt: now,
          updatedAt: now
        });
      }
    }

    return savedEvent;
  }

  async updateEvent(id: string, updates: Partial<EventDetails>): Promise<EventDetails | null> {
    return eventRepository.update(id, updates);
  }

  async archiveEvent(id: string): Promise<boolean> {
    const updated = await eventRepository.update(id, { status: 'archived' });
    return !!updated;
  }

  async deleteEvent(id: string): Promise<boolean> {
    await taskRepository.deleteByEvent(id);
    await budgetRepository.deleteByEventId(id);
    await expenseRepository.deleteByEvent(id);
    return eventRepository.delete(id);
  }
}

export const eventService = new EventService();
