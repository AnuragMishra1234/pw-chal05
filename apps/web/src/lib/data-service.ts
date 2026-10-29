import {
  EventDetails,
  Task,
  Budget,
  Expense,
  Plan,
  EventTemplate,
  EventFilterOptions,
  DashboardStats,
  CurrencyCode,
  GeneratePlanRequest,
  RevisePlanRequest,
  getAllTemplates,
  getTemplateById,
  getModulesForTemplate,
  calculateBudgetSummary
} from '@celebration/shared';
import { apiClient } from './api-client';

// Initial Canonical Fictional Demo Events
const INITIAL_DEMO_EVENTS: EventDetails[] = [
  {
    id: 'evt-wedding-01',
    title: "Ananya & Kabir's Royal Heritage Wedding",
    eventType: 'wedding',
    templateId: 'wedding',
    templateVersion: '1.0.0',
    description: 'Traditional multi-day celebration featuring Sangeet, sacred ceremony, and banquet.',
    startDate: '2027-02-14T09:00:00.000Z',
    endDate: '2027-02-16T22:00:00.000Z',
    timezone: 'Asia/Kolkata',
    location: {
      type: 'physical',
      address: 'Lakeside Palace Heritage Grounds',
      city: 'Udaipur',
      country: 'India'
    },
    currency: 'INR',
    budgetLimitMinorUnits: 350000000, // ₹35,00,000
    expectedAttendance: 350,
    preferences: {
      ceremonyStyle: 'traditional_religious',
      cateringType: 'buffet',
      bridalPartyCount: 12
    },
    activeModules: [
      'overview',
      'budget',
      'timeline',
      'tasks',
      'recommendations',
      'reports',
      'guests',
      'vendors',
      'catering'
    ],
    status: 'active',
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-15T12:00:00.000Z'
  },
  {
    id: 'evt-hackathon-02',
    title: 'CodeStorm 2027: Campus AI Hackathon',
    eventType: 'college_hackathon',
    templateId: 'college_hackathon',
    templateVersion: '1.0.0',
    description: '36-hour student hackathon centered around Generative AI, Sustainability, and HealthTech.',
    startDate: '2027-04-10T08:00:00.000Z',
    endDate: '2027-04-11T20:00:00.000Z',
    timezone: 'Asia/Kolkata',
    location: {
      type: 'physical',
      address: 'Department of Computing Innovation Center',
      city: 'Bengaluru',
      country: 'India'
    },
    currency: 'INR',
    budgetLimitMinorUnits: 65000000, // ₹6,50,000
    expectedAttendance: 250,
    preferences: {
      durationHours: '36',
      hardwareLabNeeded: true,
      focusDomains: 'Generative AI, Robotics, Civic Tech'
    },
    activeModules: [
      'overview',
      'budget',
      'timeline',
      'tasks',
      'recommendations',
      'reports',
      'registrations',
      'teams',
      'judges',
      'sessions',
      'sponsors',
      'equipment'
    ],
    status: 'active',
    createdAt: '2026-10-05T09:00:00.000Z',
    updatedAt: '2026-10-20T16:00:00.000Z'
  },
  {
    id: 'evt-cleanup-03',
    title: 'Riverfront Clean-Up & Ecology Drive',
    eventType: 'community_event',
    templateId: 'community_event',
    templateVersion: '1.0.0',
    description: 'Civic mobilization drive removing plastic waste from the riverbank with native sapling planting.',
    startDate: '2027-03-22T07:00:00.000Z',
    endDate: '2027-03-22T14:00:00.000Z',
    timezone: 'Asia/Kolkata',
    location: {
      type: 'physical',
      address: 'Riverside Promenade Sector 4',
      city: 'Pune',
      country: 'India'
    },
    currency: 'INR',
    budgetLimitMinorUnits: 12000000, // ₹1,20,000
    expectedAttendance: 90,
    preferences: {
      initiativeFocus: 'environmental',
      requiresMunicipalPermit: true,
      volunteerTargetCount: 75
    },
    activeModules: [
      'overview',
      'budget',
      'timeline',
      'tasks',
      'recommendations',
      'reports',
      'volunteers',
      'outreach',
      'equipment',
      'impact_tracking'
    ],
    status: 'active',
    createdAt: '2026-10-10T11:00:00.000Z',
    updatedAt: '2026-10-22T14:30:00.000Z'
  },
  {
    id: 'evt-conference-04',
    title: 'FinTech Horizons Annual Summit',
    eventType: 'corporate_conference',
    templateId: 'corporate_conference',
    templateVersion: '1.0.0',
    description: 'Executive summit featuring keynote presentations on digital payments, reg-tech, and AI fraud detection.',
    startDate: '2027-05-18T08:30:00.000Z',
    endDate: '2027-05-19T17:30:00.000Z',
    timezone: 'Asia/Kolkata',
    location: {
      type: 'hybrid',
      address: 'Grand Hyatt Convention Center',
      city: 'Mumbai',
      country: 'India',
      virtualUrl: 'https://stream.fintechhorizons.org'
    },
    currency: 'INR',
    budgetLimitMinorUnits: 180000000, // ₹18,00,000
    expectedAttendance: 220,
    preferences: {
      trackCount: '2',
      hasExhibitionHall: true,
      keynoteSpeakerTarget: 4
    },
    activeModules: [
      'overview',
      'budget',
      'timeline',
      'tasks',
      'recommendations',
      'reports',
      'speakers',
      'sessions',
      'sponsors',
      'equipment'
    ],
    status: 'active',
    createdAt: '2026-10-12T14:00:00.000Z',
    updatedAt: '2026-10-25T11:00:00.000Z'
  }
];

const INITIAL_DEMO_TASKS: Task[] = [
  // Wedding Tasks
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
  },
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
  },
  {
    id: 'tsk-w-03',
    eventId: 'evt-wedding-01',
    title: 'Hire Lead Wedding Cinematographer & Drone Pilot',
    category: 'Photography & Video',
    description: 'Review portfolios for candid documentary style photography.',
    status: 'pending',
    priority: 'high',
    dueAt: '2026-12-20T00:00:00.000Z',
    estimatedDurationMinutes: 90,
    dependencyTaskIds: [],
    assigneeName: 'Kabir',
    source: 'template',
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z'
  },
  // Hackathon Tasks
  {
    id: 'tsk-h-01',
    eventId: 'evt-hackathon-02',
    title: 'Obtain Dean Approval for Overnight Lab Use',
    category: 'Venue & Infrastructure',
    description: 'Submit safety and overnight security clearance form.',
    status: 'completed',
    priority: 'critical',
    dueAt: '2027-01-15T00:00:00.000Z',
    estimatedDurationMinutes: 60,
    dependencyTaskIds: [],
    assigneeName: 'Organizing Secretary',
    source: 'template',
    createdAt: '2026-10-05T09:00:00.000Z',
    updatedAt: '2026-10-18T09:00:00.000Z'
  },
  {
    id: 'tsk-h-02',
    eventId: 'evt-hackathon-02',
    title: 'Confirm 3 Title Sponsors & Sign MoU',
    category: 'Sponsorship & Grants',
    description: 'Lock in cloud credit grants and cash prize allocations.',
    status: 'in_progress',
    priority: 'high',
    dueAt: '2027-02-10T00:00:00.000Z',
    estimatedDurationMinutes: 240,
    dependencyTaskIds: [],
    assigneeName: 'Corporate Relations Lead',
    source: 'template',
    createdAt: '2026-10-05T09:00:00.000Z',
    updatedAt: '2026-10-24T12:00:00.000Z'
  },
  {
    id: 'tsk-h-03',
    eventId: 'evt-hackathon-02',
    title: 'Verify Gigabit Campus Network & Power Strips',
    category: 'Venue & Infrastructure',
    description: 'Ensure backup generator connectivity and switch testing.',
    status: 'pending',
    priority: 'critical',
    dueAt: '2027-03-25T00:00:00.000Z',
    estimatedDurationMinutes: 180,
    dependencyTaskIds: ['tsk-h-01'],
    assigneeName: 'Network Admin Lead',
    source: 'template',
    createdAt: '2026-10-05T09:00:00.000Z',
    updatedAt: '2026-10-05T09:00:00.000Z'
  },
  // Community Tasks
  {
    id: 'tsk-c-01',
    eventId: 'evt-cleanup-03',
    title: 'File Municipal Park Sound & Waste Removal Permit',
    category: 'Permits & City Relations',
    description: 'Coordinate with City Municipal Ward 7 Office.',
    status: 'completed',
    priority: 'critical',
    dueAt: '2027-02-01T00:00:00.000Z',
    estimatedDurationMinutes: 90,
    dependencyTaskIds: [],
    assigneeName: 'Civic Coordinator',
    source: 'template',
    createdAt: '2026-10-10T11:00:00.000Z',
    updatedAt: '2026-10-25T11:00:00.000Z'
  },
  {
    id: 'tsk-c-02',
    eventId: 'evt-cleanup-03',
    title: 'Procure Heavy-Duty Gloves and Biodegradable Bags',
    category: 'Safety & Equipment',
    description: 'Source 100 safety kits and first-aid kits.',
    status: 'pending',
    priority: 'high',
    dueAt: '2027-03-05T00:00:00.000Z',
    estimatedDurationMinutes: 120,
    dependencyTaskIds: [],
    assigneeName: 'Logistics Lead',
    source: 'template',
    createdAt: '2026-10-10T11:00:00.000Z',
    updatedAt: '2026-10-10T11:00:00.000Z'
  }
];

const INITIAL_DEMO_BUDGETS: Record<string, Budget> = {
  'evt-wedding-01': {
    id: 'bdg-w-01',
    eventId: 'evt-wedding-01',
    currency: 'INR',
    totalLimitMinorUnits: 350000000, // ₹35,00,000
    allocatedMinorUnits: 332500000,
    contingencyMinorUnits: 17500000,
    categoryAllocations: [
      { category: 'Venue & Staging', allocatedMinorUnits: 140000000, percentage: 40, actualSpentMinorUnits: 50000000 },
      { category: 'Catering & Beverages', allocatedMinorUnits: 105000000, percentage: 30, actualSpentMinorUnits: 25000000 },
      { category: 'Photography & Film', allocatedMinorUnits: 35000000, percentage: 10, actualSpentMinorUnits: 10000000 },
      { category: 'Décor & Florals', allocatedMinorUnits: 35000000, percentage: 10, actualSpentMinorUnits: 0 },
      { category: 'Music & Sangeet Production', allocatedMinorUnits: 17500000, percentage: 5, actualSpentMinorUnits: 0 }
    ],
    updatedAt: '2026-10-20T12:00:00.000Z'
  },
  'evt-hackathon-02': {
    id: 'bdg-h-02',
    eventId: 'evt-hackathon-02',
    currency: 'INR',
    totalLimitMinorUnits: 65000000, // ₹6,50,000
    allocatedMinorUnits: 61750000,
    contingencyMinorUnits: 3250000,
    categoryAllocations: [
      { category: 'Cash Prizes & Grants', allocatedMinorUnits: 22750000, percentage: 35, actualSpentMinorUnits: 0 },
      { category: '24h Meals & Midnight Fuel', allocatedMinorUnits: 19500000, percentage: 30, actualSpentMinorUnits: 5000000 },
      { category: 'Swag, Badges & T-Shirts', allocatedMinorUnits: 9750000, percentage: 15, actualSpentMinorUnits: 2000000 },
      { category: 'AV & High-Speed Network', allocatedMinorUnits: 6500000, percentage: 10, actualSpentMinorUnits: 1500000 },
      { category: 'Marketing & Banners', allocatedMinorUnits: 3250000, percentage: 5, actualSpentMinorUnits: 800000 }
    ],
    updatedAt: '2026-10-22T14:00:00.000Z'
  },
  'evt-cleanup-03': {
    id: 'bdg-c-03',
    eventId: 'evt-cleanup-03',
    currency: 'INR',
    totalLimitMinorUnits: 12000000, // ₹1,20,000
    allocatedMinorUnits: 11400000,
    contingencyMinorUnits: 600000,
    categoryAllocations: [
      { category: 'Safety Equipment & Gloves', allocatedMinorUnits: 4200000, percentage: 35, actualSpentMinorUnits: 1500000 },
      { category: 'Hydration & Volunteer Snacks', allocatedMinorUnits: 3600000, percentage: 30, actualSpentMinorUnits: 800000 },
      { category: 'Waste Hauling & Dumpster Fees', allocatedMinorUnits: 2400000, percentage: 20, actualSpentMinorUnits: 0 },
      { category: 'Signage & Outreach Posters', allocatedMinorUnits: 1200000, percentage: 10, actualSpentMinorUnits: 300000 }
    ],
    updatedAt: '2026-10-25T11:00:00.000Z'
  },
  'evt-conference-04': {
    id: 'bdg-f-04',
    eventId: 'evt-conference-04',
    currency: 'INR',
    totalLimitMinorUnits: 180000000, // ₹18,00,000
    allocatedMinorUnits: 171000000,
    contingencyMinorUnits: 9000000,
    categoryAllocations: [
      { category: 'Convention Ballroom & Breakouts', allocatedMinorUnits: 72000000, percentage: 40, actualSpentMinorUnits: 20000000 },
      { category: 'Catering & Coffee Breaks', allocatedMinorUnits: 45000000, percentage: 25, actualSpentMinorUnits: 10000000 },
      { category: 'AV & Multi-Cam Live Stream', allocatedMinorUnits: 36000000, percentage: 20, actualSpentMinorUnits: 5000000 },
      { category: 'Keynote Speaker Hospitality', allocatedMinorUnits: 18000000, percentage: 10, actualSpentMinorUnits: 3000000 }
    ],
    updatedAt: '2026-10-25T11:00:00.000Z'
  }
};

const INITIAL_DEMO_EXPENSES: Record<string, Expense[]> = {
  'evt-wedding-01': [
    {
      id: 'exp-w-01',
      eventId: 'evt-wedding-01',
      category: 'Venue & Staging',
      amountMinorUnits: 50000000, // ₹5,00,000
      currency: 'INR',
      status: 'actual',
      vendorName: 'Lakeside Palace Estate',
      paymentDate: '2026-10-18T14:00:00.000Z',
      notes: 'Initial venue lock advance deposit (cheque #4019)',
      createdAt: '2026-10-18T14:00:00.000Z'
    },
    {
      id: 'exp-w-02',
      eventId: 'evt-wedding-01',
      category: 'Catering & Beverages',
      amountMinorUnits: 25000000, // ₹2,50,000
      currency: 'INR',
      status: 'quotation',
      vendorName: 'Royal Spice Caterers',
      paymentDate: '2026-10-20T10:00:00.000Z',
      notes: 'Formal quotation for 350-plate banquet dinner',
      createdAt: '2026-10-20T10:00:00.000Z'
    }
  ],
  'evt-hackathon-02': [
    {
      id: 'exp-h-01',
      eventId: 'evt-hackathon-02',
      category: '24h Meals & Midnight Fuel',
      amountMinorUnits: 5000000, // ₹50,000
      currency: 'INR',
      status: 'actual',
      vendorName: 'Campus Food Co.',
      paymentDate: '2026-10-22T10:00:00.000Z',
      notes: 'Advance deposit for 24-hour food trucks and beverage station',
      createdAt: '2026-10-22T10:00:00.000Z'
    }
  ]
};

// Storage Keys for Browser Session Persistence
const STORAGE_KEYS = {
  EVENTS: 'c_events_v1',
  TASKS: 'c_tasks_v1',
  BUDGETS: 'c_budgets_v1',
  EXPENSES: 'c_expenses_v1'
};

class DataService {
  private events: EventDetails[] = [];
  private tasks: Task[] = [];
  private budgets: Record<string, Budget> = {};
  private expenses: Record<string, Expense[]> = {};
  private taskEventMap: Map<string, string> = new Map();
  private initialized = false;

  private init() {
    if (this.initialized) return;

    if (typeof window !== 'undefined') {
      try {
        const storedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
        const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
        const storedBudgets = localStorage.getItem(STORAGE_KEYS.BUDGETS);
        const storedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);

        this.events = storedEvents ? JSON.parse(storedEvents) : [...INITIAL_DEMO_EVENTS];
        this.tasks = storedTasks ? JSON.parse(storedTasks) : [...INITIAL_DEMO_TASKS];
        this.budgets = storedBudgets ? JSON.parse(storedBudgets) : { ...INITIAL_DEMO_BUDGETS };
        this.expenses = storedExpenses ? JSON.parse(storedExpenses) : { ...INITIAL_DEMO_EXPENSES };
      } catch (_e) {
        this.fallbackToInitial();
      }
    } else {
      this.fallbackToInitial();
    }

    // Populate task-to-event map
    this.tasks.forEach(t => this.taskEventMap.set(t.id, t.eventId));
    this.initialized = true;
  }

  private fallbackToInitial() {
    this.events = [...INITIAL_DEMO_EVENTS];
    this.tasks = [...INITIAL_DEMO_TASKS];
    this.budgets = { ...INITIAL_DEMO_BUDGETS };
    this.expenses = { ...INITIAL_DEMO_EXPENSES };
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(this.events));
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(this.tasks));
        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(this.budgets));
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(this.expenses));
      } catch (_e) {
        // Local storage write fail (quota or private mode) - in-memory remains valid
      }
    }
  }

  // --- EVENTS ---
  async listEvents(filters?: EventFilterOptions): Promise<EventDetails[]> {
    try {
      const serverEvents = await apiClient.listEvents(filters);
      if (serverEvents && Array.isArray(serverEvents)) {
        if (!filters || Object.keys(filters).length === 0) {
          this.events = serverEvents;
          this.persist();
        }
        return serverEvents;
      }
    } catch (err) {
      console.warn('[data-service] API unreachable, falling back to local cache for listEvents:', err);
    }

    this.init();
    let result = [...this.events];

    if (filters) {
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase().trim();
        result = result.filter(
          e =>
            e.title.toLowerCase().includes(q) ||
            e.description?.toLowerCase().includes(q) ||
            e.location.city?.toLowerCase().includes(q)
        );
      }

      if (filters.eventType && filters.eventType !== 'all') {
        result = result.filter(e => e.eventType === filters.eventType);
      }

      if (filters.status && filters.status !== 'all') {
        result = result.filter(e => e.status === filters.status);
      }

      if (filters.sortBy) {
        const order = filters.sortOrder === 'desc' ? -1 : 1;
        result.sort((a, b) => {
          if (filters.sortBy === 'startDate') {
            return (new Date(a.startDate).getTime() - new Date(b.startDate).getTime()) * order;
          }
          if (filters.sortBy === 'budgetLimitMinorUnits') {
            return (a.budgetLimitMinorUnits - b.budgetLimitMinorUnits) * order;
          }
          if (filters.sortBy === 'title') {
            return a.title.localeCompare(b.title) * order;
          }
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order;
        });
      } else {
        result.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      }
    }

    return result;
  }

  async getEventById(id: string): Promise<EventDetails | undefined> {
    try {
      const serverEvent = await apiClient.getEvent(id);
      if (serverEvent) {
        return serverEvent;
      }
    } catch (err) {
      console.warn(`[data-service] API getEvent(${id}) failed, checking local cache:`, err);
    }

    this.init();
    return this.events.find(e => e.id === id);
  }

  async getEvent(id: string): Promise<EventDetails | undefined> {
    return this.getEventById(id);
  }

  async createEvent(data: Omit<EventDetails, 'id' | 'createdAt' | 'updatedAt' | 'activeModules'>): Promise<EventDetails> {
    try {
      const serverEvent = await apiClient.createEvent(data);
      if (serverEvent) {
        this.events.unshift(serverEvent);
        this.persist();
        return serverEvent;
      }
    } catch (err) {
      console.warn('[data-service] API createEvent failed, falling back to local creation:', err);
    }

    this.init();
    const id = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const activeModules = getModulesForTemplate(data.templateId);

    const newEvent: EventDetails = {
      ...data,
      id,
      activeModules,
      createdAt: now,
      updatedAt: now
    };

    this.events.unshift(newEvent);

    // Initialize Default Budget Allocation based on template guidance
    const template = getTemplateById(data.templateId);
    const guidance = template?.planningRules.budgetAllocationGuidance || {
      'Primary Operations': 60,
      'Hospitality & Catering': 25,
      'Contingency Reserve': 15
    };

    const categoryAllocations = Object.entries(guidance).map(([category, percentage]) => ({
      category,
      percentage,
      allocatedMinorUnits: Math.round(data.budgetLimitMinorUnits * (percentage / 100)),
      actualSpentMinorUnits: 0
    }));

    this.budgets[id] = {
      id: `bdg-${id}`,
      eventId: id,
      currency: data.currency,
      totalLimitMinorUnits: data.budgetLimitMinorUnits,
      allocatedMinorUnits: categoryAllocations.reduce((acc, c) => acc + c.allocatedMinorUnits, 0),
      contingencyMinorUnits: Math.round(data.budgetLimitMinorUnits * 0.1),
      categoryAllocations,
      updatedAt: now
    };

    // Initialize Suggested Tasks from template
    if (template?.suggestedTasks) {
      const eventDate = new Date(data.startDate).getTime();
      template.suggestedTasks.forEach((st, idx) => {
        const dueAt = new Date(eventDate - st.daysBeforeEvent * 24 * 60 * 60 * 1000).toISOString();
        const tskId = `tsk-${id}-${idx + 1}`;
        this.taskEventMap.set(tskId, id);
        this.tasks.push({
          id: tskId,
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
      });
    }

    this.persist();
    return newEvent;
  }

  async updateEvent(id: string, updates: Partial<EventDetails>): Promise<EventDetails | undefined> {
    try {
      const serverUpdated = await apiClient.updateEvent(id, updates);
      if (serverUpdated) {
        this.init();
        const index = this.events.findIndex(e => e.id === id);
        if (index !== -1) {
          this.events[index] = serverUpdated;
          this.persist();
        }
        return serverUpdated;
      }
    } catch (err) {
      console.warn(`[data-service] API updateEvent(${id}) failed, falling back to local:`, err);
    }

    this.init();
    const index = this.events.findIndex(e => e.id === id);
    if (index === -1) return undefined;

    this.events[index] = {
      ...this.events[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.persist();
    return this.events[index];
  }

  async archiveEvent(id: string): Promise<boolean> {
    try {
      await apiClient.archiveEvent(id);
    } catch (err) {
      console.warn(`[data-service] API archiveEvent(${id}) failed, falling back:`, err);
    }
    const event = await this.updateEvent(id, { status: 'archived' });
    return !!event;
  }

  async deleteEvent(id: string): Promise<boolean> {
    try {
      await apiClient.deleteEvent(id);
    } catch (err) {
      console.warn(`[data-service] API deleteEvent(${id}) failed:`, err);
    }
    this.init();
    const initialLen = this.events.length;
    this.events = this.events.filter(e => e.id !== id);
    this.tasks = this.tasks.filter(t => t.eventId !== id);
    delete this.budgets[id];
    delete this.expenses[id];
    this.persist();
    return this.events.length < initialLen;
  }

  // --- TASKS ---
  async listTasks(eventId?: string): Promise<Task[]> {
    if (eventId) {
      try {
        const serverTasks = await apiClient.listTasks(eventId);
        if (serverTasks && Array.isArray(serverTasks)) {
          serverTasks.forEach(t => this.taskEventMap.set(t.id, eventId));
          return serverTasks;
        }
      } catch (err) {
        console.warn(`[data-service] API listTasks(${eventId}) failed, using local fallback:`, err);
      }
    } else {
      try {
        const events = await apiClient.listEvents();
        if (events && events.length > 0) {
          const taskLists = await Promise.all(
            events.map(e => apiClient.listTasks(e.id).catch(() => []))
          );
          const flattened = taskLists.flat();
          if (flattened.length > 0) {
            flattened.forEach(t => this.taskEventMap.set(t.id, t.eventId));
            return flattened;
          }
        }
      } catch (err) {
        console.warn('[data-service] API listAllTasks failed, using local fallback:', err);
      }
    }

    this.init();
    if (eventId) {
      return this.tasks.filter(t => t.eventId === eventId);
    }
    return [...this.tasks];
  }

  async createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    try {
      const serverTask = await apiClient.createTask(data.eventId, data);
      if (serverTask) {
        this.taskEventMap.set(serverTask.id, data.eventId);
        this.tasks.unshift(serverTask);
        this.persist();
        return serverTask;
      }
    } catch (err) {
      console.warn('[data-service] API createTask failed, falling back to local:', err);
    }

    this.init();
    const now = new Date().toISOString();
    const newTask: Task = {
      ...data,
      id: `tsk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now
    };
    this.taskEventMap.set(newTask.id, data.eventId);
    this.tasks.unshift(newTask);
    this.persist();
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    this.init();
    const eventId = this.taskEventMap.get(id) || this.tasks.find(t => t.id === id)?.eventId;

    if (eventId) {
      try {
        const serverUpdated = await apiClient.updateTask(eventId, id, updates);
        if (serverUpdated) {
          const idx = this.tasks.findIndex(t => t.id === id);
          if (idx !== -1) {
            this.tasks[idx] = serverUpdated;
            this.persist();
          }
          return serverUpdated;
        }
      } catch (err) {
        console.warn(`[data-service] API updateTask(${id}) failed, using local:`, err);
      }
    }

    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx === -1) return undefined;

    this.tasks[idx] = {
      ...this.tasks[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.persist();
    return this.tasks[idx];
  }

  async deleteTask(id: string): Promise<boolean> {
    this.init();
    const eventId = this.taskEventMap.get(id) || this.tasks.find(t => t.id === id)?.eventId;

    if (eventId) {
      try {
        await apiClient.deleteTask(eventId, id);
      } catch (err) {
        console.warn(`[data-service] API deleteTask(${id}) failed:`, err);
      }
    }

    const initialLen = this.tasks.length;
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.persist();
    return this.tasks.length < initialLen;
  }

  // --- BUDGETS & EXPENSES ---
  async getBudget(eventId: string): Promise<Budget | undefined> {
    try {
      const serverBudget = await apiClient.getBudget(eventId);
      if (serverBudget) {
        this.budgets[eventId] = serverBudget;
        return serverBudget;
      }
    } catch (err) {
      console.warn(`[data-service] API getBudget(${eventId}) failed, using local:`, err);
    }

    this.init();
    return this.budgets[eventId];
  }

  async updateBudget(eventId: string, budget: Budget): Promise<Budget> {
    try {
      const serverBudget = await apiClient.updateBudget(eventId, budget);
      if (serverBudget) {
        this.budgets[eventId] = serverBudget;
        this.persist();
        return serverBudget;
      }
    } catch (err) {
      console.warn(`[data-service] API updateBudget(${eventId}) failed, using local:`, err);
    }

    this.init();
    this.budgets[eventId] = {
      ...budget,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.budgets[eventId];
  }

  async listExpenses(eventId: string): Promise<Expense[]> {
    try {
      const serverExpenses = await apiClient.listExpenses(eventId);
      if (serverExpenses && Array.isArray(serverExpenses)) {
        this.expenses[eventId] = serverExpenses;
        return serverExpenses;
      }
    } catch (err) {
      console.warn(`[data-service] API listExpenses(${eventId}) failed, using local:`, err);
    }

    this.init();
    return this.expenses[eventId] || [];
  }

  async addExpense(data: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
    try {
      const serverExpense = await apiClient.createExpense(data.eventId, data);
      if (serverExpense) {
        if (!this.expenses[data.eventId]) {
          this.expenses[data.eventId] = [];
        }
        this.expenses[data.eventId].unshift(serverExpense);
        this.persist();
        return serverExpense;
      }
    } catch (err) {
      console.warn('[data-service] API addExpense failed, using local:', err);
    }

    this.init();
    const now = new Date().toISOString();
    const newExpense: Expense = {
      ...data,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now
    };

    if (!this.expenses[data.eventId]) {
      this.expenses[data.eventId] = [];
    }
    this.expenses[data.eventId].unshift(newExpense);

    // Update actual spent in budget category if present
    const budget = this.budgets[data.eventId];
    if (budget) {
      const cat = budget.categoryAllocations.find(c => c.category === data.category);
      if (cat) {
        cat.actualSpentMinorUnits = (cat.actualSpentMinorUnits || 0) + data.amountMinorUnits;
      }
    }

    this.persist();
    return newExpense;
  }

  // --- STATS ---
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const serverStats = await apiClient.getStats();
      if (serverStats) {
        return serverStats;
      }
    } catch (err) {
      console.warn('[data-service] API getDashboardStats failed, calculating locally:', err);
    }

    this.init();
    const activeEvents = this.events.filter(e => e.status !== 'archived');
    const now = new Date().getTime();

    const upcomingEventsCount = activeEvents.filter(
      e => new Date(e.startDate).getTime() >= now
    ).length;

    const pendingTasksCount = this.tasks.filter(
      t => t.status === 'pending' || t.status === 'in_progress'
    ).length;

    const completedTasksCount = this.tasks.filter(
      t => t.status === 'completed'
    ).length;

    const totalPlannedBudgetMinorUnits = activeEvents.reduce(
      (sum, e) => sum + (e.currency === 'INR' ? e.budgetLimitMinorUnits : 0),
      0
    );

    return {
      totalEvents: activeEvents.length,
      upcomingEventsCount,
      pendingTasksCount,
      completedTasksCount,
      totalPlannedBudgetMinorUnits,
      defaultCurrency: 'INR'
    };
  }

  // --- TEMPLATES ---
  async listTemplates(): Promise<EventTemplate[]> {
    try {
      const serverTemplates = await apiClient.listTemplates();
      if (serverTemplates && serverTemplates.length > 0) {
        return serverTemplates;
      }
    } catch (err) {
      console.warn('[data-service] API listTemplates failed, using local templates:', err);
    }
    return getAllTemplates();
  }

  async getTemplate(id: string): Promise<EventTemplate | undefined> {
    try {
      const serverTemplate = await apiClient.getTemplate(id);
      if (serverTemplate) {
        return serverTemplate;
      }
    } catch (err) {
      console.warn(`[data-service] API getTemplate(${id}) failed:`, err);
    }
    return getTemplateById(id);
  }

  // --- GENAI PLANNING ENGINE ---
  async getLatestPlan(eventId: string): Promise<Plan | null> {
    try {
      const serverPlan = await apiClient.getLatestPlan(eventId);
      return serverPlan || null;
    } catch (_err) {
      return null;
    }
  }

  async listPlans(eventId: string): Promise<Plan[]> {
    try {
      const serverPlans = await apiClient.listPlans(eventId);
      return serverPlans || [];
    } catch (_err) {
      return [];
    }
  }

  async generatePlan(eventId: string, options: GeneratePlanRequest = {}): Promise<Plan> {
    return apiClient.generatePlan(eventId, options);
  }

  async revisePlan(eventId: string, options: RevisePlanRequest): Promise<Plan> {
    return apiClient.revisePlan(eventId, options);
  }

  // --- RESET DEMO ---
  async resetToDemoData(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.EVENTS);
      localStorage.removeItem(STORAGE_KEYS.TASKS);
      localStorage.removeItem(STORAGE_KEYS.BUDGETS);
      localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    }
    this.fallbackToInitial();
    this.persist();
  }
}

// Export singleton data service
export const dataService = new DataService();
