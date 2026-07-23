'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import toast from 'react-hot-toast';
import { useAuth } from '@/components/auth/AuthProvider';

const schema = z.object({
  email: z.string().min(1, 'Email address is required').email('Invalid email address format'),
});

export function ForgotPasswordForm() {
  const { forgotPassword } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await forgotPassword(data.email);
      setSentEmail(data.email);
      setSubmitted(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      toast.error(error.message || 'Failed to send reset email');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Forgot Password?
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enter your email address to receive a password reset link
        </p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Corporate / Work Email"
            type="email"
            icon={Mail}
            placeholder="name@company.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            rightIcon={Send}
            className="w-full"
          >
            Send Reset Link
          </Button>
        </form>
      ) : (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-center space-y-3">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Reset Email Dispatched</h3>
          <p className="text-xs text-emerald-800 dark:text-emerald-300">
            We have sent password recovery instructions to <span className="font-bold">{sentEmail}</span>.
            Please check your inbox and click the reset link.
          </p>
        </div>
      )}

      <div className="text-center pt-2">
        <Link
          href="/login"
          className="inline-flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          <span>Back to Login</span>
        </Link>
      </div>
    </div>
  );
}
