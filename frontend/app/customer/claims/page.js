'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { recentClaimsData } from '@/lib/mockData';

export default function CustomerClaimsPage() {
  const [showForm, setShowForm] = useState(false);

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
          <Select label="Policy" options={['POL-2025-089 (Health)', 'POL-2025-088 (Auto)']} />
          <Input label="Claim Amount ($)" placeholder="5,000" />
          <Input label="Incident Description" placeholder="Explain what occurred..." />
          <Button variant="primary" onClick={() => { toast.success('Claim submitted to adjuster!'); setShowForm(false); }}>
            Submit Claim File
          </Button>
        </Card>
      )}

      <div className="space-y-3">
        {recentClaimsData.slice(0, 2).map((c) => (
          <Card key={c.id} className="p-4 flex items-center justify-between">
            <div>
              <span className="font-bold font-mono text-xs">{c.id}</span>
              <p className="text-sm font-bold">{c.type}</p>
              <p className="text-xs text-slate-400">Submitted: {c.submittedOn}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-bold text-sm">{c.claimAmount}</span>
              <Badge variant="info">{c.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
