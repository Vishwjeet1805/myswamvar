import { z } from 'zod';

export const planIntervalSchema = z.enum(['month', 'year']);
export type PlanInterval = z.infer<typeof planIntervalSchema>;

export const subscriptionStatusSchema = z.enum([
  'active',
  'trialing',
  'past_due',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'unpaid',
]);
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

export const subscriptionFeaturesSchema = z.object({
  unlimitedChat: z.boolean(),
  contactAccess: z.boolean(),
  advancedFilters: z.boolean(),
}).strict();
export type SubscriptionFeatures = z.infer<typeof subscriptionFeaturesSchema>;

export interface PlanResponse {
  id: string;
  name: string;
  interval: PlanInterval;
  priceCents: number;
  currency: string;
  features: SubscriptionFeatures;
  isActive: boolean;
}

export interface SubscriptionResponse {
  id: string;
  status: SubscriptionStatus;
  provider: 'stripe' | 'mock';
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  plan: PlanResponse;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionMeResponse {
  subscription: SubscriptionResponse | null;
  isPremium: boolean;
}

export const checkoutBodySchema = z.object({
  planId: z.string().uuid('Invalid plan id'),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
}).strict();
export type CheckoutBody = z.infer<typeof checkoutBodySchema>;

export interface CheckoutSessionResponse {
  url: string;
  sessionId: string;
}
