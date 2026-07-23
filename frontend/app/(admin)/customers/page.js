'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Edit3, Trash2, Filter, UserCheck, Shield, DollarSign } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { mapCustomer } from '@/lib/mappers';
import { PageLoader, PageError, EmptyState } from '@/components/common/PageState';

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchCustomers = () => {
    setLoading(true);
    api.get('/customers')
      .then((res) => setCustomers((res.data.data || []).map(mapCustomer)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCustomers(); }, []);

  // New Customer Form State
  const [newCust, setNewCust] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'New York, USA',
    tier: 'Gold',
  });

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/customers', {
        name: newCust.name,
        email: newCust.email,
        phone: newCust.phone,
        city: newCust.city,
        tier: newCust.tier,
      });
      setCustomers([mapCustomer(res.data.data), ...customers]);
      setIsAddModalOpen(false);
      toast.success(`Customer ${newCust.name} added successfully!`);
      setNewCust({ name: '', email: '', phone: '', city: 'New York, USA', tier: 'Gold' });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to remove customer ${name}?`)) return;
    try {
      await api.delete(`/customers/${id}`);
      setCustomers(customers.filter((c) => c.id !== id));
      toast.success(`Customer ${name} deleted.`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const columns = [
    {
      header: 'Customer ID',
      accessorKey: 'id',
      cell: (row) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white">
          {row.id}
        </span>
      ),
    },
    {
      header: 'Customer Name',
      accessorKey: 'name',
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <img
            src={row.avatar}
            alt={row.name}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
          />
          <div>
            <p className="font-semibold text-slate-900 dark:text-white leading-tight">
              {row.name}
            </p>
            <p className="text-[11px] text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact & Location',
      accessorKey: 'city',
      cell: (row) => (
        <div>
          <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{row.phone}</p>
          <p className="text-[11px] text-slate-400">{row.city}</p>
        </div>
      ),
    },
    {
      header: 'Tier & Status',
      accessorKey: 'status',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <Badge variant={row.status === 'Active' ? 'success' : row.status === 'Pending' ? 'warning' : 'neutral'}>
            {row.status}
          </Badge>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {row.tier}
          </span>
        </div>
      ),
    },
    {
      header: 'Active Policies',
      accessorKey: 'policiesCount',
      cell: (row) => (
        <div className="flex items-center space-x-1.5 font-medium text-slate-700 dark:text-slate-300">
          <Shield className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span>{row.policiesCount} Policies</span>
        </div>
      ),
    },
    {
      header: 'Total Premiums',
      accessorKey: 'totalPremiums',
      cell: (row) => (
        <span className="font-bold text-slate-900 dark:text-white">
          {row.totalPremiums}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end space-x-1">
          <button
            onClick={() => router.push(`/customers/${row.id}`)}
            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id, row.name)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Delete Customer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Customer Directory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage individual and corporate policyholders, risk profiles, and insurance activity.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={Plus}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add New Customer
        </Button>
      </div>

      {/* Main Customers Table Card */}
      <Card className="p-6">
        {loading ? (
          <PageLoader />
        ) : error ? (
          <PageError message={error} />
        ) : customers.length === 0 ? (
          <EmptyState message="No customers found. Add your first customer to get started." />
        ) : (
          <DataTable
            columns={columns}
            data={customers}
            searchPlaceholder="Search by name, email, ID, or location..."
          />
        )}
      </Card>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Customer"
        subtitle="Enter policyholder information to register account"
      >
        <form onSubmit={handleAddCustomer} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Eleanor Vance"
            value={newCust.name}
            onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="eleanor@company.com"
            value={newCust.email}
            onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              placeholder="+1 (555) 123-4567"
              value={newCust.phone}
              onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
            />
            <Select
              label="Customer Tier"
              options={['Platinum', 'Gold', 'Silver', 'Enterprise']}
              value={newCust.tier}
              onChange={(e) => setNewCust({ ...newCust, tier: e.target.value })}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
