import { Task } from '@celebration/shared';
import { taskRepository } from '../repositories/task.repository.js';

export class TaskService {
  async listTasks(eventId: string): Promise<Task[]> {
    return taskRepository.listByEvent(eventId);
  }

  async getTaskById(taskId: string): Promise<Task | null> {
    return taskRepository.findById(taskId);
  }

  async createTask(eventId: string, input: any): Promise<Task> {
    const id = `tsk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const task: Task = {
      ...input,
      id,
      eventId,
      status: input.status || 'pending',
      priority: input.priority || 'medium',
      dependencyTaskIds: input.dependencyTaskIds || [],
      source: input.source || 'user',
      createdAt: now,
      updatedAt: now
    };

    return taskRepository.create(task);
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
    return taskRepository.update(taskId, updates);
  }

  async deleteTask(taskId: string): Promise<boolean> {
    return taskRepository.delete(taskId);
  }
}

export const taskService = new TaskService();
