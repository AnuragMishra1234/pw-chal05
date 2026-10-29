import { Plan } from '@celebration/shared';
import { planRepository } from '../repositories/plan.repository.js';

export class PlanService {
  async listPlans(eventId: string): Promise<Plan[]> {
    return planRepository.listByEvent(eventId);
  }

  async getPlanById(planId: string): Promise<Plan | null> {
    return planRepository.findById(planId);
  }

  async getLatestPlan(eventId: string): Promise<Plan | null> {
    return planRepository.findLatestByEvent(eventId);
  }

  async savePlanVersion(eventId: string, planData: Omit<Plan, 'id' | 'createdAt'>): Promise<Plan> {
    const id = `pln-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    // Archive any currently active plans for this event
    const currentActive = await planRepository.findLatestByEvent(eventId);
    if (currentActive) {
      await planRepository.updateStatus(currentActive.id, 'superseded');
    }

    const plan: Plan = {
      ...planData,
      id,
      eventId,
      status: 'active',
      createdAt: now
    };

    return planRepository.create(plan);
  }
}

export const planService = new PlanService();
