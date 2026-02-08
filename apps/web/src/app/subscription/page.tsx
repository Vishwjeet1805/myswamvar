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
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
      <div className="py-8">
        <PageContainer className="max-w-3xl">
          <p className="text-center text-muted-foreground">Loading subscription plans…</p>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="py-8">
      <PageContainer className="max-w-3xl">
        <h1 className="mb-6 text-2xl font-semibold text-foreground">Premium Membership</h1>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!token && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                Log in to manage your premium subscription.
              </p>
              <Button variant="link" size="sm" className="mt-3 px-0" asChild>
                <Link href="/login">Go to login</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {me?.subscription && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold text-card-foreground">Your plan</h2>
              <p className="text-sm text-muted-foreground">
                {me.subscription.plan.name} · {formatPrice(me.subscription.plan)} /{' '}
                {me.subscription.plan.interval}
              </p>
              <p className="text-xs text-muted-foreground">
                Status: {me.subscription.status}
                {me.subscription.currentPeriodEnd && (
                  <> · Renews on {new Date(me.subscription.currentPeriodEnd).toLocaleDateString()}</>
                )}
              </p>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3 pt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={actionLoading}
              >
                {me.subscription.cancelAtPeriodEnd ? 'Cancel scheduled' : 'Cancel subscription'}
              </Button>
              <Button
                size="sm"
                onClick={() => me.subscription && handleCheckout(me.subscription.plan.id)}
                disabled={actionLoading}
              >
                Upgrade or renew
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <h3 className="text-lg font-semibold text-card-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(plan)} / {plan.interval}
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>Unlimited chat</li>
                  <li>Contact access</li>
                  <li>Advanced filters</li>
                </ul>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  size="sm"
                  onClick={() => handleCheckout(plan.id)}
                  disabled={actionLoading}
                >
                  Choose plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageContainer>
    </div>
  );
}
