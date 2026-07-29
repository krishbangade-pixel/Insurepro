'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, ArrowRight, ShieldCheck, Shield } from 'lucide-react';

import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Checkbox } from '@/components/common/Checkbox';
import { PasswordInput } from './PasswordInput';
import toast from 'react-hot-toast';
import { useAuth } from '@/components/auth/AuthProvider';

const loginSchema = z.object({
  email: z.string().min(1, 'Email address is required').email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export function LoginForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await signIn({
        email: data.email,
        password: data.password,
      });

      const userRole = result.user?.user_metadata?.role || result.profile?.role || 'Customer';
      toast.success(`Successfully signed in!`);

      setTimeout(() => {
        setIsLoading(false);
        if (userRole === 'Admin') {
          router.push('/dashboard');
        } else if (userRole === 'Insurance Agent' || userRole === 'Agent') {
          router.push('/agent/dashboard');
        } else {
          router.push('/customer/dashboard');
        }
      }, 500);
    } catch (error) {
      setIsLoading(false);
      toast.error(error.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
      {/* Top Header Row with Security Pill */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-serif">
            Welcome Back
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Sign in to access your InsurePro account.
          </p>
        </div>

        <div className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold shrink-0">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Bank-Level Encryption</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          icon={Mail}
          placeholder="Enter your email"
          error={errors.email?.message}
          {...register('email')}
        />

        <PasswordInput
          label="Password"
          placeholder="Enter password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <Checkbox
            label="Remember me"
            {...register('rememberMe')}
          />
          <Link
            href="/forgot-password"
            className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          leftIcon={Shield}
          rightIcon={ArrowRight}
          className="w-full mt-2 bg-brand-600 hover:bg-brand-700 py-3 text-sm font-bold shadow-md"
        >
          Sign In
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
        >
          Create one
        </Link>
      </div>
    </div>
  );
}
