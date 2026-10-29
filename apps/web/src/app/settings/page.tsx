'use client';

import React, { useState } from 'react';
import {
  Settings,
  RotateCcw,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Info
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { dataService } from '@/lib/data-service';

export default function SettingsPage() {
  const [defaultCurrency, setDefaultCurrency] = useState('INR');
  const [defaultTimezone, setDefaultTimezone] = useState('Asia/Kolkata');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetData = async () => {
    if (confirm('Are you sure you want to restore the initial demo events, tasks, and budgets?')) {
      setResetting(true);
      await dataService.resetToDemoData();
      setResetting(false);
      window.location.assign('/dashboard');
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Platform Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure regional defaults and local prototype data storage.
          </p>
        </div>

        {/* Phase Scope Callout */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Authentication & Tenancy Architecture</p>
            <p className="mt-0.5 leading-relaxed text-amber-800">
              In <strong>Phase 1</strong>, the application operates in single-user local prototype mode without authentication. Secure session tokens, password hashing, and user-level multi-tenancy are scheduled for <strong>Phase 2</strong>.
            </p>
          </div>
        </div>

        {/* Preferences Form */}
        <Card className="p-6 space-y-6">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Regional & Financial Defaults</h2>
              <p className="text-xs text-slate-500 mt-0.5">Control the default currency and timezone for new events.</p>
            </div>
            {savedSuccess && (
              <span className="text-xs font-semibold text-emerald-600 inline-flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved Preferences
              </span>
            )}
          </div>

          <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1" htmlFor="set-curr">
                  Default Platform Currency
                </label>
                <select
                  id="set-curr"
                  value={defaultCurrency}
                  onChange={e => setDefaultCurrency(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 bg-white"
                >
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="CAD">CAD (CA$ - Canadian Dollar)</option>
                  <option value="AUD">AUD (AU$ - Australian Dollar)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1" htmlFor="set-tz">
                  Default Display Timezone
                </label>
                <select
                  id="set-tz"
                  value={defaultTimezone}
                  onChange={e => setDefaultTimezone(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 bg-white"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                  <option value="America/New_York">America/New York (EST/EDT)</option>
                  <option value="America/Los_Angeles">America/Los Angeles (PST/PDT)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="UTC">UTC (Universal Time)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-sm"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </Card>

        {/* Demo Data Management */}
        <Card className="p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Demo Repository Management</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Reset browser-cached modifications back to the clean canonical demo dataset.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <p className="text-xs font-semibold text-slate-800">Restore Canonical Seed</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Clears all newly created test events and restores the initial 4 demo scenarios.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetData}
              disabled={resetting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
              {resetting ? 'Resetting Data...' : 'Reset Demo Repository'}
            </button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
