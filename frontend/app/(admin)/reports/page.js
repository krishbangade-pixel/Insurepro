'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Filter,
  Calendar,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageLoader, PageError } from '@/components/common/PageState';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function ReportsPage() {
  const [activeReportTab, setActiveReportTab] = useState('revenue');

  const handleExportPDF = () => {
    toast.success('Generating enterprise PDF executive summary report...');
  };

  const handleExportExcel = () => {
    toast.success('Exporting raw dataset to XLSX workbook...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Executive Analytics & Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Comprehensive financial, underwriting loss ratio, and growth analytics for board presentations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" leftIcon={FileSpreadsheet} onClick={handleExportExcel}>
            Export Excel
          </Button>
          <Button variant="primary" size="sm" leftIcon={Download} onClick={handleExportPDF}>
            Export PDF Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card className="p-6">
        <Tabs
          tabs={[
            { id: 'revenue', label: 'Revenue & Gross Premium' },
            { id: 'customer', label: 'Customer Retention & Growth' },
            { id: 'claims', label: 'Claims Loss Ratio Analytics' },
          ]}
          activeTab={activeReportTab}
          onChange={setActiveReportTab}
          className="mb-6"
        />

        {activeReportTab === 'revenue' && (
          <div className="space-y-6">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenueData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="#059669" name="Actual Revenue" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="target" fill="#0D9488" name="Target Projection" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <p className="text-slate-400">Total YTD Premium Collected</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">$2,44,000.00</p>
              </div>
              <div>
                <p className="text-slate-400">Target Attainment Rate</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">112.4%</p>
              </div>
              <div>
                <p className="text-slate-400">Underwriting Margin</p>
                <p className="text-lg font-bold text-brand-600 dark:text-brand-400">34.8%</p>
              </div>
            </div>
          </div>
        )}

        {activeReportTab === 'customer' && (
          <div className="space-y-6">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={customerGrowthData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="customers" stroke="#059669" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <p className="text-slate-400">Net Active Policyholders</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">2,458</p>
              </div>
              <div>
                <p className="text-slate-400">Customer Retention Rate</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">96.2%</p>
              </div>
              <div>
                <p className="text-slate-400">Avg Lifetime Value (LTV)</p>
                <p className="text-lg font-bold text-brand-600 dark:text-brand-400">$18,400</p>
              </div>
            </div>
          </div>
        )}

        {activeReportTab === 'claims' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={claimsOverviewData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>
                    {claimsOverviewData.map((e, idx) => (
                      <Cell key={idx} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Underwriting Loss Ratio Analysis</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Claims loss ratio is currently maintained at an optimal 45.6% approval rate, ensuring strong solvency reserves while delivering rapid customer payout resolution.
              </p>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2 text-xs">
                <div className="flex justify-between font-semibold">
                  <span>Gross Claims Incurred:</span>
                  <span className="font-bold text-slate-900 dark:text-white">$1,120,500</span>
                </div>
                <div className="flex justify-between font-semibold text-emerald-600">
                  <span>Net Settled Payouts:</span>
                  <span className="font-bold">$840,200</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
