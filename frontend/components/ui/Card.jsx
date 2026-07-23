'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function Card({ children, className, hover = false, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={cn(
        'bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 rounded-2xl p-5 shadow-card hover:shadow-soft transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ title, subtitle, action, className }) {
  return (
    <div className={cn('flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700/50 mb-4', className)}>
      <div>
        {title && (
          <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
