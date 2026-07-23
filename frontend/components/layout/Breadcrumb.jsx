'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumb() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
      <Link
        href="/dashboard"
        className="hover:text-slate-900 dark:hover:text-white flex items-center transition-colors"
      >
        <Home className="w-3.5 h-3.5 mr-1" />
        <span>Home</span>
      </Link>
      {pathSegments.map((segment, index) => {
        const url = `/${pathSegments.slice(0, index + 1).join('/')}`;
        const isLast = index === pathSegments.length - 1;
        const formattedName =
          segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');

        return (
          <React.Fragment key={url}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {isLast ? (
              <span className="text-slate-900 dark:text-white font-semibold capitalize truncate max-w-[120px] sm:max-w-none">
                {formattedName}
              </span>
            ) : (
              <Link
                href={url}
                className="hover:text-slate-900 dark:hover:text-white capitalize transition-colors"
              >
                {formattedName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
