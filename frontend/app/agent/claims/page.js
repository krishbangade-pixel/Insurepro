'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { recentClaimsData } from '@/lib/mockData';

export default function AgentClaimsPage() {
  const columns = [
    { header: 'Claim ID', accessorKey: 'id' },
    { header: 'Customer', accessorKey: 'customer', cell: (r) => r.customer.name },
    { header: 'Amount', accessorKey: 'claimAmount' },
    { header: 'Status', accessorKey: 'status', cell: (r) => <Badge variant="warning">{r.status}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Assigned Claims Workspace</h2>
      <Card className="p-6">
        <DataTable columns={columns} data={recentClaimsData} searchPlaceholder="Search claims..." />
      </Card>
    </div>
  );
}
