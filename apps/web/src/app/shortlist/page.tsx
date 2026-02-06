'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  getShortlist,
  removeFromShortlist,
  type ShortlistItem,
} from '@/lib/api';

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
    <main className="min-h-screen bg-stone-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-stone-900">Shortlist</h1>
          <div className="flex gap-2">
            <Link
              href="/search"
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Search
            </Link>
            <Link href="/" className="text-sm font-medium text-amber-600 hover:text-amber-700">
              ← Home
            </Link>
          </div>
        </div>

        {loading ? (
          <p className="py-8 text-center text-stone-500">Loading…</p>
        ) : error ? (
          <p className="py-8 text-center text-red-600">{error}</p>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-white p-8 text-center">
            <p className="text-stone-600">Your shortlist is empty.</p>
            <Link
              href="/search"
              className="mt-3 inline-block text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              Search profiles to shortlist
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
              >
                <Link href={`/profile/${item.profile.id}`} className="shrink-0">
                  {item.profile.photos.find((p) => p.isPrimary) ? (
                    <img
                      src={item.profile.photos.find((p) => p.isPrimary)!.url}
                      alt={item.profile.displayName}
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-stone-100 text-stone-400 text-xs">
                      No photo
                    </div>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/profile/${item.profile.id}`}
                    className="font-medium text-stone-900 hover:underline"
                  >
                    {item.profile.displayName}
                  </Link>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {item.profile.gender} · {item.profile.dob}
                  </p>
                  {(item.profile.education || item.profile.occupation) && (
                    <p className="mt-1 truncate text-xs text-stone-600">
                      {item.profile.education}
                      {item.profile.education && item.profile.occupation ? ' · ' : ''}
                      {item.profile.occupation}
                    </p>
                  )}
                  <div className="mt-2 flex gap-2">
                    <Link
                      href={`/profile/${item.profile.id}`}
                      className="text-sm font-medium text-amber-600 hover:text-amber-700"
                    >
                      View profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.profileId)}
                      className="text-sm text-stone-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
