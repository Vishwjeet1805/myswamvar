'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const ADMIN_ROLE = 'admin';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  const user = useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('user');
      return raw ? (JSON.parse(raw) as { role?: string }) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (user === null) {
      setAllowed(false);
      return;
    }
    if (user.role !== ADMIN_ROLE) {
      setAllowed(false);
      return;
    }
    setAllowed(true);
  }, [user]);

  useEffect(() => {
    if (allowed === false) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
        router.replace('/login?redirect=' + encodeURIComponent(pathname || '/admin'));
      } else {
        router.replace('/');
      }
    }
  }, [allowed, router, pathname]);

  if (allowed === null || allowed === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <p className="text-muted-foreground">Checking access…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <nav className="flex items-center gap-6">
            <Link
              href="/admin"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Users
            </Link>
            <Link
              href="/admin/profiles"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Profiles
            </Link>
            <Link
              href="/admin/subscriptions"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Subscriptions
            </Link>
          </nav>
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to app
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
