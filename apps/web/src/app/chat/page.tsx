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
    <main className="min-h-screen bg-stone-50 p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-stone-900">Messages</h1>
          <div className="flex gap-2">
            <Link
              href="/interests"
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Interests
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
        ) : conversations.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-white p-8 text-center">
            <p className="text-stone-600">
              No conversations yet. Chat is available only after mutual interest.
            </p>
            <Link
              href="/interests"
              className="mt-3 inline-block text-sm font-medium text-amber-600 hover:text-amber-700"
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
                className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition hover:bg-stone-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-stone-900">
                    {c.otherUserDisplayName ?? 'Unknown'}
                  </p>
                  {c.lastMessage && (
                    <p className="mt-0.5 truncate text-sm text-stone-500">
                      {c.lastMessage.content}
                    </p>
                  )}
                </div>
                <span className="text-stone-400">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
