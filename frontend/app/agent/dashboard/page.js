'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { MetricCard } from '@/components/ui/MetricCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Plus, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';

const emptyCustomer = { name: '', email: '', phone: '', city: '', tier: 'Silver' };
const emptyPolicy = {
  customer_id: '',
  policy_type_name: 'Health Insurance',
  plan_name: 'Executive Health Cover',
  premium_amount: '350',
  coverage_amount: '750000',
  start_date: '2025-07-01',
  end_date: '2026-06-30',
  premium_frequency: 'monthly',
};

export default function AgentDashboard() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Agent';
  const [claims, setClaims] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState(emptyCustomer);
  const [policyForm, setPolicyForm] = useState(emptyPolicy);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([api.get('/claims', { params: { limit: 5 } }), api.get('/customers'), api.get('/policies')])
      .then(([claimsResponse, customersResponse, policiesResponse]) => {
        if (!mounted) return;
        setClaims(claimsResponse.data.data || []);
        setCustomers(customersResponse.data.data || []);
        setPolicies(policiesResponse.data.data || []);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const handleCreateCustomer = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await api.post('/customers', customerForm);
      setCustomers((current) => [response.data.data, ...current]);
      setCustomerForm(emptyCustomer);
      setIsCustomerOpen(false);
      toast.success(`Customer ${customerForm.name} added to your portfolio!`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePolicy = async (event) => {
    event.preventDefault();
    if (!policyForm.customer_id) {
      toast.error('Please select a customer');
      return;
    }
    setSaving(true);
    try {
      const response = await api.post('/policies', {
        ...policyForm,
        premium_amount: Number(policyForm.premium_amount),
        coverage_amount: Number(policyForm.coverage_amount),
      });
      setPolicies([response.data.data, ...policies]);
      setPolicyForm(emptyPolicy);
      setIsPolicyOpen(false);
      toast.success(`Policy ${response.data.data.policy_number || 'Contract'} issued successfully!`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const activePolicies = policies.filter((policy) => policy.status === 'Active').length;
  const pendingClaims = claims.filter((claim) => claim.status === 'Pending').length;
  const reviewedClaims = claims.filter((claim) => ['Approved', 'Rejected'].includes(claim.status)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Welcome back, {displayName} 👋</h2>
          <p className="text-xs text-slate-500">Your live customer, policy, and claims activity.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" leftIcon={UserPlus} onClick={() => setIsCustomerOpen(true)}>
            Add New Customer
          </Button>
          <Button variant="primary" size="sm" leftIcon={Plus} onClick={() => setIsPolicyOpen(true)}>
            Create New Policy
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <MetricCard title="Assigned Customers" value={String(customers.length)} change="Live" isPositive icon="Users" color="emerald" />
        <MetricCard title="Active Policies" value={String(activePolicies)} change="Live" isPositive icon="ShieldCheck" color="blue" />
        <MetricCard title="Pending Claims" value={String(pendingClaims)} change="Live" isPositive={false} icon="Hourglass" color="rose" />
        <MetricCard title="Claims Reviewed" value={String(reviewedClaims)} change="Live" isPositive icon="Award" color="purple" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="p-5 lg:col-span-8">
          <CardHeader
            title="Assigned Claims Queue"
            subtitle="Claims requiring your review"
            action={
              <Button variant="ghost" size="sm" onClick={() => router.push('/agent/claims')} className="text-xs text-brand-600">
                View All Claims →
              </Button>
            }
          />
          <div className="space-y-3">
            {claims.length ? (
              claims.slice(0, 3).map((claim) => (
                <div key={claim.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5 dark:border-slate-800">
                  <div>
                    <span className="font-mono text-xs font-bold">{claim.claim_number}</span>
                    <p className="text-xs font-semibold">{claim.customer?.name || 'Customer'} • {claim.priority}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold">${Number(claim.claim_amount || 0).toLocaleString()}</span>
                    <Badge variant="warning">{claim.status}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No claims assigned yet.</p>
            )}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-4">
          <CardHeader
            title="Quick Portfolio Actions"
            subtitle="Underwriting & Onboarding Tools"
          />
          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center space-x-2 text-emerald-600 font-bold text-sm">
                <Users className="w-5 h-5" />
                <span>Onboard New Customer</span>
              </div>
              <p className="text-xs text-slate-500">
                Register and assign a new customer profile into your portfolio.
              </p>
              <Button variant="outline" size="sm" className="w-full" leftIcon={UserPlus} onClick={() => setIsCustomerOpen(true)}>
                Add Customer Profile
              </Button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center space-x-2 text-brand-600 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>Issue Insurance Policy</span>
              </div>
              <p className="text-xs text-slate-500">
                Underwrite and issue a new insurance contract for registered customers.
              </p>
              <Button variant="primary" size="sm" className="w-full" leftIcon={Plus} onClick={() => setIsPolicyOpen(true)}>
                Create Policy Contract
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isCustomerOpen}
        onClose={() => setIsCustomerOpen(false)}
        title="Add New Customer"
        subtitle="Register and assign a new customer to your agent portfolio"
      >
        <form className="space-y-4" onSubmit={handleCreateCustomer}>
          <Input
            label="Full Name"
            placeholder="e.g. Michael Scott"
            value={customerForm.name}
            onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="michael.scott@example.com"
            value={customerForm.email}
            onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              placeholder="+1 (555) 019-2834"
              value={customerForm.phone}
              onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
            />
            <Input
              label="City & Location"
              placeholder="Scranton, PA"
              value={customerForm.city}
              onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
            />
          </div>
          <Select
            label="Customer Tier"
            options={['Silver', 'Gold', 'Platinum']}
            value={customerForm.tier}
            onChange={(e) => setCustomerForm({ ...customerForm, tier: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsCustomerOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving} leftIcon={UserPlus}>
              Save Customer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Policy Modal */}
      <Modal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        title="Create New Insurance Policy"
        subtitle="Underwrite and issue a new insurance policy contract for a customer"
      >
        <form className="space-y-4" onSubmit={handleCreatePolicy}>
          <Select
            label="Select Policyholder Customer"
            options={[{ label: 'Select a customer', value: '' }, ...customers.map((c) => ({ label: `${c.name} — ${c.email}`, value: c.id }))]}
            value={policyForm.customer_id}
            onChange={(e) => setPolicyForm({ ...policyForm, customer_id: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Policy Type"
              options={['Health Insurance', 'Life Insurance', 'Vehicle Insurance', 'Home Insurance']}
              value={policyForm.policy_type_name}
              onChange={(e) => setPolicyForm({ ...policyForm, policy_type_name: e.target.value })}
            />
            <Input
              label="Plan Name"
              placeholder="e.g. Executive Comprehensive"
              value={policyForm.plan_name}
              onChange={(e) => setPolicyForm({ ...policyForm, plan_name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Monthly Premium ($)"
              type="number"
              min="0"
              placeholder="350"
              value={policyForm.premium_amount}
              onChange={(e) => setPolicyForm({ ...policyForm, premium_amount: e.target.value })}
              required
            />
            <Input
              label="Coverage Limit ($)"
              type="number"
              min="0"
              placeholder="750000"
              value={policyForm.coverage_amount}
              onChange={(e) => setPolicyForm({ ...policyForm, coverage_amount: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={policyForm.start_date}
              onChange={(e) => setPolicyForm({ ...policyForm, start_date: e.target.value })}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={policyForm.end_date}
              onChange={(e) => setPolicyForm({ ...policyForm, end_date: e.target.value })}
              required
            />
          </div>
          <Select
            label="Premium Frequency"
            options={['monthly', 'quarterly', 'yearly']}
            value={policyForm.premium_frequency}
            onChange={(e) => setPolicyForm({ ...policyForm, premium_frequency: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsPolicyOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving} leftIcon={ShieldCheck}>
              Issue Policy Contract
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
