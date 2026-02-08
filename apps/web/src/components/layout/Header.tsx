'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { logout } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ email: string; role?: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
    setMounted(true);
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

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={cn(
        'text-sm font-medium transition-colors hover:text-primary',
        pathname === href ? 'text-foreground' : 'text-muted-foreground'
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          Matrimony
        </Link>
        <nav className="flex items-center gap-6">
          {mounted && user ? (
            <>
              {navLink('/search', 'Search')}
              {navLink('/shortlist', 'Shortlist')}
              {navLink('/chat', 'Messages')}
              {navLink('/interests', 'Interests')}
              {navLink('/saved-searches', 'Saved searches')}
              {navLink('/profile', 'My profile')}
              {navLink('/subscription', 'Premium')}
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Admin
                </Link>
              )}
              <div className="ml-2 flex items-center gap-2 border-l pl-4">
                <span className="text-xs text-muted-foreground max-w-[120px] truncate sm:max-w-[180px]" title={user.email}>
                  {user.email}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Log out
                </Button>
              </div>
            </>
          ) : (
            <>
              {navLink('/search', 'Search')}
              <Button asChild size="sm" variant="ghost">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
