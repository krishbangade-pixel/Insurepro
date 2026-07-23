'use client';

import React from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <AuthLayout isSplit={false}>
      <ResetPasswordForm />
    </AuthLayout>
  );
}
