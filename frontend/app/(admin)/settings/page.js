'use client';

import React, { useState } from 'react';
import { Settings as SettingsIcon, Building, ShieldCheck, Lock, Palette, Save } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Tabs } from '@/components/ui/Tabs';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company');

  const [companyInfo, setCompanyInfo] = useState({
    name: 'InsurePro Global Services Inc.',
    taxId: 'US-992384711',
    address: '100 Financial Plaza, Suite 400, New York, NY 10005',
    email: 'compliance@insurepro.com',
  });

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('System configuration updated successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Enterprise Platform Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure organization profiles, underwriting category rules, security permissions matrix, and themes.
        </p>
      </div>

      <Card className="p-6">
        <Tabs
          tabs={[
            { id: 'company', label: 'Company Profile' },
            { id: 'categories', label: 'Insurance Categories' },
            { id: 'roles', label: 'Roles & Matrix Permissions' },
            { id: 'theme', label: 'Theme & Branding' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="mb-6"
        />

        {activeTab === 'company' && (
          <form onSubmit={handleSave} className="space-y-4 max-w-xl">
            <Input
              label="Organization Legal Name"
              value={companyInfo.name}
              onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
            />
            <Input
              label="Corporate Tax ID / Registration"
              value={companyInfo.taxId}
              onChange={(e) => setCompanyInfo({ ...companyInfo, taxId: e.target.value })}
            />
            <Input
              label="Headquarters Address"
              value={companyInfo.address}
              onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
            />
            <Input
              label="Compliance Support Email"
              type="email"
              value={companyInfo.email}
              onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
            />
            <Button type="submit" variant="primary" leftIcon={Save}>
              Save Corporate Profile
            </Button>
          </form>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-4 max-w-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Product Lines</h3>
            <div className="space-y-2">
              {['Health Insurance', 'Life Insurance', 'Vehicle Insurance', 'Home Insurance'].map((cat) => (
                <div key={cat} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
                  <span>{cat}</span>
                  <span className="text-emerald-600">Enabled</span>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.success('New product line created')}>
              + Add Insurance Line
            </Button>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Role Access Matrix</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-500">
                  <tr>
                    <th className="p-3">Role</th>
                    <th className="p-3">View Policies</th>
                    <th className="p-3">Approve Claims</th>
                    <th className="p-3">Export Reports</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-3 font-bold">Administrator</td>
                    <td className="p-3 text-emerald-600 font-bold">Full</td>
                    <td className="p-3 text-emerald-600 font-bold">Full</td>
                    <td className="p-3 text-emerald-600 font-bold">Full</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold">Underwriter Agent</td>
                    <td className="p-3 text-emerald-600 font-bold">Full</td>
                    <td className="p-3 text-amber-600 font-bold">Up to $25k</td>
                    <td className="p-3 text-slate-400">Read Only</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'theme' && (
          <div className="space-y-4 max-w-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Branding Palette</h3>
            <p className="text-xs text-slate-500">InsurePro Primary Color: Emerald Green (#059669)</p>
            <div className="flex space-x-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 ring-2 ring-emerald-400" />
              <div className="w-8 h-8 rounded-full bg-teal-600" />
              <div className="w-8 h-8 rounded-full bg-blue-600" />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
