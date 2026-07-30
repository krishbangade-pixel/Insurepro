'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Search,
  Bell,
  Mail,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  Settings as SettingsIcon,
  Menu,
  Loader2,
} from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import { GlobalSearchModal } from '@/components/common/GlobalSearchModal';
import { useAuth } from '@/components/auth/AuthProvider';
import toast from 'react-hot-toast';

export function Navbar({ onMobileMenuToggle }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, profile, signOut, loading } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Dynamic Page Title using profile name
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const displayRole = profile?.role || user?.user_metadata?.role || 'User';
  const displayEmail = user?.email || '';

  const getPageTitle = () => {
    const rawSegment = pathname.split('/')[1] || 'dashboard';
    if (rawSegment === 'dashboard') return `Welcome back, ${displayName.split(' ')[0]}! 👋`;
    return rawSegment.charAt(0).toUpperCase() + rawSegment.slice(1).replace('-', ' ');
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    } finally {
      setIsSigningOut(false);
      setIsProfileOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-3 transition-colors">
        <div className="flex items-center justify-between gap-4">
          {/* Left Side: Mobile Menu Button + Page Info */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onMobileMenuToggle}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <Breadcrumb />
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Center: Search Trigger (Ctrl + K) */}
          <div className="flex-1 max-w-md mx-2 sm:mx-6">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm text-slate-400 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-slate-400" />
                <span className="truncate">Search anything...</span>
              </div>
              <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md shadow-xs">
                Ctrl + K
              </kbd>
            </button>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Notification Bell */}
            <button
              onClick={() => router.push('/notifications')}
              className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                5
              </span>
            </button>

            {/* Messages Icon */}
            <button
              onClick={() => router.push('/notifications')}
              className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:flex"
              title="Messages"
            >
              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                3
              </span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Theme"
            >
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 hidden dark:block" />
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 block dark:hidden" />
            </button>

            {/* Vertical Divider */}
            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

            {/* User Profile Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center ring-2 ring-brand-500/30 text-white text-xs font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {displayRole}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-dropdown py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {displayEmail}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        router.push('/settings');
                      }}
                      className="w-full px-4 py-2 text-xs text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                    >
                      <SettingsIcon className="w-4 h-4 text-slate-400" />
                      <span>Account Settings</span>
                    </button>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="w-full px-4 py-2 text-xs text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center space-x-2 font-medium disabled:opacity-50"
                    >
                      {isSigningOut ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogOut className="w-4 h-4" />
                      )}
                      <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Command Palette Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
