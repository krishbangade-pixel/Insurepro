'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import api from '@/lib/api';
import { mapAuditLog } from '@/lib/mappers';
import { PageLoader, PageError, EmptyState } from '@/components/common/PageState';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/audit-logs')
      .then((res) => setLogs((res.data.data || []).map(mapAuditLog)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      header: 'Event ID',
      accessorKey: 'id',
      cell: (row) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white">
          {row.id}
        </span>
      ),
    },
    {
      header: 'User & Role',
      accessorKey: 'user',
      cell: (row) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white leading-tight">{row.user}</p>
          <p className="text-[10px] text-slate-400">Role: {row.role}</p>
        </div>
      ),
    },
    {
      header: 'Action Taken',
      accessorKey: 'action',
      cell: (row) => (
        <Badge variant={row.action.includes('APPROVED') ? 'success' : row.action.includes('CREATED') ? 'info' : 'neutral'}>
          {row.action}
        </Badge>
      ),
    },
    {
      header: 'Audit Event Details',
      accessorKey: 'details',
      cell: (row) => <span className="text-xs text-slate-700 dark:text-slate-300">{row.details}</span>,
    },
    {
      header: 'IP Address',
      accessorKey: 'ip',
      cell: (row) => <span className="text-xs font-mono text-slate-500">{row.ip}</span>,
    },
    {
      header: 'Timestamp',
      accessorKey: 'timestamp',
      cell: (row) => <span className="text-xs font-mono text-slate-500">{row.timestamp}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System Audit & Security Logs
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Immutable SOC2 compliant activity logs tracking underwriter actions, approvals, and system access.
        </p>
      </div>

      <Card className="p-6">
        {loading ? (
          <PageLoader />
        ) : error ? (
          <PageError message={error} />
        ) : logs.length === 0 ? (
          <EmptyState message="No audit logs found." />
        ) : (
          <DataTable
            columns={columns}
            data={logs}
            searchPlaceholder="Search audit logs by user, action, details, IP..."
          />
        )}
      </Card>
    </div>
  );
}
