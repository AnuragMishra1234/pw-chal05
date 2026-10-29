import { z } from 'zod';

export const EventTypeSchema = z.enum([
  'wedding',
  'birthday',
  'college_hackathon',
  'community_event',
  'corporate_conference',
  'custom'
]);

export const CurrencyCodeSchema = z.enum(['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD']);

export const EventStatusSchema = z.enum(['draft', 'active', 'completed', 'archived']);
export const TaskStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'blocked']);
export const TaskPrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);
export const TaskSourceSchema = z.enum(['template', 'ai', 'user']);
export const ExpenseStatusSchema = z.enum(['estimate', 'quotation', 'actual']);

export const EventLocationSchema = z.object({
  type: z.enum(['physical', 'virtual', 'hybrid']),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  virtualUrl: z.string().url().optional()
});

export const CreateEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  eventType: EventTypeSchema,
  templateId: z.string().min(1, 'Template ID is required'),
  templateVersion: z.string().default('1.0.0'),
  description: z.string().max(1000).optional(),
  startDate: z.string().datetime({ message: 'Start date must be a valid ISO-8601 string' }),
  endDate: z.string().datetime({ message: 'End date must be a valid ISO-8601 string' }).optional(),
  timezone: z.string().default('Asia/Kolkata'),
  location: EventLocationSchema,
  currency: CurrencyCodeSchema.default('INR'),
  budgetLimitMinorUnits: z.number().int().positive('Budget must be a positive integer in minor units'),
  expectedAttendance: z.number().int().positive('Expected attendance must be at least 1'),
  preferences: z.record(z.any()).default({}),
  customPrompt: z.string().max(2000).optional()
});

export const UpdateEventSchema = CreateEventSchema.partial();

export const CreateTaskSchema = z.object({
  title: z.string().min(3, 'Task title must be at least 3 characters').max(200),
  category: z.string().min(2, 'Category is required').max(100),
  description: z.string().max(1000).optional(),
  status: TaskStatusSchema.default('pending'),
  priority: TaskPrioritySchema.default('medium'),
  dueAt: z.string().datetime().optional(),
  estimatedDurationMinutes: z.number().int().positive().optional(),
  dependencyTaskIds: z.array(z.string()).default([]),
  assigneeName: z.string().optional(),
  source: TaskSourceSchema.default('user')
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

export const CreateExpenseSchema = z.object({
  category: z.string().min(2).max(100),
  amountMinorUnits: z.number().int().positive('Expense amount must be a positive integer in minor units'),
  currency: CurrencyCodeSchema,
  status: ExpenseStatusSchema,
  vendorName: z.string().max(100).optional(),
  paymentDate: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
  receiptUrl: z.string().url().optional()
});

export const RawAIPlanSchema = z.object({
  summary: z.string().min(20).max(1000),
  themeAndConcept: z.object({
    themeName: z.string(),
    description: z.string(),
    recommendedColorPalette: z.array(z.string()).optional()
  }).optional(),
  assumptions: z.array(z.string()).min(1),
  warnings: z.array(z.string()),
  budgetProposal: z.object({
    suggestedContingencyPercentage: z.number().min(0).max(50),
    categories: z.array(z.object({
      categoryName: z.string(),
      percentageOfBudget: z.number().min(0).max(100),
      reasoning: z.string(),
      savingTips: z.array(z.string()).optional()
    })).min(1)
  }),
  tasks: z.array(z.object({
    title: z.string().min(3),
    category: z.string(),
    description: z.string(),
    priority: TaskPrioritySchema,
    daysBeforeEvent: z.number(),
    estimatedDurationMinutes: z.number().optional(),
    suggestedAssigneeRole: z.string().optional()
  })).min(1),
  timelineMilestones: z.array(z.object({
    milestoneName: z.string(),
    daysBeforeEvent: z.number(),
    description: z.string()
  })),
  eventDaySchedule: z.array(z.object({
    timeOffsetHours: z.number(),
    activityTitle: z.string(),
    locationOrZone: z.string().optional(),
    leadRole: z.string().optional()
  })),
  templateSpecificModules: z.record(z.any()).optional(),
  recommendations: z.array(z.string())
});

export const GeneratePlanRequestSchema = z.object({
  userGuidance: z.string().max(2000).optional(),
  temperature: z.number().min(0).max(1).optional(),
  provider: z.enum(['gemini', 'groq', 'mock']).optional()
});

export const RevisePlanRequestSchema = z.object({
  revisionInstructions: z.string().min(3, 'Revision instructions must be at least 3 characters').max(2000),
  planId: z.string().optional()
});

export const EventTemplateSchema = z.object({
  id: z.string(),
  version: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  icon: z.string(),
  requiredFields: z.array(z.string()),
  optionalFields: z.array(z.string()),
  customFields: z.array(z.object({
    name: z.string(),
    label: z.string(),
    type: z.enum(['text', 'number', 'select', 'multiselect', 'boolean', 'date']),
    required: z.boolean(),
    defaultValue: z.any().optional(),
    options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
    helperText: z.string().optional()
  })),
  defaultModules: z.array(z.string()),
  taskCategories: z.array(z.string()),
  suggestedTasks: z.array(z.object({
    title: z.string(),
    category: z.string(),
    daysBeforeEvent: z.number(),
    priority: TaskPrioritySchema
  })),
  planningRules: z.object({
    recommendedLeadTimeDays: z.number(),
    budgetAllocationGuidance: z.record(z.number())
  }),
  outputSections: z.array(z.string())
});
