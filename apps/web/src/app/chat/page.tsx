'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  getChatConversations,
  type ChatConversationSummary,
} from '@/lib/api';

export default function ChatPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ChatConversationSummary[]>([]);
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
      const list = await getChatConversations(token);
      setConversations(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="py-6">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <h1 className="mb-6 text-2xl font-semibold text-foreground">Messages</h1>

        {loading ? (
          <p className="py-8 text-center text-muted-foreground">Loading…</p>
        ) : error ? (
          <p className="py-8 text-center text-destructive">{error}</p>
        ) : conversations.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              No conversations yet. Chat is available only after mutual interest.
            </p>
            <Link
              href="/interests"
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              View sent and received interests
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((c) => (
              <Link
                key={c.id}
                href={`/chat/${encodeURIComponent(c.otherUserId)}`}
                className="flex items-center gap-4 rounded-xl border border bg-card p-4 transition hover:bg-accent/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {c.otherUserDisplayName ?? 'Unknown'}
                  </p>
                  {c.lastMessage && (
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {c.lastMessage.content}
                    </p>
                  )}
                </div>
                <span className="text-muted-foreground">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
