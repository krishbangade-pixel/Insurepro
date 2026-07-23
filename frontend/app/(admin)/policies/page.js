'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  ShieldCheck,
  RefreshCw,
  XCircle,
  Download,
  Eye,
  FileCheck,
  Calendar,
  DollarSign,
  User,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { mapPolicy } from '@/lib/mappers';
import { PageLoader, PageError, EmptyState } from '@/components/common/PageState';

export default function PoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  useEffect(() => {
    api.get('/policies')
      .then((res) => setPolicies((res.data.data || []).map(mapPolicy)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Form State
  const [newPol, setNewPol] = useState({
    holder: '',
    type: 'Health Insurance',
    planName: 'Standard Executive Health',
    premium: '$350 / month',
    coverage: '$750,000',
    startDate: '2025-07-01',
    endDate: '2026-06-30',
  });

  const handleCreatePolicy = (e) => {
    e.preventDefault();
    const created = {
      id: `POL-2025-${Math.floor(100 + Math.random() * 900)}`,
      holder: newPol.holder || 'New Policyholder',
      holderAvatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
      type: newPol.type,
      planName: newPol.planName,
      premium: newPol.premium,
      coverage: newPol.coverage,
      startDate: newPol.startDate,
      endDate: newPol.endDate,
      status: 'Active',
      agent: 'Alex Johnson',
    };
    setPolicies([created, ...policies]);
    setIsCreateOpen(false);
    toast.success(`Policy ${created.id} issued successfully!`);
  };

  const handleRenew = async () => {
    if (!selectedPolicy) return;
    try {
      await api.put(`/policies/${selectedPolicy._id}`, { status: 'Active', end_date: '2026-12-31' });
      setPolicies(
        policies.map((p) =>
          p._id === selectedPolicy._id ? { ...p, status: 'Active', endDate: 'Dec 31, 2026' } : p
        )
      );
      setIsRenewOpen(false);
      toast.success(`Policy ${selectedPolicy.id} renewed for 12 months!`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleCancel = async () => {
    if (!selectedPolicy) return;
    try {
      await api.put(`/policies/${selectedPolicy._id}`, { status: 'Cancelled' });
      setPolicies(
        policies.map((p) =>
          p._id === selectedPolicy._id ? { ...p, status: 'Cancelled' } : p
        )
      );
      setIsCancelOpen(false);
      toast.error(`Policy ${selectedPolicy.id} has been cancelled.`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const columns = [
    {
      header: 'Policy Number',
      accessorKey: 'id',
      cell: (row) => (
        <div>
          <span className="font-mono font-bold text-slate-900 dark:text-white block">
            {row.id}
          </span>
          <span className="text-[10px] text-slate-400">Agent: {row.agent}</span>
        </div>
      ),
    },
    {
      header: 'Policyholder',
      accessorKey: 'holder',
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <img
            src={row.holderAvatar}
            alt={row.holder}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
          />
          <div>
            <p className="font-semibold text-slate-900 dark:text-white leading-tight">
              {row.holder}
            </p>
            <p className="text-[11px] text-slate-400">{row.type}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Plan & Coverage',
      accessorKey: 'planName',
      cell: (row) => (
        <div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{row.planName}</p>
          <p className="text-[11px] text-brand-600 dark:text-brand-400 font-bold">Max Limit: {row.coverage}</p>
        </div>
      ),
    },
    {
      header: 'Premium Rate',
      accessorKey: 'premium',
      cell: (row) => (
        <span className="font-bold text-slate-900 dark:text-white">
          {row.premium}
        </span>
      ),
    },
    {
      header: 'Term Validity',
      accessorKey: 'startDate',
      cell: (row) => (
        <div className="text-xs text-slate-500 font-mono">
          <p>{row.startDate}</p>
          <p className="text-[10px] text-slate-400">to {row.endDate}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => {
        const variant =
          row.status === 'Active'
            ? 'success'
            : row.status === 'Expiring Soon'
            ? 'warning'
            : row.status === 'Expired'
            ? 'danger'
            : 'neutral';
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end space-x-1">
          <button
            onClick={() => {
              setSelectedPolicy(row);
              setIsRenewOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg transition-colors"
            title="Renew Policy"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => toast.success(`Generated PDF certificate for ${row.id}`)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors"
            title="Download PDF Schedule"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedPolicy(row);
              setIsCancelOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors"
            title="Cancel Policy"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Policy Lifecycle Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Issue new policy contracts, manage active terms, process renewals, and download schedules.
          </p>
        </div>

        <Button variant="primary" leftIcon={Plus} onClick={() => setIsCreateOpen(true)}>
          Create New Policy
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="p-6">
        {loading ? (
          <PageLoader />
        ) : error ? (
          <PageError message={error} />
        ) : policies.length === 0 ? (
          <EmptyState message="No policies found." />
        ) : (
          <DataTable
            columns={columns}
            data={policies}
            searchPlaceholder="Search policies by ID, holder, plan, or status..."
          />
        )}
      </Card>

      {/* Create Policy Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Insurance Policy"
        subtitle="Underwrite and issue a new insurance policy contract"
      >
        <form onSubmit={handleCreatePolicy} className="space-y-4">
          <Input
            label="Policyholder Name"
            icon={User}
            placeholder="John Smith"
            value={newPol.holder}
            onChange={(e) => setNewPol({ ...newPol, holder: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Policy Category"
              options={['Health Insurance', 'Life Insurance', 'Vehicle Insurance', 'Home Insurance']}
              value={newPol.type}
              onChange={(e) => setNewPol({ ...newPol, type: e.target.value })}
            />
            <Input
              label="Plan Tier Name"
              placeholder="Comprehensive Executive"
              value={newPol.planName}
              onChange={(e) => setNewPol({ ...newPol, planName: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Monthly Premium ($)"
              placeholder="$450 / month"
              value={newPol.premium}
              onChange={(e) => setNewPol({ ...newPol, premium: e.target.value })}
            />
            <Input
              label="Coverage Limit ($)"
              placeholder="$1,000,000"
              value={newPol.coverage}
              onChange={(e) => setNewPol({ ...newPol, coverage: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={newPol.startDate}
              onChange={(e) => setNewPol({ ...newPol, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={newPol.endDate}
              onChange={(e) => setNewPol({ ...newPol, endDate: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Issue Policy
            </Button>
          </div>
        </form>
      </Modal>

      {/* Renew Policy Confirmation Modal */}
      <Modal
        isOpen={isRenewOpen}
        onClose={() => setIsRenewOpen(false)}
        title="Renew Policy Contract"
        subtitle={`Extend coverage term for ${selectedPolicy?.id}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Confirming renewal will extend policy schedule for <strong>{selectedPolicy?.holder}</strong> for an additional 12-month period at current rate {selectedPolicy?.premium}.
          </p>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsRenewOpen(false)}>Cancel</Button>
            <Button variant="success" onClick={handleRenew}>Confirm Renewal</Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Policy Confirmation Modal */}
      <Modal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        title="Cancel Insurance Policy"
        subtitle={`Terminate policy contract ${selectedPolicy?.id}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
            Warning: Cancelling policy {selectedPolicy?.id} will immediately revoke active coverage for {selectedPolicy?.holder}.
          </p>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsCancelOpen(false)}>Abort</Button>
            <Button variant="danger" onClick={handleCancel}>Confirm Cancellation</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
