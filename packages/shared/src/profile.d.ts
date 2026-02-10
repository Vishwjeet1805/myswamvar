import { z } from 'zod';
export declare const ContactVisibility: {
    readonly ALL: "all";
    readonly PREMIUM: "premium";
    readonly NONE: "none";
};
export type ContactVisibility = (typeof ContactVisibility)[keyof typeof ContactVisibility];
export declare const contactVisibilitySchema: z.ZodEnum<["all", "premium", "none"]>;
export declare const profilePreferencesSchema: z.ZodObject<{
    minAge: z.ZodOptional<z.ZodNumber>;
    maxAge: z.ZodOptional<z.ZodNumber>;
    maritalStatus: z.ZodOptional<z.ZodString>;
    religion: z.ZodOptional<z.ZodString>;
    caste: z.ZodOptional<z.ZodString>;
    motherTongue: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    minAge?: number | undefined;
    maxAge?: number | undefined;
    maritalStatus?: string | undefined;
    religion?: string | undefined;
    caste?: string | undefined;
    motherTongue?: string | undefined;
    country?: string | undefined;
    state?: string | undefined;
}, {
    minAge?: number | undefined;
    maxAge?: number | undefined;
    maritalStatus?: string | undefined;
    religion?: string | undefined;
    caste?: string | undefined;
    motherTongue?: string | undefined;
    country?: string | undefined;
    state?: string | undefined;
}>;
export type ProfilePreferences = z.infer<typeof profilePreferencesSchema>;
export declare const createProfileBodySchema: z.ZodObject<{
    displayName: z.ZodString;
    dob: z.ZodString;
    gender: z.ZodEnum<["male", "female", "other"]>;
    location: z.ZodOptional<z.ZodObject<{
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        country?: string | undefined;
        state?: string | undefined;
        city?: string | undefined;
    }, {
        country?: string | undefined;
        state?: string | undefined;
        city?: string | undefined;
    }>>;
    religion: z.ZodOptional<z.ZodString>;
    education: z.ZodOptional<z.ZodString>;
    occupation: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    preferences: z.ZodOptional<z.ZodObject<{
        minAge: z.ZodOptional<z.ZodNumber>;
        maxAge: z.ZodOptional<z.ZodNumber>;
        maritalStatus: z.ZodOptional<z.ZodString>;
        religion: z.ZodOptional<z.ZodString>;
        caste: z.ZodOptional<z.ZodString>;
        motherTongue: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        minAge?: number | undefined;
        maxAge?: number | undefined;
        maritalStatus?: string | undefined;
        religion?: string | undefined;
        caste?: string | undefined;
        motherTongue?: string | undefined;
        country?: string | undefined;
        state?: string | undefined;
    }, {
        minAge?: number | undefined;
        maxAge?: number | undefined;
        maritalStatus?: string | undefined;
        religion?: string | undefined;
        caste?: string | undefined;
        motherTongue?: string | undefined;
        country?: string | undefined;
        state?: string | undefined;
    }>>;
    privacyContactVisibleTo: z.ZodOptional<z.ZodEnum<["all", "premium", "none"]>>;
    timeOfBirth: z.ZodOptional<z.ZodString>;
    placeOfBirth: z.ZodOptional<z.ZodString>;
    birthLatLong: z.ZodOptional<z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        lat: number;
        lng: number;
    }, {
        lat: number;
        lng: number;
    }>>;
}, "strict", z.ZodTypeAny, {
    displayName: string;
    dob: string;
    gender: "male" | "female" | "other";
    religion?: string | undefined;
    location?: {
        country?: string | undefined;
        state?: string | undefined;
        city?: string | undefined;
    } | undefined;
    education?: string | undefined;
    occupation?: string | undefined;
    bio?: string | undefined;
    preferences?: {
        minAge?: number | undefined;
        maxAge?: number | undefined;
        maritalStatus?: string | undefined;
        religion?: string | undefined;
        caste?: string | undefined;
        motherTongue?: string | undefined;
        country?: string | undefined;
        state?: string | undefined;
    } | undefined;
    privacyContactVisibleTo?: "all" | "premium" | "none" | undefined;
    timeOfBirth?: string | undefined;
    placeOfBirth?: string | undefined;
    birthLatLong?: {
        lat: number;
        lng: number;
    } | undefined;
}, {
    displayName: string;
    dob: string;
    gender: "male" | "female" | "other";
    religion?: string | undefined;
    location?: {
        country?: string | undefined;
        state?: string | undefined;
        city?: string | undefined;
    } | undefined;
    education?: string | undefined;
    occupation?: string | undefined;
    bio?: string | undefined;
    preferences?: {
        minAge?: number | undefined;
        maxAge?: number | undefined;
        maritalStatus?: string | undefined;
        religion?: string | undefined;
        caste?: string | undefined;
        motherTongue?: string | undefined;
        country?: string | undefined;
        state?: string | undefined;
    } | undefined;
    privacyContactVisibleTo?: "all" | "premium" | "none" | undefined;
    timeOfBirth?: string | undefined;
    placeOfBirth?: string | undefined;
    birthLatLong?: {
        lat: number;
        lng: number;
    } | undefined;
}>;
export declare const updateProfileBodySchema: z.ZodObject<{
    displayName: z.ZodOptional<z.ZodString>;
    dob: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<["male", "female", "other"]>>;
    location: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        country?: string | undefined;
        state?: string | undefined;
        city?: string | undefined;
    }, {
        country?: string | undefined;
        state?: string | undefined;
        city?: string | undefined;
    }>>>;
    religion: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    education: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    occupation: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    bio: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    preferences: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        minAge: z.ZodOptional<z.ZodNumber>;
        maxAge: z.ZodOptional<z.ZodNumber>;
        maritalStatus: z.ZodOptional<z.ZodString>;
        religion: z.ZodOptional<z.ZodString>;
        caste: z.ZodOptional<z.ZodString>;
        motherTongue: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        minAge?: number | undefined;
        maxAge?: number | undefined;
        maritalStatus?: string | undefined;
        religion?: string | undefined;
        caste?: string | undefined;
        motherTongue?: string | undefined;
        country?: string | undefined;
        state?: string | undefined;
    }, {
        minAge?: number | undefined;
        maxAge?: number | undefined;
        maritalStatus?: string | undefined;
        religion?: string | undefined;
        caste?: string | undefined;
        motherTongue?: string | undefined;
        country?: string | undefined;
        state?: string | undefined;
    }>>>;
    privacyContactVisibleTo: z.ZodOptional<z.ZodOptional<z.ZodEnum<["all", "premium", "none"]>>>;
    timeOfBirth: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    placeOfBirth: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    birthLatLong: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        lat: number;
        lng: number;
    }, {
        lat: number;
        lng: number;
    }>>>;
}, "strict", z.ZodTypeAny, {
    religion?: string | undefined;
    displayName?: string | undefined;
    dob?: string | undefined;
    gender?: "male" | "female" | "other" | undefined;
    location?: {
        country?: string | undefined;
        state?: string | undefined;
        city?: string | undefined;
    } | undefined;
    education?: string | undefined;
    occupation?: string | undefined;
    bio?: string | undefined;
    preferences?: {
        minAge?: number | undefined;
        maxAge?: number | undefined;
        maritalStatus?: string | undefined;
        religion?: string | undefined;
        caste?: string | undefined;
        motherTongue?: string | undefined;
        country?: string | undefined;
        state?: string | undefined;
    } | undefined;
    privacyContactVisibleTo?: "all" | "premium" | "none" | undefined;
    timeOfBirth?: string | undefined;
    placeOfBirth?: string | undefined;
    birthLatLong?: {
        lat: number;
        lng: number;
    } | undefined;
}, {
    religion?: string | undefined;
    displayName?: string | undefined;
    dob?: string | undefined;
    gender?: "male" | "female" | "other" | undefined;
    location?: {
        country?: string | undefined;
        state?: string | undefined;
        city?: string | undefined;
    } | undefined;
    education?: string | undefined;
    occupation?: string | undefined;
    bio?: string | undefined;
    preferences?: {
        minAge?: number | undefined;
        maxAge?: number | undefined;
        maritalStatus?: string | undefined;
        religion?: string | undefined;
        caste?: string | undefined;
        motherTongue?: string | undefined;
        country?: string | undefined;
        state?: string | undefined;
    } | undefined;
    privacyContactVisibleTo?: "all" | "premium" | "none" | undefined;
    timeOfBirth?: string | undefined;
    placeOfBirth?: string | undefined;
    birthLatLong?: {
        lat: number;
        lng: number;
    } | undefined;
}>;
export type CreateProfileBody = z.infer<typeof createProfileBodySchema>;
export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>;
export interface ProfilePhotoResponse {
    id: string;
    url: string;
    isPrimary: boolean;
    order: number;
    createdAt: string;
}
export interface ProfileResponse {
    id: string;
    userId: string;
    displayName: string;
    dob: string;
    gender: string;
    religion: string | null;
    location: {
        city?: string;
        state?: string;
        country?: string;
    } | null;
    education: string | null;
    occupation: string | null;
    bio: string | null;
    preferences: ProfilePreferences | null;
    privacyContactVisibleTo: ContactVisibility;
    profileVerified: boolean;
    timeOfBirth: string | null;
    placeOfBirth: string | null;
    birthLatLong: {
        lat: number;
        lng: number;
    } | null;
    photos: ProfilePhotoResponse[];
    createdAt: string;
    updatedAt: string;
}
export interface PublicProfileResponse {
    id: string;
    displayName: string;
    dob: string;
    gender: string;
    religion: string | null;
    location: {
        city?: string;
        state?: string;
        country?: string;
    } | null;
    education: string | null;
    occupation: string | null;
    bio: string | null;
    preferences: ProfilePreferences | null;
    profileVerified: boolean;
    emailVerified: boolean;
    photos: ProfilePhotoResponse[];
    contact?: {
        email?: string;
        phone?: string;
    };
    createdAt: string;
    updatedAt: string;
}
export declare const PROFILE_PHOTO_MIME_TYPES: readonly ["image/jpeg", "image/png", "image/webp"];
export declare const PROFILE_PHOTO_MAX_SIZE_BYTES: number;
export declare const PROFILE_PHOTO_MAX_COUNT = 10;
export interface HoroscopeMatchResponse {
    matchPercent: number;
    doshaResult: {
        mangalDosha: boolean;
        nadiDosha: boolean;
        bhakootDosha: boolean;
        summary: string;
    };
}
