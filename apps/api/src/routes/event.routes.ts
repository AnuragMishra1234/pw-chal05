import { Router } from 'express';
import {
  CreateEventSchema,
  UpdateEventSchema,
  CreateTaskSchema,
  UpdateTaskSchema,
  CreateExpenseSchema,
  GeneratePlanRequestSchema,
  RevisePlanRequestSchema
} from '@celebration/shared';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireEventAccess } from '../middleware/authorization.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { aiGenerationRateLimiter } from '../middleware/rate-limiter.middleware.js';

import {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  archiveEvent,
  deleteEvent
} from '../controllers/event.controller.js';

import {
  listTasks,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/task.controller.js';

import {
  getBudget,
  updateBudget
} from '../controllers/budget.controller.js';

import {
  listExpenses,
  createExpense,
  deleteExpense
} from '../controllers/expense.controller.js';

import {
  listPlans,
  getPlan,
  getLatestPlan,
  createPlanVersion,
  generatePlan,
  revisePlan
} from '../controllers/plan.controller.js';

export const eventRouter = Router();

// All event operations require authentication
eventRouter.use(authenticate);

// Event CRUD
eventRouter.get('/', listEvents);
eventRouter.post('/', validateBody(CreateEventSchema), createEvent);

eventRouter.get('/:id', requireEventAccess, getEvent);
eventRouter.patch('/:id', requireEventAccess, validateBody(UpdateEventSchema), updateEvent);
eventRouter.delete('/:id', requireEventAccess, deleteEvent);
eventRouter.post('/:id/archive', requireEventAccess, archiveEvent);

// Nested Tasks
eventRouter.get('/:id/tasks', requireEventAccess, listTasks);
eventRouter.post('/:id/tasks', requireEventAccess, validateBody(CreateTaskSchema), createTask);
eventRouter.patch('/:id/tasks/:taskId', requireEventAccess, validateBody(UpdateTaskSchema), updateTask);
eventRouter.delete('/:id/tasks/:taskId', requireEventAccess, deleteTask);

// Nested Budget
eventRouter.get('/:id/budget', requireEventAccess, getBudget);
eventRouter.patch('/:id/budget', requireEventAccess, updateBudget);

// Nested Expenses
eventRouter.get('/:id/expenses', requireEventAccess, listExpenses);
eventRouter.post('/:id/expenses', requireEventAccess, validateBody(CreateExpenseSchema), createExpense);
eventRouter.delete('/:id/expenses/:expenseId', requireEventAccess, deleteExpense);

// Nested Plans & GenAI Planning Engine
eventRouter.get('/:id/plans', requireEventAccess, listPlans);
eventRouter.get('/:id/plans/latest', requireEventAccess, getLatestPlan);
eventRouter.get('/:id/plans/:planId', requireEventAccess, getPlan);
eventRouter.post('/:id/plans', requireEventAccess, createPlanVersion);
eventRouter.post('/:id/plan/generate', requireEventAccess, aiGenerationRateLimiter, validateBody(GeneratePlanRequestSchema), generatePlan);
eventRouter.post('/:id/plans/generate', requireEventAccess, aiGenerationRateLimiter, validateBody(GeneratePlanRequestSchema), generatePlan);
eventRouter.post('/:id/plan/revise', requireEventAccess, aiGenerationRateLimiter, validateBody(RevisePlanRequestSchema), revisePlan);
eventRouter.post('/:id/plans/revise', requireEventAccess, aiGenerationRateLimiter, validateBody(RevisePlanRequestSchema), revisePlan);
eventRouter.post('/:id/plans/:planId/revise', requireEventAccess, aiGenerationRateLimiter, validateBody(RevisePlanRequestSchema), revisePlan);
