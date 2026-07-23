'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { customersList } from '@/lib/mockData';

export default function AgentCustomersPage() {
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
        <DataTable columns={columns} data={customersList} searchPlaceholder="Search clients..." />
      </Card>
    </div>
  );
}
