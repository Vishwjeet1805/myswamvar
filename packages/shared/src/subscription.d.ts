import { z } from 'zod';
export declare const planIntervalSchema: z.ZodEnum<["month", "year"]>;
export type PlanInterval = z.infer<typeof planIntervalSchema>;
export declare const subscriptionStatusSchema: z.ZodEnum<["active", "trialing", "past_due", "canceled", "incomplete", "incomplete_expired", "unpaid"]>;
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;
export declare const subscriptionFeaturesSchema: z.ZodObject<{
    unlimitedChat: z.ZodBoolean;
    contactAccess: z.ZodBoolean;
    advancedFilters: z.ZodBoolean;
}, "strict", z.ZodTypeAny, {
    unlimitedChat: boolean;
    contactAccess: boolean;
    advancedFilters: boolean;
}, {
    unlimitedChat: boolean;
    contactAccess: boolean;
    advancedFilters: boolean;
}>;
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
export declare const checkoutBodySchema: z.ZodObject<{
    planId: z.ZodString;
    successUrl: z.ZodOptional<z.ZodString>;
    cancelUrl: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    planId: string;
    successUrl?: string | undefined;
    cancelUrl?: string | undefined;
}, {
    planId: string;
    successUrl?: string | undefined;
    cancelUrl?: string | undefined;
}>;
export type CheckoutBody = z.infer<typeof checkoutBodySchema>;
export interface CheckoutSessionResponse {
    url: string;
    sessionId: string;
}
