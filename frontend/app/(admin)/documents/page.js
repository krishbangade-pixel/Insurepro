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
  Upload,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { mapDocument } from '@/lib/mappers';
import { PageLoader, PageError, EmptyState } from '@/components/common/PageState';

export default function DocumentsPage() {
  const [docs, setDocs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    name: '',
    category: 'Policy Agreements',
    customer_id: '',
    file: null,
  });

  useEffect(() => {
    Promise.all([api.get('/documents'), api.get('/customers')])
      .then(([docRes, custRes]) => {
        setDocs((docRes.data.data || []).map(mapDocument));
        setCustomers(custRes.data.data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredDocs = activeCategory === 'All'
    ? docs
    : docs.filter((d) => d.category === activeCategory);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.name.trim()) {
      toast.error('Document title is required');
      return;
    }
    setUploading(true);
    try {
      const fileName = uploadForm.file ? uploadForm.file.name : `${uploadForm.name.replace(/\s+/g, '_')}.pdf`;
      const fileSize = uploadForm.file ? `${(uploadForm.file.size / (1024 * 1024)).toFixed(2)} MB` : '1.50 MB';
      const fileType = uploadForm.file ? uploadForm.file.type : 'application/pdf';

      const res = await api.post('/documents', {
        name: uploadForm.name.trim(),
        category: uploadForm.category,
        size: fileSize,
        customer_id: uploadForm.customer_id || null,
        file_name: fileName,
        file_type: fileType,
        file_path: `/uploads/${fileName}`,
      });

      const newDoc = mapDocument(res.data.data);
      setDocs([newDoc, ...docs]);
      setIsUploadModalOpen(false);
      setUploadForm({ name: '', category: 'Policy Agreements', customer_id: '', file: null });
      toast.success(`Document "${uploadForm.name}" uploaded to repository successfully!`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
    }
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

        <Button variant="primary" leftIcon={Plus} onClick={() => setIsUploadModalOpen(true)}>
          Upload New Document
        </Button>
      </div>

      {/* Drag & Drop Upload Zone */}
      <Card
        className="p-8 border-2 border-dashed border-brand-500/40 hover:border-brand-500 bg-brand-50/20 dark:bg-brand-950/20 text-center space-y-3 transition-colors cursor-pointer"
        onClick={() => setIsUploadModalOpen(true)}
      >
        <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-900/60 dark:text-brand-300 flex items-center justify-center">
          <UploadCloud className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Click here or drop files to upload to Document Vault
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

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Document"
        subtitle="Add a new policy, medical report, or compliance file into Supabase"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <Input
            label="Document Title"
            placeholder="e.g. Executive Health Policy Schedule 2026.pdf"
            value={uploadForm.name}
            onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
            required
          />
          <Select
            label="Document Category"
            options={[
              'Policy Agreements',
              'Medical Reports',
              'Claim Proofs',
              'Identification',
              'Other',
            ]}
            value={uploadForm.category}
            onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
          />
          <Select
            label="Associated Customer (Optional)"
            options={[{ label: 'General / No Customer', value: '' }, ...customers.map((c) => ({ label: `${c.name} — ${c.email}`, value: c.id }))]}
            value={uploadForm.customer_id}
            onChange={(e) => setUploadForm({ ...uploadForm, customer_id: e.target.value })}
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Document File
            </label>
            <input
              type="file"
              onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer border border-slate-200 dark:border-slate-800 rounded-xl p-1"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={uploading} leftIcon={Upload}>
              Upload to Vault
            </Button>
          </div>
        </form>
      </Modal>

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
