'use client';

import { Card } from '@/components/ui/Card';

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading data...</p>
      </div>
    </div>
  );
}

export function PageError({ message }) {
  return (
    <div className="flex items-center justify-center py-20">
      <Card className="p-6 text-center max-w-md">
        <p className="text-sm font-semibold text-rose-600">Failed to load data</p>
        <p className="text-xs text-slate-500 mt-1">{message || 'Please try again later.'}</p>
      </Card>
    </div>
  );
}

export function EmptyState({ message, action }) {
  return (
    <Card className="p-8 text-center">
      <p className="text-sm text-slate-500">{message || 'No data found.'}</p>
      {action}
    </Card>
  );
}
