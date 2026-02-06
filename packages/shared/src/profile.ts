import { z } from 'zod';

/** Who can see contact info */
export const ContactVisibility = {
  ALL: 'all',
  PREMIUM: 'premium',
  NONE: 'none',
} as const;

export type ContactVisibility =
  (typeof ContactVisibility)[keyof typeof ContactVisibility];

export const contactVisibilitySchema = z.enum([
  ContactVisibility.ALL,
  ContactVisibility.PREMIUM,
  ContactVisibility.NONE,
]);

/** Preferences stored as JSON on profile */
export const profilePreferencesSchema = z.object({
  minAge: z.number().int().min(18).max(100).optional(),
  maxAge: z.number().int().min(18).max(100).optional(),
  maritalStatus: z.string().max(50).optional(),
  religion: z.string().max(100).optional(),
  caste: z.string().max(100).optional(),
  motherTongue: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
}).strict();

export type ProfilePreferences = z.infer<typeof profilePreferencesSchema>;

/** Create/update profile body */
export const createProfileBodySchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(100),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'DOB must be YYYY-MM-DD'),
  gender: z.enum(['male', 'female', 'other']),
  location: z.object({
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    country: z.string().max(100).optional(),
  }).optional(),
  religion: z.string().max(100).optional(),
  education: z.string().max(200).optional(),
  occupation: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  preferences: profilePreferencesSchema.optional(),
  privacyContactVisibleTo: contactVisibilitySchema.optional(),
  timeOfBirth: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM format').optional(),
  placeOfBirth: z.string().max(200).optional(),
  birthLatLong: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
}).strict();

export const updateProfileBodySchema = createProfileBodySchema.partial();

export type CreateProfileBody = z.infer<typeof createProfileBodySchema>;
export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>;

/** Profile photo as returned by API */
export interface ProfilePhotoResponse {
  id: string;
  url: string;
  isPrimary: boolean;
  order: number;
  createdAt: string;
}

/** Profile as returned for own view (full) */
export interface ProfileResponse {
  id: string;
  userId: string;
  displayName: string;
  dob: string;
  gender: string;
  religion: string | null;
  location: { city?: string; state?: string; country?: string } | null;
  education: string | null;
  occupation: string | null;
  bio: string | null;
  preferences: ProfilePreferences | null;
  privacyContactVisibleTo: ContactVisibility;
  profileVerified: boolean;
  timeOfBirth: string | null;
  placeOfBirth: string | null;
  birthLatLong: { lat: number; lng: number } | null;
  photos: ProfilePhotoResponse[];
  createdAt: string;
  updatedAt: string;
}

/** Public profile view (visibility rules applied; contact may be hidden) */
export interface PublicProfileResponse {
  id: string;
  displayName: string;
  dob: string;
  gender: string;
  religion: string | null;
  location: { city?: string; state?: string; country?: string } | null;
  education: string | null;
  occupation: string | null;
  bio: string | null;
  preferences: ProfilePreferences | null;
  profileVerified: boolean;
  emailVerified: boolean;
  photos: ProfilePhotoResponse[];
  /** Present only if viewer is allowed to see contact */
  contact?: { email?: string; phone?: string };
  createdAt: string;
  updatedAt: string;
}

/** Allowed image MIME types for profile photos */
export const PROFILE_PHOTO_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

/** Max file size in bytes (5MB) */
export const PROFILE_PHOTO_MAX_SIZE_BYTES = 5 * 1024 * 1024;

/** Max number of profile photos per user */
export const PROFILE_PHOTO_MAX_COUNT = 10;

/** Horoscope match result */
export interface HoroscopeMatchResponse {
  matchPercent: number;
  doshaResult: {
    mangalDosha: boolean;
    nadiDosha: boolean;
    bhakootDosha: boolean;
    summary: string;
  };
}
