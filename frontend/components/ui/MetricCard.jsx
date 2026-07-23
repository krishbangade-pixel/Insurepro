'use client';

import React from 'react';
import { Card } from './Card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Users, ShieldCheck, FileText, DollarSign, Hourglass, AlertTriangle } from 'lucide-react';

const iconMap = {
  Users,
  ShieldCheck,
  FileText,
  DollarSign,
  Hourglass,
  AlertTriangle,
};

export function MetricCard({ title, value, change, isPositive, subtitle, icon, color = 'emerald' }) {
  const IconComponent = iconMap[icon] || ShieldCheck;

  const colorVariants = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400',
  };

  return (
    <Card hover className="relative overflow-hidden p-4 sm:p-5">
      <div className="flex items-center space-x-3.5">
        <div className={cn('p-3 rounded-2xl shrink-0 transition-transform duration-200 hover:scale-105', colorVariants[color])}>
          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
            {title}
          </p>
          <div className="flex items-baseline space-x-2 mt-1">
            <h4 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {value}
            </h4>
            {change && (
              <span
                className={cn(
                  'inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full',
                  isPositive
                    ? 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'bg-rose-100/80 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                )}
              >
                {isPositive ? (
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-0.5" />
                )}
                {change}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
