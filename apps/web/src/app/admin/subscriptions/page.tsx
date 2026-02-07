'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  adminGetSubscriptions,
  adminCancelSubscription,
  type AdminSubscription,
} from '@/lib/api';

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const token = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    setLoading(true);
    try {
      const data = await adminGetSubscriptions(token);
      setSubscriptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = useCallback(
    async (subscriptionId: string) => {
      if (!token) return;
      if (!confirm('Cancel this subscription at period end?')) return;
      setActionLoading(subscriptionId);
      setError(null);
      try {
        await adminCancelSubscription(token, subscriptionId);
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Cancel failed');
      } finally {
        setActionLoading(null);
      }
    },
    [token, load],
  );

  const formatPrice = (cents: number, currency: string) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (currency || 'USD').toUpperCase(),
      maximumFractionDigits: 2,
    }).format(cents / 100);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">Subscriptions</h1>
      <p className="mt-1 text-stone-500">Active premium subscriptions</p>

      {error && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-stone-500">Loading…</p>
      ) : subscriptions.length === 0 ? (
        <p className="mt-6 text-stone-500">No active subscriptions</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-stone-200">
            <thead>
              <tr className="bg-stone-50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-stone-500">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-stone-500">
                  Plan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-stone-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-stone-500">
                  Period end
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-stone-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {subscriptions.map((s) => (
                <tr key={s.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 text-sm text-stone-900">
                    <span className="font-medium">{s.userEmail}</span>
                    <br />
                    <Link
                      href={`/admin/users?status=approved`}
                      className="text-xs text-amber-600 hover:underline"
                    >
                      User ID: {s.userId.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-stone-600">
                    {s.plan.name} ({formatPrice(s.plan.priceCents, s.plan.currency)}/{s.plan.interval})
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                      {s.status}
                    </span>
                    {s.cancelAtPeriodEnd && (
                      <span className="ml-1 text-xs text-amber-600">(cancelling)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-stone-500">
                    {s.currentPeriodEnd
                      ? new Date(s.currentPeriodEnd).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!s.cancelAtPeriodEnd && (
                      <button
                        onClick={() => handleCancel(s.id)}
                        disabled={actionLoading === s.id}
                        className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        Cancel at period end
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
