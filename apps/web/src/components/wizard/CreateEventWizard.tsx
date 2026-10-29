'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Heart,
  Cake,
  Laptop,
  Users,
  Briefcase,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  MapPin,
  IndianRupee,
  AlertCircle,
  Layers,
  Edit3
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { dataService } from '@/lib/data-service';
import {
  EventType,
  CurrencyCode,
  EventTemplate,
  getAllTemplates,
  getTemplateById,
  majorToMinorUnits,
  minorUnitsToMajor,
  formatMoney,
  formatDate
} from '@celebration/shared';

const TEMPLATE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  wedding: Heart,
  birthday: Cake,
  college_hackathon: Laptop,
  community_event: Users,
  corporate_conference: Briefcase,
  custom: Sparkles
};

export const CreateEventWizard: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTemplateParam = searchParams.get('template') as EventType | null;

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Wizard Form State
  const [eventType, setEventType] = useState<EventType>(initialTemplateParam || 'college_hackathon');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [timezone, setTimezone] = useState<string>('Asia/Kolkata');
  const [locationType, setLocationType] = useState<'physical' | 'virtual' | 'hybrid'>('physical');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [country, setCountry] = useState<string>('India');
  const [virtualUrl, setVirtualUrl] = useState<string>('');
  const [attendance, setAttendance] = useState<number>(100);

  // Budget
  const [budgetMajor, setBudgetMajor] = useState<number>(500000); // ₹5,00,000 default
  const [currency, setCurrency] = useState<CurrencyCode>('INR');

  // Dynamic Template-Specific Preferences
  const [preferences, setPreferences] = useState<Record<string, any>>({});
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const templates = getAllTemplates();
  const activeTemplate: EventTemplate = getTemplateById(eventType) || templates[0];

  // Set default preferences when template changes
  useEffect(() => {
    if (activeTemplate) {
      const defPrefs: Record<string, any> = {};
      activeTemplate.customFields.forEach(f => {
        if (f.defaultValue !== undefined) {
          defPrefs[f.name] = f.defaultValue;
        }
      });
      setPreferences(defPrefs);
    }
  }, [eventType]);

  // If URL has template param, jump to that template
  useEffect(() => {
    if (initialTemplateParam && getTemplateById(initialTemplateParam)) {
      setEventType(initialTemplateParam);
    }
  }, [initialTemplateParam]);

  // Validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 2) {
      if (!title.trim() || title.trim().length < 3) {
        newErrors.title = 'Event title must be at least 3 characters.';
      }
      if (!startDate) {
        newErrors.startDate = 'Event start date is required.';
      }
      if (endDate && new Date(endDate).getTime() < new Date(startDate).getTime()) {
        newErrors.endDate = 'End date cannot precede the start date.';
      }
      if (!attendance || attendance <= 0) {
        newErrors.attendance = 'Expected attendance must be at least 1 person.';
      }
      if (locationType !== 'virtual' && !city.trim()) {
        newErrors.city = 'City is required for in-person and hybrid events.';
      }
    }

    if (step === 3) {
      if (!budgetMajor || budgetMajor <= 0) {
        newErrors.budget = 'Budget amount must be a positive number.';
      }
    }

    if (step === 4) {
      if (eventType === 'custom' && customPrompt.trim().length > 0 && customPrompt.trim().length < 10) {
        newErrors.customPrompt = 'Please provide at least 10 characters describing your custom event concept.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(2) || !validateStep(3) || !validateStep(4)) {
      return;
    }

    setSubmitting(true);
    try {
      const budgetLimitMinorUnits = majorToMinorUnits(budgetMajor);
      const startIso = new Date(startDate).toISOString();
      const endIso = endDate ? new Date(endDate).toISOString() : undefined;

      const newEvent = await dataService.createEvent({
        title: title.trim(),
        eventType,
        templateId: activeTemplate.id,
        templateVersion: activeTemplate.version,
        description: description.trim(),
        startDate: startIso,
        endDate: endIso,
        timezone,
        location: {
          type: locationType,
          address: address.trim(),
          city: city.trim(),
          country: country.trim(),
          virtualUrl: virtualUrl.trim() || undefined
        },
        currency,
        budgetLimitMinorUnits,
        expectedAttendance: Number(attendance),
        preferences,
        customPrompt: eventType === 'custom' ? customPrompt.trim() : undefined,
        status: 'active'
      });

      router.push(`/events/${newEvent.id}`);
    } catch (err: any) {
      setErrors({ submit: err.message || 'Failed to initialize event.' });
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Category' },
    { num: 2, title: 'Logistics' },
    { num: 3, title: 'Budget' },
    { num: 4, title: 'Specialization' },
    { num: 5, title: 'Review' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Step Indicator Navigation */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between">
          {steps.map((st, i) => {
            const isCompleted = currentStep > st.num;
            const isCurrent = currentStep === st.num;
            return (
              <React.Fragment key={st.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : isCurrent
                        ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-sm'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : st.num}
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-1.5 hidden sm:block ${
                      isCurrent ? 'text-brand-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {st.title}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-colors ${
                      currentStep > st.num ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {errors.submit && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errors.submit}</span>
        </div>
      )}

      {/* STEP 1: SELECT EVENT TYPE */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Step 1: Select Event Template</h2>
            <p className="text-xs text-slate-500 mt-1">
              Choose the category that best matches your gathering. Each template configures tailored modules and planning rules.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(tmpl => {
              const Icon = TEMPLATE_ICONS[tmpl.id] || Sparkles;
              const isSelected = eventType === tmpl.id;

              return (
                <div
                  key={tmpl.id}
                  onClick={() => setEventType(tmpl.id as EventType)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/40 shadow-sm ring-1 ring-brand-600'
                      : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                        isSelected ? 'bg-brand-600 text-white border-brand-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-100/70 px-2 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{tmpl.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{tmpl.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>{tmpl.defaultModules.length} Modules</span>
                    <span>{tmpl.suggestedTasks.length} Suggested Tasks</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: BASIC LOGISTICS */}
      {currentStep === 2 && (
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Step 2: Core Event Logistics</h2>
            <p className="text-xs text-slate-500 mt-1">Specify schedule, attendance count, and location details.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="event-title">
                Event Title *
              </label>
              <input
                id="event-title"
                type="text"
                placeholder="e.g. CodeStorm 2027: Campus AI Hackathon"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                  errors.title ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-brand-500'
                } focus:outline-none focus:ring-2 text-slate-900`}
              />
              {errors.title && <p className="text-[11px] text-rose-600 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="event-desc">
                Event Purpose / Overview
              </label>
              <textarea
                id="event-desc"
                rows={3}
                placeholder="Brief summary of event objectives, theme, or intended participant experience..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="start-date">
                  Start Date & Time *
                </label>
                <input
                  id="start-date"
                  type="datetime-local"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                    errors.startDate ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-brand-500'
                  } focus:outline-none focus:ring-2 text-slate-900`}
                />
                {errors.startDate && <p className="text-[11px] text-rose-600 mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="end-date">
                  End Date & Time (Optional)
                </label>
                <input
                  id="end-date"
                  type="datetime-local"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                    errors.endDate ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-brand-500'
                  } focus:outline-none focus:ring-2 text-slate-900`}
                />
                {errors.endDate && <p className="text-[11px] text-rose-600 mt-1">{errors.endDate}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="attendance">
                  Expected Attendance *
                </label>
                <input
                  id="attendance"
                  type="number"
                  min={1}
                  value={attendance}
                  onChange={e => setAttendance(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="timezone">
                  Primary Timezone
                </label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 bg-white"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                  <option value="America/New_York">America/New York (EST/EDT)</option>
                  <option value="America/Los_Angeles">America/Los Angeles (PST/PDT)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="UTC">UTC (Universal Time)</option>
                </select>
              </div>
            </div>

            {/* Location Section */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-bold text-slate-700">Location Format</label>
              <div className="flex gap-4">
                {(['physical', 'virtual', 'hybrid'] as const).map(mode => (
                  <label key={mode} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="locationType"
                      checked={locationType === mode}
                      onChange={() => setLocationType(mode)}
                      className="text-brand-600 focus:ring-brand-500"
                    />
                    <span className="capitalize">{mode}</span>
                  </label>
                ))}
              </div>

              {locationType !== 'virtual' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="city">
                      City *
                    </label>
                    <input
                      id="city"
                      type="text"
                      placeholder="e.g. Bengaluru, Pune, Udaipur"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                        errors.city ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-brand-500'
                      } focus:outline-none focus:ring-2 text-slate-900`}
                    />
                    {errors.city && <p className="text-[11px] text-rose-600 mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="address">
                      Venue Address / Landmark
                    </label>
                    <input
                      id="address"
                      type="text"
                      placeholder="e.g. Tech Innovation Center, Campus Auditorium"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                    />
                  </div>
                </div>
              )}

              {locationType !== 'physical' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="virtualUrl">
                    Virtual Meeting / Stream URL
                  </label>
                  <input
                    id="virtualUrl"
                    type="url"
                    placeholder="https://meet.google.com/... or https://stream.example.com"
                    value={virtualUrl}
                    onChange={e => setVirtualUrl(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                  />
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: BUDGET */}
      {currentStep === 3 && (
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Step 3: Budget Parameters</h2>
            <p className="text-xs text-slate-500 mt-1">
              Set total financial limits. The platform calculates minor units deterministically to eliminate rounding errors.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="budget-amount">
                  Total Budget Limit *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-xs font-bold text-slate-400">
                    {currency}
                  </span>
                  <input
                    id="budget-amount"
                    type="number"
                    min={1}
                    value={budgetMajor}
                    onChange={e => setBudgetMajor(Number(e.target.value))}
                    className={`w-full pl-14 pr-3.5 py-2 text-sm font-bold rounded-xl border ${
                      errors.budget ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-brand-500'
                    } focus:outline-none focus:ring-2 text-slate-900`}
                  />
                </div>
                {errors.budget && <p className="text-[11px] text-rose-600 mt-1">{errors.budget}</p>}
                <p className="text-[11px] text-slate-500 mt-1">
                  Stored as {majorToMinorUnits(budgetMajor)} integer minor units.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="currency">
                  Currency *
                </label>
                <select
                  id="currency"
                  value={currency}
                  onChange={e => setCurrency(e.target.value as CurrencyCode)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 bg-white"
                >
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="CAD">CAD (CA$ - Canadian Dollar)</option>
                  <option value="AUD">AUD (AU$ - Australian Dollar)</option>
                </select>
              </div>
            </div>

            {/* Template Recommended Budget Allocation Guidance Preview */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Recommended Allocation Guidance ({activeTemplate.name})
              </h3>
              <p className="text-xs text-slate-500">
                Preliminary percentage distribution derived from template planning rules:
              </p>

              <div className="space-y-2">
                {Object.entries(activeTemplate.planningRules.budgetAllocationGuidance).map(([cat, pct]) => {
                  const estimatedMinor = Math.round(majorToMinorUnits(budgetMajor) * (pct / 100));
                  return (
                    <div key={cat} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                      <span className="text-slate-700 font-medium">{cat}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-mono text-[11px]">{pct}%</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {formatMoney(estimatedMinor, currency)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 4: EVENT-SPECIFIC REQUIREMENTS */}
      {currentStep === 4 && (
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Step 4: Specialized Requirements ({activeTemplate.name})
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure parameters specific to this event category.
            </p>
          </div>

          <div className="space-y-4">
            {eventType === 'custom' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="custom-prompt">
                  Natural Language Creative Brief / Concept *
                </label>
                <textarea
                  id="custom-prompt"
                  rows={4}
                  placeholder="Describe your unique event vision (e.g. A 2-day outdoor pottery and acoustic folk music weekend retreat for 60 people with organic wood-fired catering and solar lantern workshops)..."
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                />
                {errors.customPrompt && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.customPrompt}</p>
                )}
              </div>
            )}

            {/* Dynamic Custom Fields from Template */}
            {activeTemplate.customFields.map(field => {
              const val = preferences[field.name] !== undefined ? preferences[field.name] : field.defaultValue;

              return (
                <div key={field.name} className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700" htmlFor={field.name}>
                    {field.label} {field.required ? '*' : ''}
                  </label>

                  {field.type === 'select' && field.options && (
                    <select
                      id={field.name}
                      value={val}
                      onChange={e => setPreferences({ ...preferences, [field.name]: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 bg-white"
                    >
                      {field.options.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {field.type === 'boolean' && (
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={Boolean(val)}
                        onChange={e => setPreferences({ ...preferences, [field.name]: e.target.checked })}
                        className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                      />
                      <span className="text-xs text-slate-700">Yes, include specialized tasks for this requirement</span>
                    </label>
                  )}

                  {field.type === 'number' && (
                    <input
                      id={field.name}
                      type="number"
                      value={val || ''}
                      onChange={e => setPreferences({ ...preferences, [field.name]: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                    />
                  )}

                  {field.type === 'text' && (
                    <input
                      id={field.name}
                      type="text"
                      value={val || ''}
                      onChange={e => setPreferences({ ...preferences, [field.name]: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
                    />
                  )}

                  {field.helperText && (
                    <p className="text-[11px] text-slate-400">{field.helperText}</p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* STEP 5: REVIEW & INITIALIZE */}
      {currentStep === 5 && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Step 5: Review & Initialize</h2>
              <p className="text-xs text-slate-500 mt-1">Confirm your parameters before initializing the workspace.</p>
            </div>
            <Badge variant="purple" size="md">
              {activeTemplate.name}
            </Badge>
          </div>

          <div className="space-y-4 text-xs">
            {/* Summary Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">Title & Purpose</span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-brand-600 hover:text-brand-700 font-bold inline-flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              </div>
              <p className="text-sm font-bold text-slate-900">{title}</p>
              {description && <p className="text-slate-600 leading-relaxed">{description}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold uppercase text-[10px]">Schedule & Place</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-brand-600 hover:text-brand-700 font-bold inline-flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div className="space-y-1 text-slate-700">
                  <p><strong>Starts:</strong> {startDate ? formatDate(startDate) : 'Not specified'}</p>
                  <p><strong>Attendance:</strong> {attendance} attendees</p>
                  <p><strong>Location:</strong> {city || 'Virtual'}, {country}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold uppercase text-[10px]">Budget Limits</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-brand-600 hover:text-brand-700 font-bold inline-flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div className="space-y-1 text-slate-700">
                  <p className="text-base font-extrabold text-slate-900">
                    {formatMoney(majorToMinorUnits(budgetMajor), currency)}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Category allocations will auto-populate from {activeTemplate.name} guidance.
                  </p>
                </div>
              </div>
            </div>

            {/* Active Modules & Suggested Tasks Preview */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">Proposed Modules</span>
                <span className="text-slate-400 font-mono text-[11px]">{activeTemplate.defaultModules.length} Active</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeTemplate.defaultModules.map(m => (
                  <Badge key={m} variant="default" size="sm">
                    {m.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Workspace will initialize with {activeTemplate.suggestedTasks.length} baseline milestones ready for execution.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Wizard Footer Controls */}
      <div className="flex items-center justify-between pt-4">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        ) : <div />}

        {currentStep < 5 ? (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {submitting ? 'Initializing Workspace...' : 'Confirm & Initialize Event'}
            <CheckCircle2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
