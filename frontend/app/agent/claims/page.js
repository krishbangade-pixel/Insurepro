'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  Eye,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function AgentClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review modal state
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState('Approve');
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Detail modal state
  const [detailClaim, setDetailClaim] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchClaims = () => {
    setLoading(true);
    api
      .get('/claims')
      .then((r) => setClaims(r.data.data || []))
      .catch((e) => setError(e.response?.data?.message || e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const openReview = (claim, action) => {
    setSelectedClaim(claim);
    setReviewAction(action);
    setReviewComment('');
    setIsReviewOpen(true);
  };

  const openDetail = (claim) => {
    setDetailClaim(claim);
    setIsDetailOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error('A review comment is required before approving or rejecting a claim.');
      return;
    }
    const targetId = selectedClaim.id || selectedClaim._id;
    setSubmitting(true);
    try {
      const endpoint =
        reviewAction === 'Approve'
          ? `/claims/${targetId}/approve`
          : `/claims/${targetId}/reject`;
      const res = await api.put(endpoint, { review_comment: reviewComment.trim() });
      toast.success(
        res.data.message ||
          `Claim ${selectedClaim.claim_number || targetId} ${reviewAction.toLowerCase()}d successfully.`
      );
      setIsReviewOpen(false);
      fetchClaims();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const statusVariant = (s) =>
    s === 'Approved' ? 'success' : s === 'Rejected' ? 'danger' : s === 'In Review' ? 'info' : 'warning';

  const priorityVariant = (p) =>
    p === 'High' ? 'danger' : p === 'Medium' ? 'warning' : 'neutral';

  const columns = [
    {
      header: 'Claim Number',
      accessorKey: 'claim_number',
      cell: (r) => (
        <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
          {r.claim_number || r.id}
        </span>
      ),
    },
    {
      header: 'Customer',
      accessorKey: 'customer',
      cell: (r) => (
        <div className="flex items-center space-x-2">
          <img
            src={
              r.customer?.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(r.customer?.name || 'C')}&background=10b981&color=fff`
            }
            alt={r.customer?.name}
            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
          />
          <div>
            <p className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">
              {r.customer?.name || 'Customer'}
            </p>
            <p className="text-[10px] text-slate-400">{r.claim_type || 'General'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Claim Value',
      accessorKey: 'claim_amount',
      cell: (r) => (
        <span className="font-extrabold text-slate-900 dark:text-white">
          ${Number(r.claim_amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Priority',
      accessorKey: 'priority',
      cell: (r) => (
        <Badge variant={priorityVariant(r.priority)}>{r.priority || 'Medium'}</Badge>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (r) => (
        <div className="space-y-1">
          <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
          {r.review_comment && (
            <p
              className="text-[10px] text-slate-400 max-w-[160px] truncate"
              title={r.review_comment}
            >
              <MessageSquare className="w-3 h-3 inline mr-0.5" />
              {r.review_comment}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: (row) => {
        const isPending = row.status === 'Pending' || row.status === 'In Review';
        return (
          <div className="flex items-center space-x-1.5">
            {/* View details — always available */}
            <button
              onClick={() => openDetail(row)}
              className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950 rounded-lg transition-colors"
              title="View Claim Details"
            >
              <Eye className="w-4 h-4" />
            </button>

            {isPending ? (
              <>
                <Button
                  size="xs"
                  variant="success"
                  leftIcon={CheckCircle}
                  onClick={() => openReview(row, 'Approve')}
                >
                  Approve
                </Button>
                <Button
                  size="xs"
                  variant="danger"
                  leftIcon={XCircle}
                  onClick={() => openReview(row, 'Reject')}
                >
                  Reject
                </Button>
              </>
            ) : (
              <span className="flex items-center gap-1 text-xs text-slate-400 italic">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                {row.status}
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Assigned Claims Portfolio
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review pending claims assigned to you. Only your assigned claims are shown.
          </p>
        </div>
      </div>

      <Card className="p-6">
        <DataTable
          columns={columns}
          data={claims}
          loading={loading}
          error={error}
          searchPlaceholder="Search assigned claims..."
        />
      </Card>

      {/* ── Claim Detail Modal ────────────────────────────────── */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Claim: ${detailClaim?.claim_number || detailClaim?.id}`}
        subtitle={`Customer: ${detailClaim?.customer?.name || 'Customer'} • Status: ${detailClaim?.status}`}
      >
        {detailClaim && (
          <div className="space-y-4">
            {/* Key facts grid */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Claim Amount</span>
                <span className="font-extrabold text-base text-slate-900 dark:text-white">
                  ${Number(detailClaim.claim_amount || 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Status</span>
                <Badge variant={statusVariant(detailClaim.status)}>{detailClaim.status}</Badge>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Claim Type</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {detailClaim.claim_type || 'General'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Priority</span>
                <Badge variant={priorityVariant(detailClaim.priority)}>
                  {detailClaim.priority || 'Medium'}
                </Badge>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Policy Number</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {detailClaim.policy?.policy_number || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Filed On</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {detailClaim.submission_date
                    ? new Date(detailClaim.submission_date).toLocaleDateString()
                    : 'Today'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Customer Email</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {detailClaim.customer?.email || '—'}
                </span>
              </div>
              {detailClaim.reviewed_at && (
                <div>
                  <span className="text-slate-400 block mb-0.5">Reviewed On</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(detailClaim.reviewed_at).toLocaleDateString()}
                  </span>
                </div>
              )}
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

            {/* Review comment (if reviewed) */}
            {detailClaim.review_comment ? (
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-brand-600" /> Your Review Comment
                </span>
                <p
                  className={`text-xs p-3 rounded-xl border ${
                    detailClaim.status === 'Approved'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {detailClaim.review_comment}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-400 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <Clock className="w-3.5 h-3.5" />
                No review comment submitted yet.
              </div>
            )}

            {/* Action buttons from detail modal */}
            <div className="flex justify-end items-center gap-2 pt-1">
              {(detailClaim.status === 'Pending' || detailClaim.status === 'In Review') && (
                <>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setIsDetailOpen(false);
                      openReview(detailClaim, 'Reject');
                    }}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => {
                      setIsDetailOpen(false);
                      openReview(detailClaim, 'Approve');
                    }}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => setIsDetailOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Review Modal (Approve / Reject with Mandatory Comment) ── */}
      <Modal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title={`${reviewAction} Claim: ${selectedClaim?.claim_number || selectedClaim?.id}`}
        subtitle={`Customer: ${selectedClaim?.customer?.name || 'Customer'} • Value: $${Number(
          selectedClaim?.claim_amount || 0
        ).toLocaleString()}`}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          {/* Claim facts summary */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block">Type</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {selectedClaim?.claim_type || 'General'}
              </span>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="text-slate-400 block">Priority</span>
              <Badge variant={priorityVariant(selectedClaim?.priority)}>
                {selectedClaim?.priority}
              </Badge>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Adjuster Decision Comment <span className="text-rose-500">*</span>
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
            <Button variant="outline" type="button" onClick={() => setIsReviewOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={reviewAction === 'Approve' ? 'success' : 'danger'}
              type="submit"
              isLoading={submitting}
            >
              Submit {reviewAction} Note
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
