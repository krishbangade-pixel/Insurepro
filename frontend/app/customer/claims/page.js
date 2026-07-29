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
  const [selectedPolicyIndex, setSelectedPolicyIndex] = useState(0);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const fetchClaims = () => {
    api.get('/claims').then((r) => setClaims(r.data.data || [])).catch(() => {});
    api.get('/policies').then((r) => setPolicies(r.data.data || [])).catch(() => {});
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      const pol = policies[selectedPolicyIndex] || policies[0];
      const res = await api.post('/claims', {
        policy_id: pol?.id,
        claim_amount: Number(amount) || 1000,
        description: description || 'Submitted from app',
      });
      toast.success('Claim submitted to adjuster!');
      setShowForm(false);
      setAmount('');
      setDescription('');
      setClaims([res.data.data, ...claims]);
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
        <form onSubmit={handleSubmit}>
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold">File Claim Form</h3>
            <Select
              label="Policy"
              options={(policies || []).map((p) => `${p.policy_number || p.id} (${p.plan_name})`)}
              onChange={(e) => setSelectedPolicyIndex(e.target.selectedIndex || 0)}
            />
            <Input
              label="Claim Amount ($)"
              placeholder="5,000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <Input
              label="Incident Description"
              placeholder="Explain what occurred..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <Button variant="primary" type="submit">
              Submit Claim File
            </Button>
          </Card>
        </form>
      )}

      <div className="space-y-3">
        {claims.map((c) => (
          <Card key={c.id} className="p-4 flex items-center justify-between">
            <div>
              <span className="font-bold font-mono text-xs">{c.claim_number || c.id}</span>
              <p className="text-sm font-bold">{c.priority || 'Medium'}</p>
              <p className="text-xs text-slate-400">
                Submitted: {c.submission_date || c.created_at ? new Date(c.submission_date || c.created_at).toLocaleDateString() : '-'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-bold text-sm">
                ${Number(c.claim_amount || c.amount || 0).toLocaleString()}
              </span>
              <Badge variant={c.status === 'Approved' ? 'success' : c.status === 'Rejected' ? 'danger' : 'info'}>
                {c.status}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
