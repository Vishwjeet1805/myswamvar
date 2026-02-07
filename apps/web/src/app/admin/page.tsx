'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  adminGetAnalytics,
  type AdminAnalytics,
} from '@/lib/api';

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    setLoading(true);
    try {
      const data = await adminGetAnalytics(token);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <p className="text-stone-500">Loading analytics…</p>;
  }
  if (error) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
        {error}
      </div>
    );
  }
  if (!analytics) {
    return null;
  }

  const cards = [
    { label: 'Total users', value: analytics.totalUsers, href: '/admin/users' },
    { label: 'Total profiles', value: analytics.totalProfiles, href: '/admin/profiles' },
    { label: 'Active subscriptions', value: analytics.activeSubscriptions, href: '/admin/subscriptions' },
    { label: 'Pending approvals', value: analytics.pendingUsers, href: '/admin/users?status=pending' },
    { label: 'Signups (7 days)', value: analytics.signupsLast7Days },
    { label: 'Signups (30 days)', value: analytics.signupsLast30Days },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">Admin Dashboard</h1>
      <p className="mt-1 text-stone-500">Overview and quick links</p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) =>
          c.href ? (
            <Link
              key={c.label}
              href={c.href}
              className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-amber-200 hover:shadow"
            >
              <p className="text-sm font-medium text-stone-500">{c.label}</p>
              <p className="mt-1 text-2xl font-semibold text-stone-900">{c.value}</p>
            </Link>
          ) : (
            <div
              key={c.label}
              className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-stone-500">{c.label}</p>
              <p className="mt-1 text-2xl font-semibold text-stone-900">{c.value}</p>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
