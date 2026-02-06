'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { logout } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
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

  async function handleLogout() {
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    try {
      if (accessToken) await logout(accessToken, refreshToken ?? undefined);
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    setUser(null);
    router.refresh();
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-stone-50">
      <h1 className="text-3xl font-bold text-stone-900">Matrimony</h1>
      <p className="mt-2 text-stone-600">Web-based matrimonial platform</p>
      {loading ? (
        <p className="mt-6 text-sm text-stone-500">Loading…</p>
      ) : user ? (
        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="text-sm text-stone-600">
            Logged in as <span className="font-medium text-stone-900">{user.email}</span>
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Log out
          </button>
        </div>
      ) : (
        <nav className="mt-8 flex gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Sign up
          </Link>
        </nav>
      )}
    </main>
  );
}
