'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { PasswordInput } from './PasswordInput';
import toast from 'react-hot-toast';
import { useAuth } from '@/components/auth/AuthProvider';

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export function ResetPasswordForm() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await resetPassword(data.password);
      toast.success('Your password has been reset successfully!');
      setTimeout(() => {
        setIsLoading(false);
        router.push('/login');
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      toast.error(error.message || 'Failed to reset password');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Set New Password
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enter your new password below to secure your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <PasswordInput
          label="New Password"
          placeholder="Minimum 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />

        <PasswordInput
          label="Confirm New Password"
          placeholder="Re-enter new password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          rightIcon={ArrowRight}
          className="w-full mt-2"
        >
          Reset Password
        </Button>
      </form>

      <div className="text-center pt-2">
        <Link
          href="/login"
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
