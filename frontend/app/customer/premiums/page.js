'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerPremiumsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Premium Billing & Quick Pay</h2>
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
          <div>
            <p className="text-xs text-slate-500">Upcoming Statement: POL-2025-089</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">$450.00</p>
            <p className="text-xs text-slate-400">Due July 01, 2025</p>
          </div>
          <Button variant="primary" leftIcon={CreditCard} onClick={() => toast.success('Payment of $450.00 submitted!')}>
            Pay Premium Now
          </Button>
        </div>
      </Card>
    </div>
  );
}
