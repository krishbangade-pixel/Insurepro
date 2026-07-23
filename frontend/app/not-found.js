'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">404 - Record Not Found</h1>
          <p className="text-xs text-slate-500">
            The insurance policy, customer file, or route you are looking for does not exist or has been archived.
          </p>
        </div>
        <Link href="/dashboard" className="inline-block">
          <Button variant="primary" leftIcon={ArrowLeft}>
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
