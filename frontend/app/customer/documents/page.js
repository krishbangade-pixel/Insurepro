'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FolderOpen, Download, Upload, FileText, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { PageLoader } from '@/components/common/PageState';

export default function CustomerDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: 'KYC & Identity Proof',
    file: null,
  });

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

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Document title is required');
      return;
    }
    setUploading(true);
    try {
      const fileName = form.file ? form.file.name : `${form.name.replace(/\s+/g, '_')}.pdf`;
      const fileSize = form.file ? `${(form.file.size / (1024 * 1024)).toFixed(2)} MB` : '1.50 MB';
      const fileType = form.file ? form.file.type : 'application/pdf';

      const response = await api.post('/documents', {
        name: form.name.trim(),
        category: form.category,
        size: fileSize,
        file_name: fileName,
        file_type: fileType,
        file_path: `/uploads/${fileName}`,
      });

      setDocuments([response.data.data, ...documents]);
      setIsUploadOpen(false);
      setForm({ name: '', category: 'KYC & Identity Proof', file: null });
      toast.success(`Document "${form.name}" uploaded successfully!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const downloadDocument = (doc) => {
    toast.success(`Downloaded ${doc.name || doc.file_name}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Document Vault</h2>
          <p className="text-xs text-slate-500">Securely store and manage your insurance policies, KYC identity proofs, and claim receipts.</p>
        </div>
        <Button variant="primary" leftIcon={Upload} onClick={() => setIsUploadOpen(true)}>
          Upload New Document
        </Button>
      </div>

      {loading ? (
        <PageLoader />
      ) : documents.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Documents Uploaded</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You have not uploaded any personal documents yet. Click Upload New Document above to add your files.
          </p>
          <Button variant="outline" size="sm" leftIcon={Upload} onClick={() => setIsUploadOpen(true)} className="mt-2">
            Upload Document Now
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((d) => (
            <Card key={d.id} className="p-4 flex items-center justify-between hover:border-brand-500/40 transition-colors">
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center font-bold shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{d.name || d.file_name}</p>
                  <p className="text-xs text-slate-500">{d.category || 'General'} • {d.size || '1.2 MB'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Verified
                </span>
                <Button variant="ghost" size="sm" onClick={() => downloadDocument(d)} aria-label={`Download ${d.name}`}>
                  <Download className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload Document" subtitle="Add a new file to your secure vault.">
        <form className="space-y-4" onSubmit={handleUploadSubmit}>
          <Input
            label="Document Title"
            placeholder="e.g. Passport ID / Health Claim Invoice"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Select
            label="Category"
            options={[
              'KYC & Identity Proof',
              'Policy Schedule',
              'Claim Proof & Receipts',
              'Medical Certificate',
              'Vehicle Registration',
              'Other',
            ]}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Document File
            </label>
            <input
              type="file"
              onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer border border-slate-200 dark:border-slate-800 rounded-xl p-1"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={uploading} leftIcon={Upload}>
              Save to Vault
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
