'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/components/auth/AuthProvider';

export default function AgentProfilePage() {
  const { user, profile } = useAuth();
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Agent';
  const displayRole = profile?.role || user?.user_metadata?.role || 'Insurance Agent';
  const displayEmail = user?.email || '';

  return (
    <div className="space-y-6 max-w-xl">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Agent Credentials Profile</h2>
      <Card className="p-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-emerald-600 text-white font-bold text-xl flex items-center justify-center ring-4 ring-emerald-500/20 shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{displayName}</h3>
            <p className="text-xs text-brand-600 font-semibold">{displayRole}</p>
            <p className="text-xs text-slate-500 mt-0.5">{displayEmail}</p>
            <p className="text-xs text-slate-400 mt-1 font-mono">License ID: #AG-99201-NY</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
