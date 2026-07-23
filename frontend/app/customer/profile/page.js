'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CustomerProfilePage() {
  return (
    <div className="space-y-6 max-w-xl">
      <h2 className="text-xl font-bold">Policyholder Account Profile</h2>
      <Card className="p-6 space-y-4">
        <div className="flex items-center space-x-4">
          <img
            src="https://i.pravatar.cc/150?u=johnsmith"
            alt="John Smith"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h3 className="text-base font-bold">John Smith</h3>
            <p className="text-xs text-slate-500">john.smith@gmail.com</p>
            <p className="text-xs text-brand-600 font-bold">Platinum Tier Policyholder</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
