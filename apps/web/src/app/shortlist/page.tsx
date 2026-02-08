'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  getShortlist,
  removeFromShortlist,
  type ShortlistItem,
} from '@/lib/api';
import { PageContainer } from '@/components/layout/PageContainer';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ShortlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<ShortlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      router.replace('/login');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await getShortlist(token);
      setItems(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load shortlist');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRemove(profileId: string) {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;
    try {
      await removeFromShortlist(token, profileId);
      setItems((prev) => prev.filter((i) => i.profileId !== profileId));
    } catch {
      // ignore
    }
  }

  return (
    <div className="py-6">
      <PageContainer className="max-w-4xl">
        <h1 className="mb-6 text-2xl font-semibold text-foreground">Shortlist</h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="flex gap-4 p-4">
                  <Skeleton className="h-24 w-24 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : items.length === 0 ? (
          <EmptyState
            title="Your shortlist is empty"
            description="Search for profiles and add them to your shortlist."
            actionLabel="Search profiles"
            actionHref="/search"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="flex gap-4 p-4">
                  <Link
                    href={`/profile/${item.profile.id}`}
                    className="shrink-0"
                  >
                    {item.profile.photos.find((p) => p.isPrimary) ? (
                      <img
                        src={item.profile.photos.find((p) => p.isPrimary)!.url}
                        alt={item.profile.displayName}
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-muted text-muted-foreground text-xs">
                        No photo
                      </div>
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/profile/${item.profile.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {item.profile.displayName}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.profile.gender} · {item.profile.dob}
                    </p>
                    {(item.profile.education || item.profile.occupation) && (
                      <p className="mt-1 truncate text-xs text-foreground/80">
                        {item.profile.education}
                        {item.profile.education && item.profile.occupation
                          ? ' · '
                          : ''}
                        {item.profile.occupation}
                      </p>
                    )}
                    <div className="mt-2 flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/profile/${item.profile.id}`}>
                          View profile
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemove(item.profileId)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
