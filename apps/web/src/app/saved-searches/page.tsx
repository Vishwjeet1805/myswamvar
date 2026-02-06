'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { getSavedSearches, deleteSavedSearch, type SavedSearch } from '@/lib/api';

export default function SavedSearchesPage() {
  const router = useRouter();
  const [list, setList] = useState<SavedSearch[]>([]);
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
      const data = await getSavedSearches(token);
      setList(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load saved searches');
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;
    try {
      await deleteSavedSearch(token, id);
      setList((prev) => prev.filter((s) => s.id !== id));
    } catch {
      load();
    }
  }

  function filtersToQuery(f: SavedSearch['filters']): string {
    const sp = new URLSearchParams();
    if (f.ageMin != null) sp.set('ageMin', String(f.ageMin));
    if (f.ageMax != null) sp.set('ageMax', String(f.ageMax));
    if (f.gender) sp.set('gender', f.gender);
    if (f.locationCountry) sp.set('locationCountry', f.locationCountry);
    if (f.locationState) sp.set('locationState', f.locationState);
    if (f.locationCity) sp.set('locationCity', f.locationCity);
    if (f.education) sp.set('education', f.education);
    if (f.occupation) sp.set('occupation', f.occupation);
    if (f.religion) sp.set('religion', f.religion);
    return sp.toString();
  }

  return (
    <main className="min-h-screen bg-stone-50 p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-stone-900">Saved searches</h1>
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
        ) : list.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-white p-8 text-center">
            <p className="text-stone-600">No saved searches.</p>
            <Link
              href="/search"
              className="mt-3 inline-block text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              Go to search and save a filter set
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {list.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
              >
                <div>
                  <Link
                    href={`/search?${filtersToQuery(s.filters)}`}
                    className="font-medium text-stone-900 hover:underline"
                  >
                    {s.name}
                  </Link>
                  {s.notify && (
                    <span className="ml-2 text-xs text-stone-500">Notify on new matches</span>
                  )}
                  <p className="mt-0.5 text-xs text-stone-500">
                    {[
                      s.filters.ageMin != null && `Age ${s.filters.ageMin}-${s.filters.ageMax ?? 'any'}`,
                      s.filters.gender,
                      s.filters.locationCountry,
                      s.filters.education,
                      s.filters.religion,
                    ]
                      .filter(Boolean)
                      .join(' · ') || 'No filters'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(s.id)}
                  className="text-sm text-stone-500 hover:text-red-600"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
