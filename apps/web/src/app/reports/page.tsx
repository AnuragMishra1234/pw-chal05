'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Users,
  ArrowRight,
  Printer
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { dataService } from '@/lib/data-service';
import {
  EventDetails,
  Task,
  DashboardStats,
  formatMoney,
  formatDate
} from '@celebration/shared';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventDetails[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const loadReportData = async () => {
      setLoading(true);
      const [allEvents, allTasks, fetchedStats] = await Promise.all([
        dataService.listEvents(),
        dataService.listTasks(),
        dataService.getDashboardStats()
      ]);
      setEvents(allEvents);
      setTasks(allTasks);
      setStats(fetchedStats);
      setLoading(false);
    };
    loadReportData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Executive Planning Reports
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Cross-event budget allocations, completion velocities, and timeline summaries.
            </p>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>

        {loading ? (
          <div className="py-12"><LoadingSpinner size="lg" /></div>
        ) : (
          <div className="space-y-6">
            {/* High-level portfolio metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Portfolio Budget Cap</span>
                <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                  {stats ? formatMoney(stats.totalPlannedBudgetMinorUnits, stats.defaultCurrency) : '₹0'}
                </span>
                <span className="text-xs text-slate-500 mt-1 block">Across {events.length} planned celebrations</span>
              </Card>

              <Card className="p-5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Scheduled Tasks</span>
                <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                  {tasks.length} Action Items
                </span>
                <span className="text-xs text-slate-500 mt-1 block">
                  {stats?.completedTasksCount} completed ({tasks.length > 0 ? Math.round(((stats?.completedTasksCount || 0) / tasks.length) * 100) : 0}%)
                </span>
              </Card>

              <Card className="p-5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Participant Reach</span>
                <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                  {events.reduce((sum, e) => sum + e.expectedAttendance, 0).toLocaleString()} Attendees
                </span>
                <span className="text-xs text-slate-500 mt-1 block">Projected across portfolio</span>
              </Card>
            </div>

            {/* Event Portfolio Table */}
            <Card className="overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Event Portfolio Summary Table</h3>
                <span className="text-xs text-slate-400 font-mono">{events.length} Records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-3">Event Title</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Scheduled Date</th>
                      <th className="px-6 py-3">Attendance</th>
                      <th className="px-6 py-3">Budget Cap</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {events.map(ev => (
                      <tr key={ev.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3.5 font-bold text-slate-900">{ev.title}</td>
                        <td className="px-6 py-3.5 capitalize">{ev.eventType.replace('_', ' ')}</td>
                        <td className="px-6 py-3.5">{formatDate(ev.startDate, ev.timezone)}</td>
                        <td className="px-6 py-3.5">{ev.expectedAttendance}</td>
                        <td className="px-6 py-3.5 font-bold font-mono">
                          {formatMoney(ev.budgetLimitMinorUnits, ev.currency)}
                        </td>
                        <td className="px-6 py-3.5">
                          <Badge variant={ev.status === 'active' ? 'success' : 'default'} size="sm">
                            {ev.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <Link
                            href={`/events/${ev.id}`}
                            className="font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                          >
                            Open <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
