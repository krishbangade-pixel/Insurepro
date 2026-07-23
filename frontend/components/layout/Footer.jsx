import React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-4 px-6 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
      <p>© 2026 InsurePro Inc. All rights reserved. Enterprise Insurance Platform v2.4.</p>
      <div className="flex items-center space-x-4">
        <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</a>
        <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Compliance & SOC2</a>
      </div>
    </footer>
  );
}
