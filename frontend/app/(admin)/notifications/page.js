'use client';

import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { mapNotification } from '@/lib/mappers';
import { PageLoader, PageError, EmptyState } from '@/components/common/PageState';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/notifications')
      .then((res) => setNotifications((res.data.data || []).map(mapNotification)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      toast.success('Marked all notifications as read');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  if (loading) return <PageLoader />;
  if (error) return <PageError message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Notification Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            System alerts, claim updates, policy expirations, and financial transaction receipts.
          </p>
        </div>

        <Button variant="outline" size="sm" leftIcon={CheckCheck} onClick={handleMarkAllRead}>
          Mark All as Read
        </Button>
      </div>

      <Card className="p-6">
        <Tabs
          tabs={[
            { id: 'all', label: 'All Notifications', count: notifications.length },
            { id: 'unread', label: 'Unread Only', count: notifications.filter((n) => !n.read).length },
          ]}
          activeTab={filter}
          onChange={setFilter}
          className="mb-6"
        />

        {filteredNotifs.length === 0 ? (
          <EmptyState message="No notifications found." />
        ) : (
          <div className="space-y-3">
            {filteredNotifs.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-colors flex items-start space-x-4 ${
                  notif.read
                    ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                    : 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300 shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {notif.title}
                    </h4>
                    <span className="text-[11px] text-slate-400">{notif.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{notif.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
