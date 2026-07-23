import React from 'react';
import { cn } from '@/lib/utils';

export const Checkbox = React.forwardRef(
  ({ label, error, className, containerClassName, ...props }, ref) => {
    return (
      <div className={cn('space-y-1', containerClassName)}>
        <label className="flex items-center space-x-2.5 cursor-pointer select-none">
          <input
            ref={ref}
            type="checkbox"
            className={cn(
              'w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500/20 focus:ring-2 dark:bg-slate-900 transition-colors cursor-pointer',
              className
            )}
            {...props}
          />
          {label && (
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              {label}
            </span>
          )}
        </label>
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
