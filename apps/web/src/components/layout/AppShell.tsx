'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  CheckSquare,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  Sparkles,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { dataService } from '@/lib/data-service';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Events', href: '/events', icon: CalendarDays },
  { label: 'Create Event', href: '/events/new', icon: PlusCircle },
  { label: 'Tasks & Calendar', href: '/tasks', icon: CheckSquare },
  { label: 'People & Resources', href: '/resources', icon: Users },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings }
];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleResetData = async () => {
    if (confirm('Reset all demo events, tasks, and budgets back to the initial demo dataset?')) {
      setResetting(true);
      await dataService.resetToDemoData();
      setResetting(false);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 text-sm tracking-tight">Celebration Planner</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 min-h-screen sticky top-0 z-30">
        {/* Brand Logo Header */}
        <div className="h-16 px-6 flex items-center border-b border-slate-100 gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 tracking-tight leading-none">Celebration</div>
            <div className="text-[11px] text-brand-600 font-semibold tracking-wide mt-0.5">& Event Planner</div>
          </div>
        </div>

        {/* Phase Indicator Badge */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              Phase 1 Frontend
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-100/60 text-emerald-800">
              Local Demo
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main Navigation">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-200/60 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / Reset & Profile */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <button
            type="button"
            onClick={handleResetData}
            disabled={resetting}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"
            title="Reset events and tasks to default demo seed"
          >
            <RotateCcw className={`w-3 h-3 ${resetting ? 'animate-spin' : ''}`} />
            Reset Demo Data
          </button>

          <div className="flex items-center gap-3 pt-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 flex items-center justify-center text-white text-xs font-bold">
              DO
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">Demo Organizer</p>
              <p className="text-[10px] text-slate-400 truncate">Local Mode (No Auth)</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-64 bg-white h-full shadow-2xl flex flex-col p-4 animate-in slide-in-from-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-slate-900 text-sm">Celebration</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetData}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs text-slate-600 bg-slate-100 rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Demo Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex h-16 px-8 bg-white border-b border-slate-200/80 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="font-medium text-slate-700">Universal Platform</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold capitalize">
              {pathname === '/' || pathname === '/dashboard' ? 'Overview Dashboard' : pathname.replace('/', '').replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Popover Preview */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 text-xs animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-bold text-slate-800">
                    <span>Notifications</span>
                    <span className="text-[10px] text-brand-600 font-semibold uppercase">Prototype</span>
                  </div>
                  <div className="py-3 space-y-2.5">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="font-medium text-slate-800 text-[11px]">Milestone Approaching</p>
                      <p className="text-slate-500 text-[10px] mt-0.5">Dean Approval deadline for CodeStorm 2027 in 5 days.</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="font-medium text-slate-800 text-[11px]">Budget Balance Alert</p>
                      <p className="text-slate-500 text-[10px] mt-0.5">Ananya & Kabir wedding budget is 95% allocated.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/events/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Create Event
            </Link>
          </div>
        </header>

        {/* Dynamic Page Children */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
