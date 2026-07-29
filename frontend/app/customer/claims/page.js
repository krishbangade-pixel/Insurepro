'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  FileText,
  MessageSquare,
  Clock,
  ShieldCheck,
  Plus,
  Lock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function CustomerClaimsPage() {
  const [showForm, setShowForm] = useState(false);
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [claimType, setClaimType] = useState('Medical Claim');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchClaims = () => {
    api
      .get('/claims')
      .then((r) => setClaims(r.data.data || []))
      .catch(() => {});
    api
      .get('/policies')
      .then((r) => {
        const pols = r.data.data || [];
        setPolicies(pols);
        if (pols.length && !selectedPolicyId) {
          setSelectedPolicyId(pols[0].id);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid claim amount.');
      return;
    }
    if (!description.trim()) {
      toast.error('Please describe the incident.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/claims', {
        policy_id: selectedPolicyId || (policies[0]?.id || null),
        claim_amount: Number(amount),
        claim_type: claimType,
        description: description.trim(),
      });
      toast.success('Claim submitted! Status: Pending Adjuster Review.');
      setShowForm(false);
      setAmount('');
      setDescription('');
      setClaims([res.data.data, ...claims]);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const statusVariant = (s) =>
    s === 'Approved' ? 'success' : s === 'Rejected' ? 'danger' : 'warning';

  const StatusIcon = ({ status }) => {
    if (status === 'Approved') return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    if (status === 'Rejected') return <XCircle className="w-4 h-4 text-rose-500" />;
    return <Clock className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Filed Claims</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track claim statuses and view review comments from your adjuster.
            <span className="ml-2 inline-flex items-center gap-1 text-slate-400">
              <Lock className="w-3 h-3" /> Claims are read-only after submission.
            </span>
          </p>
        </div>
        <Button variant="primary" leftIcon={Plus} onClick={() => setShowForm(true)}>
          File New Claim
        </Button>
      </div>

      {/* Claims List */}
      <div className="space-y-3">
        {claims.length === 0 ? (
          <Card className="p-8 text-center text-slate-500">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold">No claims filed yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              Submit a new claim if you experienced an insured incident.
            </p>
          </Card>
        ) : (
          claims.map((c) => (
            <Card
              key={c.id}
              className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-brand-500/40 transition-colors"
            >
              <div className="space-y-2 flex-1">
                {/* Claim ID + Status + Lock */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold font-mono text-sm text-slate-900 dark:text-white">
                    {c.claim_number || c.id}
                  </span>
                  <Badge variant={statusVariant(c.status)}>
                    <StatusIcon status={c.status} />
                    <span className="ml-1">{c.status}</span>
                  </Badge>
                  {/* Read-only lock badge */}
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                    <Lock className="w-2.5 h-2.5" /> Read Only
                  </span>
                </div>

                {/* Type + Description */}
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {c.claim_type || 'General Claim'} — {c.description}
                </p>

                {/* Dates */}
                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                  <span>
                    Filed:{' '}
                    {c.submission_date || c.created_at
                      ? new Date(c.submission_date || c.created_at).toLocaleDateString()
                      : 'Today'}
                  </span>
                  {c.reviewed_at && (
                    <span>
                      Reviewed: {new Date(c.reviewed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Review Comment — visible to customer (read-only) */}
                {c.review_comment ? (
                  <div
                    className={`mt-1 p-3 rounded-xl border text-xs ${
                      c.status === 'Approved'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                        : c.status === 'Rejected'
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-0.5">
                      <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
                      Adjuster Review Comment:
                    </span>
                    <p
                      className={
                        c.status === 'Approved'
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : c.status === 'Rejected'
                          ? 'text-rose-700 dark:text-rose-300'
                          : 'text-slate-600 dark:text-slate-400'
                      }
                    >
                      {c.review_comment}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                    <Clock className="w-3 h-3" />
                    Awaiting adjuster review…
                  </div>
                )}
              </div>

              {/* Right column — Amount + View Details */}
              <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800 shrink-0">
                <div className="text-right">
                  <p className="text-xs text-slate-400">Claim Value</p>
                  <p className="font-extrabold text-base text-slate-900 dark:text-white">
                    ${Number(c.claim_amount || c.amount || 0).toLocaleString()}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedClaim(c)}>
                  View Details
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* ── File New Claim Modal ──────────────────────────────── */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="File New Insurance Claim"
        subtitle="Submit incident details for adjuster review — cannot be edited after submission"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Policy Schedule"
            options={
              policies.length
                ? policies.map((p) => ({
                    label: `${p.policy_number || p.id} — ${p.plan_name || p.type}`,
                    value: p.id,
                  }))
                : [{ label: 'General Coverage', value: '' }]
            }
            value={selectedPolicyId}
            onChange={(e) => setSelectedPolicyId(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Claim Type"
              options={[
                'Medical Claim',
                'Vehicle Damage',
                'Property Loss',
                'Life Policy Benefit',
                'General Claim',
              ]}
              value={claimType}
              onChange={(e) => setClaimType(e.target.value)}
            />
            <Input
              label="Claim Amount ($)"
              type="number"
              min="1"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <Input
            label="Incident Description & Details"
            placeholder="Describe what occurred, location, and reason for claim..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          {/* Read-only warning */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-700 dark:text-amber-300">
            <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              Once submitted, this claim <strong>cannot be edited</strong>. Make sure all
              details are correct before submitting.
            </span>
          </div>

          <div className="flex justify-end space-x-2 pt-1">
            <Button variant="outline" type="button" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={submitting}>
              Submit Claim
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Claim Detail Modal (Read-Only) ────────────────────── */}
      <Modal
        isOpen={Boolean(selectedClaim)}
        onClose={() => setSelectedClaim(null)}
        title={`Claim Details: ${selectedClaim?.claim_number}`}
        subtitle={`Status: ${selectedClaim?.status}`}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-slate-400 block">Claim Amount</span>
              <span className="font-extrabold text-base text-slate-900 dark:text-white">
                ${Number(selectedClaim?.claim_amount || 0).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Status</span>
              <Badge variant={statusVariant(selectedClaim?.status)}>
                {selectedClaim?.status}
              </Badge>
            </div>
            <div>
              <span className="text-slate-400 block">Claim Type</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {selectedClaim?.claim_type || 'General'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Filing Date</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {selectedClaim?.submission_date
                  ? new Date(selectedClaim.submission_date).toLocaleDateString()
                  : 'Today'}
              </span>
            </div>
            {selectedClaim?.reviewed_at && (
              <div className="col-span-2">
                <span className="text-slate-400 block">Reviewed On</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {new Date(selectedClaim.reviewed_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          <div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Description
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              {selectedClaim?.description || 'No description provided.'}
            </p>
          </div>

          {selectedClaim?.review_comment ? (
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Adjuster Review Comment
              </span>
              <p
                className={`text-xs p-3 rounded-xl border ${
                  selectedClaim?.status === 'Approved'
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-50/60 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                }`}
              >
                {selectedClaim.review_comment}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <Clock className="w-3.5 h-3.5" />
              Awaiting adjuster review decision.
            </div>
          )}

          {/* Read-only notice */}
          <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
            <Lock className="w-3 h-3 shrink-0" />
            This claim is read-only and cannot be modified after submission.
          </div>

          <div className="flex justify-end pt-1">
            <Button variant="outline" onClick={() => setSelectedClaim(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
