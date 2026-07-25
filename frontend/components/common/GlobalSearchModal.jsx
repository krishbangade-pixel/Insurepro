'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Search, Shield, Users, FileText, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const router = Router();

  function Router() {
    return useRouter();
  }

  const [filteredPolicies, setFilteredPolicies] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);

  useEffect(() => {
    let mounted = true;
    const doSearch = async () => {
      if (!query || query.length < 2) {
        if (mounted) {
          setFilteredPolicies([]); setFilteredCustomers([]); setFilteredClaims([]);
        }
        return;
      }

      try {
        const [polRes, custRes, claimRes] = await Promise.all([
          api.get('/policies', { params: { search: query, limit: 6 } }).catch(() => ({ data: { data: [] } })),
          api.get('/customers', { params: { search: query, limit: 6 } }).catch(() => ({ data: { data: [] } })),
          api.get('/claims', { params: { search: query, limit: 6 } }).catch(() => ({ data: { data: [] } })),
        ]);
        if (!mounted) return;
        setFilteredPolicies(polRes.data.data || []);
        setFilteredCustomers(custRes.data.data || []);
        setFilteredClaims(claimRes.data.data || []);
      } catch (e) {
        // ignore search errors
      }
    };

    const t = setTimeout(doSearch, 250);
    return () => { mounted = false; clearTimeout(t); };
  }, [query]);

  const navigateTo = (path) => {
    onClose();
    setQuery('');
    router.push(path);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl" className="p-0 border-0 bg-transparent shadow-none">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Search Header */}
        <div className="relative border-b border-slate-100 dark:border-slate-800 p-4 flex items-center">
          <Search className="w-5 h-5 text-brand-600 dark:text-brand-400 ml-2 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search policies, customers, claims, or press ESC to close..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-slate-900 dark:text-white text-base focus:outline-none placeholder:text-slate-400 font-sans"
          />
          <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg">
            ESC
          </kbd>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
              Type to search policies (e.g. POL-2025-089), customers (e.g. John Smith), or claims (e.g. CLM-2025-1256)...
            </div>
          )}

          {query && filteredPolicies.length === 0 && filteredCustomers.length === 0 && filteredClaims.length === 0 && (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
              No matching policies, customers, or claims found for &quot;{query}&quot;.
            </div>
          )}

          {filteredPolicies.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Policies ({filteredPolicies.length})
              </p>
              <div className="space-y-1">
                {filteredPolicies.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigateTo('/policies')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 rounded-lg">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {item.id} - {item.type}
                        </p>
                        <p className="text-xs text-slate-500">{item.holder} • {item.coverage}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredCustomers.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Customers ({filteredCustomers.length})
              </p>
              <div className="space-y-1">
                {filteredCustomers.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(`/customers/${item.id}`)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 rounded-lg">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {item.name} ({item.id})
                        </p>
                        <p className="text-xs text-slate-500">{item.email} • {item.tier}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredClaims.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Claims ({filteredClaims.length})
              </p>
              <div className="space-y-1">
                {filteredClaims.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigateTo('/claims')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 rounded-lg">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {item.id} - {item.claimAmount}
                        </p>
                        <p className="text-xs text-slate-500">{item.customer.name} • Status: {item.status}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
