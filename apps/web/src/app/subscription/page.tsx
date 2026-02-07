'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  cancelSubscription,
  createSubscriptionCheckout,
  getSubscriptionMe,
  getSubscriptionPlans,
  type Plan,
  type SubscriptionMe,
} from '@/lib/api';

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [me, setMe] = useState<SubscriptionMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }, []);

  const loadData = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [planData, meData] = await Promise.all([
        getSubscriptionPlans(),
        token ? getSubscriptionMe(token) : Promise.resolve(null),
      ]);
      setPlans(planData);
      setMe(meData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load plans.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatPrice = useCallback((plan: Plan) => {
    const amount = plan.priceCents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: plan.currency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);

  const handleCheckout = useCallback(
    async (planId: string) => {
      if (!token) {
        setError('Log in to subscribe.');
        return;
      }
      setActionLoading(true);
      setError(null);
      try {
        const res = await createSubscriptionCheckout(token, { planId });
        if (typeof window !== 'undefined') {
          window.location.href = res.url;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Checkout failed.');
      } finally {
        setActionLoading(false);
      }
    },
    [token],
  );

  const handleCancel = useCallback(async () => {
    if (!token) return;
    setActionLoading(true);
    setError(null);
    try {
      await cancelSubscription(token);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancel failed.');
    } finally {
      setActionLoading(false);
    }
  }, [loadData, token]);

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-stone-50">
        <p className="text-stone-500">Loading subscription plans…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-stone-50">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-stone-900">Premium Membership</h1>
          <Link
            href="/"
            className="text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            ← Home
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {!token && (
          <div className="mb-6 rounded-lg border border-stone-200 bg-white p-4 text-sm">
            <p className="text-stone-600">
              Log in to manage your premium subscription.
            </p>
            <Link
              href="/login"
              className="mt-3 inline-block text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              Go to login
            </Link>
          </div>
        )}

        {me?.subscription && (
          <div className="mb-6 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-900">Your plan</h2>
            <p className="mt-1 text-sm text-stone-600">
              {me.subscription.plan.name} · {formatPrice(me.subscription.plan)} /{' '}
              {me.subscription.plan.interval}
            </p>
            <p className="mt-2 text-xs text-stone-500">
              Status: {me.subscription.status}
              {me.subscription.currentPeriodEnd && (
                <> · Renews on {new Date(me.subscription.currentPeriodEnd).toLocaleDateString()}</>
              )}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={actionLoading}
                className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-60"
              >
                {me.subscription.cancelAtPeriodEnd ? 'Cancel scheduled' : 'Cancel subscription'}
              </button>
              <button
                type="button"
                onClick={() => me.subscription && handleCheckout(me.subscription.plan.id)}
                disabled={actionLoading}
                className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-60"
              >
                Upgrade or renew
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.id} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-stone-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-stone-600">
                {formatPrice(plan)} / {plan.interval}
              </p>
              <ul className="mt-3 text-xs text-stone-500 space-y-1">
                <li>Unlimited chat</li>
                <li>Contact access</li>
                <li>Advanced filters</li>
              </ul>
              <button
                type="button"
                onClick={() => handleCheckout(plan.id)}
                disabled={actionLoading}
                className="mt-4 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-60"
              >
                Choose plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
