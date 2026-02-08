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
    return <p className="text-muted-foreground">Loading analytics…</p>;
  }
  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive">
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
      <h1 className="text-2xl font-semibold text-foreground">Admin Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Overview and quick links</p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) =>
          c.href ? (
            <Link
              key={c.label}
              href={c.href}
              className="rounded-xl border bg-card p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md"
            >
              <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
              <p className="mt-1 text-2xl font-semibold text-card-foreground">{c.value}</p>
            </Link>
          ) : (
            <div
              key={c.label}
              className="rounded-xl border bg-card p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
              <p className="mt-1 text-2xl font-semibold text-card-foreground">{c.value}</p>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
