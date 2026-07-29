'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  FileText,
  FolderOpen,
  Plus,
  Edit,
  Download,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id;
  const [customer, setCustomer] = useState(null);
  const [customerPolicies, setCustomerPolicies] = useState([]);
  const [customerClaims, setCustomerClaims] = useState([]);
  const [customerDocs, setCustomerDocs] = useState([]);
  const [activeTab, setActiveTab] = useState('policies');

  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      try {
        const custRes = await api.get(`/customers/${customerId}`);
        if (!mounted) return;
        setCustomer(custRes.data.data);
        const polRes = await api.get('/policies', { params: { customer_id: customerId, limit: 10 } });
        const clRes = await api.get('/claims', { params: { customer_id: customerId, limit: 10 } });
        const docRes = await api.get('/documents', { params: { customer_id: customerId, limit: 10 } });
        if (!mounted) return;
        setCustomerPolicies(polRes.data.data || []);
        setCustomerClaims(clRes.data.data || []);
        setCustomerDocs(docRes.data.data || []);
      } catch (e) {
        toast.error(e.response?.data?.message || e.message);
      }
    };
    fetchAll();
    return () => { mounted = false; };
  }, [customerId]);

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div>
        <button
          onClick={() => router.push('/customers')}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Back to Customers Directory</span>
        </button>
      </div>

      {/* Customer Header Profile Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4">
              <img
              src={customer?.avatar_url || '/placeholder.png'}
              alt={customer?.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-brand-500/20"
            />
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {customer?.name}
                </h2>
                <Badge variant={customer?.status === 'Active' ? 'success' : 'warning'}>
                  {customer?.status}
                </Badge>
                <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {customer?.tier} Tier
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">Customer ID: {customer?.id}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1" />{customer?.email}</span>
                <span className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1" />{customer?.phone || '-'}</span>
                <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" />{customer?.city || '-'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-4 md:pt-0">
            <Button variant="outline" size="sm" leftIcon={Edit} onClick={() => toast.success('Edit customer opened')}>
              Edit Profile
            </Button>
            <Button variant="primary" size="sm" leftIcon={Plus} onClick={() => router.push('/policies')}>
              Issue Policy
            </Button>
          </div>
        </div>

        {/* Stats Metrics Sub-Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-xs text-slate-500">Active Policies</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{customerPolicies.length}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Premiums Paid</p>
            <p className="text-lg font-bold text-brand-600 dark:text-brand-400 mt-0.5">{customer?.total_premiums ? `$${customer.total_premiums}` : '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Underwriting Risk Score</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{customer?.risk_score || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Member Since</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {customer?.created_at ? new Date(customer.created_at).toLocaleDateString() : '-'}
            </p>
          </div>
        </div>
      </Card>

      {/* Detail Tabs Section */}
      <Card className="p-6">
        <Tabs
          tabs={[
            { id: 'policies', label: 'Policy History', count: customerPolicies.length },
            { id: 'claims', label: 'Claim History', count: customerClaims.length },
            { id: 'documents', label: 'Uploaded Documents', count: customerDocs.length },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="mb-6"
        />

        {/* Policy History Tab */}
        {activeTab === 'policies' && (
          <div className="space-y-4">
            {customerPolicies.map((pol) => (
              <div key={pol.id} className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand-500/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{pol.policy_number || pol.id}</span>
                      <Badge variant="success">{pol.status}</Badge>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{pol.plan_name}</p>
                    <p className="text-[11px] text-slate-400">Coverage: {pol.coverage_amount} • Valid: {pol.start_date} - {pol.end_date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{pol.premium_amount}</p>
                  <Button variant="ghost" size="sm" className="text-xs text-brand-600" onClick={() => router.push('/policies')}>
                    View Policy Details →
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Claim History Tab */}
        {activeTab === 'claims' && (
          <div className="space-y-4">
            {customerClaims.map((claim) => (
              <div key={claim.id} className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{claim.claim_number || claim.id}</span>
                      <Badge variant={claim.status === 'Approved' ? 'success' : 'info'}>{claim.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Policy: {claim.policy_id} • Submitted: {new Date(claim.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{claim.amount}</p>
                  <Button variant="ghost" size="sm" className="text-xs text-brand-600" onClick={() => router.push('/claims')}>
                    Review Timeline →
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Uploaded Documents Tab */}
        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customerDocs.map((doc) => (
              <div key={doc.id} className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center space-x-3">
                  <FolderOpen className="w-6 h-6 text-brand-600" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{doc.name}</p>
                    <p className="text-[10px] text-slate-400">{doc.category} • {doc.size}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-emerald-600 font-semibold">{doc.status}</span>
                  <button onClick={() => toast.success(`Downloading ${doc.name}`)} className="text-slate-500 hover:text-slate-900">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
