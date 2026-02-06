'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { getProfileById, type PublicProfile } from '@/lib/api';

export default function PublicProfilePage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const [profile, setProfile] = useState<PublicProfile | null | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);

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
      const p = await getProfileById(id, token ?? undefined);
      setProfile(p);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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
          <Link
            href="/"
            className="text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            ← Home
          </Link>
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
