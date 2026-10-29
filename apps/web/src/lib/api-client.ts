import {
  EventDetails,
  Task,
  Budget,
  Expense,
  Plan,
  EventTemplate,
  DashboardStats,
  EventFilterOptions,
  GeneratePlanRequest,
  RevisePlanRequest
} from '@celebration/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  code: string;
  status: number;
  details?: any;

  constructor(message: string, status: number, code: string = 'API_ERROR', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Authorization')) {
    headers.set('Authorization', 'Bearer usr-organizer-default');
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      const code = body?.error?.code || `HTTP_${res.status}`;
      const message = body?.error?.message || `Request failed with status ${res.status}`;
      throw new ApiError(message, res.status, code, body?.error?.details);
    }

    return body?.data as T;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error.message || 'Unable to connect to the backend server.',
      0,
      'NETWORK_ERROR'
    );
  }
}

export const apiClient = {
  // System Health
  async getHealth() {
    return request<{ status: string; service: string; database: string }>('/health');
  },

  // Dashboard Stats
  async getStats() {
    return request<DashboardStats>('/stats');
  },

  // Templates
  async listTemplates() {
    return request<EventTemplate[]>('/templates');
  },

  async getTemplate(id: string) {
    return request<EventTemplate>(`/templates/${id}`);
  },

  // Events CRUD
  async listEvents(filters?: EventFilterOptions) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.eventType) params.append('eventType', filters.eventType);
    const searchTerm = filters?.search || filters?.searchQuery;
    if (searchTerm) params.append('search', searchTerm);

    const queryString = params.toString();
    return request<EventDetails[]>(`/events${queryString ? `?${queryString}` : ''}`);
  },

  async getEvent(id: string) {
    return request<EventDetails>(`/events/${id}`);
  },

  async createEvent(data: any) {
    return request<EventDetails>('/events', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateEvent(id: string, updates: Partial<EventDetails>) {
    return request<EventDetails>(`/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  async archiveEvent(id: string) {
    return request<{ id: string; status: string }>(`/events/${id}/archive`, {
      method: 'POST'
    });
  },

  async deleteEvent(id: string) {
    return request<{ id: string; deleted: boolean }>(`/events/${id}`, {
      method: 'DELETE'
    });
  },

  // Tasks
  async listTasks(eventId: string) {
    return request<Task[]>(`/events/${eventId}/tasks`);
  },

  async createTask(eventId: string, task: any) {
    return request<Task>(`/events/${eventId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(task)
    });
  },

  async updateTask(eventId: string, taskId: string, updates: Partial<Task>) {
    return request<Task>(`/events/${eventId}/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  async deleteTask(eventId: string, taskId: string) {
    return request<{ taskId: string; deleted: boolean }>(`/events/${eventId}/tasks/${taskId}`, {
      method: 'DELETE'
    });
  },

  // Budget
  async getBudget(eventId: string) {
    return request<Budget>(`/events/${eventId}/budget`);
  },

  async updateBudget(eventId: string, budget: Partial<Budget>) {
    return request<Budget>(`/events/${eventId}/budget`, {
      method: 'PATCH',
      body: JSON.stringify(budget)
    });
  },

  // Expenses
  async listExpenses(eventId: string) {
    return request<Expense[]>(`/events/${eventId}/expenses`);
  },

  async createExpense(eventId: string, expense: any) {
    return request<Expense>(`/events/${eventId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(expense)
    });
  },

  async deleteExpense(eventId: string, expenseId: string) {
    return request<{ expenseId: string; deleted: boolean }>(`/events/${eventId}/expenses/${expenseId}`, {
      method: 'DELETE'
    });
  },

  // Plans & AI Engine
  async listPlans(eventId: string) {
    return request<Plan[]>(`/events/${eventId}/plans`);
  },

  async getLatestPlan(eventId: string) {
    return request<Plan>(`/events/${eventId}/plans/latest`);
  },

  async savePlan(eventId: string, plan: any) {
    return request<Plan>(`/events/${eventId}/plans`, {
      method: 'POST',
      body: JSON.stringify(plan)
    });
  },

  async generatePlan(eventId: string, options: GeneratePlanRequest = {}) {
    return request<Plan>(`/events/${eventId}/plan/generate`, {
      method: 'POST',
      body: JSON.stringify(options)
    });
  },

  async revisePlan(eventId: string, options: RevisePlanRequest) {
    return request<Plan>(`/events/${eventId}/plan/revise`, {
      method: 'POST',
      body: JSON.stringify(options)
    });
  }
};
