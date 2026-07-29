'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Download, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { mapPolicy } from '@/lib/mappers';
import { PageLoader, PageError } from '@/components/common/PageState';

export default function CustomerPoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.get('/policies')
      .then((res) => { if (mounted) setPolicies((res.data.data || []).map(mapPolicy)); })
      .catch((e) => { if (mounted) setError(e.response?.data?.message || e.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return <PageLoader />;
  if (error) return <PageError message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Insurance Policies</h2>
        <p className="text-xs text-slate-500">View your active insurance schedules and policy terms.</p>
      </div>

      <div className="space-y-4">
        {policies.length === 0 ? (
          <Card className="p-12 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Policies Issued Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your registered account does not have any active insurance policies under your profile yet.
            </p>
          </Card>
        ) : (
          policies.map((pol) => (
            <Card key={pol.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center shrink-0 font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-xs font-mono text-slate-500">{pol.id}</span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{pol.planName}</h3>
                  <p className="text-xs text-slate-500">
                    Category: {pol.policyType} • Coverage: {pol.coverageAmount} • Premium: {pol.premiumAmount}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 self-end sm:self-center">
                <Badge variant={pol.status === 'Active' ? 'success' : pol.status === 'Expiring Soon' ? 'warning' : 'neutral'}>
                  {pol.status}
                </Badge>
                <Button variant="outline" size="sm" leftIcon={Download} onClick={() => toast.success(`Policy Schedule downloaded for ${pol.id}`)}>
                  Schedule PDF
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
