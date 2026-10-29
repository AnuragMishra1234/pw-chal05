'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Briefcase,
  UserCheck,
  Radio,
  Truck,
  HeartHandshake,
  ArrowRight,
  Info
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function ResourcesPage() {
  const resourceCategories = [
    {
      title: 'Guests & RSVPs',
      templates: 'Wedding, Birthday',
      desc: 'Attendee invitations, dietary preferences, table seating arrangements, plus-one tracking.',
      icon: Users,
      color: 'bg-rose-50 text-rose-600 border-rose-200'
    },
    {
      title: 'Judges, Mentors & Teams',
      templates: 'College Hackathon',
      desc: 'Hackathon team rosters, mentor appointment slots, scoring rubric submissions, and room assignments.',
      icon: UserCheck,
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      title: 'Volunteers & First Responders',
      templates: 'Community Initiative',
      desc: 'Shift assignments, municipal permit liaisons, safety briefing attendance, and supply allocation.',
      icon: HeartHandshake,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    {
      title: 'Keynote Speakers & VIPs',
      templates: 'Corporate Conference',
      desc: 'Speaker honorariums, bio approvals, slide deck submissions, flight arrangements, and stage timing.',
      icon: Radio,
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    },
    {
      title: 'Contractors & Equipment Vendors',
      templates: 'All Categories',
      desc: 'Audio-visual rental contracts, generator bookings, catering agreements, and formal quotation tracking.',
      icon: Truck,
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    }
  ];

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            People & Specialized Resources
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Universal roster coordinating participants, volunteers, judges, keynote speakers, and commercial vendors.
          </p>
        </div>

        {/* Phase Info Callout */}
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
          <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-900">Adaptive Resource Management (Phase 1 Preview)</p>
            <p className="mt-0.5 leading-relaxed text-slate-600">
              In this architecture, resources are not siloed in a separate CRM; they adapt to the active event template. For example, opening a wedding surfaces guests and caterers, while opening a hackathon surfaces mentors and judges.
            </p>
          </div>
        </div>

        {/* Resource Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resourceCategories.map(cat => {
            const Icon = cat.icon;
            return (
              <Card key={cat.title} className="p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="default" size="sm">
                      {cat.templates}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{cat.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{cat.desc}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Configured in Template</span>
                  <Link
                    href="/events"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    View Events <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
