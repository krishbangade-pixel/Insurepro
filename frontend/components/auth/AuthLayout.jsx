'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AuthIllustration } from './AuthIllustration';
import { Logo } from './Logo';

export function AuthLayout({ children, isSplit = true }) {
  if (isSplit) {
    return (
      <div className="min-h-screen bg-[#033526] font-sans flex items-center justify-center p-0 lg:p-6">
        <div className="w-full max-w-[1440px] min-h-screen lg:min-h-[850px] grid grid-cols-1 lg:grid-cols-12 rounded-none lg:rounded-[2.5rem] overflow-hidden shadow-2xl border-0 lg:border border-emerald-900/40 bg-[#033526]">
          {/* Left Side: Hero Illustration */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-6">
            <AuthIllustration />
          </div>

          {/* Right Side: Floating Auth Card Wrapper */}
          <div className="col-span-1 lg:col-span-6 xl:col-span-6 bg-[#033526] p-4 sm:p-8 lg:p-10 flex flex-col justify-center items-center">
            {/* Mobile Header Logo */}
            <div className="lg:hidden my-4">
              <Logo textClassName="text-white" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-full max-w-xl"
            >
              {children}
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Centered Card Layout (Forgot Password, Reset Password)
  return (
    <div className="min-h-screen bg-[#033526] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="mb-8">
        <Logo textClassName="text-white" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {children}
      </motion.div>

      <footer className="text-center text-xs text-emerald-200/60 mt-8">
        © 2026 InsurePro. All rights reserved.
      </footer>
    </div>
  );
}
