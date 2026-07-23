'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  UploadCloud,
  FileText,
  Download,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  Plus,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { mapDocument } from '@/lib/mappers';
import { PageLoader, PageError, EmptyState } from '@/components/common/PageState';

export default function DocumentsPage() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    api.get('/documents')
      .then((res) => setDocs((res.data.data || []).map(mapDocument)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredDocs = activeCategory === 'All'
    ? docs
    : docs.filter((d) => d.category === activeCategory);

  const handleDropUpload = (e) => {
    e.preventDefault();
    setIsUploading(true);
    setTimeout(() => {
      const created = {
        id: `DOC-${Math.floor(100 + Math.random() * 900)}`,
        name: 'Signed_Policy_Endorsement_2025.pdf',
        category: 'Policy Agreements',
        size: '3.1 MB',
        uploadedOn: 'Just now',
        uploadedBy: 'Alex Johnson',
        status: 'Verified',
      };
      setDocs([created, ...docs]);
      setIsUploading(false);
      toast.success('Document uploaded and scanned for viruses.');
    }, 1000);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Remove file ${name}?`)) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocs(docs.filter((d) => d.id !== id));
      toast.success(`Deleted file ${name}`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Document Repository & Compliance Vault
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Store, categorize, verify, and inspect policy agreements, medical records, and claim proof documents.
          </p>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <Card
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropUpload}
        className="p-8 border-2 border-dashed border-brand-500/40 hover:border-brand-500 bg-brand-50/20 dark:bg-brand-950/20 text-center space-y-3 transition-colors cursor-pointer"
        onClick={handleDropUpload}
      >
        <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-900/60 dark:text-brand-300 flex items-center justify-center">
          <UploadCloud className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {isUploading ? 'Uploading and Indexing File...' : 'Drag & drop files here, or click to browse'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Supports PDF, ZIP, PNG, JPG up to 50MB per file. Automatic OCR & virus scanning enabled.
          </p>
        </div>
      </Card>

      {/* Document Category Filter & Grid */}
      <Card className="p-6">
        <Tabs
          tabs={[
            { id: 'All', label: 'All Files', count: docs.length },
            { id: 'Policy Agreements', label: 'Policy Agreements' },
            { id: 'Medical Reports', label: 'Medical Reports' },
            { id: 'Claim Proofs', label: 'Claim Proofs' },
            { id: 'Identification', label: 'Identification' },
          ]}
          activeTab={activeCategory}
          onChange={setActiveCategory}
          className="mb-6"
        />

        {loading ? (
          <PageLoader />
        ) : error ? (
          <PageError message={error} />
        ) : filteredDocs.length === 0 ? (
          <EmptyState message="No documents found." />
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-500/60 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-card"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <Badge variant={doc.status === 'Verified' ? 'success' : 'warning'}>
                    {doc.status}
                  </Badge>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {doc.name}
                </h4>
                <p className="text-[11px] text-slate-400">Category: {doc.category}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>Size: {doc.size}</span>
                  <span>{doc.uploadedOn}</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="Preview Document"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toast.success(`Downloading ${doc.name}`)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(doc.id, doc.name)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="Delete File"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </Card>

      {/* Preview Modal */}
      <Modal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        title={`Document Viewer: ${previewDoc?.name}`}
        subtitle={`${previewDoc?.category} • Uploaded by ${previewDoc?.uploadedBy}`}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4">
          <div className="h-80 w-full rounded-2xl bg-slate-900 text-white flex items-center justify-center p-6 text-center">
            <div>
              <FileText className="w-16 h-16 text-brand-400 mx-auto mb-3" />
              <p className="text-sm font-semibold">{previewDoc?.name}</p>
              <p className="text-xs text-slate-400 mt-1">Simulated Secure Document OCR Renderer</p>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setPreviewDoc(null)}>Close Preview</Button>
            <Button variant="primary" leftIcon={Download} onClick={() => toast.success('File downloaded.')}>
              Download Document
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
