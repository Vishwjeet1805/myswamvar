'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import {
  searchProfiles,
  createSavedSearch,
  type PublicProfile,
  type SearchParams as SearchParamsType,
  type SearchResult,
} from '@/lib/api';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveNotify, setSaveNotify] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [filters, setFilters] = useState<SearchParamsType>({
    page: Number(searchParams.get('page')) || DEFAULT_PAGE,
    limit: Number(searchParams.get('limit')) || DEFAULT_LIMIT,
  });

  const runSearch = useCallback(async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      setHasToken(!!token);
      const r = await searchProfiles(filters, token ?? undefined);
      setResult(r);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (typeof window !== 'undefined') setHasToken(!!localStorage.getItem('accessToken'));
  }, []);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  function updateFilters(updates: Partial<SearchParamsType>) {
    setFilters((prev) => ({ ...prev, ...updates, page: 1 }));
  }

  function goToPage(page: number) {
    setFilters((prev) => ({ ...prev, page }));
  }

  async function handleSaveSearch() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token || !saveName.trim()) return;
    setSaving(true);
    try {
      const f = {
        ageMin: filters.ageMin,
        ageMax: filters.ageMax,
        gender: filters.gender,
        locationCountry: filters.locationCountry,
        locationState: filters.locationState,
        locationCity: filters.locationCity,
        education: filters.education,
        occupation: filters.occupation,
        religion: filters.religion,
      };
      await createSavedSearch(token, { name: saveName.trim(), filters: f, notify: saveNotify });
      setSaveOpen(false);
      setSaveName('');
      setSaveNotify(false);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-stone-900">Search profiles</h1>
          <Link href="/" className="text-sm font-medium text-amber-600 hover:text-amber-700">
            ← Home
          </Link>
        </div>

        <div className="mb-6 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-medium text-stone-700">Filters</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            <div>
              <label className="block text-xs text-stone-500">Age min</label>
              <input
                type="number"
                min={18}
                max={100}
                value={filters.ageMin ?? ''}
                onChange={(e) => updateFilters({ ageMin: e.target.value ? Number(e.target.value) : undefined })}
                className="mt-0.5 w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500">Age max</label>
              <input
                type="number"
                min={18}
                max={100}
                value={filters.ageMax ?? ''}
                onChange={(e) => updateFilters({ ageMax: e.target.value ? Number(e.target.value) : undefined })}
                className="mt-0.5 w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500">Gender</label>
              <select
                value={filters.gender ?? ''}
                onChange={(e) => updateFilters({ gender: (e.target.value || undefined) as 'male' | 'female' | 'other' | undefined })}
                className="mt-0.5 w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
              >
                <option value="">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-stone-500">Country</label>
              <input
                type="text"
                value={filters.locationCountry ?? ''}
                onChange={(e) => updateFilters({ locationCountry: e.target.value || undefined })}
                className="mt-0.5 w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500">Education</label>
              <input
                type="text"
                value={filters.education ?? ''}
                onChange={(e) => updateFilters({ education: e.target.value || undefined })}
                className="mt-0.5 w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500">Occupation</label>
              <input
                type="text"
                value={filters.occupation ?? ''}
                onChange={(e) => updateFilters({ occupation: e.target.value || undefined })}
                className="mt-0.5 w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500">Religion</label>
              <input
                type="text"
                value={filters.religion ?? ''}
                onChange={(e) => updateFilters({ religion: e.target.value || undefined })}
                className="mt-0.5 w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => runSearch()}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
            >
              Search
            </button>
            {hasToken && (
              <>
                <button
                  type="button"
                  onClick={() => setSaveOpen((o) => !o)}
                  className="rounded border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
                >
                  Save this search
                </button>
                {saveOpen && (
                  <div className="flex flex-wrap items-center gap-2 rounded border border-stone-200 bg-stone-50 p-2">
                    <input
                      type="text"
                      placeholder="Search name"
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      className="rounded border border-stone-300 px-2 py-1.5 text-sm"
                    />
                    <label className="flex items-center gap-1 text-sm text-stone-600">
                      <input
                        type="checkbox"
                        checked={saveNotify}
                        onChange={(e) => setSaveNotify(e.target.checked)}
                      />
                      Notify on new matches
                    </label>
                    <button
                      type="button"
                      onClick={handleSaveSearch}
                      disabled={saving || !saveName.trim()}
                      className="rounded bg-amber-600 px-2 py-1 text-sm text-white hover:bg-amber-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {loading ? (
          <p className="py-8 text-center text-stone-500">Loading…</p>
        ) : !result ? (
          <p className="py-8 text-center text-stone-600">Search failed or no results.</p>
        ) : result.data.length === 0 ? (
          <p className="py-8 text-center text-stone-600">No profiles match your filters.</p>
        ) : (
          <>
            <p className="mb-4 text-sm text-stone-600">
              {result.total} result{result.total !== 1 ? 's' : ''} (page {result.page} of {result.totalPages})
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.data.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
            {result.totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <button
                  type="button"
                  disabled={result.page <= 1}
                  onClick={() => goToPage(result.page - 1)}
                  className="rounded border border-stone-300 bg-white px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="flex items-center px-2 text-sm text-stone-600">
                  {result.page} / {result.totalPages}
                </span>
                <button
                  type="button"
                  disabled={result.page >= result.totalPages}
                  onClick={() => goToPage(result.page + 1)}
                  className="rounded border border-stone-300 bg-white px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-stone-50 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-stone-900">Search profiles</h1>
            <Link href="/" className="text-sm font-medium text-amber-600 hover:text-amber-700">
              ← Home
            </Link>
          </div>
          <p className="py-8 text-center text-stone-500">Loading…</p>
        </div>
      </main>
    }>
      <SearchPageContent />
    </Suspense>
  );
}

function ProfileCard({ profile }: { profile: PublicProfile }) {
  const primaryPhoto = profile.photos.find((p) => p.isPrimary) ?? profile.photos[0];
  const locationStr = profile.location
    ? [profile.location.city, profile.location.state, profile.location.country].filter(Boolean).join(', ')
    : '';
  return (
    <Link
      href={`/profile/${profile.id}`}
      className="block rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden rounded-t-xl bg-stone-100">
        {primaryPhoto ? (
          <img src={primaryPhoto.url} alt={profile.displayName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-400">No photo</div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-stone-900">{profile.displayName}</h3>
        <p className="mt-0.5 text-xs text-stone-500">
          {profile.gender} · {profile.dob}
          {locationStr && ` · ${locationStr}`}
        </p>
        {(profile.education || profile.occupation) && (
          <p className="mt-1 truncate text-xs text-stone-600">
            {profile.education}
            {profile.education && profile.occupation ? ' · ' : ''}
            {profile.occupation}
          </p>
        )}
      </div>
    </Link>
  );
}
