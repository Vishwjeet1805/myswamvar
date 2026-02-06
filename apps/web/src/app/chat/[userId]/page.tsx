'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getChatMessages,
  sendChatMessage,
  getMessageLimit,
  getMyProfile,
  type ChatMessage,
  type MessageLimit,
} from '@/lib/api';

export default function ChatConversationPage() {
  const params = useParams();
  const router = useRouter();
  const otherUserId = typeof params.userId === 'string' ? params.userId : '';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [limit, setLimit] = useState<MessageLimit | null>(null);
  const [otherDisplayName, setOtherDisplayName] = useState<string>('');
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const loadMessages = useCallback(async () => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token || !otherUserId) {
      if (!token) router.replace('/login');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [list, limitRes, myProfile] = await Promise.all([
        getChatMessages(token, otherUserId, { limit: 50 }),
        getMessageLimit(token),
        getMyProfile(token),
      ]);
      setMessages(list);
      setLimit(limitRes);
      setMyUserId(myProfile?.userId ?? null);
      setOtherDisplayName('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [otherUserId, router]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Resolve display name from conversation list (we don't have a dedicated endpoint)
  useEffect(() => {
    if (!otherUserId || otherDisplayName) return;
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;
    import('@/lib/api').then(({ getChatConversations }) => {
      getChatConversations(token).then((list) => {
        const conv = list.find((c) => c.otherUserId === otherUserId);
        if (conv?.otherUserDisplayName) setOtherDisplayName(conv.otherUserDisplayName);
      }).catch(() => {});
    });
  }, [otherUserId, otherDisplayName]);

  async function handleSend() {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token || !otherUserId || !input.trim() || sending) return;
    if (limit && !limit.unlimited && limit.remainingToday <= 0) {
      setError('Daily message limit reached. Upgrade to premium for unlimited messages.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      const msg = await sendChatMessage(token, otherUserId, input.trim());
      setMessages((prev) => [...prev, msg]);
      setInput('');
      if (limit && !limit.unlimited) {
        setLimit((prev) =>
          prev
            ? { ...prev, sentToday: prev.sentToday + 1, remainingToday: prev.remainingToday - 1 }
            : null,
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  }

  if (!otherUserId) {
    return (
      <main className="min-h-screen bg-stone-50 p-6">
        <p className="text-center text-stone-500">Invalid conversation.</p>
        <Link href="/chat" className="mt-4 block text-center text-amber-600 hover:text-amber-700">
          ← Back to Messages
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-stone-50">
      <header className="border-b border-stone-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/chat" className="text-sm font-medium text-amber-600 hover:text-amber-700">
            ← Messages
          </Link>
          <h1 className="text-lg font-semibold text-stone-900 truncate flex-1 text-center mx-2">
            {otherDisplayName || 'Chat'}
          </h1>
          <div className="w-14" />
        </div>
        {limit && !limit.unlimited && (
          <p className="text-center text-xs text-stone-500 mt-1">
            {limit.remainingToday} messages left today
          </p>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-2xl">
          {loading ? (
            <p className="py-8 text-center text-stone-500">Loading…</p>
          ) : error && messages.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-red-600">{error}</p>
              <p className="mt-2 text-sm text-stone-500">
                Chat is available only when both users have mutual interest.
              </p>
              <Link href="/chat" className="mt-3 inline-block text-amber-600 hover:text-amber-700">
                ← Back to Messages
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {messages.map((m) => {
                  const isFromMe = myUserId != null && m.senderId === myUserId;
                  return (
                  <div
                    key={m.id}
                    className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                        isFromMe ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isFromMe ? 'text-amber-100' : 'text-stone-500'
                        }`}
                      >
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  );
                })}
              </div>
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {messages.length > 0 && (
        <div className="border-t border-stone-200 bg-white p-4">
          <div className="mx-auto flex max-w-2xl gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type a message…"
              className="flex-1 rounded-xl border border-stone-300 px-4 py-2 text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              maxLength={2000}
              disabled={sending || (limit != null && !limit.unlimited && limit.remainingToday <= 0)}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={
                sending ||
                !input.trim() ||
                (limit != null && !limit.unlimited && limit.remainingToday <= 0)
              }
              className="rounded-xl bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          {error && messages.length > 0 && (
            <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-red-600">{error}</p>
          )}
        </div>
      )}
    </main>
  );
}
