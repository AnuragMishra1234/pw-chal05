import { Plan } from '@celebration/shared';
import { PlanModel } from '../models/Plan.model.js';
import { database } from '../config/database.js';

export interface IPlanRepository {
  listByEvent(eventId: string): Promise<Plan[]>;
  findById(id: string): Promise<Plan | null>;
  findLatestByEvent(eventId: string): Promise<Plan | null>;
  create(plan: Plan): Promise<Plan>;
  updateStatus(id: string, status: 'active' | 'archived' | 'superseded'): Promise<Plan | null>;
}

const MEMORY_PLANS: Map<string, Plan> = new Map();

export class PlanRepository implements IPlanRepository {
  async listByEvent(eventId: string): Promise<Plan[]> {
    if (database.isConnected()) {
      const docs = await PlanModel.find({ eventId }).sort({ version: -1 }).lean();
      return docs.map(d => ({ ...d, id: d._id }));
    }
    return Array.from(MEMORY_PLANS.values()).filter(p => p.eventId === eventId);
  }

  async findById(id: string): Promise<Plan | null> {
    if (database.isConnected()) {
      const doc = await PlanModel.findById(id).lean();
      return doc ? { ...doc, id: doc._id } : null;
    }
    return MEMORY_PLANS.get(id) || null;
  }

  async findLatestByEvent(eventId: string): Promise<Plan | null> {
    if (database.isConnected()) {
      const doc = await PlanModel.findOne({ eventId, status: 'active' }).sort({ version: -1 }).lean();
      return doc ? { ...doc, id: doc._id } : null;
    }
    const plans = Array.from(MEMORY_PLANS.values())
      .filter(p => p.eventId === eventId && p.status === 'active')
      .sort((a, b) => b.version - a.version);
    return plans[0] || null;
  }

  async create(plan: Plan): Promise<Plan> {
    if (database.isConnected()) {
      const created = await PlanModel.create({
        ...plan,
        _id: plan.id
      });
      return { ...created.toObject(), id: created._id };
    }
    MEMORY_PLANS.set(plan.id, plan);
    return plan;
  }

  async updateStatus(id: string, status: 'active' | 'archived' | 'superseded'): Promise<Plan | null> {
    if (database.isConnected()) {
      const updated = await PlanModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
      return updated ? { ...updated, id: updated._id } : null;
    }
    const plan = MEMORY_PLANS.get(id);
    if (!plan) return null;
    plan.status = status;
    return plan;
  }
}

export const planRepository = new PlanRepository();
