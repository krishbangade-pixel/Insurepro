'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Tabs({ tabs = [], activeTab, onChange, className }) {
  return (
    <div className={cn('flex items-center space-x-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors duration-200 focus:outline-none',
              isActive
                ? 'text-brand-600 dark:text-brand-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'ml-2 px-2 py-0.5 rounded-full text-[10px]',
                  isActive
                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                )}
              >
                {tab.count}
              </span>
            )}

            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-500 rounded-t-full"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
