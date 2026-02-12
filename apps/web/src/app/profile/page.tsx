'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  getMyProfile,
  createProfile,
  updateProfile,
  addProfilePhoto,
  deleteProfilePhoto,
  setPrimaryPhoto,
  type Profile,
  type CreateProfileBody,
} from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<CreateProfileBody>({
    displayName: '',
    dob: '',
    gender: 'other',
    location: {},
    education: '',
    occupation: '',
    bio: '',
    preferences: {},
    privacyContactVisibleTo: 'all',
    timeOfBirth: '',
    placeOfBirth: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const resetAuthAndRedirect = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    setAccessToken(null);
    setProfile(undefined);
    router.replace('/login?redirect=/profile');
  }, [router]);

  const loadProfile = useCallback(async () => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      setAccessToken(null);
      setProfile(undefined);
      setLoading(false);
      return;
    }
    setAccessToken(token);
    try {
      const p = await getMyProfile(token);
      setProfile(p);
      if (p) {
        setForm({
          displayName: p.displayName,
          dob: p.dob,
          gender: p.gender as 'male' | 'female' | 'other',
          location: p.location ?? {},
          education: p.education ?? '',
          occupation: p.occupation ?? '',
          bio: p.bio ?? '',
          preferences: p.preferences ?? {},
          privacyContactVisibleTo: p.privacyContactVisibleTo,
          timeOfBirth: p.timeOfBirth ?? '',
          placeOfBirth: p.placeOfBirth ?? '',
          birthLatLong: p.birthLatLong ?? undefined,
        });
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'Unauthorized') {
        setError('Session expired. Please sign in again.');
        resetAuthAndRedirect();
        return;
      }
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [resetAuthAndRedirect]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (loading === false && accessToken === null) {
      router.replace('/login');
    }
  }, [loading, accessToken, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    setError('');
    setSaving(true);
    try {
      const body: CreateProfileBody = {
        ...form,
        location:
          form.location && (form.location.city || form.location.state || form.location.country)
            ? form.location
            : undefined,
        education: form.education || undefined,
        occupation: form.occupation || undefined,
        bio: form.bio || undefined,
        timeOfBirth: form.timeOfBirth || undefined,
        placeOfBirth: form.placeOfBirth || undefined,
      };
      if (profile) {
        const updated = await updateProfile(accessToken, body);
        setProfile(updated);
        setEditing(false);
      } else {
        const created = await createProfile(accessToken, body);
        setProfile(created);
        setEditing(false);
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'Unauthorized') {
        setError('Session expired. Please sign in again.');
        resetAuthAndRedirect();
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken || !photoFile || !profile) return;
    setError('');
    setSaving(true);
    try {
      const photo = await addProfilePhoto(accessToken, photoFile);
      setProfile((prev) =>
        prev ? { ...prev, photos: [...prev.photos, photo] } : prev,
      );
      setPhotoFile(null);
    } catch (err) {
      if (err instanceof Error && err.message === 'Unauthorized') {
        setError('Session expired. Please sign in again.');
        resetAuthAndRedirect();
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePhoto(photoId: string) {
    if (!accessToken || !profile) return;
    if (!confirm('Delete this photo?')) return;
    setError('');
    try {
      await deleteProfilePhoto(accessToken, photoId);
      setProfile((prev) =>
        prev
          ? { ...prev, photos: prev.photos.filter((p) => p.id !== photoId) }
          : prev,
      );
    } catch (err) {
      if (err instanceof Error && err.message === 'Unauthorized') {
        setError('Session expired. Please sign in again.');
        resetAuthAndRedirect();
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to delete photo');
    }
  }

  async function handleSetPrimary(photoId: string) {
    if (!accessToken || !profile) return;
    setError('');
    try {
      await setPrimaryPhoto(accessToken, photoId);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              photos: prev.photos.map((p) => ({
                ...p,
                isPrimary: p.id === photoId,
              })),
            }
          : prev,
      );
    } catch (err) {
      if (err instanceof Error && err.message === 'Unauthorized') {
        setError('Session expired. Please sign in again.');
        resetAuthAndRedirect();
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to set primary');
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-stone-50">
        <p className="text-stone-500">Loading profile…</p>
      </main>
    );
  }

  if (profile === undefined && !accessToken) {
    return null;
  }

  return (
    <main className="min-h-screen p-8 bg-stone-50">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-stone-900">My Profile</h1>
          <Link
            href="/"
            className="text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            ← Home
          </Link>
        </div>

        {error && (
          <div
            className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800"
            role="alert"
          >
            {error}
          </div>
        )}

        {!profile ? (
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium text-stone-900">
              Create your profile
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Add your basic info so others can find you.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-sm font-medium text-stone-700"
                >
                  Display name
                </label>
                <input
                  id="displayName"
                  type="text"
                  required
                  value={form.displayName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, displayName: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="dob"
                    className="block text-sm font-medium text-stone-700"
                  >
                    Date of birth (YYYY-MM-DD)
                  </label>
                  <input
                    id="dob"
                    type="text"
                    required
                    placeholder="1990-01-15"
                    value={form.dob}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, dob: e.target.value }))
                    }
                    className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-stone-700"
                  >
                    Gender
                  </label>
                  <select
                    id="gender"
                    value={form.gender}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        gender: e.target.value as 'male' | 'female' | 'other',
                      }))
                    }
                    className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-stone-700"
                  >
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={form.location?.city ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        location: { ...f.location, city: e.target.value },
                      }))
                    }
                    className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-stone-700"
                  >
                    State
                  </label>
                  <input
                    id="state"
                    type="text"
                    value={form.location?.state ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        location: { ...f.location, state: e.target.value },
                      }))
                    }
                    className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-stone-700"
                  >
                    Country
                  </label>
                  <input
                    id="country"
                    type="text"
                    value={form.location?.country ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        location: { ...f.location, country: e.target.value },
                      }))
                    }
                    className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="education"
                  className="block text-sm font-medium text-stone-700"
                >
                  Education
                </label>
                <input
                  id="education"
                  type="text"
                  value={form.education}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, education: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label
                  htmlFor="occupation"
                  className="block text-sm font-medium text-stone-700"
                >
                  Occupation
                </label>
                <input
                  id="occupation"
                  type="text"
                  value={form.occupation}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, occupation: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-stone-700"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={form.bio}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bio: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label
                  htmlFor="privacy"
                  className="block text-sm font-medium text-stone-700"
                >
                  Who can see your contact?
                </label>
                <select
                  id="privacy"
                  value={form.privacyContactVisibleTo}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      privacyContactVisibleTo: e.target
                        .value as 'all' | 'premium' | 'none',
                    }))
                  }
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="all">Everyone</option>
                  <option value="premium">Premium members only</option>
                  <option value="none">Nobody</option>
                </select>
              </div>
              <div className="border-t border-stone-200 pt-4">
                <h3 className="text-sm font-medium text-stone-700 mb-3">
                  Birth Details (for horoscope matching)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="timeOfBirth"
                      className="block text-sm font-medium text-stone-700"
                    >
                      Time of birth (HH:MM)
                    </label>
                    <input
                      id="timeOfBirth"
                      type="text"
                      placeholder="14:30"
                      value={form.timeOfBirth}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, timeOfBirth: e.target.value }))
                      }
                      className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="placeOfBirth"
                      className="block text-sm font-medium text-stone-700"
                    >
                      Place of birth
                    </label>
                    <input
                      id="placeOfBirth"
                      type="text"
                      placeholder="City, State, Country"
                      value={form.placeOfBirth}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, placeOfBirth: e.target.value }))
                      }
                      className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-stone-500">
                  Birth details are optional but required for horoscope matching.
                </p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Create profile'}
              </button>
            </form>
          </div>
        ) : editing ? (
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium text-stone-900">Edit profile</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="edit-displayName"
                  className="block text-sm font-medium text-stone-700"
                >
                  Display name
                </label>
                <input
                  id="edit-displayName"
                  type="text"
                  required
                  value={form.displayName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, displayName: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="edit-dob"
                    className="block text-sm font-medium text-stone-700"
                  >
                    Date of birth
                  </label>
                  <input
                    id="edit-dob"
                    type="text"
                    required
                    value={form.dob}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, dob: e.target.value }))
                    }
                    className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-gender"
                    className="block text-sm font-medium text-stone-700"
                  >
                    Gender
                  </label>
                  <select
                    id="edit-gender"
                    value={form.gender}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        gender: e.target.value as 'male' | 'female' | 'other',
                      }))
                    }
                    className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">
                  Location
                </label>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={form.location?.city ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        location: { ...f.location, city: e.target.value },
                      }))
                    }
                    className="rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={form.location?.state ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        location: { ...f.location, state: e.target.value },
                      }))
                    }
                    className="rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={form.location?.country ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        location: { ...f.location, country: e.target.value },
                      }))
                    }
                    className="rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="edit-education"
                  className="block text-sm font-medium text-stone-700"
                >
                  Education
                </label>
                <input
                  id="edit-education"
                  type="text"
                  value={form.education}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, education: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-occupation"
                  className="block text-sm font-medium text-stone-700"
                >
                  Occupation
                </label>
                <input
                  id="edit-occupation"
                  type="text"
                  value={form.occupation}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, occupation: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-bio"
                  className="block text-sm font-medium text-stone-700"
                >
                  Bio
                </label>
                <textarea
                  id="edit-bio"
                  rows={4}
                  value={form.bio}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bio: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-privacy"
                  className="block text-sm font-medium text-stone-700"
                >
                  Who can see your contact?
                </label>
                <select
                  id="edit-privacy"
                  value={form.privacyContactVisibleTo}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      privacyContactVisibleTo: e.target
                        .value as 'all' | 'premium' | 'none',
                    }))
                  }
                  className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="all">Everyone</option>
                  <option value="premium">Premium members only</option>
                  <option value="none">Nobody</option>
                </select>
              </div>
              <div className="border-t border-stone-200 pt-4">
                <h3 className="text-sm font-medium text-stone-700 mb-3">
                  Birth Details (for horoscope matching)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="edit-timeOfBirth"
                      className="block text-sm font-medium text-stone-700"
                    >
                      Time of birth (HH:MM)
                    </label>
                    <input
                      id="edit-timeOfBirth"
                      type="text"
                      placeholder="14:30"
                      value={form.timeOfBirth}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, timeOfBirth: e.target.value }))
                      }
                      className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edit-placeOfBirth"
                      className="block text-sm font-medium text-stone-700"
                    >
                      Place of birth
                    </label>
                    <input
                      id="edit-placeOfBirth"
                      type="text"
                      placeholder="City, State, Country"
                      value={form.placeOfBirth}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, placeOfBirth: e.target.value }))
                      }
                      className="mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-stone-500">
                  Birth details are optional but required for horoscope matching.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
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
              </div>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
              >
                Edit
              </button>
            </div>
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
              Contact visible to: {profile.privacyContactVisibleTo}
              {profile.profileVerified && ' · Verified profile'}
            </p>

            {/* Photos */}
            <div className="mt-6 border-t border-stone-200 pt-6">
              <h3 className="text-sm font-medium text-stone-700">
                Profile photos
              </h3>
              <div className="mt-2 flex flex-wrap gap-3">
                {profile.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative rounded-lg border border-stone-200 overflow-hidden"
                  >
                    <img
                      src={photo.url}
                      alt="Profile"
                      className="h-24 w-24 object-cover"
                    />
                    {photo.isPrimary && (
                      <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-center text-xs text-white py-0.5">
                        Primary
                      </span>
                    )}
                    <div className="mt-1 flex gap-1 p-1">
                      {!photo.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(photo.id)}
                          className="text-xs text-amber-600 hover:text-amber-700"
                        >
                          Set primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handlePhotoUpload} className="mt-3 flex items-end gap-2">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                  className="block w-full max-w-xs text-sm text-stone-600 file:mr-2 file:rounded file:border-0 file:bg-amber-50 file:px-3 file:py-1.5 file:text-amber-700"
                />
                <button
                  type="submit"
                  disabled={!photoFile || saving}
                  className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  Upload
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
