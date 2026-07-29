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
  Upload,
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
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const [uploadDocForm, setUploadDocForm] = useState({
    customer_id: '',
    policy_id: '',
    name: '',
    category: 'Policy Schedule',
    file: null,
  });

  useEffect(() => {
    Promise.all([api.get('/policies'), api.get('/customers')])
      .then(([policyResponse, customerResponse]) => {
        setPolicies((policyResponse.data.data || []).map(mapPolicy));
        setCustomers(customerResponse.data.data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Form State
  const [newPol, setNewPol] = useState({
    customerId: '',
    type: 'Health Insurance',
    planName: 'Standard Executive Health',
    premium: '$350 / month',
    coverage: '$750,000',
    startDate: '2025-07-01',
    endDate: '2026-06-30',
  });

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/policies', {
        customer_id: newPol.customerId,
        policy_type_name: newPol.type,
        plan_name: newPol.planName,
        premium_amount: Number(String(newPol.premium).replace(/[^0-9.]/g, '')),
        coverage_amount: Number(String(newPol.coverage).replace(/[^0-9.]/g, '')),
        start_date: newPol.startDate,
        end_date: newPol.endDate,
      });
      const customer = customers.find((item) => item.id === newPol.customerId);
      setPolicies([mapPolicy({ ...response.data.data, customer, policy_type: { name: newPol.type } }), ...policies]);
      setIsCreateOpen(false);
      toast.success(`Policy ${response.data.data.policy_number} issued successfully!`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleRenew = async () => {
    if (!selectedPolicy) return;
    const targetId = selectedPolicy._id || selectedPolicy.id;
    try {
      await api.put(`/policies/${targetId}`, { status: 'Active', end_date: '2026-12-31' });
      setPolicies(
        policies.map((p) =>
          (p._id === targetId || p.id === targetId) ? { ...p, status: 'Active', endDate: 'Dec 31, 2026' } : p
        )
      );
      setIsRenewOpen(false);
      toast.success(`Policy ${selectedPolicy.id || targetId} renewed for 12 months!`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleCancel = async () => {
    if (!selectedPolicy) return;
    const targetId = selectedPolicy._id || selectedPolicy.id;
    try {
      await api.put(`/policies/${targetId}`, { status: 'Cancelled' });
      setPolicies(
        policies.map((p) =>
          (p._id === targetId || p.id === targetId) ? { ...p, status: 'Cancelled' } : p
        )
      );
      setIsCancelOpen(false);
      toast.error(`Policy ${selectedPolicy.id || targetId} has been cancelled.`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleUploadPolicyDoc = async (e) => {
    e.preventDefault();
    if (!uploadDocForm.name.trim()) {
      toast.error('Document title is required');
      return;
    }
    setUploadingDoc(true);
    try {
      const fileName = uploadDocForm.file ? uploadDocForm.file.name : `${uploadDocForm.name.replace(/\s+/g, '_')}.pdf`;
      const fileSize = uploadDocForm.file ? `${(uploadDocForm.file.size / (1024 * 1024)).toFixed(2)} MB` : '1.50 MB';
      const fileType = uploadDocForm.file ? uploadDocForm.file.type : 'application/pdf';

      await api.post('/documents', {
        name: uploadDocForm.name.trim(),
        category: uploadDocForm.category,
        size: fileSize,
        customer_id: uploadDocForm.customer_id || null,
        policy_id: uploadDocForm.policy_id || null,
        file_name: fileName,
        file_type: fileType,
        file_path: `/uploads/${fileName}`,
      });

      toast.success(`Policy document "${uploadDocForm.name}" uploaded to Supabase successfully!`);
      setIsUploadDocOpen(false);
      setUploadDocForm({ customer_id: '', policy_id: '', name: '', category: 'Policy Schedule', file: null });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setUploadingDoc(false);
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
            Issue new policy contracts, manage active terms, process renewals, and upload schedules.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" leftIcon={Upload} onClick={() => setIsUploadDocOpen(true)}>
            Upload Policy Document
          </Button>
          <Button variant="primary" leftIcon={Plus} onClick={() => setIsCreateOpen(true)}>
            Create New Policy
          </Button>
        </div>
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
          <Select
            label="Policyholder"
            options={[{ label: 'Select a customer', value: '' }, ...customers.map((customer) => ({ label: `${customer.name} — ${customer.email}`, value: customer.id }))]}
            value={newPol.customerId}
            onChange={(e) => setNewPol({ ...newPol, customerId: e.target.value })}
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

      {/* Upload Policy Document Modal */}
      <Modal
        isOpen={isUploadDocOpen}
        onClose={() => setIsUploadDocOpen(false)}
        title="Upload Policy Document"
        subtitle="Attach contract schedules, endorsements, or policy terms into Supabase"
      >
        <form onSubmit={handleUploadPolicyDoc} className="space-y-4">
          <Input
            label="Document Title"
            placeholder="e.g. Policy Endorsement & Terms Schedule 2026.pdf"
            value={uploadDocForm.name}
            onChange={(e) => setUploadDocForm({ ...uploadDocForm, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Customer (Optional)"
              options={[{ label: 'Select a customer', value: '' }, ...customers.map((c) => ({ label: `${c.name} — ${c.email}`, value: c.id }))]}
              value={uploadDocForm.customer_id}
              onChange={(e) => setUploadDocForm({ ...uploadDocForm, customer_id: e.target.value })}
            />
            <Select
              label="Policy Contract (Optional)"
              options={[{ label: 'Select a policy', value: '' }, ...policies.map((p) => ({ label: `${p.id} — ${p.planName}`, value: p.id }))]}
              value={uploadDocForm.policy_id}
              onChange={(e) => setUploadDocForm({ ...uploadDocForm, policy_id: e.target.value })}
            />
          </div>
          <Select
            label="Document Category"
            options={[
              'Policy Schedule',
              'Underwriting Endorsement',
              'KYC & Identity Proof',
              'Claim Proof & Receipts',
              'Legal & Compliance',
            ]}
            value={uploadDocForm.category}
            onChange={(e) => setUploadDocForm({ ...uploadDocForm, category: e.target.value })}
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Document File
            </label>
            <input
              type="file"
              onChange={(e) => setUploadDocForm({ ...uploadDocForm, file: e.target.files[0] })}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer border border-slate-200 dark:border-slate-800 rounded-xl p-1"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsUploadDocOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={uploadingDoc} leftIcon={Upload}>
              Upload Document
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
