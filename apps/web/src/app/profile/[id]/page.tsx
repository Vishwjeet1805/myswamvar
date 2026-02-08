'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  getProfileById,
  getMyProfile,
  getProfileContact,
  addToShortlist,
  sendInterest,
  getHoroscopeMatch,
  type PublicProfile,
  type HoroscopeMatch,
} from '@/lib/api';
import { PageContainer } from '@/components/layout/PageContainer';
import { ProfileDetailSkeleton } from '@/components/ProfileDetailSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PublicProfilePage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const [profile, setProfile] = useState<PublicProfile | null | undefined>(undefined);
  const [isOwn, setIsOwn] = useState(false);
  const [loading, setLoading] = useState(true);

  const [shortlistSending, setShortlistSending] = useState(false);
  const [interestSending, setInterestSending] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);
  const [interestSent, setInterestSent] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [horoscopeMatch, setHoroscopeMatch] = useState<
    HoroscopeMatch | null | undefined
  >(undefined);
  const [loadingHoroscope, setLoadingHoroscope] = useState(false);

  const [contact, setContact] = useState<PublicProfile['contact'] | null>(null);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!id) {
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      setHasToken(!!token);
      const [p, myProfile] = await Promise.all([
        getProfileById(id, token ?? undefined),
        token ? getMyProfile(token).catch(() => null) : Promise.resolve(null),
      ]);
      setProfile(p);
      setIsOwn(!!(myProfile && myProfile.id === id));
      setContact(p.contact ?? null);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleContact = useCallback(async () => {
    setContactError(null);
    setContactLoading(true);
    try {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) {
        setContactError('Log in to view contact details.');
        return;
      }
      const info = await getProfileContact(id, token);
      setContact(info);
    } catch (err) {
      setContactError(
        err instanceof Error ? err.message : 'Unable to load contact.'
      );
    } finally {
      setContactLoading(false);
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
          typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
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
      <div className="py-8">
        <PageContainer>
          <ProfileDetailSkeleton />
        </PageContainer>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-8">
        <PageContainer>
          <EmptyState
            title="Profile not found"
            description="The profile you're looking for doesn't exist or was removed."
            actionLabel="Go to search"
            actionHref="/search"
          />
        </PageContainer>
      </div>
    );
  }

  const locationStr =
    profile.location &&
    (profile.location.city || profile.location.state || profile.location.country)
      ? [profile.location.city, profile.location.state, profile.location.country]
          .filter(Boolean)
          .join(', ')
      : '';

  return (
    <div className="py-8">
      <PageContainer className="max-w-2xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
          {hasToken && !isOwn && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShortlist}
                disabled={shortlistSending || shortlisted}
              >
                {shortlisted ? 'Shortlisted' : shortlistSending ? 'Adding…' : 'Add to shortlist'}
              </Button>
              <Button
                size="sm"
                onClick={handleSendInterest}
                disabled={interestSending || interestSent}
              >
                {interestSent ? 'Interest sent' : interestSending ? 'Sending…' : 'Send interest'}
              </Button>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-card-foreground">
              {profile.displayName}
            </h2>
            <p className="text-sm text-muted-foreground">
              {profile.gender} · DOB: {profile.dob}
              {locationStr && ` · ${locationStr}`}
            </p>
            {(profile.education || profile.occupation) && (
              <p className="text-sm text-foreground/90">
                {profile.education}
                {profile.education && profile.occupation ? ' · ' : ''}
                {profile.occupation}
              </p>
            )}
            {profile.bio && (
              <p className="mt-2 text-sm text-card-foreground">{profile.bio}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {profile.profileVerified && 'Verified profile · '}
              {profile.emailVerified && 'Email verified'}
            </p>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            {contact && (
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="font-medium text-foreground">Contact</p>
                {contact.email && (
                  <p className="text-sm text-muted-foreground">{contact.email}</p>
                )}
                {contact.phone && (
                  <p className="text-sm text-muted-foreground">{contact.phone}</p>
                )}
              </div>
            )}
            {!contact && (
              <div className="rounded-lg border bg-card p-4">
                <p className="font-medium text-foreground">Contact</p>
                <p className="text-sm text-muted-foreground">
                  Contact details are locked.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Button
                    size="sm"
                    onClick={handleContact}
                    disabled={contactLoading}
                  >
                    {contactLoading ? 'Checking…' : 'View contact'}
                  </Button>
                  <Button variant="link" size="sm" asChild>
                    <Link href="/subscription">Upgrade to premium</Link>
                  </Button>
                </div>
                {contactError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>{contactError}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {horoscopeMatch !== undefined && (
              <div className="border-t pt-6">
                <h3 className="mb-3 text-sm font-medium text-foreground">
                  Horoscope Match
                </h3>
                {loadingHoroscope ? (
                  <p className="text-sm text-muted-foreground">Loading match…</p>
                ) : horoscopeMatch ? (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-lg font-semibold text-primary">
                        {horoscopeMatch.matchPercent}% Match
                      </span>
                    </div>
                    <p className="mb-3 text-sm text-foreground/90">
                      {horoscopeMatch.doshaResult.summary}
                    </p>
                    <div className="space-y-1 text-xs text-muted-foreground">
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
                  <p className="text-sm text-muted-foreground">
                    Horoscope match not available. Both profiles need complete
                    birth details.
                  </p>
                )}
              </div>
            )}

            {profile.photos.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="mb-2 text-sm font-medium text-foreground">Photos</h3>
                <div className="flex flex-wrap gap-3">
                  {profile.photos.map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.url}
                      alt="Profile"
                      className="h-32 w-32 rounded-lg border object-cover"
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </PageContainer>
    </div>
  );
}
