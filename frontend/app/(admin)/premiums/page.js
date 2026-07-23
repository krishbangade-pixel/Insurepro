'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  CreditCard,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Send,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Tabs } from '@/components/ui/Tabs';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { mapPayment } from '@/lib/mappers';
import { PageLoader, PageError, EmptyState } from '@/components/common/PageState';

export default function PremiumsPage() {
  const [premiums, setPremiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    api.get('/payments')
      .then((res) => setPremiums((res.data.data || []).map(mapPayment)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Form State
  const [payForm, setPayForm] = useState({
    policyNumber: 'POL-2025-089',
    customer: 'John Smith',
    amount: '1250.00',
    method: 'Credit Card',
  });

  const filteredPremiums = premiums.filter((p) => {
    if (activeFilter === 'paid') return p.status === 'Paid';
    if (activeFilter === 'due') return p.status === 'Due Soon';
    if (activeFilter === 'overdue') return p.status === 'Overdue';
    return true;
  });

  const handleRecordPayment = (e) => {
    e.preventDefault();
    const created = {
      invoiceId: `INV-${Math.floor(9000 + Math.random() * 1000)}`,
      policyNumber: payForm.policyNumber,
      customer: payForm.customer,
      amount: `$${parseFloat(payForm.amount).toFixed(2)}`,
      paymentMethod: payForm.method,
      dueDate: 'Jun 30, 2025',
      paidDate: 'Just now',
      status: 'Paid',
    };
    setPremiums([created, ...premiums]);
    setIsRecordOpen(false);
    toast.success(`Payment of ${created.amount} recorded for invoice ${created.invoiceId}`);
  };

  const columns = [
    {
      header: 'Invoice ID',
      accessorKey: 'invoiceId',
      cell: (row) => (
        <div>
          <span className="font-mono font-bold text-slate-900 dark:text-white block">
            {row.invoiceId}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Policy: {row.policyNumber}</span>
        </div>
      ),
    },
    {
      header: 'Policyholder Customer',
      accessorKey: 'customer',
      cell: (row) => (
        <span className="font-semibold text-slate-900 dark:text-white">
          {row.customer}
        </span>
      ),
    },
    {
      header: 'Payment Amount',
      accessorKey: 'amount',
      cell: (row) => (
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          {row.amount}
        </span>
      ),
    },
    {
      header: 'Method',
      accessorKey: 'paymentMethod',
      cell: (row) => <span className="text-xs text-slate-500">{row.paymentMethod}</span>,
    },
    {
      header: 'Due Date',
      accessorKey: 'dueDate',
      cell: (row) => <span className="text-xs text-slate-500 font-mono">{row.dueDate}</span>,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => {
        const variant =
          row.status === 'Paid'
            ? 'success'
            : row.status === 'Due Soon'
            ? 'warning'
            : 'danger';
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
    {
      header: 'Receipt & Actions',
      accessorKey: 'actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end space-x-1">
          {row.status === 'Overdue' && (
            <button
              onClick={() => toast.success(`Payment reminder email sent to ${row.customer}`)}
              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 rounded-lg transition-colors"
              title="Send Payment Reminder"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => {
              setSelectedReceipt(row);
            }}
            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Download PDF Receipt"
          >
            <Download className="w-4 h-4" />
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
            Premium & Financial Billing
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track premium collections, issue invoices, record receipts, and manage overdue accounts.
          </p>
        </div>

        <Button variant="primary" leftIcon={Plus} onClick={() => setIsRecordOpen(true)}>
          Record New Payment
        </Button>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center space-x-4 border-l-4 border-emerald-500">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Collected This Month</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">$2,45,850.00</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center space-x-4 border-l-4 border-amber-500">
          <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Upcoming Due Premiums</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">$42,100.00</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center space-x-4 border-l-4 border-rose-500">
          <div className="p-3 bg-rose-50 dark:bg-rose-950 text-rose-600 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Overdue Collections</p>
            <p className="text-xl font-bold text-rose-600 dark:text-rose-400">$18,450.00</p>
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="p-6">
        <Tabs
          tabs={[
            { id: 'all', label: 'All Invoices', count: premiums.length },
            { id: 'paid', label: 'Paid Receipts', count: premiums.filter((p) => p.status === 'Paid').length },
            { id: 'due', label: 'Due Soon', count: premiums.filter((p) => p.status === 'Due Soon').length },
            { id: 'overdue', label: 'Overdue Premiums', count: premiums.filter((p) => p.status === 'Overdue').length },
          ]}
          activeTab={activeFilter}
          onChange={setActiveFilter}
          className="mb-6"
        />

        {loading ? (
          <PageLoader />
        ) : error ? (
          <PageError message={error} />
        ) : filteredPremiums.length === 0 ? (
          <EmptyState message="No payment records found." />
        ) : (
          <DataTable
            columns={columns}
            data={filteredPremiums}
            searchPlaceholder="Search invoices, customers, policy numbers..."
          />
        )}
      </Card>

      {/* Record Payment Form Modal */}
      <Modal
        isOpen={isRecordOpen}
        onClose={() => setIsRecordOpen(false)}
        title="Record Premium Payment"
        subtitle="Manually post a received premium payment to invoice"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <Input
            label="Policy Number"
            value={payForm.policyNumber}
            onChange={(e) => setPayForm({ ...payForm, policyNumber: e.target.value })}
            required
          />
          <Input
            label="Customer Name"
            value={payForm.customer}
            onChange={(e) => setPayForm({ ...payForm, customer: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Payment Amount ($)"
              type="number"
              value={payForm.amount}
              onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
              required
            />
            <Select
              label="Payment Method"
              options={['Credit Card', 'ACH Direct Debit', 'Wire Transfer', 'Check']}
              value={payForm.method}
              onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsRecordOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Post Payment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Download Receipt Preview Modal */}
      <Modal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        title={`Payment Receipt: ${selectedReceipt?.invoiceId}`}
        subtitle="InsurePro Corporate Billing Record"
      >
        <div className="space-y-4 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">InsurePro Underwriting</p>
              <p className="text-[10px] text-slate-400">Transaction Ref: {selectedReceipt?.invoiceId}</p>
            </div>
            <Badge variant="success">PAID RECEIPT</Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-slate-400">Policyholder:</p>
              <p className="font-bold text-slate-800 dark:text-slate-200">{selectedReceipt?.customer}</p>
            </div>
            <div>
              <p className="text-slate-400">Policy Number:</p>
              <p className="font-bold font-mono text-slate-800 dark:text-slate-200">{selectedReceipt?.policyNumber}</p>
            </div>
            <div>
              <p className="text-slate-400">Amount Paid:</p>
              <p className="font-bold text-emerald-600 dark:text-emerald-400">{selectedReceipt?.amount}</p>
            </div>
            <div>
              <p className="text-slate-400">Method:</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedReceipt?.paymentMethod}</p>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <Button
              variant="primary"
              size="sm"
              leftIcon={Download}
              onClick={() => {
                toast.success('Downloaded official PDF invoice receipt');
                setSelectedReceipt(null);
              }}
            >
              Download PDF Copy
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
