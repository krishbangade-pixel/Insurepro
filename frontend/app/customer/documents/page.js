'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FolderOpen, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { documentsList } from '@/lib/mockData';

export default function CustomerDocumentsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">My Personal Document Repository</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {documentsList.map((d) => (
          <Card key={d.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FolderOpen className="w-6 h-6 text-brand-600" />
              <div>
                <p className="text-xs font-bold truncate max-w-[180px]">{d.name}</p>
                <p className="text-[10px] text-slate-400">{d.category}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => toast.success(`Downloading ${d.name}`)}>
              <Download className="w-4 h-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
