'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  PlusCircle,
  Search,
  Filter,
  ArrowUpDown,
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  Trash2,
  Archive,
  ArrowRight
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { dataService } from '@/lib/data-service';
import {
  EventDetails,
  EventType,
  EventStatus,
  formatMoney,
  formatDate,
  getDaysUntil
} from '@celebration/shared';

export default function MyEventsPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<EventType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'startDate' | 'title' | 'budgetLimitMinorUnits'>('startDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const fetchEvents = async () => {
    setLoading(true);
    const data = await dataService.listEvents({
      searchQuery,
      eventType: selectedType,
      status: selectedStatus,
      sortBy,
      sortOrder
    });
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [searchQuery, selectedType, selectedStatus, sortBy, sortOrder]);

  const handleDeleteEvent = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"? This will remove all associated tasks and budgets.`)) {
      await dataService.deleteEvent(id);
      await fetchEvents();
    }
  };

  const handleArchiveEvent = async (id: string) => {
    await dataService.archiveEvent(id);
    await fetchEvents();
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Events Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Browse, filter, and manage your complete portfolio of planned events.
            </p>
          </div>
          <Link
            href="/events/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <PlusCircle className="w-4 h-4" />
            Create Event
          </Link>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search events, city, description..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Event Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                aria-label="Filter by Event Category"
                value={selectedType}
                onChange={e => setSelectedType(e.target.value as any)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 bg-white"
              >
                <option value="all">All Categories</option>
                <option value="wedding">Wedding & Anniversary</option>
                <option value="birthday">Birthday & Milestone</option>
                <option value="college_hackathon">College Hackathon</option>
                <option value="community_event">Community Initiative</option>
                <option value="corporate_conference">Corporate Conference</option>
                <option value="custom">Custom Event</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <select
                aria-label="Filter by Status"
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value as any)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <select
                aria-label="Sort Events"
                value={`${sortBy}-${sortOrder}`}
                onChange={e => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as any);
                  setSortOrder(order as any);
                }}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 bg-white"
              >
                <option value="startDate-asc">Date: Earliest First</option>
                <option value="startDate-desc">Date: Latest First</option>
                <option value="budgetLimitMinorUnits-desc">Budget: Highest First</option>
                <option value="budgetLimitMinorUnits-asc">Budget: Lowest First</option>
                <option value="title-asc">Title: A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Event Cards Grid */}
        {loading ? (
          <div className="py-12"><LoadingSpinner size="lg" /></div>
        ) : events.length === 0 ? (
          <EmptyState
            title="No matching events found"
            description="Try modifying your search query or filters to discover saved plans."
            actionText="Clear Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedType('all');
              setSelectedStatus('all');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(evt => {
              const days = getDaysUntil(evt.startDate);
              return (
                <Card key={evt.id} className="p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                        {evt.eventType.replace('_', ' ')}
                      </span>
                      <Badge variant={evt.status === 'active' ? 'success' : evt.status === 'archived' ? 'default' : 'warning'} size="sm">
                        {evt.status}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 line-clamp-1">{evt.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {evt.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(evt.startDate, evt.timezone)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{evt.location.city || 'Virtual'}, {evt.location.country || ''}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 pt-1">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {evt.expectedAttendance} attendees
                        </span>
                        <span className="font-semibold text-slate-800">
                          {formatMoney(evt.budgetLimitMinorUnits, evt.currency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {evt.status !== 'archived' && (
                        <button
                          type="button"
                          onClick={() => handleArchiveEvent(evt.id)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Archive Event"
                          aria-label="Archive Event"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(evt.id, evt.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Event"
                        aria-label="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <Link
                      href={`/events/${evt.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm"
                    >
                      Workspace <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
