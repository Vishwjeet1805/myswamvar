'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import type { PublicProfile } from '@/lib/api';

export function ProfileCard({ profile }: { profile: PublicProfile }) {
  const primaryPhoto = profile.photos.find((p) => p.isPrimary) ?? profile.photos[0];
  const locationStr = profile.location
    ? [profile.location.city, profile.location.state, profile.location.country]
        .filter(Boolean)
        .join(', ')
    : '';

  return (
    <Link href={`/profile/${profile.id}`} className="block transition-shadow hover:shadow-md">
      <Card className="overflow-hidden">
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          {primaryPhoto ? (
            <img
              src={primaryPhoto.url}
              alt={profile.displayName}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              No photo
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-card-foreground">{profile.displayName}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {profile.gender} · {profile.dob}
            {locationStr && ` · ${locationStr}`}
          </p>
          {(profile.education || profile.occupation) && (
            <p className="mt-1.5 truncate text-xs text-foreground/80">
              {profile.education}
              {profile.education && profile.occupation ? ' · ' : ''}
              {profile.occupation}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
