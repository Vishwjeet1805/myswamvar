'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  getProfileById,
  getMyProfile,
  addToShortlist,
  sendInterest,
  getHoroscopeMatch,
  type PublicProfile,
  type HoroscopeMatch,
} from '@/lib/api';

export default function PublicProfilePage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const [profile, setProfile] = useState<PublicProfile | null | undefined>(
    undefined,
  );
  const [isOwn, setIsOwn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shortlistSending, setShortlistSending] = useState(false);
  const [interestSending, setInterestSending] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);
  const [interestSent, setInterestSent] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [horoscopeMatch, setHoroscopeMatch] = useState<HoroscopeMatch | null | undefined>(
    undefined,
  );
  const [loadingHoroscope, setLoadingHoroscope] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!id) {
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('accessToken')
          : null;
      setHasToken(!!token);
      const [p, myProfile] = await Promise.all([
        getProfileById(id, token ?? undefined),
        token ? getMyProfile(token).catch(() => null) : Promise.resolve(null),
      ]);
      setProfile(p);
      setIsOwn(!!(myProfile && myProfile.id === id));
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    const loadHoroscopeMatch = async () => {
      if (!id || !hasToken || isOwn) {
        setHoroscopeMatch(null);
        return;
      }
      setLoadingHoroscope(true);
      try {
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('accessToken')
            : null;
        if (!token) {
          setHoroscopeMatch(null);
          return;
        }
        const match = await getHoroscopeMatch(token, id);
        setHoroscopeMatch(match);
      } catch {
        setHoroscopeMatch(null);
      } finally {
        setLoadingHoroscope(false);
      }
    };
    loadHoroscopeMatch();
  }, [id, hasToken, isOwn]);

  async function handleShortlist() {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token || !profile) return;
    setShortlistSending(true);
    try {
      await addToShortlist(token, profile.id);
      setShortlisted(true);
    } catch {
      // ignore
    } finally {
      setShortlistSending(false);
    }
  }

  async function handleSendInterest() {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token || !profile) return;
    setInterestSending(true);
    try {
      await sendInterest(token, profile.id);
      setInterestSent(true);
    } catch {
      // ignore
    } finally {
      setInterestSending(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-stone-50">
        <p className="text-stone-500">Loading profile…</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-stone-50">
        <p className="text-stone-600">Profile not found.</p>
        <Link
          href="/"
          className="mt-4 text-sm font-medium text-amber-600 hover:text-amber-700"
        >
          ← Home
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-stone-50">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-stone-900">Profile</h1>
          <div className="flex gap-2">
            {hasToken && !isOwn && (
              <>
                <button
                  type="button"
                  onClick={handleShortlist}
                  disabled={shortlistSending || shortlisted}
                  className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
                >
                  {shortlisted ? 'Shortlisted' : shortlistSending ? 'Adding…' : 'Add to shortlist'}
                </button>
                <button
                  type="button"
                  onClick={handleSendInterest}
                  disabled={interestSending || interestSent}
                  className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  {interestSent ? 'Interest sent' : interestSending ? 'Sending…' : 'Send interest'}
                </button>
              </>
            )}
            <Link
              href="/"
              className="text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              ← Home
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-stone-900">
            {profile.displayName}
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            {profile.gender} · DOB: {profile.dob}
            {profile.location &&
              (profile.location.city ||
                profile.location.state ||
                profile.location.country) &&
              ` · ${[profile.location.city, profile.location.state, profile.location.country].filter(Boolean).join(', ')}`}
          </p>
          {(profile.education || profile.occupation) && (
            <p className="mt-3 text-sm text-stone-600">
              {profile.education}
              {profile.education && profile.occupation ? ' · ' : ''}
              {profile.occupation}
            </p>
          )}
          {profile.bio && (
            <p className="mt-2 text-stone-700">{profile.bio}</p>
          )}
          <p className="mt-2 text-xs text-stone-500">
            {profile.profileVerified && 'Verified profile · '}
            {profile.emailVerified && 'Email verified'}
          </p>

          {profile.contact && (
            <div className="mt-4 rounded-lg bg-stone-50 p-3 text-sm">
              <p className="font-medium text-stone-700">Contact</p>
              {profile.contact.email && (
                <p className="text-stone-600">{profile.contact.email}</p>
              )}
              {profile.contact.phone && (
                <p className="text-stone-600">{profile.contact.phone}</p>
              )}
            </div>
          )}

          {horoscopeMatch !== undefined && (
            <div className="mt-6 border-t border-stone-200 pt-6">
              <h3 className="text-sm font-medium text-stone-700 mb-3">Horoscope Match</h3>
              {loadingHoroscope ? (
                <p className="text-sm text-stone-500">Loading match...</p>
              ) : horoscopeMatch ? (
                <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold text-amber-900">
                      {horoscopeMatch.matchPercent}% Match
                    </span>
                  </div>
                  <p className="text-sm text-amber-800 mb-3">
                    {horoscopeMatch.doshaResult.summary}
                  </p>
                  <div className="text-xs text-amber-700 space-y-1">
                    {horoscopeMatch.doshaResult.mangalDosha && (
                      <p>• Mangal Dosha present</p>
                    )}
                    {horoscopeMatch.doshaResult.nadiDosha && (
                      <p>• Nadi Dosha present</p>
                    )}
                    {horoscopeMatch.doshaResult.bhakootDosha && (
                      <p>• Bhakoot Dosha present</p>
                    )}
                    {!horoscopeMatch.doshaResult.mangalDosha &&
                      !horoscopeMatch.doshaResult.nadiDosha &&
                      !horoscopeMatch.doshaResult.bhakootDosha && (
                        <p>• No doshas found</p>
                      )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-stone-500">
                  Horoscope match not available. Both profiles need complete birth details.
                </p>
              )}
            </div>
          )}

          {profile.photos.length > 0 && (
            <div className="mt-6 border-t border-stone-200 pt-6">
              <h3 className="text-sm font-medium text-stone-700">Photos</h3>
              <div className="mt-2 flex flex-wrap gap-3">
                {profile.photos.map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.url}
                    alt="Profile"
                    className="h-32 w-32 rounded-lg object-cover border border-stone-200"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
