'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  PlusCircle,
  FilePlus,
  FileText,
  DollarSign,
  UploadCloud,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  MoreHorizontal,
  UserPlus,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { MetricCard } from '@/components/ui/MetricCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { deriveClaimsByCategory } from '@/lib/mappers';
import { PageLoader, PageError } from '@/components/common/PageState';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kpiStats, setKpiStats] = useState([]);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
  const [claimsOverviewData, setClaimsOverviewData] = useState([]);
  const [topPolicyTypes, setTopPolicyTypes] = useState([]);
  const [customerGrowthData, setCustomerGrowthData] = useState([]);
  const [recentClaimsData, setRecentClaimsData] = useState([]);
  const [policyStatusDistribution, setPolicyStatusDistribution] = useState([]);
  const [recentNotificationsData, setRecentNotificationsData] = useState([]);
  const [claimsByCategoryData, setClaimsByCategoryData] = useState([]);

  // Form states for Quick Actions (must be declared before any early return)
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [policyType, setPolicyType] = useState('Health Insurance');
  const [claimAmount, setClaimAmount] = useState('');

  useEffect(() => {
    api.get('/reports/dashboard')
      .then((res) => {
        const d = res.data.data;
        setKpiStats(d.kpiStats || []);
        setMonthlyRevenueData(d.monthlyRevenueData || []);
        setClaimsOverviewData(d.claimsOverviewData || []);
        setTopPolicyTypes(d.topPolicyTypes || []);
        setCustomerGrowthData(d.customerGrowthData || []);
        setRecentClaimsData(d.recentClaimsData || []);
        setPolicyStatusDistribution(d.policyStatusDistribution || []);
        setRecentNotificationsData(d.recentNotificationsData || []);
        setClaimsByCategoryData(deriveClaimsByCategory(d.recentClaimsData));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totalClaims = claimsOverviewData.reduce((s, c) => s + (c.value || 0), 0);

  if (loading) return <PageLoader />;
  if (error) return <PageError message={error} />;



  const handleQuickSubmit = (title) => {
    setActiveModal(null);
    toast.success(`${title} processed successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Enterprise Overview
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time policy underwriting, claims analytics, and premium collection metrics.
          </p>
        </div>

        {/* Date Filter Pill */}
        <div className="flex items-center space-x-2 shrink-0">
          <Button variant="outline" size="sm" leftIcon={Calendar}>
            May 12, 2025 - June 12, 2025
          </Button>
        </div>
      </div>

      {/* 6 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiStats.map((stat) => (
          <MetricCard key={stat.id} {...stat} />
        ))}
      </div>

      {/* Main Charts & Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Premium Collection Bar Chart */}
        <Card className="lg:col-span-5 p-5">
          <CardHeader
            title="Premium Collection"
            subtitle="$2,45,850 Total Collection (+15.6% vs last month)"
            action={
              <select className="text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-2 py-1 text-slate-600 dark:text-slate-300">
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Yearly</option>
              </select>
            }
          />
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Claims Overview Donut Chart */}
        <Card className="lg:col-span-4 p-5">
          <CardHeader title="Claims Overview" subtitle="Status breakdown for 1,246 total claims" />
          <div className="flex flex-col sm:flex-row items-center justify-around h-64">
            <div className="relative w-44 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={claimsOverviewData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {claimsOverviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-slate-900 dark:text-white">{totalClaims.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400">Total Claims</span>
              </div>
            </div>
            <div className="space-y-2 mt-4 sm:mt-0 text-xs">
              {claimsOverviewData.map((item) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-slate-600 dark:text-slate-300 w-16">{item.name}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{item.value}</span>
                  <span className="text-slate-400 font-mono text-[10px]">({item.percentage})</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Quick Actions Panel */}
        <Card className="lg:col-span-3 p-5 flex flex-col justify-between">
          <CardHeader title="Quick Actions" subtitle="Shortcuts for daily workflows" />
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5">
            <Button
              variant="outline"
              size="sm"
              leftIcon={UserPlus}
              onClick={() => setActiveModal('addCustomer')}
              className="justify-start border-emerald-200/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs py-2.5"
            >
              Add Customer
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={ShieldCheck}
              onClick={() => setActiveModal('createPolicy')}
              className="justify-start border-blue-200/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs py-2.5"
            >
              Create Policy
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={FilePlus}
              onClick={() => setActiveModal('newClaim')}
              className="justify-start border-purple-200/80 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs py-2.5"
            >
              New Claim
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={DollarSign}
              onClick={() => setActiveModal('recordPayment')}
              className="justify-start border-amber-200/80 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs py-2.5"
            >
              Record Payment
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={UploadCloud}
              onClick={() => setActiveModal('uploadDoc')}
              className="justify-start text-xs py-2.5"
            >
              Upload Document
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={BarChart3}
              onClick={() => router.push('/reports')}
              className="justify-start text-xs py-2.5"
            >
              Generate Report
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Claims Data Table & Policy Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Claims Table */}
        <Card className="lg:col-span-8 p-5">
          <CardHeader
            title="Recent Claims"
            subtitle="Latest submitted policy claims requiring processing"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/claims')}
                className="text-xs text-brand-600 dark:text-brand-400 font-semibold"
              >
                View All Claims →
              </Button>
            }
          />

          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Claim ID</th>
                  <th className="px-4 py-3">Policy Number</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Claim Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted On</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentClaimsData.map((claim) => {
                  const getStatusVariant = (st) => {
                    if (st === 'Approved') return 'success';
                    if (st === 'Pending') return 'warning';
                    if (st === 'In Review') return 'info';
                    return 'danger';
                  };

                  return (
                    <tr key={claim.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                        {claim.id}
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono">{claim.policyNumber}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <img
                            src={claim.customer.avatar}
                            alt={claim.customer.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="font-medium text-slate-900 dark:text-white">
                            {claim.customer.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        {claim.claimAmount}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getStatusVariant(claim.status)}>{claim.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{claim.submittedOn}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => router.push('/claims')}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Side Panel: Policy Status + Recent Notifications */}
        <div className="lg:col-span-4 space-y-6">
          {/* Policy Status Distribution */}
          <Card className="p-5">
            <CardHeader
              title="Policy Status"
              subtitle="Active portfolio breakdown"
              action={
                <Button variant="ghost" size="sm" onClick={() => router.push('/policies')} className="text-xs text-brand-600">
                  View All
                </Button>
              }
            />
            <div className="space-y-4">
              {policyStatusDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-slate-900 dark:text-white">{item.count.toLocaleString()}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{item.percentage}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Notifications Feed */}
          <Card className="p-5">
            <CardHeader
              title="Recent Notifications"
              subtitle="System alerts and updates"
              action={
                <Button variant="ghost" size="sm" onClick={() => router.push('/notifications')} className="text-xs text-brand-600">
                  View All
                </Button>
              }
            />
            <div className="space-y-3">
              {recentNotificationsData.map((notif) => (
                <div key={notif.id} className="flex items-start space-x-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{notif.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Policy Types Progress */}
        <Card className="p-5">
          <CardHeader title="Top Policy Types" subtitle="Distribution by total policy count" />
          <div className="space-y-4">
            {topPolicyTypes.map((pt) => (
              <div key={pt.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{pt.name}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{pt.percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pt.percentage}%`, backgroundColor: pt.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Customer Growth Area Chart */}
        <Card className="p-5">
          <CardHeader title="Customer Growth" subtitle="Cumulative customer acquisition" />
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={customerGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip />
                <Area type="monotone" dataKey="customers" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#growthGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Claims by Category Donut Chart */}
        <Card className="p-5">
          <CardHeader title="Claims by Category" subtitle="Claims volume split" />
          <div className="flex items-center justify-between h-44">
            <div className="w-32 h-32 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={claimsByCategoryData} cx="50%" cy="50%" innerRadius={35} outerRadius={50} dataKey="value">
                    {claimsByCategoryData.map((e, idx) => (
                      <Cell key={idx} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 text-xs">
              {claimsByCategoryData.map((cat) => (
                <div key={cat.name} className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="font-medium text-slate-600 dark:text-slate-300 w-16">{cat.name}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Modals for Quick Actions */}
      <Modal
        isOpen={activeModal === 'addCustomer'}
        onClose={() => setActiveModal(null)}
        title="Add New Customer"
        subtitle="Register a new policyholder in the system"
      >
        <div className="space-y-4">
          <Input
            label="Customer Name"
            placeholder="John Doe"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <Input
            label="Customer Email"
            type="email"
            placeholder="john@example.com"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
            <Button variant="primary" onClick={() => handleQuickSubmit('Customer')}>Save Customer</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'createPolicy'}
        onClose={() => setActiveModal(null)}
        title="Create Insurance Policy"
        subtitle="Issue a new policy agreement to a customer"
      >
        <div className="space-y-4">
          <Select
            label="Policy Type"
            options={['Health Insurance', 'Life Insurance', 'Vehicle Insurance', 'Home Insurance']}
            value={policyType}
            onChange={(e) => setPolicyType(e.target.value)}
          />
          <Input label="Policy Holder Name" placeholder="e.g. John Smith" />
          <Input label="Annual Coverage Limit ($)" placeholder="e.g. 500,000" />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
            <Button variant="primary" onClick={() => handleQuickSubmit('Policy')}>Create Policy</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'newClaim'}
        onClose={() => setActiveModal(null)}
        title="File New Insurance Claim"
        subtitle="Submit claim details for adjuster review"
      >
        <div className="space-y-4">
          <Input label="Policy Number" placeholder="POL-2025-089" />
          <Input
            label="Claim Amount ($)"
            placeholder="e.g. 5,000"
            value={claimAmount}
            onChange={(e) => setClaimAmount(e.target.value)}
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
            <Button variant="primary" onClick={() => handleQuickSubmit('Claim')}>Submit Claim</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
