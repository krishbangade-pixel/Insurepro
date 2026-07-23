'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AgentProfilePage() {
  return (
    <div className="space-y-6 max-w-xl">
      <h2 className="text-xl font-bold">Agent Credentials Profile</h2>
      <Card className="p-6 space-y-4">
        <div className="flex items-center space-x-4">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
            alt="Marcus Vance"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h3 className="text-base font-bold">Marcus Vance</h3>
            <p className="text-xs text-brand-600 font-semibold">Claims Specialist Lead</p>
            <p className="text-xs text-slate-400">License ID: #AG-99201-NY</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
