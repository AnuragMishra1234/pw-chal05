/**
 * Canonical domain types for Celebration & Event Planner
 */

export type EventType =
  | 'wedding'
  | 'birthday'
  | 'college_hackathon'
  | 'community_event'
  | 'corporate_conference'
  | 'custom';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

export type EventStatus = 'draft' | 'active' | 'completed' | 'archived';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskSource = 'template' | 'ai' | 'user';

export type ModuleId =
  | 'overview'
  | 'budget'
  | 'timeline'
  | 'tasks'
  | 'recommendations'
  | 'reports'
  | 'guests'
  | 'vendors'
  | 'catering'
  | 'registrations'
  | 'teams'
  | 'judges'
  | 'speakers'
  | 'sessions'
  | 'volunteers'
  | 'sponsors'
  | 'equipment'
  | 'outreach'
  | 'impact_tracking';

export type ExpenseStatus = 'estimate' | 'quotation' | 'actual';

export interface EventLocation {
  type: 'physical' | 'virtual' | 'hybrid';
  address?: string;
  city?: string;
  country?: string;
  virtualUrl?: string;
}

export interface EventDetails {
  id: string;
  ownerId?: string;
  title: string;
  eventType: EventType;
  templateId: string;
  templateVersion: string;
  description?: string;
  startDate: string; // ISO-8601
  endDate?: string;
  timezone: string;
  location: EventLocation;
  currency: CurrencyCode;
  budgetLimitMinorUnits: number; // Stored as integer minor units (e.g. cents/paise)
  expectedAttendance: number;
  preferences: Record<string, any>;
  customPrompt?: string;
  activeModules: ModuleId[];
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateFieldOption {
  label: string;
  value: string;
}

export interface TemplateFieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'date';
  required: boolean;
  defaultValue?: any;
  options?: TemplateFieldOption[];
  helperText?: string;
}

export interface TemplateSuggestedTask {
  title: string;
  category: string;
  daysBeforeEvent: number;
  priority: TaskPriority;
}

export interface EventTemplate {
  id: string;
  version: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  requiredFields: string[];
  optionalFields: string[];
  customFields: TemplateFieldDefinition[];
  defaultModules: ModuleId[];
  taskCategories: string[];
  suggestedTasks: TemplateSuggestedTask[];
  planningRules: {
    recommendedLeadTimeDays: number;
    budgetAllocationGuidance: Record<string, number>;
  };
  outputSections: string[];
}

export interface Task {
  id: string;
  eventId: string;
  planId?: string;
  title: string;
  category: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt?: string;
  estimatedDurationMinutes?: number;
  dependencyTaskIds: string[];
  assigneeName?: string;
  source: TaskSource;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategoryAllocation {
  category: string;
  allocatedMinorUnits: number;
  percentage: number;
  actualSpentMinorUnits?: number;
}

export interface Budget {
  id: string;
  eventId: string;
  currency: CurrencyCode;
  totalLimitMinorUnits: number;
  allocatedMinorUnits: number;
  contingencyMinorUnits: number;
  categoryAllocations: BudgetCategoryAllocation[];
  updatedAt: string;
}

export interface BudgetSummary {
  totalLimitMinorUnits: number;
  totalAllocatedMinorUnits: number;
  totalSpentMinorUnits: number;
  remainingMinorUnits: number;
  varianceMinorUnits: number;
  isOverBudget: boolean;
  allocatedPercentage: number;
  spentPercentage: number;
  currency: CurrencyCode;
}

export interface Expense {
  id: string;
  eventId: string;
  category: string;
  amountMinorUnits: number;
  currency: CurrencyCode;
  status: ExpenseStatus;
  vendorName?: string;
  paymentDate?: string;
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface Plan {
  id: string;
  eventId: string;
  version: number;
  status: 'active' | 'archived' | 'superseded';
  previousPlanId?: string;
  summary: string;
  themeAndConcept?: {
    themeName: string;
    description: string;
    recommendedColorPalette?: string[];
  };
  assumptions: string[];
  warnings: string[];
  budgetProposal: {
    suggestedContingencyPercentage: number;
    categories: Array<{
      categoryName: string;
      percentageOfBudget: number;
      reasoning: string;
      savingTips?: string[];
    }>;
  };
  timelineMilestones: Array<{
    milestoneName: string;
    daysBeforeEvent: number;
    description: string;
  }>;
  eventDaySchedule: Array<{
    timeOffsetHours: number;
    activityTitle: string;
    locationOrZone?: string;
    leadRole?: string;
  }>;
  templateSpecificModules?: Record<string, any>;
  recommendations: string[];
  createdAt: string;
}

export interface EventFilterOptions {
  searchQuery?: string;
  search?: string;
  eventType?: EventType | 'all';
  status?: EventStatus | 'all';
  sortBy?: 'startDate' | 'title' | 'budgetLimitMinorUnits' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface DashboardStats {
  totalEvents: number;
  upcomingEventsCount: number;
  pendingTasksCount: number;
  completedTasksCount: number;
  totalPlannedBudgetMinorUnits: number;
  defaultCurrency: CurrencyCode;
}

export interface GeneratePlanRequest {
  userGuidance?: string;
  temperature?: number;
  provider?: 'gemini' | 'groq' | 'mock';
}

export interface RevisePlanRequest {
  revisionInstructions: string;
  planId?: string;
}
