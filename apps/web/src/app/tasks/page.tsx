'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Square,
  Plus,
  Filter,
  Calendar,
  AlertCircle,
  ArrowRight,
  Clock,
  ListFilter
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { dataService } from '@/lib/data-service';
import {
  Task,
  EventDetails,
  TaskStatus,
  TaskPriority,
  formatDate
} from '@celebration/shared';

export default function TasksCalendarPage() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<EventDetails[]>([]);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'all'>('all');
  const [selectedEventId, setSelectedEventId] = useState<string>('all');

  // Add Task Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Logistics');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newEventId, setNewEventId] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [fetchedTasks, fetchedEvents] = await Promise.all([
      dataService.listTasks(),
      dataService.listEvents()
    ]);
    setTasks(fetchedTasks);
    setEvents(fetchedEvents);
    if (fetchedEvents.length > 0 && !newEventId) {
      setNewEventId(fetchedEvents[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await dataService.updateTask(taskId, { status: newStatus });
    await loadData();
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newEventId) return;

    await dataService.createTask({
      eventId: newEventId,
      title: newTitle.trim(),
      category: newCategory,
      priority: newPriority,
      status: 'pending',
      dueAt: newDueDate ? new Date(newDueDate).toISOString() : undefined,
      dependencyTaskIds: [],
      source: 'user'
    });

    setNewTitle('');
    setIsModalOpen(false);
    await loadData();
  };

  const eventMap = new Map(events.map(e => [e.id, e.title]));

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
    if (selectedEventId !== 'all' && t.eventId !== selectedEventId) return false;
    return true;
  });

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tasks & Milestones Calendar
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Cross-event chronological execution checklist with status and priority tracking.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Status:</span>
            <select
              aria-label="Filter by Task Status"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value as any)}
              className="w-full py-1.5 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Priority:</span>
            <select
              aria-label="Filter by Priority"
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value as any)}
              className="w-full py-1.5 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 bg-white"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Event Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Event:</span>
            <select
              aria-label="Filter by Event"
              value={selectedEventId}
              onChange={e => setSelectedEventId(e.target.value)}
              className="w-full py-1.5 px-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 bg-white"
            >
              <option value="all">All Events</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Task List */}
        {loading ? (
          <div className="py-12"><LoadingSpinner size="lg" /></div>
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            title="No tasks match the active filters"
            description="Clear your filter criteria or schedule a new preparation milestone."
            actionText="Clear Filters"
            onAction={() => {
              setSelectedStatus('all');
              setSelectedPriority('all');
              setSelectedEventId('all');
            }}
          />
        ) : (
          <Card className="p-4 sm:p-6 divide-y divide-slate-100">
            {filteredTasks.map(t => {
              const isDone = t.status === 'completed';
              const eventTitle = eventMap.get(t.eventId) || 'Associated Event';
              return (
                <div key={t.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(t.id, t.status)}
                      className="text-slate-400 hover:text-brand-600 transition-colors flex-shrink-0"
                      aria-label={`Toggle task ${t.title}`}
                    >
                      {isDone ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p className={`text-xs sm:text-sm font-semibold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {t.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <Link href={`/events/${t.eventId}`} className="text-brand-600 hover:underline font-medium">
                          {eventTitle}
                        </Link>
                        <span>·</span>
                        <span>{t.category}</span>
                        {t.dueAt && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1 text-slate-400">
                              <Calendar className="w-3 h-3" /> Due {formatDate(t.dueAt)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      variant={t.priority === 'critical' ? 'danger' : t.priority === 'high' ? 'warning' : 'default'}
                      size="sm"
                    >
                      {t.priority}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </Card>
        )}

        {/* Add Task Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Preparation Task"
          description="Schedule a task linked to an existing event."
        >
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="global-task-title">
                Task Description *
              </label>
              <input
                id="global-task-title"
                type="text"
                required
                placeholder="e.g. Confirm emergency first aid station volunteer roster"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="global-task-event">
                Target Event *
              </label>
              <select
                id="global-task-event"
                required
                value={newEventId}
                onChange={e => setNewEventId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 bg-white"
              >
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="global-task-cat">
                  Category
                </label>
                <input
                  id="global-task-cat"
                  type="text"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="global-task-pri">
                  Priority
                </label>
                <select
                  id="global-task-pri"
                  value={newPriority}
                  onChange={e => setNewPriority(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="global-task-date">
                Due Date
              </label>
              <input
                id="global-task-date"
                type="date"
                value={newDueDate}
                onChange={e => setNewDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
              />
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-sm"
              >
                Create Task
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
