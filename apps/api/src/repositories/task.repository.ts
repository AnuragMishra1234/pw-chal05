import { Task } from '@celebration/shared';
import { TaskModel } from '../models/Task.model.js';
import { database } from '../config/database.js';

export interface ITaskRepository {
  listByEvent(eventId: string): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  create(task: Task): Promise<Task>;
  update(id: string, updates: Partial<Task>): Promise<Task | null>;
  delete(id: string): Promise<boolean>;
  deleteByEvent(eventId: string): Promise<number>;
  countPending(eventId?: string): Promise<number>;
  countCompleted(eventId?: string): Promise<number>;
}

const MEMORY_TASKS: Map<string, Task> = new Map([
  [
    'tsk-w-01',
    {
      id: 'tsk-w-01',
      eventId: 'evt-wedding-01',
      title: 'Confirm Palace Venue Booking & Pay Deposit',
      category: 'Venue & Logistics',
      description: 'Ensure banquet hall and lawn availability for Feb 14-16.',
      status: 'completed',
      priority: 'critical',
      dueAt: '2026-11-15T00:00:00.000Z',
      estimatedDurationMinutes: 120,
      dependencyTaskIds: [],
      assigneeName: 'Kabir & Ananya',
      source: 'template',
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-20T10:00:00.000Z'
    }
  ],
  [
    'tsk-w-02',
    {
      id: 'tsk-w-02',
      eventId: 'evt-wedding-01',
      title: 'Select & Finalize Multi-Cuisine Catering Menu',
      category: 'Catering & Bar',
      description: 'Organize tasting session for live counter and dinner menus.',
      status: 'in_progress',
      priority: 'high',
      dueAt: '2026-12-05T00:00:00.000Z',
      estimatedDurationMinutes: 180,
      dependencyTaskIds: ['tsk-w-01'],
      assigneeName: 'Ananya',
      source: 'template',
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-22T10:00:00.000Z'
    }
  ]
]);

export class TaskRepository implements ITaskRepository {
  async listByEvent(eventId: string): Promise<Task[]> {
    if (database.isConnected()) {
      const docs = await TaskModel.find({ eventId }).sort({ createdAt: -1 }).lean();
      return docs.map(d => ({ ...d, id: d._id }));
    }
    return Array.from(MEMORY_TASKS.values()).filter(t => t.eventId === eventId);
  }

  async findById(id: string): Promise<Task | null> {
    if (database.isConnected()) {
      const doc = await TaskModel.findById(id).lean();
      return doc ? { ...doc, id: doc._id } : null;
    }
    return MEMORY_TASKS.get(id) || null;
  }

  async create(task: Task): Promise<Task> {
    if (database.isConnected()) {
      const created = await TaskModel.create({
        ...task,
        _id: task.id
      });
      return { ...created.toObject(), id: created._id };
    }
    MEMORY_TASKS.set(task.id, task);
    return task;
  }

  async update(id: string, updates: Partial<Task>): Promise<Task | null> {
    if (database.isConnected()) {
      const updated = await TaskModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date().toISOString() },
        { new: true, runValidators: true }
      ).lean();
      return updated ? { ...updated, id: updated._id } : null;
    }

    const existing = MEMORY_TASKS.get(id);
    if (!existing) return null;

    const modified: Task = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    MEMORY_TASKS.set(id, modified);
    return modified;
  }

  async delete(id: string): Promise<boolean> {
    if (database.isConnected()) {
      const res = await TaskModel.findByIdAndDelete(id);
      return !!res;
    }
    return MEMORY_TASKS.delete(id);
  }

  async deleteByEvent(eventId: string): Promise<number> {
    if (database.isConnected()) {
      const res = await TaskModel.deleteMany({ eventId });
      return res.deletedCount || 0;
    }
    let count = 0;
    for (const [id, t] of MEMORY_TASKS.entries()) {
      if (t.eventId === eventId) {
        MEMORY_TASKS.delete(id);
        count++;
      }
    }
    return count;
  }

  async countPending(eventId?: string): Promise<number> {
    if (database.isConnected()) {
      const query: any = { status: { $in: ['pending', 'in_progress', 'blocked'] } };
      if (eventId) query.eventId = eventId;
      return TaskModel.countDocuments(query);
    }
    return Array.from(MEMORY_TASKS.values()).filter(
      t => (!eventId || t.eventId === eventId) && (t.status === 'pending' || t.status === 'in_progress' || t.status === 'blocked')
    ).length;
  }

  async countCompleted(eventId?: string): Promise<number> {
    if (database.isConnected()) {
      const query: any = { status: 'completed' };
      if (eventId) query.eventId = eventId;
      return TaskModel.countDocuments(query);
    }
    return Array.from(MEMORY_TASKS.values()).filter(
      t => (!eventId || t.eventId === eventId) && t.status === 'completed'
    ).length;
  }
}

export const taskRepository = new TaskRepository();
