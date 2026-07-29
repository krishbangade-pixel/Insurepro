'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle,
  XCircle,
  UserCheck,
  Clock,
  MessageSquare,
  Lock,
  Eye,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { mapClaim, mapAgent, formatDate } from '@/lib/mappers';
import { PageLoader, PageError, EmptyState } from '@/components/common/PageState';
import { useAuth } from '@/components/auth/AuthProvider';

export default function ClaimsPage() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'Admin' || !profile?.role; // fallback to true in dev

  const [claims, setClaims] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [detailClaim, setDetailClaim] = useState(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [reviewAction, setReviewAction] = useState('Approve');
  const [reviewComment, setReviewComment] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittingAssign, setSubmittingAssign] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([api.get('/claims'), api.get('/agents')])
      .then(([claimsRes, agentsRes]) => {
        setClaims((claimsRes.data.data || []).map(mapClaim));
        const agentList = (agentsRes.data.data || []).map(mapAgent);
        setAgents(agentList);
        if (agentList.length) setSelectedAgentId(agentList[0]._id || agentList[0].id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openReviewModal = (claim, action) => {
    setSelectedClaim(claim);
    setReviewAction(action);
    setReviewComment('');
    setIsReviewModalOpen(true);
  };

  const openDetailModal = (claim) => {
    setDetailClaim(claim);
    setIsDetailModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error('A review comment is required before approving or rejecting a claim.');
      return;
    }
    const targetId = selectedClaim._id || selectedClaim.id;
    setSubmittingReview(true);
    try {
      const endpoint =
        reviewAction === 'Approve' ? `/claims/${targetId}/approve` : `/claims/${targetId}/reject`;
      const res = await api.put(endpoint, { review_comment: reviewComment.trim() });

      const newStatus = reviewAction === 'Approve' ? 'Approved' : 'Rejected';
      setClaims((prev) =>
        prev.map((c) =>
          c._id === targetId || c.id === targetId
            ? {
                ...c,
                status: newStatus,
                reviewComment: reviewComment.trim(),
                reviewedAt: formatDate(new Date().toISOString()),
              }
            : c
        )
      );

      toast.success(res.data.message || `Claim ${newStatus.toLowerCase()} successfully!`);
      setIsReviewModalOpen(false);
      setReviewComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAssignAgent = async (e) => {
    e.preventDefault();
    if (!selectedClaim || !selectedAgentId) return;
    const targetId = selectedClaim._id || selectedClaim.id;
    setSubmittingAssign(true);
    try {
      // selectedAgentId holds the agents.id (UUID), not employee_code
      const targetAgent = agents.find((a) => (a._id || a.id) === selectedAgentId);
      const agentUUID = targetAgent?._id || targetAgent?.id || selectedAgentId;
      const res = await api.put(`/claims/${targetId}/assign`, { agent_id: agentUUID });
      toast.success(res.data.message || `Claim reassigned to ${targetAgent?.name || 'Agent'}.`);
      setIsAssignModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSubmittingAssign(false);
    }
  };

  const statusVariant = (status) =>
    status === 'Approved'
      ? 'success'
      : status === 'Pending'
      ? 'warning'
      : status === 'In Review'
      ? 'info'
      : 'danger';

  const priorityVariant = (p) =>
    p === 'High' ? 'danger' : p === 'Medium' ? 'warning' : 'neutral';

  const columns = [
    {
      header: 'Claim',
      accessorKey: 'id',
      cell: (row) => (
        <div>
          <span className="font-mono font-bold text-slate-900 dark:text-white block">{row.id}</span>
          <span className="text-[10px] text-slate-400 font-mono">
            Policy: {row.policyNumber || '—'}
          </span>
        </div>
      ),
    },
    {
      header: 'Customer',
      accessorKey: 'customer',
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <img
            src={row.customer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.customer.name || 'C')}&background=10b981&color=fff`}
            alt={row.customer.name}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
          />
          <div>
            <p className="font-semibold text-slate-900 dark:text-white leading-tight text-sm">
              {row.customer.name}
            </p>
            <p className="text-[11px] text-slate-400">{row.type}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Agent',
      accessorKey: 'agentName',
      cell: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {row.agentName || <span className="italic text-slate-400">Unassigned</span>}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessorKey: 'claimAmount',
      cell: (row) => (
        <span className="font-bold text-slate-900 dark:text-white">{row.claimAmount}</span>
      ),
    },
    {
      header: 'Priority',
      accessorKey: 'priority',
      cell: (row) => <Badge variant={priorityVariant(row.priority)}>{row.priority}</Badge>,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => (
        <div className="space-y-1">
          <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
          {row.reviewComment && (
            <p className="text-[10px] text-slate-400 max-w-[140px] truncate" title={row.reviewComment}>
              <MessageSquare className="w-3 h-3 inline mr-0.5" />
              {row.reviewComment}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Filed On',
      accessorKey: 'submittedOn',
      cell: (row) => <span className="text-xs text-slate-500 font-mono">{row.submittedOn}</span>,
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      className: 'text-right',
      cell: (row) => {
        const isPending = row.status === 'Pending' || row.status === 'In Review';
        return (
          <div className="flex items-center justify-end space-x-1">
            {/* View Details — always available */}
            <button
              onClick={() => openDetailModal(row)}
              className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950 rounded-lg transition-colors"
              title="View Claim Details"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Reassign Agent — Admin only (Requirement #9) */}
            {isAdmin && (
              <button
                onClick={() => {
                  setSelectedClaim(row);
                  setIsAssignModalOpen(true);
                }}
                className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950 rounded-lg transition-colors"
                title="Reassign Agent (Admin Only)"
              >
                <UserCheck className="w-4 h-4" />
              </button>
            )}

            {/* Approve — only for Pending/In Review claims */}
            <button
              onClick={() => isPending && openReviewModal(row, 'Approve')}
              className={`p-1.5 rounded-lg transition-colors ${
                isPending
                  ? 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                  : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
              }`}
              title={isPending ? 'Approve Claim' : `Already ${row.status}`}
              disabled={!isPending}
            >
              <CheckCircle className="w-4 h-4" />
            </button>

            {/* Reject — only for Pending/In Review claims */}
            <button
              onClick={() => isPending && openReviewModal(row, 'Reject')}
              className={`p-1.5 rounded-lg transition-colors ${
                isPending
                  ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950'
                  : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
              }`}
              title={isPending ? 'Reject Claim' : `Already ${row.status}`}
              disabled={!isPending}
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        );
      },
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
            Review submitted claims, reassign adjusters, and execute approvals with mandatory
            comments.
            {isAdmin && (
              <span className="ml-2 inline-flex items-center gap-1 text-purple-600 font-semibold">
                <ShieldAlert className="w-3 h-3" /> Admin: Agent reassignment enabled
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Claims Table */}
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
            searchPlaceholder="Search by claim ID, customer, policy number..."
          />
        )}
      </Card>

      {/* ── Claim Detail Modal ─────────────────────────────────────── */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Claim Details — ${detailClaim?.id}`}
        subtitle={`Customer: ${detailClaim?.customer?.name} • Status: ${detailClaim?.status}`}
      >
        {detailClaim && (
          <div className="space-y-4 text-sm">
            {/* Grid of key facts */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Claim Amount</span>
                <span className="font-extrabold text-base text-slate-900 dark:text-white">
                  {detailClaim.claimAmount}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Status</span>
                <Badge variant={statusVariant(detailClaim.status)}>{detailClaim.status}</Badge>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Claim Type</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {detailClaim.claimType}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Priority</span>
                <Badge variant={priorityVariant(detailClaim.priority)}>{detailClaim.priority}</Badge>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Policy Number</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {detailClaim.policyNumber || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Filed On</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {detailClaim.submittedOn}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Assigned Agent</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {detailClaim.agentName || <span className="italic text-slate-400">Unassigned</span>}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Reviewed On</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {detailClaim.reviewedAt || '—'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Incident Description
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                {detailClaim.description || 'No description provided.'}
              </p>
            </div>

            {/* Review Comment */}
            {detailClaim.reviewComment ? (
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-brand-600" /> Reviewer Decision Comment
                </span>
                <p
                  className={`text-xs p-3 rounded-xl border ${
                    detailClaim.status === 'Approved'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {detailClaim.reviewComment}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-400 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <Clock className="w-3.5 h-3.5" />
                Awaiting adjuster review decision.
              </div>
            )}

            {/* Action buttons from detail view */}
            <div className="flex justify-end items-center gap-2 pt-1">
              {(detailClaim.status === 'Pending' || detailClaim.status === 'In Review') && (
                <>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      openReviewModal(detailClaim, 'Reject');
                    }}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      openReviewModal(detailClaim, 'Approve');
                    }}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Review Modal (Approve / Reject with Mandatory Comment) ─── */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`${reviewAction} Claim: ${selectedClaim?.id}`}
        subtitle={`${selectedClaim?.customer?.name} • ${selectedClaim?.claimAmount}`}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          {/* Claim summary */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block">Type</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {selectedClaim?.claimType}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Priority</span>
              <Badge variant={priorityVariant(selectedClaim?.priority)}>
                {selectedClaim?.priority}
              </Badge>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Reviewer Decision Comment <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder={`Enter justification note for ${reviewAction.toLowerCase()}ing this claim (required)...`}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={reviewAction === 'Approve' ? 'success' : 'danger'}
              type="submit"
              isLoading={submittingReview}
            >
              Confirm {reviewAction}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Assign Agent Modal (Admin Only) ─────────────────────────── */}
      {isAdmin && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title="Reassign Claims Adjuster Agent"
          subtitle={`Claim: ${selectedClaim?.id} — Admin Authorization Required`}
        >
          <form onSubmit={handleAssignAgent} className="space-y-4">
            <Select
              label="Select Claims Adjuster Agent"
              options={agents.map((a) => ({
                label: `${a.name} (${a.role || 'Agent'})`,
                value: a._id || a.id,
              }))}
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={() => setIsAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={submittingAssign}>
                Reassign Agent
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
