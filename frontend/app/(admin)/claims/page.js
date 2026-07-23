'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle,
  XCircle,
  UserCheck,
  Clock,
  MessageSquare,
  Paperclip,
  Plus,
  ShieldAlert,
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
import { mapClaim, mapAgent } from '@/lib/mappers';
import { PageLoader, PageError, EmptyState } from '@/components/common/PageState';

export default function ClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [assignedAgent, setAssignedAgent] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [notesList, setNotesList] = useState([
    { author: 'Marcus Vance', text: 'Initial police report and medical receipts verified.', time: 'Jun 11, 2025' },
  ]);

  useEffect(() => {
    Promise.all([api.get('/claims'), api.get('/agents')])
      .then(([claimsRes, agentsRes]) => {
        setClaims((claimsRes.data.data || []).map(mapClaim));
        const agentList = (agentsRes.data.data || []).map(mapAgent);
        setAgents(agentList);
        if (agentList.length) setAssignedAgent(agentList[0].name);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (claim) => {
    try {
      await api.put(`/claims/${claim._id}/approve`);
      setClaims(claims.map((c) => (c._id === claim._id ? { ...c, status: 'Approved' } : c)));
      toast.success(`Claim ${claim.id} approved for disbursement!`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleReject = async (claim) => {
    try {
      await api.put(`/claims/${claim._id}/reject`);
      setClaims(claims.map((c) => (c._id === claim._id ? { ...c, status: 'Rejected' } : c)));
      toast.error(`Claim ${claim.id} rejected.`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleAssignAgent = (e) => {
    e.preventDefault();
    setIsAssignModalOpen(false);
    toast.success(`Claim ${selectedClaim?.id} assigned to ${assignedAgent}.`);
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!internalNote.trim()) return;
    setNotesList([
      ...notesList,
      { author: 'Alex Johnson (Admin)', text: internalNote, time: 'Just now' },
    ]);
    setInternalNote('');
    toast.success('Internal note appended to claim file.');
  };

  const columns = [
    {
      header: 'Claim ID',
      accessorKey: 'id',
      cell: (row) => (
        <div>
          <span className="font-mono font-bold text-slate-900 dark:text-white block">
            {row.id}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Policy: {row.policyNumber}</span>
        </div>
      ),
    },
    {
      header: 'Claimant Customer',
      accessorKey: 'customer',
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <img
            src={row.customer.avatar}
            alt={row.customer.name}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
          />
          <div>
            <p className="font-semibold text-slate-900 dark:text-white leading-tight">
              {row.customer.name}
            </p>
            <p className="text-[11px] text-slate-400">{row.type}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Claim Amount',
      accessorKey: 'claimAmount',
      cell: (row) => (
        <span className="font-bold text-slate-900 dark:text-white">
          {row.claimAmount}
        </span>
      ),
    },
    {
      header: 'Priority',
      accessorKey: 'priority',
      cell: (row) => (
        <Badge variant={row.priority === 'High' ? 'danger' : row.priority === 'Medium' ? 'warning' : 'neutral'}>
          {row.priority}
        </Badge>
      ),
    },
    {
      header: 'Lifecycle Status',
      accessorKey: 'status',
      cell: (row) => {
        const variant =
          row.status === 'Approved'
            ? 'success'
            : row.status === 'Pending'
            ? 'warning'
            : row.status === 'In Review'
            ? 'info'
            : 'danger';
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
    {
      header: 'Submitted On',
      accessorKey: 'submittedOn',
      cell: (row) => <span className="text-xs text-slate-500 font-mono">{row.submittedOn}</span>,
    },
    {
      header: 'Workflow Actions',
      accessorKey: 'actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end space-x-1">
          <button
            onClick={() => {
              setSelectedClaim(row);
              setIsTimelineOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Review Details & Notes"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedClaim(row);
              setIsAssignModalOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950 rounded-lg transition-colors"
            title="Assign Claims Agent"
          >
            <UserCheck className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleApprove(row)}
            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg transition-colors"
            title="Approve Claim"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleReject(row)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors"
            title="Reject Claim"
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
            Claims Triage & Resolution
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review submitted loss claims, assign claims adjusters, inspect evidence files, and execute approvals.
          </p>
        </div>

        <Button variant="primary" leftIcon={Plus} onClick={() => toast.success('New claim filing modal opened')}>
          File New Claim
        </Button>
      </div>

      {/* Claims Table Card */}
      <Card className="p-6">
        {loading ? (
          <PageLoader />
        ) : error ? (
          <PageError message={error} />
        ) : claims.length === 0 ? (
          <EmptyState message="No claims found." />
        ) : (
          <DataTable
            columns={columns}
            data={claims}
            searchPlaceholder="Search claims by ID, customer, status, or policy number..."
          />
        )}
      </Card>

      {/* Assign Agent Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Claims Adjuster Agent"
        subtitle={`Select claims specialist for ${selectedClaim?.id}`}
      >
        <form onSubmit={handleAssignAgent} className="space-y-4">
          <Select
            label="Select Claims Adjuster"
            options={agents.map((a) => ({ label: `${a.name} (${a.role})`, value: a.name }))}
            value={assignedAgent}
            onChange={(e) => setAssignedAgent(e.target.value)}
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Review Documents & Timeline Modal */}
      <Modal
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        title={`Claim Timeline & Audit File: ${selectedClaim?.id}`}
        subtitle={`Policy ${selectedClaim?.policyNumber} • ${selectedClaim?.customer?.name}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          {/* Status Bar */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div>
              <p className="text-xs text-slate-500">Claim Amount</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedClaim?.claimAmount}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Current Status</p>
              <Badge variant="info">{selectedClaim?.status}</Badge>
            </div>
            <div>
              <p className="text-xs text-slate-500">Priority Level</p>
              <Badge variant="danger">{selectedClaim?.priority}</Badge>
            </div>
          </div>

          {/* Timeline Milestones */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Audit Timeline</h4>
            <div className="border-l-2 border-brand-500 pl-4 space-y-4">
              <div className="relative">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-brand-500 ring-4 ring-white dark:ring-slate-900" />
                <p className="text-xs font-bold text-slate-900 dark:text-white">Claim Submitted</p>
                <p className="text-[11px] text-slate-500">Submitted by claimant John Smith via portal on {selectedClaim?.submittedOn}</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-brand-500 ring-4 ring-white dark:ring-slate-900" />
                <p className="text-xs font-bold text-slate-900 dark:text-white">Assigned to Adjuster</p>
                <p className="text-[11px] text-slate-500">Auto-routed to Alex Johnson (Senior Underwriter)</p>
              </div>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Internal Underwriting Notes</h4>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {notesList.map((note, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-200">
                    <span>{note.author}</span>
                    <span className="text-[10px] text-slate-400">{note.time}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">{note.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddNote} className="flex gap-2">
              <Input
                placeholder="Append internal note..."
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                className="text-xs"
              />
              <Button type="submit" variant="primary" size="sm" className="shrink-0">
                Post Note
              </Button>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
}
