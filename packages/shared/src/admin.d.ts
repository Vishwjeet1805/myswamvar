import { z } from 'zod';
import type { UserStatus } from './auth';
import type { SubscriptionResponse } from './subscription';
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
export interface AdminSubscriptionListItem extends SubscriptionResponse {
    userEmail: string;
    userId: string;
}
export interface AdminAnalyticsResponse {
    totalUsers: number;
    totalProfiles: number;
    activeSubscriptions: number;
    pendingUsers: number;
    signupsLast7Days: number;
    signupsLast30Days: number;
}
export declare const adminVerifyProfileBodySchema: z.ZodObject<{
    verified: z.ZodBoolean;
    notes: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    verified: boolean;
    notes?: string | undefined;
}, {
    verified: boolean;
    notes?: string | undefined;
}>;
export type AdminVerifyProfileBody = z.infer<typeof adminVerifyProfileBodySchema>;
