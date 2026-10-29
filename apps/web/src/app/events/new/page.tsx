'use client';

import React, { Suspense } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { CreateEventWizard } from '@/components/wizard/CreateEventWizard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function NewEventPage() {
  return (
    <AppShell>
      <div className="py-4">
        <Suspense fallback={<div className="py-12"><LoadingSpinner size="lg" /></div>}>
          <CreateEventWizard />
        </Suspense>
      </div>
    </AppShell>
  );
}
