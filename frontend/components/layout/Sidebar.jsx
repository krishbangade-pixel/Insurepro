'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Shield,
  LayoutDashboard,
  Users,
  FileCheck,
  FileText,
  DollarSign,
  FolderOpen,
  UserCheck,
  BarChart3,
  Bell,
  Settings,
  History,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';

export function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const pathname = usePathname();
  const { user, profile } = useAuth();

  // Determine current role based on URL route
  const isAgent = pathname.startsWith('/agent');
  const isCustomer = pathname.startsWith('/customer');

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const displayRole = profile?.role || user?.user_metadata?.role || (isAgent ? 'Insurance Agent' : isCustomer ? 'Customer' : 'Admin');

  // Menu configurations for each role
  const adminSections = [
    {
      title: 'MAIN',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Customers', href: '/customers', icon: Users },
        { name: 'Policies', href: '/policies', icon: FileCheck },
        { name: 'Claims', href: '/claims', icon: FileText },
        { name: 'Premiums', href: '/premiums', icon: DollarSign },
        { name: 'Documents', href: '/documents', icon: FolderOpen },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        { name: 'Agents Roster', href: '/agents', icon: UserCheck },
        { name: 'Analytics & Reports', href: '/reports', icon: BarChart3 },
        { name: 'Notifications', href: '/notifications', icon: Bell },
        { name: 'Audit Logs', href: '/audit-logs', icon: History },
        { name: 'Settings', href: '/settings', icon: Settings },
      ],
    },
  ];

  const agentSections = [
    {
      title: 'AGENT PORTAL',
      items: [
        { name: 'Agent Dashboard', href: '/agent/dashboard', icon: LayoutDashboard },
        { name: 'Policies & Issuance', href: '/agent/policies', icon: FileCheck },
        { name: 'Assigned Customers', href: '/agent/customers', icon: Users },
        { name: 'Assigned Claims', href: '/agent/claims', icon: FileText },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        { name: 'My Profile', href: '/agent/profile', icon: User },
      ],
    },
  ];

  const customerSections = [
    {
      title: 'MY INSUREPRO',
      items: [
        { name: 'Dashboard', href: '/customer/dashboard', icon: LayoutDashboard },
        { name: 'My Policies', href: '/customer/policies', icon: FileCheck },
        { name: 'My Claims', href: '/customer/claims', icon: FileText },
        { name: 'Premiums & Billing', href: '/customer/premiums', icon: DollarSign },
        { name: 'Documents Vault', href: '/customer/documents', icon: FolderOpen },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        { name: 'My Profile', href: '/customer/profile', icon: User },
      ],
    },
  ];

  const menuSections = isAgent ? agentSections : isCustomer ? customerSections : adminSections;

  const userProfile = {
    name: displayName,
    role: displayRole,
    initial: displayName.charAt(0).toUpperCase(),
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-sidebar-bg border-r border-sidebar-border text-sidebar-text transition-all duration-300 ease-in-out select-none shadow-xl',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-sidebar-border shrink-0">
          <Link href={isAgent ? '/agent/dashboard' : isCustomer ? '/customer/dashboard' : '/dashboard'} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-900/40 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 fill-current" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight text-white font-sans">
                  Insure<span className="text-emerald-400">Pro</span>
                </span>
                <span className="text-[10px] text-sidebar-muted uppercase tracking-wider font-semibold">
                  {isAgent ? 'Agent Portal' : isCustomer ? 'Customer Portal' : 'Insurance Management'}
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Menu List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-bold text-sidebar-muted uppercase tracking-wider mb-2">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href.length > 1 && pathname.startsWith(item.href + '/'));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={cn(
                      'relative flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group',
                      isActive
                        ? 'bg-sidebar-active text-white shadow-md shadow-brand-950/30'
                        : 'text-sidebar-text/80 hover:bg-sidebar-hover hover:text-white'
                    )}
                  >
                    <Icon className={cn('w-5 h-5 shrink-0 transition-transform group-hover:scale-110', isActive ? 'text-white' : 'text-sidebar-muted')} />

                    {!isCollapsed && (
                      <span className="flex-1 truncate">{item.name}</span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500 text-slate-950">
                        {item.badge}
                      </span>
                    )}

                    {/* Active Indicator Glow */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebarActivePill"
                        className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r-full"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Footer Profile */}
        <div className="p-3 border-t border-sidebar-border shrink-0 space-y-2">
          {!isCollapsed ? (
            <div className="p-2.5 rounded-2xl bg-sidebar-hover/60 flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-emerald-400/40 shrink-0">
                  {userProfile.initial}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {userProfile.name}
                  </p>
                  <p className="text-[10px] text-sidebar-muted truncate">
                    {userProfile.role}
                  </p>
                </div>
              </div>
              <Link href="/login" className="p-1.5 text-sidebar-muted hover:text-rose-400 transition-colors">
                <LogOut className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-emerald-400/40 shrink-0">
                {userProfile.initial}
              </div>
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-full items-center justify-center space-x-2 py-2 px-3 text-xs font-semibold text-sidebar-muted hover:text-white hover:bg-sidebar-hover rounded-xl transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Menu</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
