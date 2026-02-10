import { z } from 'zod';
import type { PublicProfileResponse } from './profile';
import type { PaginatedResponse } from './types';
export declare const searchProfilesQuerySchema: z.ZodObject<{
    ageMin: z.ZodOptional<z.ZodNumber>;
    ageMax: z.ZodOptional<z.ZodNumber>;
    gender: z.ZodOptional<z.ZodEnum<["male", "female", "other"]>>;
    locationCountry: z.ZodOptional<z.ZodString>;
    locationState: z.ZodOptional<z.ZodString>;
    locationCity: z.ZodOptional<z.ZodString>;
    education: z.ZodOptional<z.ZodString>;
    occupation: z.ZodOptional<z.ZodString>;
    religion: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    page: number;
    limit: number;
    religion?: string | undefined;
    gender?: "male" | "female" | "other" | undefined;
    education?: string | undefined;
    occupation?: string | undefined;
    ageMin?: number | undefined;
    ageMax?: number | undefined;
    locationCountry?: string | undefined;
    locationState?: string | undefined;
    locationCity?: string | undefined;
}, {
    religion?: string | undefined;
    gender?: "male" | "female" | "other" | undefined;
    education?: string | undefined;
    occupation?: string | undefined;
    ageMin?: number | undefined;
    ageMax?: number | undefined;
    locationCountry?: string | undefined;
    locationState?: string | undefined;
    locationCity?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export type SearchProfilesQuery = z.infer<typeof searchProfilesQuerySchema>;
export type SearchProfilesResponse = PaginatedResponse<PublicProfileResponse>;
export declare const addShortlistBodySchema: z.ZodObject<{
    profileId: z.ZodString;
}, "strict", z.ZodTypeAny, {
    profileId: string;
}, {
    profileId: string;
}>;
export type AddShortlistBody = z.infer<typeof addShortlistBodySchema>;
export interface ShortlistItemResponse {
    id: string;
    profileId: string;
    profile: PublicProfileResponse;
    createdAt: string;
}
export declare const sendInterestBodySchema: z.ZodObject<{
    profileId: z.ZodString;
}, "strict", z.ZodTypeAny, {
    profileId: string;
}, {
    profileId: string;
}>;
export type SendInterestBody = z.infer<typeof sendInterestBodySchema>;
export declare const InterestStatus: {
    readonly PENDING: "pending";
    readonly ACCEPTED: "accepted";
    readonly DECLINED: "declined";
};
export type InterestStatusType = (typeof InterestStatus)[keyof typeof InterestStatus];
export interface InterestResponse {
    id: string;
    fromUserId: string;
    toUserId: string;
    toProfile?: PublicProfileResponse;
    fromProfile?: PublicProfileResponse;
    status: InterestStatusType;
    createdAt: string;
}
export declare const savedSearchFiltersSchema: z.ZodObject<{
    ageMin: z.ZodOptional<z.ZodNumber>;
    ageMax: z.ZodOptional<z.ZodNumber>;
    gender: z.ZodOptional<z.ZodEnum<["male", "female", "other"]>>;
    locationCountry: z.ZodOptional<z.ZodString>;
    locationState: z.ZodOptional<z.ZodString>;
    locationCity: z.ZodOptional<z.ZodString>;
    education: z.ZodOptional<z.ZodString>;
    occupation: z.ZodOptional<z.ZodString>;
    religion: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    religion?: string | undefined;
    gender?: "male" | "female" | "other" | undefined;
    education?: string | undefined;
    occupation?: string | undefined;
    ageMin?: number | undefined;
    ageMax?: number | undefined;
    locationCountry?: string | undefined;
    locationState?: string | undefined;
    locationCity?: string | undefined;
}, {
    religion?: string | undefined;
    gender?: "male" | "female" | "other" | undefined;
    education?: string | undefined;
    occupation?: string | undefined;
    ageMin?: number | undefined;
    ageMax?: number | undefined;
    locationCountry?: string | undefined;
    locationState?: string | undefined;
    locationCity?: string | undefined;
}>;
export declare const createSavedSearchBodySchema: z.ZodObject<{
    name: z.ZodString;
    filters: z.ZodObject<{
        ageMin: z.ZodOptional<z.ZodNumber>;
        ageMax: z.ZodOptional<z.ZodNumber>;
        gender: z.ZodOptional<z.ZodEnum<["male", "female", "other"]>>;
        locationCountry: z.ZodOptional<z.ZodString>;
        locationState: z.ZodOptional<z.ZodString>;
        locationCity: z.ZodOptional<z.ZodString>;
        education: z.ZodOptional<z.ZodString>;
        occupation: z.ZodOptional<z.ZodString>;
        religion: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        religion?: string | undefined;
        gender?: "male" | "female" | "other" | undefined;
        education?: string | undefined;
        occupation?: string | undefined;
        ageMin?: number | undefined;
        ageMax?: number | undefined;
        locationCountry?: string | undefined;
        locationState?: string | undefined;
        locationCity?: string | undefined;
    }, {
        religion?: string | undefined;
        gender?: "male" | "female" | "other" | undefined;
        education?: string | undefined;
        occupation?: string | undefined;
        ageMin?: number | undefined;
        ageMax?: number | undefined;
        locationCountry?: string | undefined;
        locationState?: string | undefined;
        locationCity?: string | undefined;
    }>;
    notify: z.ZodDefault<z.ZodBoolean>;
}, "strict", z.ZodTypeAny, {
    name: string;
    filters: {
        religion?: string | undefined;
        gender?: "male" | "female" | "other" | undefined;
        education?: string | undefined;
        occupation?: string | undefined;
        ageMin?: number | undefined;
        ageMax?: number | undefined;
        locationCountry?: string | undefined;
        locationState?: string | undefined;
        locationCity?: string | undefined;
    };
    notify: boolean;
}, {
    name: string;
    filters: {
        religion?: string | undefined;
        gender?: "male" | "female" | "other" | undefined;
        education?: string | undefined;
        occupation?: string | undefined;
        ageMin?: number | undefined;
        ageMax?: number | undefined;
        locationCountry?: string | undefined;
        locationState?: string | undefined;
        locationCity?: string | undefined;
    };
    notify?: boolean | undefined;
}>;
export declare const updateSavedSearchBodySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    filters: z.ZodOptional<z.ZodObject<{
        ageMin: z.ZodOptional<z.ZodNumber>;
        ageMax: z.ZodOptional<z.ZodNumber>;
        gender: z.ZodOptional<z.ZodEnum<["male", "female", "other"]>>;
        locationCountry: z.ZodOptional<z.ZodString>;
        locationState: z.ZodOptional<z.ZodString>;
        locationCity: z.ZodOptional<z.ZodString>;
        education: z.ZodOptional<z.ZodString>;
        occupation: z.ZodOptional<z.ZodString>;
        religion: z.ZodOptional<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        religion?: string | undefined;
        gender?: "male" | "female" | "other" | undefined;
        education?: string | undefined;
        occupation?: string | undefined;
        ageMin?: number | undefined;
        ageMax?: number | undefined;
        locationCountry?: string | undefined;
        locationState?: string | undefined;
        locationCity?: string | undefined;
    }, {
        religion?: string | undefined;
        gender?: "male" | "female" | "other" | undefined;
        education?: string | undefined;
        occupation?: string | undefined;
        ageMin?: number | undefined;
        ageMax?: number | undefined;
        locationCountry?: string | undefined;
        locationState?: string | undefined;
        locationCity?: string | undefined;
    }>>;
    notify: z.ZodOptional<z.ZodBoolean>;
}, "strict", z.ZodTypeAny, {
    name?: string | undefined;
    filters?: {
        religion?: string | undefined;
        gender?: "male" | "female" | "other" | undefined;
        education?: string | undefined;
        occupation?: string | undefined;
        ageMin?: number | undefined;
        ageMax?: number | undefined;
        locationCountry?: string | undefined;
        locationState?: string | undefined;
        locationCity?: string | undefined;
    } | undefined;
    notify?: boolean | undefined;
}, {
    name?: string | undefined;
    filters?: {
        religion?: string | undefined;
        gender?: "male" | "female" | "other" | undefined;
        education?: string | undefined;
        occupation?: string | undefined;
        ageMin?: number | undefined;
        ageMax?: number | undefined;
        locationCountry?: string | undefined;
        locationState?: string | undefined;
        locationCity?: string | undefined;
    } | undefined;
    notify?: boolean | undefined;
}>;
export type SavedSearchFilters = z.infer<typeof savedSearchFiltersSchema>;
export type CreateSavedSearchBody = z.infer<typeof createSavedSearchBodySchema>;
export type UpdateSavedSearchBody = z.infer<typeof updateSavedSearchBodySchema>;
export interface SavedSearchResponse {
    id: string;
    name: string;
    filters: SavedSearchFilters;
    notify: boolean;
    createdAt: string;
}
