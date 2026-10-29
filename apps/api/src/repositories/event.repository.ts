import { EventDetails, EventFilterOptions } from '@celebration/shared';
import { EventModel } from '../models/Event.model.js';
import { database } from '../config/database.js';

export interface IEventRepository {
  list(ownerId: string, filters?: EventFilterOptions): Promise<EventDetails[]>;
  findById(id: string): Promise<EventDetails | null>;
  create(event: EventDetails): Promise<EventDetails>;
  update(id: string, updates: Partial<EventDetails>): Promise<EventDetails | null>;
  delete(id: string): Promise<boolean>;
  countActive(ownerId?: string): Promise<number>;
}

// In-Memory Fallback Store (Seeded for seamless dev/testing when MongoDB is not connected)
const MEMORY_EVENTS: Map<string, EventDetails> = new Map([
  [
    'evt-wedding-01',
    {
      id: 'evt-wedding-01',
      ownerId: 'usr-organizer-default',
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
      budgetLimitMinorUnits: 350000000,
      expectedAttendance: 350,
      preferences: {
        ceremonyStyle: 'traditional_religious',
        cateringType: 'buffet',
        bridalPartyCount: 12
      },
      activeModules: ['overview', 'budget', 'timeline', 'tasks', 'recommendations', 'reports', 'guests', 'vendors', 'catering'],
      status: 'active',
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-15T12:00:00.000Z'
    }
  ],
  [
    'evt-hackathon-02',
    {
      id: 'evt-hackathon-02',
      ownerId: 'usr-organizer-default',
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
      budgetLimitMinorUnits: 65000000,
      expectedAttendance: 250,
      preferences: {
        durationHours: '36',
        hardwareLabNeeded: true,
        focusDomains: 'Generative AI, Robotics, Civic Tech'
      },
      activeModules: ['overview', 'budget', 'timeline', 'tasks', 'recommendations', 'reports', 'registrations', 'teams', 'judges', 'sessions', 'sponsors', 'equipment'],
      status: 'active',
      createdAt: '2026-10-05T09:00:00.000Z',
      updatedAt: '2026-10-20T16:00:00.000Z'
    }
  ]
]);

export class EventRepository implements IEventRepository {
  async list(ownerId: string, filters?: EventFilterOptions): Promise<EventDetails[]> {
    if (database.isConnected()) {
      const query: any = { ownerId };

      if (filters?.eventType && filters.eventType !== 'all') {
        query.eventType = filters.eventType;
      }

      if (filters?.status && filters.status !== 'all') {
        query.status = filters.status;
      } else {
        query.status = { $ne: 'archived' };
      }

      if (filters?.searchQuery) {
        query.$or = [
          { title: { $regex: filters.searchQuery, $options: 'i' } },
          { description: { $regex: filters.searchQuery, $options: 'i' } },
          { 'location.city': { $regex: filters.searchQuery, $options: 'i' } }
        ];
      }

      const sortOption: any = {};
      if (filters?.sortBy) {
        const order = filters.sortOrder === 'desc' ? -1 : 1;
        sortOption[filters.sortBy] = order;
      } else {
        sortOption.startDate = 1;
      }

      const docs = await EventModel.find(query).sort(sortOption).lean();
      return docs.map(doc => ({ ...doc, id: doc._id }));
    }

    // In-memory fallback
    let items = Array.from(MEMORY_EVENTS.values()).filter(e => e.ownerId === ownerId);

    if (filters?.eventType && filters.eventType !== 'all') {
      items = items.filter(e => e.eventType === filters.eventType);
    }
    if (filters?.status && filters.status !== 'all') {
      items = items.filter(e => e.status === filters.status);
    } else {
      items = items.filter(e => e.status !== 'archived');
    }
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      items = items.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.location.city?.toLowerCase().includes(q)
      );
    }

    return items;
  }

  async findById(id: string): Promise<EventDetails | null> {
    if (database.isConnected()) {
      const doc = await EventModel.findById(id).lean();
      return doc ? { ...doc, id: doc._id } : null;
    }
    return MEMORY_EVENTS.get(id) || null;
  }

  async create(event: EventDetails): Promise<EventDetails> {
    if (database.isConnected()) {
      const created = await EventModel.create({
        ...event,
        _id: event.id
      });
      return { ...created.toObject(), id: created._id };
    }
    MEMORY_EVENTS.set(event.id, event);
    return event;
  }

  async update(id: string, updates: Partial<EventDetails>): Promise<EventDetails | null> {
    if (database.isConnected()) {
      const updated = await EventModel.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date().toISOString() },
        { new: true, runValidators: true }
      ).lean();
      return updated ? { ...updated, id: updated._id } : null;
    }

    const existing = MEMORY_EVENTS.get(id);
    if (!existing) return null;

    const modified: EventDetails = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    MEMORY_EVENTS.set(id, modified);
    return modified;
  }

  async delete(id: string): Promise<boolean> {
    if (database.isConnected()) {
      const res = await EventModel.findByIdAndDelete(id);
      return !!res;
    }
    return MEMORY_EVENTS.delete(id);
  }

  async countActive(ownerId?: string): Promise<number> {
    if (database.isConnected()) {
      const query: any = { status: 'active' };
      if (ownerId) query.ownerId = ownerId;
      return EventModel.countDocuments(query);
    }
    return Array.from(MEMORY_EVENTS.values()).filter(e => e.status === 'active' && (!ownerId || e.ownerId === ownerId)).length;
  }
}

export const eventRepository = new EventRepository();
