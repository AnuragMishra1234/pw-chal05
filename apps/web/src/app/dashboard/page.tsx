'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  IndianRupee,
  PlusCircle,
  ArrowRight,
  Heart,
  Cake,
  Laptop,
  Users,
  Briefcase,
  Sparkles,
  MapPin,
  Calendar,
  CheckSquare,
  Square
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { dataService } from '@/lib/data-service';
import {
  EventDetails,
  Task,
  DashboardStats,
  formatMoney,
  formatDate,
  getDaysUntil
} from '@celebration/shared';

const TEMPLATE_SHORTCUTS = [
  { id: 'wedding', name: 'Wedding', desc: 'Ceremonies, banquet & guests', icon: Heart, color: 'bg-rose-50 text-rose-600 border-rose-200' },
  { id: 'birthday', name: 'Birthday', desc: 'Party, themes & entertainment', icon: Cake, color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { id: 'college_hackathon', name: 'Hackathon', desc: 'Teams, judges & hardware lab', icon: Laptop, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'community_event', name: 'Community', desc: 'Volunteers, permits & cleanup', icon: Users, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { id: 'corporate_conference', name: 'Conference', desc: 'Speakers, tracks & sponsors', icon: Briefcase, color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { id: 'custom', name: 'Custom Event', desc: 'Natural language creative brief', icon: Sparkles, color: 'bg-indigo-50 text-indigo-600 border-indigo-200' }
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<EventDetails[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadData = async () => {
    setLoading(true);
    const [fetchedStats, fetchedEvents, fetchedTasks] = await Promise.all([
      dataService.getDashboardStats(),
      dataService.listEvents(),
      dataService.listTasks()
    ]);
    setStats(fetchedStats);
    setUpcomingEvents(fetchedEvents.slice(0, 4));
    setTasks(fetchedTasks.slice(0, 6));
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

  return (
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Universal Planning Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Deterministic budget & timeline tracking combined with adaptive event templates.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/events/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              <PlusCircle className="w-4 h-4" />
              Create New Event
            </Link>
          </div>
        </div>

        {/* Platform Status Banner */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/60 flex items-center justify-between text-xs text-indigo-900">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>
              <strong>Platform Operational:</strong> Universal GenAI planning engine connected with persistent database storage and adaptive templates.
            </span>
          </div>
          <span className="text-[10px] font-mono font-semibold bg-white/80 px-2 py-0.5 rounded border border-indigo-200 text-indigo-700">
            Phase 3 Verified
          </span>
        </div>

        {/* Overview Statistics Cards */}
        {loading ? (
          <div className="py-8"><LoadingSpinner /></div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              label="Total Events"
              value={stats.totalEvents}
              subValue="Active in portfolio"
              icon={<CalendarDays className="w-5 h-5" />}
              iconBgColor="bg-blue-50 text-blue-600 border-blue-200"
            />
            <StatCard
              label="Upcoming Events"
              value={stats.upcomingEventsCount}
              subValue="Scheduled in calendar"
              icon={<Clock className="w-5 h-5" />}
              iconBgColor="bg-emerald-50 text-emerald-600 border-emerald-200"
            />
            <StatCard
              label="Pending Tasks"
              value={stats.pendingTasksCount}
              subValue={`${stats.completedTasksCount} completed`}
              icon={<CheckCircle2 className="w-5 h-5" />}
              iconBgColor="bg-amber-50 text-amber-600 border-amber-200"
            />
            <StatCard
              label="Planned Budget"
              value={formatMoney(stats.totalPlannedBudgetMinorUnits, stats.defaultCurrency)}
              subValue="Across all active events"
              icon={<IndianRupee className="w-5 h-5" />}
              iconBgColor="bg-purple-50 text-purple-600 border-purple-200"
            />
          </div>
        ) : null}

        {/* Quick Template Launchers */}
        <section aria-labelledby="quick-templates-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="quick-templates-heading" className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Quick Launch by Template
            </h2>
            <span className="text-xs text-slate-400">Click to start wizard</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {TEMPLATE_SHORTCUTS.map(sc => {
              const Icon = sc.icon;
              return (
                <Link
                  key={sc.id}
                  href={`/events/new?template=${sc.id}`}
                  className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-brand-300 hover:shadow-sm transition-all group flex flex-col justify-between"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${sc.color} mb-3 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {sc.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{sc.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Two-Column Grid: Upcoming Events & Upcoming Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Events Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Upcoming Events</h2>
              <Link
                href="/events"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                View all ({upcomingEvents.length}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcomingEvents.length === 0 ? (
              <EmptyState
                title="No Events Found"
                description="Start planning your next celebration, hackathon, or conference now."
                actionText="Create First Event"
                onAction={() => window.location.assign('/events/new')}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {upcomingEvents.map(evt => {
                  const daysUntil = getDaysUntil(evt.startDate);
                  return (
                    <Card key={evt.id} hoverable className="p-5 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant={evt.status === 'active' ? 'success' : 'default'} size="sm">
                            {evt.status}
                          </Badge>
                          <span className="text-[11px] font-mono text-slate-400">
                            {daysUntil > 0 ? `In ${daysUntil} days` : daysUntil === 0 ? 'Today' : 'Past'}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{evt.title}</h3>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{evt.description}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatDate(evt.startDate, evt.timezone)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">{evt.location.city || 'Virtual / Hybrid'}, {evt.location.country || ''}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Budget Cap</span>
                          <span className="text-xs font-bold text-slate-900">
                            {formatMoney(evt.budgetLimitMinorUnits, evt.currency)}
                          </span>
                        </div>
                        <Link
                          href={`/events/${evt.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
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

          {/* Upcoming Tasks Column (1/3 width) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Active Tasks</h2>
              <Link
                href="/tasks"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                All tasks <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <Card className="p-4 divide-y divide-slate-100">
              {tasks.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No active tasks scheduled.</p>
              ) : (
                tasks.map(t => {
                  const isCompleted = t.status === 'completed';
                  return (
                    <div key={t.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(t.id, t.status)}
                        className="mt-0.5 text-slate-400 hover:text-brand-600 transition-colors"
                        aria-label={`Mark task ${t.title} as ${isCompleted ? 'pending' : 'completed'}`}
                      >
                        {isCompleted ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {t.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={t.priority === 'critical' ? 'danger' : t.priority === 'high' ? 'warning' : 'default'}
                            size="sm"
                          >
                            {t.priority}
                          </Badge>
                          {t.dueAt && (
                            <span className="text-[10px] text-slate-400">
                              Due {formatDate(t.dueAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
