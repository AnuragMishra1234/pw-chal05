'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Plus,
  Send,
  ArrowLeft,
  Square,
  CheckSquare,
  ListTodo,
  Layers,
  FileText,
  BadgeAlert,
  Info,
  Palette,
  ShieldAlert,
  Lightbulb,
  History,
  RefreshCw
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { dataService } from '@/lib/data-service';
import {
  EventDetails,
  Task,
  Budget,
  Expense,
  Plan,
  EventTemplate,
  formatMoney,
  formatDate,
  getDaysUntil,
  calculateBudgetSummary,
  getTemplateById,
  majorToMinorUnits
} from '@celebration/shared';

export default function EventOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [template, setTemplate] = useState<EventTemplate | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [activeTab, setActiveTab] = useState<'workspace' | 'tasks' | 'budget' | 'modules'>('workspace');

  // AI Planning Workspace State
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [planHistory, setPlanHistory] = useState<Plan[]>([]);
  const [selectedPlanVersionId, setSelectedPlanVersionId] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [userGuidance, setUserGuidance] = useState('');
  const [revisionPrompt, setRevisionPrompt] = useState('');
  const [revisionHistory, setRevisionHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Hello! I am your AI event coordinator. You can generate a tailored execution plan, or ask me to revise budget percentages, shift dates, and add custom contingency workflows.'
    }
  ]);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [newExpenseCategory, setNewExpenseCategory] = useState('');
  const [newExpenseMajor, setNewExpenseMajor] = useState<number>(5000);
  const [newExpenseStatus, setNewExpenseStatus] = useState<'estimate' | 'quotation' | 'actual'>('actual');
  const [newExpenseVendor, setNewExpenseVendor] = useState('');

  const loadEventData = async () => {
    setLoading(true);
    const fetchedEvent = await dataService.getEventById(eventId);
    if (!fetchedEvent) {
      setLoading(false);
      return;
    }

    const [fetchedTasks, fetchedBudget, fetchedExpenses, fetchedLatestPlan, fetchedPlans] = await Promise.all([
      dataService.listTasks(eventId),
      dataService.getBudget(eventId),
      dataService.listExpenses(eventId),
      dataService.getLatestPlan(eventId),
      dataService.listPlans(eventId)
    ]);

    const tmpl = getTemplateById(fetchedEvent.templateId);

    setEvent(fetchedEvent);
    setTemplate(tmpl || null);
    setTasks(fetchedTasks);
    setBudget(fetchedBudget || null);
    setExpenses(fetchedExpenses);
    setPlanHistory(fetchedPlans || []);

    if (fetchedLatestPlan) {
      setCurrentPlan(fetchedLatestPlan);
      setSelectedPlanVersionId(fetchedLatestPlan.id);
    }

    if (tmpl && tmpl.taskCategories.length > 0) {
      setNewTaskCategory(tmpl.taskCategories[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await dataService.updateTask(taskId, { status: newStatus });
    const updatedTasks = await dataService.listTasks(eventId);
    setTasks(updatedTasks);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await dataService.createTask({
      eventId,
      title: newTaskTitle.trim(),
      category: newTaskCategory || 'General Operations',
      priority: newTaskPriority,
      status: 'pending',
      dependencyTaskIds: [],
      source: 'user'
    });

    setNewTaskTitle('');
    setIsTaskModalOpen(false);
    const updatedTasks = await dataService.listTasks(eventId);
    setTasks(updatedTasks);
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseCategory || !newExpenseMajor) return;

    await dataService.addExpense({
      eventId,
      category: newExpenseCategory,
      amountMinorUnits: majorToMinorUnits(newExpenseMajor),
      currency: event?.currency || 'INR',
      status: newExpenseStatus,
      vendorName: newExpenseVendor.trim() || undefined,
      paymentDate: new Date().toISOString()
    });

    setIsExpenseModalOpen(false);
    await loadEventData();
  };

  const handleTriggerAIGeneration = async () => {
    setAiGenerating(true);
    setAiError(null);
    try {
      const plan = await dataService.generatePlan(eventId, {
        userGuidance: userGuidance.trim() || undefined
      });
      setCurrentPlan(plan);
      setSelectedPlanVersionId(plan.id);
      setUserGuidance('');
      await loadEventData();
      setRevisionHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `Synthesized Plan v${plan.version}: ${plan.summary}`
        }
      ]);
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate plan.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSendRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionPrompt.trim() || aiGenerating) return;

    const userText = revisionPrompt.trim();
    setRevisionPrompt('');
    setAiGenerating(true);
    setAiError(null);

    setRevisionHistory(prev => [
      ...prev,
      { role: 'user', text: userText }
    ]);

    try {
      const plan = await dataService.revisePlan(eventId, {
        revisionInstructions: userText
      });
      setCurrentPlan(plan);
      setSelectedPlanVersionId(plan.id);
      await loadEventData();
      setRevisionHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `Plan v${plan.version} generated: ${plan.summary}`
        }
      ]);
    } catch (err: any) {
      setAiError(err.message || 'Failed to apply plan revision.');
      setRevisionHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `Revision error: ${err.message}`
        }
      ]);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSelectHistoricalPlan = (planId: string) => {
    setSelectedPlanVersionId(planId);
    const selected = planHistory.find(p => p.id === planId);
    if (selected) {
      setCurrentPlan(selected);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="py-20"><LoadingSpinner size="lg" /></div>
      </AppShell>
    );
  }

  if (!event) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
          <BadgeAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Event Not Found</h2>
          <p className="text-xs text-slate-500">The event ID &quot;{eventId}&quot; does not exist in the active repository.</p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Events
          </Link>
        </div>
      </AppShell>
    );
  }

  const budgetSummary = budget ? calculateBudgetSummary(budget, expenses) : null;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const taskProgress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const daysUntil = getDaysUntil(event.startDate);

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Navigation Breadcrumb & Back */}
        <div className="flex items-center justify-between">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">ID: {event.id}</span>
            <Badge variant={event.status === 'active' ? 'success' : 'default'} size="sm">
              {event.status}
            </Badge>
          </div>
        </div>

        {/* Event Header Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                  {template?.name || event.eventType.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-400">v{event.templateVersion}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {event.title}
              </h1>
              {event.description && (
                <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                  {event.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Task
              </button>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <IndianRupee className="w-3.5 h-3.5" /> Log Expense
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-brand-600" />
              <div>
                <span className="font-semibold text-slate-900 block">Date & Time</span>
                <span>{formatDate(event.startDate, event.timezone)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-brand-600" />
              <div>
                <span className="font-semibold text-slate-900 block">Location</span>
                <span className="truncate">{event.location.city || 'Virtual'}, {event.location.country || ''}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-brand-600" />
              <div>
                <span className="font-semibold text-slate-900 block">Attendance</span>
                <span>{event.expectedAttendance} Attendees Projected</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Planned Budget"
            value={formatMoney(event.budgetLimitMinorUnits, event.currency)}
            subValue={`${budgetSummary ? budgetSummary.allocatedPercentage : 0}% Allocated`}
            icon={<IndianRupee className="w-5 h-5" />}
            iconBgColor="bg-purple-50 text-purple-600 border-purple-200"
          />
          <StatCard
            label="Actual Spending"
            value={budgetSummary ? formatMoney(budgetSummary.totalSpentMinorUnits, event.currency) : '₹0'}
            subValue={`${budgetSummary ? budgetSummary.spentPercentage : 0}% of budget spent`}
            icon={<Clock className="w-5 h-5" />}
            iconBgColor="bg-blue-50 text-blue-600 border-blue-200"
          />
          <StatCard
            label="Task Progress"
            value={`${taskProgress}%`}
            subValue={`${completedCount} of ${tasks.length} tasks completed`}
            icon={<CheckCircle2 className="w-5 h-5" />}
            iconBgColor="bg-emerald-50 text-emerald-600 border-emerald-200"
          />
          <StatCard
            label="Countdown"
            value={daysUntil > 0 ? `${daysUntil} Days` : daysUntil === 0 ? 'Today' : 'Completed'}
            subValue={`Scheduled for ${formatDate(event.startDate, event.timezone)}`}
            icon={<Calendar className="w-5 h-5" />}
            iconBgColor="bg-amber-50 text-amber-600 border-amber-200"
          />
        </div>

        {/* Workspace Navigation Tabs */}
        <div className="border-b border-slate-200 flex items-center gap-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('workspace')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'workspace'
                ? 'border-brand-600 text-brand-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" /> AI Planning Workspace
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'tasks'
                ? 'border-brand-600 text-brand-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ListTodo className="w-4 h-4" /> Tasks & Milestones ({tasks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('budget')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'budget'
                ? 'border-brand-600 text-brand-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <IndianRupee className="w-4 h-4" /> Budget & Ledger
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('modules')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'modules'
                ? 'border-brand-600 text-brand-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" /> Template Modules ({event.activeModules.length})
          </button>
        </div>

        {/* TAB 1: AI PLANNING WORKSPACE */}
        {activeTab === 'workspace' && (
          <div className="space-y-6">
            {/* AI Error Alert */}
            {aiError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start justify-between gap-3 shadow-sm">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">AI Planning Engine Notice</p>
                    <p className="mt-0.5 text-rose-700 leading-relaxed">{aiError}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAiError(null)}
                  className="text-rose-500 hover:text-rose-800 text-[11px] font-semibold underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Version History & Action Bar */}
            <Card className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-600" />
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        {currentPlan ? `Execution Plan v${currentPlan.version}` : 'AI Planning Engine'}
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        {currentPlan
                          ? `Active Plan • Generated ${formatDate(currentPlan.createdAt, event.timezone)}`
                          : 'Deterministic budget & timeline synthesis with adaptive templates.'}
                      </p>
                    </div>
                  </div>

                  {/* Plan Version Selector Pills */}
                  {planHistory.length > 1 && (
                    <div className="flex items-center gap-1.5 ml-0 sm:ml-4 pl-0 sm:pl-4 sm:border-l sm:border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Versions:</span>
                      {planHistory.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectHistoricalPlan(p.id)}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                            selectedPlanVersionId === p.id
                              ? 'bg-brand-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          v{p.version} {p.status === 'active' && '★'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Synthesis Trigger */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Optional focus notes (e.g. prioritize outdoor games)..."
                    value={userGuidance}
                    onChange={e => setUserGuidance(e.target.value)}
                    className="hidden md:block w-72 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={handleTriggerAIGeneration}
                    disabled={aiGenerating}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${aiGenerating ? 'animate-spin' : ''}`} />
                    {aiGenerating ? 'Synthesizing Plan...' : currentPlan ? 'Regenerate Plan' : 'Generate Event Plan'}
                  </button>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (2/3): Structured Plan Output */}
              <div className="lg:col-span-2 space-y-6">
                {currentPlan ? (
                  <>
                    {/* Concept & Theme Card */}
                    <Card className="p-6 space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Palette className="w-4 h-4 text-brand-600" />
                          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Concept & Aesthetics</h3>
                        </div>
                        <Badge variant="success">Version {currentPlan.version} Active</Badge>
                      </div>

                      <div className="space-y-3">
                        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium">
                          {currentPlan.summary}
                        </p>

                        {currentPlan.themeAndConcept && (
                          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">{currentPlan.themeAndConcept.themeName}</span>
                              {currentPlan.themeAndConcept.recommendedColorPalette && (
                                <div className="flex items-center gap-1.5">
                                  {currentPlan.themeAndConcept.recommendedColorPalette.map((color, idx) => (
                                    <span
                                      key={idx}
                                      title={color}
                                      style={{ backgroundColor: color }}
                                      className="w-4 h-4 rounded-full border border-slate-200 shadow-sm inline-block"
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {currentPlan.themeAndConcept.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* Deterministic Budget Proposal Card */}
                    <Card className="p-6 space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <IndianRupee className="w-4 h-4 text-emerald-600" />
                          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Deterministic Budget Allocations
                          </h3>
                        </div>
                        <Badge variant="info">
                          Contingency Reserve: {currentPlan.budgetProposal.suggestedContingencyPercentage}%
                        </Badge>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                              <th className="pb-2">Category</th>
                              <th className="pb-2 text-right">Target Weight</th>
                              <th className="pb-2 text-right">Allocated Amount</th>
                              <th className="pb-2 pl-4">Planning Rationale & Saving Tips</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {currentPlan.budgetProposal.categories.map((cat, idx) => {
                              const calculatedMinor = Math.round(event.budgetLimitMinorUnits * (cat.percentageOfBudget / 100));
                              return (
                                <tr key={idx} className="hover:bg-slate-50/60">
                                  <td className="py-2.5 font-bold text-slate-800">{cat.categoryName}</td>
                                  <td className="py-2.5 text-right font-mono font-bold text-slate-700">
                                    {cat.percentageOfBudget}%
                                  </td>
                                  <td className="py-2.5 text-right font-mono font-bold text-emerald-600">
                                    {formatMoney(calculatedMinor, event.currency)}
                                  </td>
                                  <td className="py-2.5 pl-4 text-slate-600">
                                    <p className="leading-snug">{cat.reasoning}</p>
                                    {cat.savingTips && cat.savingTips.length > 0 && (
                                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                        <Lightbulb className="w-3 h-3 text-amber-500 inline flex-shrink-0" />
                                        <span className="text-[10px] text-amber-700 font-medium">
                                          {cat.savingTips.join(' • ')}
                                        </span>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </Card>

                    {/* Assumptions & Warnings Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Assumptions */}
                      <Card className="p-5 space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <h4 className="text-xs font-bold text-slate-900 uppercase">Planning Assumptions</h4>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-600">
                          {currentPlan.assumptions.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 leading-relaxed">
                              <span className="text-emerald-500 mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>

                      {/* Warnings */}
                      <Card className="p-5 space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <h4 className="text-xs font-bold text-slate-900 uppercase">Actionable Warnings</h4>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-600">
                          {currentPlan.warnings.length === 0 ? (
                            <li className="text-slate-400 italic">No operational bottlenecks detected.</li>
                          ) : (
                            currentPlan.warnings.map((warn, idx) => (
                              <li key={idx} className="flex items-start gap-2 leading-relaxed text-amber-800">
                                <span className="text-amber-500 mt-0.5">⚠</span>
                                <span>{warn}</span>
                              </li>
                            ))
                          )}
                        </ul>
                      </Card>
                    </div>

                    {/* Timeline Milestones & Day Schedule Card */}
                    <Card className="p-6 space-y-6">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Milestones & Day-of-Event Schedule
                          </h3>
                        </div>
                      </div>

                      {/* Milestones Flow */}
                      <div className="space-y-3">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Preparation Milestones</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {currentPlan.timelineMilestones.map((m, idx) => (
                            <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-900">{m.milestoneName}</span>
                                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-mono font-bold">
                                  T-{m.daysBeforeEvent}d
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-snug">{m.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Day of Event Schedule */}
                      <div className="space-y-3 pt-2">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Event Day Run-of-Show</h4>
                        <div className="space-y-2">
                          {currentPlan.eventDaySchedule.map((s, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3">
                                <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-mono font-bold text-[10px]">
                                  +{s.timeOffsetHours}h
                                </span>
                                <span className="font-bold text-slate-800">{s.activityTitle}</span>
                              </div>
                              <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                                {s.locationOrZone && <span>📍 {s.locationOrZone}</span>}
                                {s.leadRole && <span className="text-slate-500 font-medium">👤 {s.leadRole}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>

                    {/* Template Specific Modules Card */}
                    {currentPlan.templateSpecificModules && Object.keys(currentPlan.templateSpecificModules).length > 0 && (
                      <Card className="p-6 space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                          <Layers className="w-4 h-4 text-indigo-600" />
                          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Specialized Template Modules
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          {Object.entries(currentPlan.templateSpecificModules).map(([key, val]) => (
                            <div key={key} className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-2">
                              <span className="font-bold text-slate-800 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <div className="text-slate-600 leading-relaxed text-[11px]">
                                {Array.isArray(val) ? (
                                  <ul className="space-y-1">
                                    {val.map((item, idx) => (
                                      <li key={idx} className="flex items-start gap-1.5">
                                        <span className="text-brand-500">•</span>
                                        <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : typeof val === 'object' ? (
                                  <pre className="text-[10px] bg-white p-2 rounded border border-slate-200 overflow-x-auto">
                                    {JSON.stringify(val, null, 2)}
                                  </pre>
                                ) : (
                                  <p>{String(val)}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                  </>
                ) : (
                  /* Initial Empty Plan CTA */
                  <Card className="p-10 text-center space-y-4 border-dashed border-2">
                    <Sparkles className="w-12 h-12 text-brand-600 mx-auto animate-pulse" />
                    <div>
                      <h3 className="text-base font-bold text-slate-900">No Plan Generated Yet</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                        Click the button below to synthesize a structured execution plan tailored to {event.title}, complete with deterministic budget allocations, milestones, and template workflows.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleTriggerAIGeneration}
                      disabled={aiGenerating}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      {aiGenerating ? 'Synthesizing Initial Plan...' : 'Generate Initial Event Plan'}
                    </button>
                  </Card>
                )}
              </div>

              {/* Right Column (1/3): Conversational Revision Panel */}
              <div className="space-y-4">
                <Card className="p-5 flex flex-col h-[650px] shadow-sm">
                  <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand-600" />
                      <h3 className="text-xs font-bold text-slate-900">AI Planning Assistant</h3>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      Live Engine
                    </span>
                  </div>

                  {/* Message Stream */}
                  <div className="flex-1 overflow-y-auto py-3 space-y-3 text-xs">
                    {revisionHistory.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-2xl leading-relaxed text-xs shadow-xs ${
                          msg.role === 'user'
                            ? 'bg-brand-50 text-brand-900 border border-brand-200 ml-4'
                            : 'bg-slate-50 text-slate-700 border border-slate-100 mr-4'
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider block mb-1 text-slate-400">
                          {msg.role === 'user' ? 'You' : 'Planner AI'}
                        </span>
                        {msg.text}
                      </div>
                    ))}
                    {aiGenerating && (
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 mr-4 flex items-center gap-2 text-slate-500 text-xs">
                        <LoadingSpinner size="sm" />
                        <span>Applying non-destructive revision & recalculating budget...</span>
                      </div>
                    )}
                  </div>

                  {/* Suggested Revision Chips */}
                  <div className="pt-2 pb-2 border-t border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Quick Revision Suggestions:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Cut budget by 10%',
                        'Add backup plan for rain',
                        'Scale for 250 attendees',
                        'Add mentor check-in rounds'
                      ].map((promptText, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setRevisionPrompt(promptText)}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-700 font-medium transition-colors"
                        >
                          {promptText}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Revision Prompt Form */}
                  <form onSubmit={handleSendRevision} className="pt-2 flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Cut catering budget by 15%..."
                      value={revisionPrompt}
                      onChange={e => setRevisionPrompt(e.target.value)}
                      disabled={aiGenerating}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 placeholder-slate-400 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={aiGenerating || !revisionPrompt.trim()}
                      className="p-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
                      aria-label="Send Revision Request"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TASKS & MILESTONES */}
        {activeTab === 'tasks' && (
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Task Checklist & Milestones</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Interactive checklist tracking event preparation. Toggle tasks to recalculate progress.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Task
              </button>
            </div>

            <div className="space-y-2">
              {tasks.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">No tasks recorded for this event.</p>
              ) : (
                tasks.map(t => {
                  const isDone = t.status === 'completed';
                  return (
                    <div
                      key={t.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        isDone ? 'bg-slate-50/70 border-slate-100 text-slate-400' : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(t.id, t.status)}
                          className="flex-shrink-0 text-slate-400 hover:text-brand-600"
                          aria-label={`Mark task ${t.title} as ${isDone ? 'pending' : 'completed'}`}
                        >
                          {isDone ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4" />}
                        </button>
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {t.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                            <span>{t.category}</span>
                            {t.dueAt && <span>· Due {formatDate(t.dueAt)}</span>}
                            {t.assigneeName && <span>· Assigned: {t.assigneeName}</span>}
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
                })
              )}
            </div>
          </Card>
        )}

        {/* TAB 3: BUDGET & LEDGER */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Deterministic Budget Allocation</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Category allocations calculated deterministically to prevent floating-point rounding errors.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Log Expense
                </button>
              </div>

              {budget ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Total Budget Limit</span>
                      <span className="text-base font-extrabold text-slate-900">
                        {formatMoney(budget.totalLimitMinorUnits, budget.currency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Allocated to Categories</span>
                      <span className="text-base font-bold text-slate-800">
                        {formatMoney(budget.allocatedMinorUnits, budget.currency)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Contingency Reserve</span>
                      <span className="text-base font-bold text-emerald-700">
                        {formatMoney(budget.contingencyMinorUnits, budget.currency)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Category Breakdown</h3>
                    {budget.categoryAllocations.map(cat => {
                      const actualSpent = cat.actualSpentMinorUnits || 0;
                      const pctSpent = cat.allocatedMinorUnits > 0 ? Math.round((actualSpent / cat.allocatedMinorUnits) * 100) : 0;
                      return (
                        <div key={cat.category} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-slate-800">{cat.category}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-slate-400 font-mono">{cat.percentage}%</span>
                              <span className="text-slate-900 font-bold font-mono">
                                {formatMoney(cat.allocatedMinorUnits, budget.currency)}
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pctSpent > 100 ? 'bg-rose-500' : 'bg-brand-600'}`}
                              style={{ width: `${Math.min(pctSpent, 100)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>Actual Spent: {formatMoney(actualSpent, budget.currency)}</span>
                            <span>{pctSpent}% utilized</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </Card>

            {/* Expenses Ledger */}
            <Card className="p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900">Recorded Expenses Ledger</h2>
              {expenses.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No expenses recorded yet. Click &quot;Log Expense&quot; to add.</p>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {expenses.map(exp => (
                    <div key={exp.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{exp.category}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {exp.vendorName ? `Vendor: ${exp.vendorName} · ` : ''}
                          {exp.notes || 'No notes'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 block font-mono">
                          {formatMoney(exp.amountMinorUnits, exp.currency)}
                        </span>
                        <Badge
                          variant={exp.status === 'actual' ? 'success' : exp.status === 'quotation' ? 'info' : 'warning'}
                          size="sm"
                        >
                          {exp.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* TAB 4: ADAPTIVE TEMPLATE MODULES */}
        {activeTab === 'modules' && (
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Adaptive Modules ({template?.name || event.eventType})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Modules enabled specifically for this event category based on declarative template rules.
                </p>
              </div>
              <Badge variant="purple" size="md">
                {event.activeModules.length} Modules Active
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {event.activeModules.map(m => (
                <div key={m} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 capitalize">
                      {m.replace('_', ' ')}
                    </span>
                    <Badge variant="success" size="sm">Active</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Domain module configured for {template?.name}. In subsequent phases, this section connects to dedicated persistence for {m}.
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Add Task Modal */}
        <Modal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          title="Add New Action Item"
          description="Create a task with category, priority, and timeline assignment."
        >
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="task-title-input">
                Task Title *
              </label>
              <input
                id="task-title-input"
                type="text"
                required
                placeholder="e.g. Confirm audio mixer equipment delivery"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="task-cat-select">
                  Category
                </label>
                <select
                  id="task-cat-select"
                  value={newTaskCategory}
                  onChange={e => setNewTaskCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 bg-white"
                >
                  {template?.taskCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  )) || <option value="General">General</option>}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="task-pri-select">
                  Priority
                </label>
                <select
                  id="task-pri-select"
                  value={newTaskPriority}
                  onChange={e => setNewTaskPriority(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-sm"
              >
                Save Task
              </button>
            </div>
          </form>
        </Modal>

        {/* Add Expense Modal */}
        <Modal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          title="Log Expense Entry"
          description="Record an estimate, formal quotation, or actual disbursement."
        >
          <form onSubmit={handleCreateExpense} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="exp-cat-select">
                Budget Category *
              </label>
              <select
                id="exp-cat-select"
                required
                value={newExpenseCategory}
                onChange={e => setNewExpenseCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 bg-white"
              >
                <option value="">Select Category</option>
                {budget?.categoryAllocations.map(c => (
                  <option key={c.category} value={c.category}>{c.category}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="exp-amount-input">
                  Amount ({event.currency}) *
                </label>
                <input
                  id="exp-amount-input"
                  type="number"
                  min={1}
                  required
                  value={newExpenseMajor}
                  onChange={e => setNewExpenseMajor(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="exp-stat-select">
                  Status *
                </label>
                <select
                  id="exp-stat-select"
                  value={newExpenseStatus}
                  onChange={e => setNewExpenseStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 bg-white"
                >
                  <option value="actual">Actual Disbursement</option>
                  <option value="quotation">Formal Quotation</option>
                  <option value="estimate">Rough Estimate</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="exp-vendor-input">
                Vendor / Payee Name (Optional)
              </label>
              <input
                id="exp-vendor-input"
                type="text"
                placeholder="e.g. SoundWave AV Productions"
                value={newExpenseVendor}
                onChange={e => setNewExpenseVendor(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
              />
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-sm"
              >
                Record Expense
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
