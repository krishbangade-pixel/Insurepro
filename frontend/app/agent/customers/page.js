'use client';

import React, { useEffect, useState } from 'react';
import { Plus, ShieldCheck, UserRound, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import api from '@/lib/api';

const emptyCustomer = { name: '', email: '', phone: '', city: '', tier: 'Silver' };
const emptyPolicy = {
  customer_id: '', policy_type_name: 'Health Insurance', plan_name: '', premium_amount: '',
  coverage_amount: '', start_date: '', end_date: '', premium_frequency: 'monthly',
};

export default function AgentCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState(emptyCustomer);
  const [policyForm, setPolicyForm] = useState(emptyPolicy);
  const [saving, setSaving] = useState(false);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/customers');
      setCustomers(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadCustomers(); }, []);

  const createCustomer = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await api.post('/customers', customerForm);
      setCustomers((current) => [response.data.data, ...current]);
      setCustomerForm(emptyCustomer);
      setIsCustomerOpen(false);
      toast.success('Customer added to your portfolio.');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const createPolicy = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await api.post('/policies', {
        ...policyForm,
        premium_amount: Number(policyForm.premium_amount),
        coverage_amount: Number(policyForm.coverage_amount),
      });
      setPolicyForm(emptyPolicy);
      setIsPolicyOpen(false);
      toast.success(`Policy ${response.data.data.policy_number} issued successfully.`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { header: 'Customer', accessorKey: 'name', cell: (row) => <div><p className="font-semibold">{row.name}</p><p className="text-xs text-slate-500">{row.email}</p></div> },
    { header: 'Phone', accessorKey: 'phone', cell: (row) => row.phone || '—' },
    { header: 'Location', accessorKey: 'city', cell: (row) => row.city || '—' },
    { header: 'Tier', accessorKey: 'tier', cell: (row) => row.tier || 'Silver' },
    { header: 'Status', accessorKey: 'status', cell: (row) => <Badge variant={row.status?.toLowerCase() === 'active' ? 'success' : 'warning'}>{row.status || 'Active'}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">My Customers</h2>
          <p className="text-sm text-slate-500">Add customers and issue policies for your portfolio.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" leftIcon={ShieldCheck} onClick={() => setIsPolicyOpen(true)} disabled={!customers.length}>Create Policy</Button>
          <Button leftIcon={Plus} onClick={() => setIsCustomerOpen(true)}>Add Customer</Button>
        </div>
      </div>

      <Card className="p-6">
        <DataTable columns={columns} data={customers} loading={loading} error={error} searchPlaceholder="Search your customers..." />
      </Card>

      <Modal isOpen={isCustomerOpen} onClose={() => setIsCustomerOpen(false)} title="Add Customer" subtitle="This customer will be assigned to you.">
        <form className="space-y-4" onSubmit={createCustomer}>
          <Input label="Full name" value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} required />
          <Input label="Email address" type="email" value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Phone" value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} />
            <Input label="City" value={customerForm.city} onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })} />
          </div>
          <Select label="Customer tier" options={['Silver', 'Gold', 'Platinum']} value={customerForm.tier} onChange={(e) => setCustomerForm({ ...customerForm, tier: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setIsCustomerOpen(false)}>Cancel</Button><Button type="submit" isLoading={saving} leftIcon={UserRound}>Save Customer</Button></div>
        </form>
      </Modal>

      <Modal isOpen={isPolicyOpen} onClose={() => setIsPolicyOpen(false)} title="Create New Policy" subtitle="Issue a policy for one of your customers.">
        <form className="space-y-4" onSubmit={createPolicy}>
          <Select label="Customer" options={[{ label: 'Select a customer', value: '' }, ...customers.map((customer) => ({ label: `${customer.name} — ${customer.email}`, value: customer.id }))]} value={policyForm.customer_id} onChange={(e) => setPolicyForm({ ...policyForm, customer_id: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Policy type" options={['Health Insurance', 'Life Insurance', 'Vehicle Insurance', 'Home Insurance']} value={policyForm.policy_type_name} onChange={(e) => setPolicyForm({ ...policyForm, policy_type_name: e.target.value })} />
            <Input label="Plan name" value={policyForm.plan_name} onChange={(e) => setPolicyForm({ ...policyForm, plan_name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Premium amount" type="number" min="0" value={policyForm.premium_amount} onChange={(e) => setPolicyForm({ ...policyForm, premium_amount: e.target.value })} required />
            <Input label="Coverage amount" type="number" min="0" value={policyForm.coverage_amount} onChange={(e) => setPolicyForm({ ...policyForm, coverage_amount: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start date" type="date" value={policyForm.start_date} onChange={(e) => setPolicyForm({ ...policyForm, start_date: e.target.value })} required />
            <Input label="End date" type="date" value={policyForm.end_date} onChange={(e) => setPolicyForm({ ...policyForm, end_date: e.target.value })} required />
          </div>
          <Select label="Premium frequency" options={['monthly', 'quarterly', 'yearly']} value={policyForm.premium_frequency} onChange={(e) => setPolicyForm({ ...policyForm, premium_frequency: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setIsPolicyOpen(false)}>Cancel</Button><Button type="submit" isLoading={saving} leftIcon={ShieldCheck}>Issue Policy</Button></div>
        </form>
      </Modal>
    </div>
  );
}
