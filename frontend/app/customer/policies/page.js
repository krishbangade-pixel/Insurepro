'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { policiesList } from '@/lib/mockData';

export default function CustomerPoliciesPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">My Insurance Policies</h2>
      <div className="space-y-4">
        {policiesList.slice(0, 2).map((pol) => (
          <Card key={pol.id} className="p-5 flex items-center justify-between">
            <div>
              <span className="font-bold text-sm font-mono">{pol.id}</span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{pol.planName}</h3>
              <p className="text-xs text-slate-400">Coverage: {pol.coverage} • Premium: {pol.premium}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="success">{pol.status}</Badge>
              <Button variant="outline" size="sm" leftIcon={Download} onClick={() => toast.success(`Policy PDF downloaded for ${pol.id}`)}>
                Schedule PDF
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
