'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function CustomerPoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.get('/policies')
      .then((res) => { if (mounted) setPolicies(res.data.data || []); })
      .catch((e) => { if (mounted) setError(e.response?.data?.message || e.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Loading policies…</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">My Insurance Policies</h2>
      <div className="space-y-4">
        {policies.map((pol) => (
          <Card key={pol.id} className="p-5 flex items-center justify-between">
            <div>
              <span className="font-bold text-sm font-mono">{pol.policy_number || pol.id}</span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{pol.plan_name}</h3>
              <p className="text-xs text-slate-400">Coverage: {pol.coverage_amount} • Premium: {pol.premium_amount}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant={pol.status === 'active' ? 'success' : 'neutral'}>{pol.status}</Badge>
              <Button variant="outline" size="sm" leftIcon={Download} onClick={() => toast.success(`Policy PDF downloaded for ${pol.policy_number || pol.id}`)}>
                Schedule PDF
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
