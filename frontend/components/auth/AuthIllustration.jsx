'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldCheck, Zap, BarChart3, Users, FileCheck } from 'lucide-react';

export function AuthIllustration() {
  const features = [
    {
      title: 'Enterprise Security',
      desc: 'Bank-level encryption and data protection',
      icon: ShieldCheck,
    },
    {
      title: 'Fast & Efficient',
      desc: 'Automate workflows and save valuable time',
      icon: Zap,
    },
    {
      title: 'Real-time Insights',
      desc: 'Powerful dashboards and analytics',
      icon: BarChart3,
    },
    {
      title: 'Role-Based Access',
      desc: 'Secure access for admins, agents & customers',
      icon: Users,
    },
  ];

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-8 lg:p-12 text-white select-none overflow-hidden bg-gradient-to-br from-[#04382A] via-[#032E22] to-[#022118]">
      {/* Background Subtle Gradient Wave Blur */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Logo */}
      <div className="relative z-10 flex items-center space-x-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-950/40">
          <Shield className="w-6 h-6 fill-current" />
        </div>
        <div>
          <span className="text-xl font-extrabold tracking-tight text-white font-sans">
            Insure<span className="text-emerald-400">Pro</span>
          </span>
          <p className="text-[10px] text-emerald-300 font-medium tracking-wider uppercase">
            Insurance Management Platform
          </p>
        </div>
      </div>

      {/* Hero Title & Subtitle */}
      <div className="relative z-10 my-auto py-6 space-y-8 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-white font-serif">
            Smart Insurance<br />
            Management<br />
            <span className="text-emerald-400 font-sans">Simplified.</span>
          </h1>

          <p className="text-sm text-emerald-100/80 leading-relaxed font-normal">
            Manage policies, streamline claims, track premiums, and grow your business — all from one secure platform.
          </p>
        </motion.div>

        {/* 2x2 Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-start space-x-3 hover:bg-white/10 transition-colors"
              >
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-snug">{feat.title}</h4>
                  <p className="text-[10px] text-emerald-200/70 leading-tight mt-0.5">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Bottom Glass Statistics Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl grid grid-cols-3 gap-2"
        >
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-white">10K+</p>
              <p className="text-[10px] text-emerald-200/80">Active Customers</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 border-x border-white/15 px-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-white">25K+</p>
              <p className="text-[10px] text-emerald-200/80">Policies Managed</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 pl-1">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-white">98.6%</p>
              <p className="text-[10px] text-emerald-200/80">Claims Processed</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Footer */}
      <div className="relative z-10 flex items-center space-x-2 text-xs text-emerald-200/60 pt-4">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>© 2026 InsurePro. All rights reserved.</span>
      </div>
    </div>
  );
}
