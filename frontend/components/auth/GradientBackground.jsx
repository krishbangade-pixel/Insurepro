'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function GradientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Dark Emerald Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-sidebar-bg via-brand-950 to-slate-950" />

      {/* Animated Glowing Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[120px]"
      />

      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.4, 0.2],
          y: [0, -30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-teal-500/20 blur-[120px]"
      />

      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0596690f_1px,transparent_1px),linear-gradient(to_bottom,#0596690f_1px,transparent_1px)] bg-[size:4rem_4rem]" />
    </div>
  );
}
