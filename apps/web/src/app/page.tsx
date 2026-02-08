'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageContainer } from '@/components/layout/PageContainer';
import { Skeleton } from '@/components/ui/skeleton';

const ACTIONS = [
  { href: '/search', label: 'Search', description: 'Find your match' },
  { href: '/shortlist', label: 'Shortlist', description: 'Saved profiles' },
  { href: '/chat', label: 'Messages', description: 'Your conversations' },
  { href: '/interests', label: 'Interests', description: 'Sent and received' },
  { href: '/profile', label: 'My profile', description: 'Edit your profile' },
  { href: '/subscription', label: 'Premium', description: 'Unlock features' },
] as const;

export default function Home() {
  const [user, setUser] = useState<{ email: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-col">
      <section className="border-b bg-muted/40 py-16">
        <PageContainer className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Find your match
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Web-based matrimonial platform
          </p>
          {loading ? (
            <div className="mt-8 flex justify-center gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          ) : !user ? (
            <nav className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/register">Sign up</Link>
              </Button>
            </nav>
          ) : null}
        </PageContainer>
      </section>

      {!loading && user && (
        <section className="py-12">
          <PageContainer>
            <p className="mb-8 text-center text-muted-foreground">
              Welcome back. Choose an option below to get started.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ACTIONS.map(({ href, label, description }) => (
                <Link key={href} href={href}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-card-foreground">{label}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                      <Button variant="ghost" size="sm" className="mt-3">
                        Open
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              {user.role === 'admin' && (
                <Link href="/admin">
                  <Card className="h-full border-primary/30 bg-primary/5 transition-shadow hover:shadow-md">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-card-foreground">Admin</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Manage users and content</p>
                      <Button variant="outline" size="sm" className="mt-3">
                        Open
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          </PageContainer>
        </section>
      )}
    </div>
  );
}
