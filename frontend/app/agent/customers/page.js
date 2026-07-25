'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';

export default function AgentCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.get('/customers').then((r) => { if (mounted) setCustomers(r.data.data || []); }).catch((e) => { if (mounted) setError(e.message); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const columns = [
    { header: 'ID', accessorKey: 'id' },
    { header: 'Customer', accessorKey: 'name' },
    { header: 'Email', accessorKey: 'email' },
    { header: 'Tier', accessorKey: 'tier' },
    { header: 'Status', accessorKey: 'status', cell: (r) => <Badge variant="success">{r.status}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Assigned Accounts & Clients</h2>
      <Card className="p-6">
        <DataTable columns={columns} data={customers} loading={loading} error={error} searchPlaceholder="Search clients..." />
      </Card>
    </div>
  );
}
