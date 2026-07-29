'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, DollarSign, FileText, Plus, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/components/auth/AuthProvider';
import api from '@/lib/api';
import { mapPolicy, mapClaim } from '@/lib/mappers';
import { PageLoader, PageError } from '@/components/common/PageState';

export default function CustomerDashboard() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Customer';

  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([api.get('/policies'), api.get('/claims')])
      .then(([policiesRes, claimsRes]) => {
        if (!mounted) return;
        setPolicies((policiesRes.data.data || []).map(mapPolicy));
        setClaims((claimsRes.data.data || []).map(mapClaim));
      })
      .catch((err) => {
        if (mounted) setError(err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  if (loading) return <PageLoader />;
  if (error) return <PageError message={error} />;

  const activePolicies = policies.filter((p) => p.status === 'Active' || p.status === 'Expiring Soon');
  const activeCoverageTotal = activePolicies.reduce((sum, p) => sum + (Number(p.coverageAmountRaw) || 0), 0);
  const nextPremiumTotal = activePolicies.reduce((sum, p) => sum + (Number(p.premiumAmountRaw) || 0), 0);
  const openClaims = claims.filter((c) => c.status === 'Pending' || c.status === 'In Review');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Welcome, {displayName} 👋
          </h2>
          <p className="text-xs text-slate-500">Manage your active policies, file claims, and pay monthly premiums online.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/customer/policies')}>
            View My Policies
          </Button>
          <Button variant="primary" leftIcon={Plus} onClick={() => router.push('/customer/claims')}>
            File New Claim
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 space-y-2 border-l-4 border-emerald-500">
          <p className="text-xs text-slate-500 font-medium">Active Coverage Total</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            ${activeCoverageTotal.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold">
            {activePolicies.length} Active {activePolicies.length === 1 ? 'Policy' : 'Policies'}
          </p>
        </Card>
        <Card className="p-5 space-y-2 border-l-4 border-blue-500">
          <p className="text-xs text-slate-500 font-medium">Monthly Premiums Total</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            ${nextPremiumTotal.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 font-mono">Current Billing Cycle</p>
        </Card>
        <Card className="p-5 space-y-2 border-l-4 border-purple-500">
          <p className="text-xs text-slate-500 font-medium">Open Claims</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {openClaims.length} {openClaims.length === 1 ? 'Claim' : 'Claims'}
          </p>
          <p className="text-[11px] text-amber-600 font-semibold">
            {openClaims.length > 0 ? `${openClaims[0].id} (${openClaims[0].status})` : 'All claims resolved'}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <CardHeader
          title="My Active Policies"
          subtitle="Current live insurance coverage schedules"
          action={
            <Button variant="ghost" size="sm" onClick={() => router.push('/customer/policies')} className="text-xs text-brand-600 font-semibold">
              View All Policies →
            </Button>
          }
        />
        <div className="space-y-3">
          {policies.length === 0 ? (
            <div className="text-center py-8 space-y-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Active Insurance Policies</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You do not have any issued policies under your profile yet. Please contact an underwriter or agent to get covered.
              </p>
            </div>
          ) : (
            policies.map((pol) => (
              <div key={pol.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">
                      {pol.id} — {pol.planName}
                    </p>
                    <p className="text-xs text-slate-500">
                      Category: {pol.policyType} • Coverage: {pol.coverageAmount}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={pol.status === 'Active' ? 'success' : pol.status === 'Expiring Soon' ? 'warning' : 'neutral'}>
                    {pol.status}
                  </Badge>
                  <Button variant="outline" size="sm" leftIcon={Download} onClick={() => toast.success(`Downloaded ${pol.id} policy schedule`)}>
                    Download Schedule
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
