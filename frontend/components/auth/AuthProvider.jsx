'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const AuthContext = createContext(undefined);

/**
 * AuthProvider wraps the app and provides authentication state
 * via Supabase Auth. Listens for auth state changes (sign in,
 * sign out, token refresh) and keeps user + profile in sync.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Fetch user profile from the profiles table
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
    return data;
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      setUser(currentUser ?? null);
      if (currentUser) {
        await fetchProfile(currentUser.id);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }

        setLoading(false);

        // Handle specific auth events
        if (event === 'SIGNED_OUT') {
          router.push('/login');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sign up with email and password
  const signUp = async ({ email, password, fullName, gender, role }) => {
    const selectedRole = role || 'Customer';
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          gender,
          role: selectedRole,
        },
      },
    });

    if (error) throw error;

    if (data?.user) {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          role: selectedRole,
          email: email,
        });

        if (selectedRole === 'Customer') {
          await supabase.from('customers').upsert({
            name: fullName,
            email: email,
            gender: gender || 'Not specified',
            status: 'Active',
            tier: 'Silver',
          });
        }

        if (selectedRole === 'Insurance Agent') {
          await supabase.from('agents').upsert({
            employee_code: `AGT-${String(Math.floor(10 + Math.random() * 90))}`,
            name: fullName,
            email: email,
            role: 'Insurance Agent',
            designation: 'Insurance Underwriter',
            assigned_customers: 0,
            active_policies: 0,
            claim_resolution_rate: '100%',
            revenue_generated: '$0',
            status: 'Active',
          });
        }
      } catch (e) {
        console.warn('Post-signup table record creation warning:', e.message);
      }
    }

    return data;
  };

  // Sign in with email and password
  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  };

  // Forgot password — sends reset email
  const forgotPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return data;
  };

  // Reset password with new password (after clicking reset link)
  const resetPassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return data;
  };

  // Update user profile
  const updateProfile = async (updates) => {
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
    return data;
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    forgotPassword,
    resetPassword,
    updateProfile,
    supabase,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access auth context.
 * Must be used within an <AuthProvider>.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
