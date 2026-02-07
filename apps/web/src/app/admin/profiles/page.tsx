'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  adminGetProfiles,
  adminVerifyProfile,
  type AdminProfile,
} from '@/lib/api';

export default function AdminProfilesPage() {
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | ''>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [verifyNotes, setVerifyNotes] = useState('');

  const token = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    setLoading(true);
    try {
      const filter =
        verifiedFilter === true ? true : verifiedFilter === false ? false : undefined;
      const data = await adminGetProfiles(token, filter);
      setProfiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  }, [token, verifiedFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleVerify = useCallback(
    async (profileId: string, verified: boolean, notes?: string) => {
      if (!token) return;
      setActionLoading(profileId);
      setError(null);
      setEditingId(null);
      setVerifyNotes('');
      try {
        await adminVerifyProfile(token, profileId, { verified, notes });
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Update failed');
      } finally {
        setActionLoading(null);
      }
    },
    [token, load],
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">Profiles</h1>
      <p className="mt-1 text-stone-500">Verification and notes</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-stone-600">Filter:</span>
        {(['', true, false] as const).map((v) => (
          <button
            key={String(v)}
            onClick={() => setVerifiedFilter(v)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
              verifiedFilter === v
                ? 'border-amber-500 bg-amber-50 text-amber-800'
                : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            {v === '' ? 'All' : v ? 'Verified' : 'Unverified'}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-stone-500">Loading…</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-stone-200">
            <thead>
              <tr className="bg-stone-50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-stone-500">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-stone-500">
                  Gender
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-stone-500">
                  Verified
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-stone-500">
                  Notes
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-stone-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {profiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-stone-500">
                    No profiles found
                  </td>
                </tr>
              ) : (
                profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3 text-sm text-stone-900">
                      <Link
                        href={`/profile/${p.id}`}
                        className="font-medium text-amber-600 hover:underline"
                      >
                        {p.displayName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-600">{p.gender}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.profileVerified
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {p.profileVerified ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-sm text-stone-500">
                      {p.verificationNotes ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editingId === p.id ? (
                        <div className="flex flex-col items-end gap-2">
                          <textarea
                            placeholder="Optional notes"
                            value={verifyNotes}
                            onChange={(e) => setVerifyNotes(e.target.value)}
                            className="w-full max-w-xs rounded border border-stone-300 px-2 py-1 text-sm"
                            rows={2}
                          />
                          <span className="flex gap-2">
                            <button
                              onClick={() => handleVerify(p.id, true, verifyNotes)}
                              disabled={actionLoading === p.id}
                              className="rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleVerify(p.id, false, verifyNotes)}
                              disabled={actionLoading === p.id}
                              className="rounded bg-stone-500 px-2 py-1 text-xs font-medium text-white hover:bg-stone-600 disabled:opacity-50"
                            >
                              Unverify
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setVerifyNotes('');
                              }}
                              className="rounded border border-stone-300 px-2 py-1 text-xs text-stone-600 hover:bg-stone-50"
                            >
                              Cancel
                            </button>
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingId(p.id)}
                          disabled={actionLoading === p.id}
                          className="rounded border border-amber-500 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                        >
                          {p.profileVerified ? 'Change' : 'Verify'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
