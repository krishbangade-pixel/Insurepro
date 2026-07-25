'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function CustomerClaimsPage() {
  const [showForm, setShowForm] = useState(false);
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    let mounted = true;
    api.get('/claims').then((r) => { if (mounted) setClaims(r.data.data || []); }).catch(() => {});
    api.get('/policies').then((r) => { if (mounted) setPolicies(r.data.data || []); }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async () => {
    try {
      await api.post('/claims', { policy_id: policies[0]?.id, amount: 1000, description: 'Submitted from app' });
      toast.success('Claim submitted to adjuster!');
      setShowForm(false);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">My Filed Claims</h2>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close Form' : '+ Submit New Claim'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold">File Claim Form</h3>
          <Select label="Policy" options={(policies || []).map((p) => `${p.policy_number || p.id} (${p.plan_name})`)} />
          <Input label="Claim Amount ($)" placeholder="5,000" />
          <Input label="Incident Description" placeholder="Explain what occurred..." />
          <Button variant="primary" onClick={handleSubmit}>
            Submit Claim File
          </Button>
        </Card>
      )}

      <div className="space-y-3">
        {claims.slice(0, 5).map((c) => (
          <Card key={c.id} className="p-4 flex items-center justify-between">
            <div>
              <span className="font-bold font-mono text-xs">{c.claim_number || c.id}</span>
              <p className="text-sm font-bold">{c.priority}</p>
              <p className="text-xs text-slate-400">Submitted: {new Date(c.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-bold text-sm">{c.amount}</span>
              <Badge variant="info">{c.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
