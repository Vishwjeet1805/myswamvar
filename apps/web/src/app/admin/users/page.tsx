'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  adminGetUsers,
  adminApproveUser,
  adminRejectUser,
  type AdminUser,
} from '@/lib/api';

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | undefined;
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | ''>(
    statusParam || '',
  );
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
      const filter =
        statusFilter === 'pending' || statusFilter === 'approved' || statusFilter === 'rejected'
          ? statusFilter
          : undefined;
      const data = await adminGetUsers(token, filter);
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = useCallback(
    async (userId: string) => {
      if (!token) return;
      setActionLoading(userId);
      setError(null);
      try {
        await adminApproveUser(token, userId);
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Approve failed');
      } finally {
        setActionLoading(null);
      }
    },
    [token, load],
  );

  const handleReject = useCallback(
    async (userId: string) => {
      if (!token) return;
      setActionLoading(userId);
      setError(null);
      try {
        await adminRejectUser(token, userId);
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Reject failed');
      } finally {
        setActionLoading(null);
      }
    },
    [token, load],
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">Users</h1>
      <p className="mt-1 text-stone-500">Approve or reject registrations</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-stone-600">Filter:</span>
        {(['', 'pending', 'approved', 'rejected'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
              statusFilter === s
                ? 'border-amber-500 bg-amber-50 text-amber-800'
                : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            {s || 'All'}
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
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-stone-500">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-stone-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-stone-500">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-stone-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-stone-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3 text-sm text-stone-900">{u.email}</td>
                    <td className="px-4 py-3 text-sm text-stone-600">
                      {u.displayName ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : u.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.status === 'pending' && (
                        <span className="inline-flex gap-2">
                          <button
                            onClick={() => handleApprove(u.id)}
                            disabled={actionLoading === u.id}
                            className="rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(u.id)}
                            disabled={actionLoading === u.id}
                            className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </span>
                      )}
                      {u.profileId && (
                        <Link
                          href={`/profile/${u.profileId}`}
                          className="ml-2 text-sm text-amber-600 hover:underline"
                        >
                          Profile
                        </Link>
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
