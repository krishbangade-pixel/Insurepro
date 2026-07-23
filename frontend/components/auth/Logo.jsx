'use client';

import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className, textClassName }) {
  return (
    <Link href="/login" className={cn('flex items-center space-x-3 group select-none', className)}>
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-900/30 group-hover:scale-105 transition-transform duration-200">
        <Shield className="w-6 h-6 fill-current" />
      </div>
      <div className="flex flex-col">
        <span className={cn('text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans', textClassName)}>
          Insure<span className="text-emerald-500">Pro</span>
        </span>
        <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
          Insurance Platform
        </span>
      </div>
    </Link>
  );
}
