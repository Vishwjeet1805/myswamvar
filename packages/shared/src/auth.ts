import { z } from 'zod';
import type { UserRole } from './types';

/** Email format; allow reasonable length */
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email')
  .max(255);

/** Phone: optional, E.164-like when present */
const phoneSchema = z
  .string()
  .max(20)
  .regex(/^\+?[0-9\s-]*$/, 'Invalid phone format')
  .optional()
  .or(z.literal(''));

/** Password: min length, no max to allow passphrases */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(256);

export const registerBodySchema = z.object({
  email: emailSchema,
  phone: phoneSchema.transform((v) => (v === '' ? undefined : v)),
  password: passwordSchema,
});

export const loginBodySchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type RefreshBody = z.infer<typeof refreshBodySchema>;

/** User registration/approval status (admin workflow) */
export type UserStatus = 'pending' | 'approved' | 'rejected';

/** User as returned by API (no password) */
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

/** Auth tokens response */
export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
  user: UserResponse;
}
