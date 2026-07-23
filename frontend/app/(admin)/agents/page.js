'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  ShieldCheck,
  Award,
  DollarSign,
  FileText,
  Mail,
  Plus,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { mapAgent } from '@/lib/mappers';
import { PageLoader, PageError, EmptyState } from '@/components/common/PageState';

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', role: 'Claims Specialist', email: '' });

  useEffect(() => {
    api.get('/agents')
      .then((res) => setAgents((res.data.data || []).map(mapAgent)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAddAgent = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/agents', {
        name: newAgent.name,
        role: newAgent.role,
        email: newAgent.email,
      });
      setAgents([...agents, mapAgent(res.data.data)]);
      setIsAddOpen(false);
      toast.success(`Agent ${newAgent.name} added to team roster.`);
      setNewAgent({ name: '', role: 'Claims Specialist', email: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <PageLoader />;
  if (error) return <PageError message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Insurance Underwriters & Agents
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor agent workloads, active policies under management, and claims resolution efficiency rates.
          </p>
        </div>

        <Button variant="primary" leftIcon={Plus} onClick={() => setIsAddOpen(true)}>
          Add New Agent
        </Button>
      </div>

      {agents.length === 0 ? (
        <EmptyState message="No agents found." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card key={agent.id} hover className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-500/20"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {agent.name}
                    </h3>
                    <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                      {agent.role}
                    </p>
                  </div>
                </div>
                <Badge variant="success">{agent.status}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-slate-400 flex items-center"><UserCheck className="w-3 h-3 mr-1" />Clients</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{agent.assignedCustomers}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-slate-400 flex items-center"><ShieldCheck className="w-3 h-3 mr-1" />Policies</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{agent.activePolicies}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-slate-400 flex items-center"><Award className="w-3 h-3 mr-1" />Resolution</p>
                  <p className="font-bold text-emerald-600 mt-0.5">{agent.claimResolutionRate}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-slate-400 flex items-center"><DollarSign className="w-3 h-3 mr-1" />Revenue</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{agent.revenueGenerated}</p>
                </div>
              </div>

              <div className="flex items-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Mail className="w-3.5 h-3.5 mr-1.5" />
                {agent.email}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Agent"
        subtitle="Register a new underwriter or claims specialist"
      >
        <form onSubmit={handleAddAgent} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Alex Johnson"
            value={newAgent.name}
            onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="alex@insurepro.com"
            value={newAgent.email}
            onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
            required
          />
          <Input
            label="Role / Designation"
            placeholder="Claims Specialist"
            value={newAgent.role}
            onChange={(e) => setNewAgent({ ...newAgent, role: e.target.value })}
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Add Agent</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
