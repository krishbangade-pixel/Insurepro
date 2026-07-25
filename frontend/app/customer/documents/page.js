'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FolderOpen, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function CustomerDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get('/documents')
      .then((response) => {
        if (mounted) setDocuments(response.data.data || []);
      })
      .catch((error) => {
        if (mounted) toast.error(error.response?.data?.message || 'Unable to load documents');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const downloadDocument = (document) => {
    if (!document.file_path) {
      toast.error('This document does not have a downloadable file yet.');
      return;
    }
    window.open(document.file_path, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">My Personal Document Repository</h2>
      {loading ? (
        <p className="text-sm text-slate-500">Loading documents…</p>
      ) : documents.length === 0 ? (
        <Card className="p-6 text-sm text-slate-500">You have not uploaded any documents yet.</Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {documents.map((d) => (
          <Card key={d.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FolderOpen className="w-6 h-6 text-brand-600" />
              <div>
                <p className="text-xs font-bold truncate max-w-[180px]">{d.name}</p>
                <p className="text-[10px] text-slate-400">{d.category}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => downloadDocument(d)} aria-label={`Download ${d.name}`}>
              <Download className="w-4 h-4" />
            </Button>
          </Card>
        ))}
        </div>
      )}
    </div>
  );
}
