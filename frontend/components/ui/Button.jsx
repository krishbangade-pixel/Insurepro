'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      type = 'button',
      onClick,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        'bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow focus:ring-brand-500/20 active:bg-brand-800',
      secondary:
        'bg-teal-600 hover:bg-teal-700 text-white shadow-sm focus:ring-teal-500/20 active:bg-teal-800',
      outline:
        'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 shadow-xs',
      ghost:
        'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500/20 active:bg-rose-800',
      success:
        'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500/20',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded-lg font-medium gap-1.5',
      md: 'px-4 py-2 text-sm rounded-xl font-medium gap-2',
      lg: 'px-5 py-2.5 text-base rounded-xl font-semibold gap-2.5',
      icon: 'p-2 rounded-xl text-sm',
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.01 }}
        disabled={disabled || isLoading}
        onClick={onClick}
        className={cn(
          'inline-flex items-center justify-center font-sans transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          LeftIcon && <LeftIcon className="w-4 h-4 shrink-0" />
        )}
        <span>{children}</span>
        {!isLoading && RightIcon && <RightIcon className="w-4 h-4 shrink-0" />}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
