'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';

export default function AgentClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.get('/claims').then((r) => { if (mounted) setClaims(r.data.data || []); }).catch((e) => { if (mounted) setError(e.message); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const columns = [
    { header: 'Claim ID', accessorKey: 'claim_number' },
    { header: 'Customer', accessorKey: 'customer', cell: (r) => r.customer?.name },
    { header: 'Amount', accessorKey: 'amount' },
    { header: 'Status', accessorKey: 'status', cell: (r) => <Badge variant="warning">{r.status}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Assigned Claims Workspace</h2>
      <Card className="p-6">
        <DataTable columns={columns} data={claims} loading={loading} error={error} searchPlaceholder="Search claims..." />
      </Card>
    </div>
  );
}
