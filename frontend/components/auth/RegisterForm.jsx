'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, User, ArrowRight, ShieldCheck, UserCheck, Shield } from 'lucide-react';

import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Checkbox } from '@/components/common/Checkbox';
import { PasswordInput } from './PasswordInput';
import toast from 'react-hot-toast';
import { useAuth } from '@/components/auth/AuthProvider';

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().min(1, 'Email address is required').email('Invalid email address format'),
    gender: z.enum(['Male', 'Female'], { required_error: 'Please select a gender' }),
    role: z.enum(['Customer', 'Insurance Agent'], { required_error: 'Please select a role' }),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
    terms: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to the Terms of Service' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export function RegisterForm() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Customer');
  const [selectedGender, setSelectedGender] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      gender: '',
      role: 'Customer',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setValue('role', role, { shouldValidate: true });
  };

  const handleGenderChange = (gender) => {
    setSelectedGender(gender);
    setValue('gender', gender, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await signUp({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        gender: data.gender,
        role: data.role,
      });

      toast.success('Account created successfully! Please check your email to verify your account.');
      setTimeout(() => {
        setIsLoading(false);
        router.push('/login');
      }, 800);
    } catch (error) {
      setIsLoading(false);
      toast.error(error.message || 'Registration failed');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
      {/* Top Header Row with Security Pill */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-serif">
            Create Your Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Join InsurePro and revolutionize your insurance management.
          </p>
        </div>

        <div className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold shrink-0">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Your Data is Secure</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <Input
          label="Full Name"
          icon={User}
          placeholder="Enter your full name"
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        {/* Email Address */}
        <Input
          label="Email Address"
          type="email"
          icon={Mail}
          placeholder="Enter your email"
          error={errors.email?.message}
          {...register('email')}
        />

        {/* Gender Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Gender
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleGenderChange('Male')}
              className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer ${
                selectedGender === 'Male'
                  ? 'bg-brand-50/40 dark:bg-brand-950/40 border-brand-500 ring-2 ring-brand-500/20 text-brand-600 dark:text-brand-400 font-extrabold'
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => handleGenderChange('Female')}
              className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer ${
                selectedGender === 'Female'
                  ? 'bg-brand-50/40 dark:bg-brand-950/40 border-brand-500 ring-2 ring-brand-500/20 text-brand-600 dark:text-brand-400 font-extrabold'
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              Female
            </button>
          </div>
          {errors.gender && <p className="text-xs text-rose-500 font-medium">{errors.gender.message}</p>}
        </div>

        {/* Passwords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PasswordInput
            label="Password"
            placeholder="Create a strong password"
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>

        {/* Select Your Role Cards */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Select Your Role
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleRoleChange('Customer')}
              className={`p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition-all cursor-pointer ${
                selectedRole === 'Customer'
                  ? 'bg-brand-50/40 dark:bg-brand-950/40 border-brand-500 ring-2 ring-brand-500/20'
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  selectedRole === 'Customer'
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}
              >
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Customer</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Manage your policies and claims
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('Insurance Agent')}
              className={`p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition-all cursor-pointer ${
                selectedRole === 'Insurance Agent'
                  ? 'bg-brand-50/40 dark:bg-brand-950/40 border-brand-500 ring-2 ring-brand-500/20'
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  selectedRole === 'Insurance Agent'
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}
              >
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Insurance Agent</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-400 leading-tight">
                  Underwrite policies & manage clients
                </p>
              </div>
            </button>
          </div>
          {errors.role && <p className="text-xs text-rose-500 font-medium">{errors.role.message}</p>}
        </div>

        {/* Terms Checkbox */}
        <Checkbox
          label={
            <span>
              I agree to the{' '}
              <a href="#" className="text-brand-600 dark:text-brand-400 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-brand-600 dark:text-brand-400 hover:underline">
                Privacy Policy
              </a>
            </span>
          }
          error={errors.terms?.message}
          {...register('terms')}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          leftIcon={Shield}
          rightIcon={ArrowRight}
          className="w-full mt-2 bg-brand-600 hover:bg-brand-700 py-3 text-sm font-bold shadow-md"
        >
          Create Account
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
