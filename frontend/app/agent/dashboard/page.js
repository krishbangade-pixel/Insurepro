'use client';

import React from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { MetricCard } from '@/components/ui/MetricCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { recentClaimsData, customersList } from '@/lib/mockData';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AgentDashboard() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Agent Workspace Dashboard
        </h2>
        <p className="text-xs text-slate-500">Welcome, Marcus Vance! Here is your assigned claims queue and client activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard title="Assigned Customers" value="98" change="+4" isPositive icon="Users" color="emerald" />
        <MetricCard title="Active Policies" value="215" change="+8" isPositive icon="ShieldCheck" color="blue" />
        <MetricCard title="Pending Verifications" value="12" change="-2" isPositive={false} icon="Hourglass" color="rose" />
        <MetricCard title="Claim Settlement Rate" value="96.1%" change="+1.2%" isPositive icon="Award" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 p-5">
          <CardHeader title="Assigned Claims Queue" subtitle="Claims assigned to your underwriter queue requiring review" />
          <div className="space-y-3">
            {recentClaimsData.slice(0, 3).map((cl) => (
              <div key={cl.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">{cl.id}</span>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{cl.customer.name} • {cl.type}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-xs">{cl.claimAmount}</span>
                  <Badge variant="warning">{cl.status}</Badge>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.success(`Reviewing ${cl.id}`)}>
                    Inspect File
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-4 p-5">
          <CardHeader title="Assigned Accounts" subtitle="Top accounts under your management" />
          <div className="space-y-3">
            {customersList.slice(0, 3).map((cust) => (
              <div key={cust.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                <div className="flex items-center space-x-2">
                  <img src={cust.avatar} alt={cust.name} className="w-7 h-7 rounded-full object-cover" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{cust.name}</p>
                    <p className="text-[10px] text-slate-400">{cust.tier} Tier</p>
                  </div>
                </div>
                <span className="font-bold text-emerald-600">{cust.totalPremiums}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
