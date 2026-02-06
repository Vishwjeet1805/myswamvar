import { z } from 'zod';
import type { PublicProfileResponse } from './profile';
import type { PaginatedResponse } from './types';

/** Query params for GET /profiles/search */
export const searchProfilesQuerySchema = z.object({
  ageMin: z.coerce.number().int().min(18).max(100).optional(),
  ageMax: z.coerce.number().int().min(18).max(100).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  locationCountry: z.string().max(100).optional(),
  locationState: z.string().max(100).optional(),
  locationCity: z.string().max(100).optional(),
  education: z.string().max(200).optional(),
  occupation: z.string().max(200).optional(),
  religion: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
}).strict();

export type SearchProfilesQuery = z.infer<typeof searchProfilesQuerySchema>;

export type SearchProfilesResponse = PaginatedResponse<PublicProfileResponse>;

/** Body for POST /shortlist */
export const addShortlistBodySchema = z.object({
  profileId: z.string().uuid(),
}).strict();

export type AddShortlistBody = z.infer<typeof addShortlistBodySchema>;

export interface ShortlistItemResponse {
  id: string;
  profileId: string;
  profile: PublicProfileResponse;
  createdAt: string;
}

/** Body for POST /interest */
export const sendInterestBodySchema = z.object({
  profileId: z.string().uuid(),
}).strict();

export type SendInterestBody = z.infer<typeof sendInterestBodySchema>;

export const InterestStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
} as const;

export type InterestStatusType =
  (typeof InterestStatus)[keyof typeof InterestStatus];

export interface InterestResponse {
  id: string;
  fromUserId: string;
  toUserId: string;
  toProfile?: PublicProfileResponse;
  fromProfile?: PublicProfileResponse;
  status: InterestStatusType;
  createdAt: string;
}

/** Body for POST /saved-searches */
export const savedSearchFiltersSchema = z.object({
  ageMin: z.number().int().min(18).max(100).optional(),
  ageMax: z.number().int().min(18).max(100).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  locationCountry: z.string().max(100).optional(),
  locationState: z.string().max(100).optional(),
  locationCity: z.string().max(100).optional(),
  education: z.string().max(200).optional(),
  occupation: z.string().max(200).optional(),
  religion: z.string().max(100).optional(),
}).strict();

export const createSavedSearchBodySchema = z.object({
  name: z.string().min(1).max(100),
  filters: savedSearchFiltersSchema,
  notify: z.boolean().default(false),
}).strict();

export const updateSavedSearchBodySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  filters: savedSearchFiltersSchema.optional(),
  notify: z.boolean().optional(),
}).strict();

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
