'use client';

import React from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, DollarSign, FileText, Plus, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function CustomerDashboard() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Welcome, John Smith 👋
          </h2>
          <p className="text-xs text-slate-500">Manage your active policies, file claims, and pay monthly premiums online.</p>
        </div>
        <Button variant="primary" leftIcon={Plus} onClick={() => router.push('/customer/claims')}>
          File New Claim
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 space-y-2 border-l-4 border-emerald-500">
          <p className="text-xs text-slate-500">Active Coverage Total</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">$1,000,000</p>
          <p className="text-[11px] text-emerald-600 font-semibold">3 Active Policies</p>
        </Card>
        <Card className="p-5 space-y-2 border-l-4 border-blue-500">
          <p className="text-xs text-slate-500">Next Premium Due</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">$450.00</p>
          <p className="text-[11px] text-slate-400 font-mono">Due on July 01, 2025</p>
        </Card>
        <Card className="p-5 space-y-2 border-l-4 border-purple-500">
          <p className="text-xs text-slate-500">Open Claims</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">1 Claim</p>
          <p className="text-[11px] text-amber-600 font-semibold">CLM-2025-1256 (In Review)</p>
        </Card>
      </div>

      <Card className="p-6">
        <CardHeader title="My Active Policies" subtitle="Current insurance coverage schedules" />
        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-6 h-6 text-brand-600" />
              <div>
                <p className="font-bold text-sm">POL-2025-089 - Health Insurance</p>
                <p className="text-xs text-slate-400">Comprehensive Executive Health Plan</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="success">Active</Badge>
              <Button variant="outline" size="sm" leftIcon={Download} onClick={() => toast.success('Downloaded policy PDF')}>
                Download Schedule
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
