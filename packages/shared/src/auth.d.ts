import { z } from 'zod';
import type { UserRole } from './types';
export declare const registerBodySchema: z.ZodObject<{
    email: z.ZodString;
    phone: z.ZodEffects<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>, string | undefined, string | undefined>;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    phone?: string | undefined;
}, {
    email: string;
    password: string;
    phone?: string | undefined;
}>;
export declare const loginBodySchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const refreshBodySchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type RefreshBody = z.infer<typeof refreshBodySchema>;
export type UserStatus = 'pending' | 'approved' | 'rejected';
export interface UserResponse {
    id: string;
    email: string;
    phone: string | null;
    role: UserRole;
    status?: UserStatus;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface AuthTokensResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: UserResponse;
}
