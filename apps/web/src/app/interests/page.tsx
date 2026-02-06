'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  getInterestsSent,
  getInterestsReceived,
  acceptInterest,
  declineInterest,
  type InterestItem,
} from '@/lib/api';

type Tab = 'sent' | 'received';

export default function InterestsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('received');
  const [sent, setSent] = useState<InterestItem[]>([]);
  const [received, setReceived] = useState<InterestItem[]>([]);
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
      const [sentList, receivedList] = await Promise.all([
        getInterestsSent(token),
        getInterestsReceived(token),
      ]);
      setSent(sentList);
      setReceived(receivedList);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load interests');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAccept(interestId: string) {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;
    try {
      await acceptInterest(token, interestId);
      setReceived((prev) => prev.filter((i) => i.id !== interestId));
    } catch {
      load();
    }
  }

  async function handleDecline(interestId: string) {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;
    try {
      await declineInterest(token, interestId);
      setReceived((prev) => prev.filter((i) => i.id !== interestId));
    } catch {
      load();
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-stone-900">Interests</h1>
          <div className="flex gap-2">
            <Link
              href="/search"
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Search
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              ← Home
            </Link>
          </div>
        </div>

        <div className="mb-4 flex gap-2 border-b border-stone-200">
          <button
            type="button"
            onClick={() => setTab('received')}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              tab === 'received'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            Received ({received.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('sent')}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              tab === 'sent'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            Sent ({sent.length})
          </button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-stone-500">Loading…</p>
        ) : error ? (
          <p className="py-8 text-center text-red-600">{error}</p>
        ) : tab === 'received' ? (
          received.length === 0 ? (
            <div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-600">
              No interests received yet.
            </div>
          ) : (
            <div className="space-y-4">
              {received.map((item) => (
                <InterestReceivedCard
                  key={item.id}
                  item={item}
                  onAccept={() => handleAccept(item.id)}
                  onDecline={() => handleDecline(item.id)}
                />
              ))}
            </div>
          )
        ) : sent.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-600">
            You have not sent any interests yet.
          </div>
        ) : (
          <div className="space-y-4">
            {sent.map((item) => (
              <InterestSentCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function InterestReceivedCard({
  item,
  onAccept,
  onDecline,
}: {
  item: InterestItem;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const profile = item.fromProfile;
  if (!profile) return null;
  const primaryPhoto = profile.photos.find((p) => p.isPrimary) ?? profile.photos[0];
  return (
    <div className="flex gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <Link href={`/profile/${profile.id}`} className="shrink-0">
        {primaryPhoto ? (
          <img
            src={primaryPhoto.url}
            alt={profile.displayName}
            className="h-20 w-20 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-stone-100 text-stone-400 text-xs">
            No photo
          </div>
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={`/profile/${profile.id}`}
          className="font-medium text-stone-900 hover:underline"
        >
          {profile.displayName}
        </Link>
        <p className="mt-0.5 text-xs text-stone-500">
          {profile.gender} · {profile.dob} · Status: {item.status}
        </p>
        {(profile.education || profile.occupation) && (
          <p className="mt-1 truncate text-xs text-stone-600">
            {profile.education}
            {profile.education && profile.occupation ? ' · ' : ''}
            {profile.occupation}
          </p>
        )}
        {item.status === 'pending' && (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={onAccept}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={onDecline}
              className="rounded border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
            >
              Decline
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function InterestSentCard({ item }: { item: InterestItem }) {
  const profile = item.toProfile;
  if (!profile) return null;
  const primaryPhoto = profile.photos.find((p) => p.isPrimary) ?? profile.photos[0];
  return (
    <div className="flex gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <Link href={`/profile/${profile.id}`} className="shrink-0">
        {primaryPhoto ? (
          <img
            src={primaryPhoto.url}
            alt={profile.displayName}
            className="h-20 w-20 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-stone-100 text-stone-400 text-xs">
            No photo
          </div>
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={`/profile/${profile.id}`}
          className="font-medium text-stone-900 hover:underline"
        >
          {profile.displayName}
        </Link>
        <p className="mt-0.5 text-xs text-stone-500">
          {profile.gender} · {profile.dob} · Status: {item.status}
        </p>
        {(profile.education || profile.occupation) && (
          <p className="mt-1 truncate text-xs text-stone-600">
            {profile.education}
            {profile.education && profile.occupation ? ' · ' : ''}
            {profile.occupation}
          </p>
        )}
        <Link
          href={`/profile/${profile.id}`}
          className="mt-2 inline-block text-sm font-medium text-amber-600 hover:text-amber-700"
        >
          View profile
        </Link>
      </div>
    </div>
  );
}
