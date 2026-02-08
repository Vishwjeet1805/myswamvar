'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';
import {
  searchProfiles,
  createSavedSearch,
  type SearchParams as SearchParamsType,
  type SearchResult,
} from '@/lib/api';
import { PageContainer } from '@/components/layout/PageContainer';
import { ProfileCard } from '@/components/ProfileCard';
import { SearchGridSkeleton } from '@/components/SearchGridSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    <div className="py-6">
      <PageContainer>
        <h1 className="mb-6 text-2xl font-semibold text-foreground">Search profiles</h1>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <h2 className="text-sm font-medium text-foreground">Filters</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              <div className="space-y-2">
                <Label className="text-xs">Age min</Label>
                <Input
                  type="number"
                  min={18}
                  max={100}
                  value={filters.ageMin ?? ''}
                  onChange={(e) =>
                    updateFilters({ ageMin: e.target.value ? Number(e.target.value) : undefined })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Age max</Label>
                <Input
                  type="number"
                  min={18}
                  max={100}
                  value={filters.ageMax ?? ''}
                  onChange={(e) =>
                    updateFilters({ ageMax: e.target.value ? Number(e.target.value) : undefined })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Gender</Label>
                <Select
                  value={filters.gender ?? '_any'}
                  onValueChange={(v) =>
                    updateFilters({
                      gender: v === '_any' ? undefined : (v as 'male' | 'female' | 'other'),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_any">Any</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Country</Label>
                <Input
                  value={filters.locationCountry ?? ''}
                  onChange={(e) =>
                    updateFilters({ locationCountry: e.target.value || undefined })
                  }
                  placeholder="Any"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Education</Label>
                <Input
                  value={filters.education ?? ''}
                  onChange={(e) => updateFilters({ education: e.target.value || undefined })}
                  placeholder="Any"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Occupation</Label>
                <Input
                  value={filters.occupation ?? ''}
                  onChange={(e) => updateFilters({ occupation: e.target.value || undefined })}
                  placeholder="Any"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Religion</Label>
                <Input
                  value={filters.religion ?? ''}
                  onChange={(e) => updateFilters({ religion: e.target.value || undefined })}
                  placeholder="Any"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={() => runSearch()}>Search</Button>
              {hasToken && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSaveOpen((o) => !o)}
                  >
                    Save this search
                  </Button>
                  {saveOpen && (
                    <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/50 p-3">
                      <Input
                        placeholder="Search name"
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        className="max-w-[180px]"
                      />
                      <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={saveNotify}
                          onChange={(e) => setSaveNotify(e.target.checked)}
                          className="rounded border-input"
                        />
                        Notify on new matches
                      </label>
                      <Button
                        size="sm"
                        onClick={handleSaveSearch}
                        disabled={saving || !saveName.trim()}
                      >
                        {saving ? 'Saving…' : 'Save'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <SearchGridSkeleton />
        ) : !result ? (
          <Alert variant="destructive">
            <AlertDescription>Search failed or no results. Try adjusting your filters.</AlertDescription>
          </Alert>
        ) : result.data.length === 0 ? (
          <EmptyState
            title="No profiles match your filters"
            description="Try broadening your search criteria."
            actionLabel="Clear and search again"
            actionHref="/search"
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {result.total} result{result.total !== 1 ? 's' : ''} (page {result.page} of{' '}
              {result.totalPages})
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.data.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
            {result.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={result.page <= 1}
                  onClick={() => goToPage(result.page - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  {result.page} / {result.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={result.page >= result.totalPages}
                  onClick={() => goToPage(result.page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </PageContainer>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="py-6">
          <PageContainer>
            <h1 className="mb-6 text-2xl font-semibold text-foreground">Search profiles</h1>
            <SearchGridSkeleton />
          </PageContainer>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
