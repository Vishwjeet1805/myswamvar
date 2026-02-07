import { z } from 'zod';
import type { UserStatus } from './auth';
import type { SubscriptionResponse } from './subscription';

/** Admin: user list item (with optional profile) */
export interface AdminUserListItem {
  id: string;
  email: string;
  phone: string | null;
  role: string;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profileId?: string;
  displayName?: string;
}

/** Admin: profile list item for verification */
export interface AdminProfileListItem {
  id: string;
  userId: string;
  displayName: string;
  gender: string;
  profileVerified: boolean;
  verifiedAt: string | null;
  verifiedBy: string | null;
  verificationNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Admin: subscription list item (with user + plan) */
export interface AdminSubscriptionListItem extends SubscriptionResponse {
  userEmail: string;
  userId: string;
}

/** Admin: analytics summary */
export interface AdminAnalyticsResponse {
  totalUsers: number;
  totalProfiles: number;
  activeSubscriptions: number;
  pendingUsers: number;
  signupsLast7Days: number;
  signupsLast30Days: number;
}

/** Body for PATCH /admin/profiles/:id/verify */
export const adminVerifyProfileBodySchema = z.object({
  verified: z.boolean(),
  notes: z.string().max(2000).optional(),
}).strict();
export type AdminVerifyProfileBody = z.infer<typeof adminVerifyProfileBodySchema>;
