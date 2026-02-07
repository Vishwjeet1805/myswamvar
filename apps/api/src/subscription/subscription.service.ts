import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { Prisma } from '@prisma/client';
import Stripe from 'stripe';
import type {
  CheckoutSessionResponse,
  PlanResponse,
  SubscriptionMeResponse,
  SubscriptionResponse,
} from '@matrimony/shared';
import { checkoutBodySchema } from '@matrimony/shared';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_PLANS: Prisma.PlanCreateManyInput[] = [
  {
    name: 'Premium Monthly',
    interval: 'month',
    priceCents: 1999,
    currency: 'usd',
    features: {
      unlimitedChat: true,
      contactAccess: true,
      advancedFilters: true,
    },
    isActive: true,
  },
  {
    name: 'Premium Yearly',
    interval: 'year',
    priceCents: 19999,
    currency: 'usd',
    features: {
      unlimitedChat: true,
      contactAccess: true,
      advancedFilters: true,
    },
    isActive: true,
  },
];

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  private readonly stripe: Stripe | null;
  private seededPlans = false;

  constructor(private readonly prisma: PrismaService) {
    const key = process.env.STRIPE_SECRET_KEY;
    this.stripe = key ? new Stripe(key, { apiVersion: '2024-04-10' }) : null;
  }

  async getPlans(): Promise<PlanResponse[]> {
    await this.ensureDefaultPlans();
    const plans = await this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: [{ priceCents: 'asc' }],
    });
    return plans.map((plan) => this.toPlanResponse(plan));
  }

  async getSubscriptionMe(userId: string): Promise<SubscriptionMeResponse> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });
    const isPremium = this.isSubscriptionPremium(subscription);
    return {
      subscription: subscription ? this.toSubscriptionResponse(subscription) : null,
      isPremium,
    };
  }

  async createCheckoutSession(
    userId: string,
    body: unknown,
  ): Promise<CheckoutSessionResponse> {
    await this.ensureDefaultPlans();
    const parsed = checkoutBodySchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('; ');
      throw new BadRequestException(msg);
    }
    const { planId, successUrl, cancelUrl } = parsed.data;
    const plan = await this.prisma.plan.findFirst({
      where: { id: planId, isActive: true },
    });
    if (!plan) {
      throw new NotFoundException('Plan not found.');
    }

    const baseUrl = process.env.WEB_BASE_URL ?? 'http://localhost:3000';
    const safeSuccessUrl = this.safeUrl(successUrl, `${baseUrl}/subscription?status=success`);
    const safeCancelUrl = this.safeUrl(cancelUrl, `${baseUrl}/subscription?status=cancel`);

    if (!this.stripe) {
      const sessionId = `mock_${randomUUID()}`;
      await this.activateMockSubscription(userId, plan.id, plan.interval);
      return { url: safeSuccessUrl, sessionId };
    }

    const priceId = await this.ensureStripePrice(plan);
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: safeSuccessUrl,
      cancel_url: safeCancelUrl,
      client_reference_id: userId,
      subscription_data: {
        metadata: { userId, planId: plan.id },
      },
    });

    if (!session.url) {
      throw new BadRequestException('Unable to create checkout session.');
    }
    return { url: session.url, sessionId: session.id };
  }

  async cancelSubscription(userId: string): Promise<SubscriptionResponse> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });
    if (!subscription) {
      throw new NotFoundException('No subscription found.');
    }

    if (subscription.provider === 'stripe' && this.stripe && subscription.stripeSubscriptionId) {
      await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
      const updated = await this.prisma.subscription.update({
        where: { userId },
        data: { cancelAtPeriodEnd: true },
        include: { plan: true },
      });
      return this.toSubscriptionResponse(updated);
    }

    const updated = await this.prisma.subscription.update({
      where: { userId },
      data: {
        status: 'canceled',
        cancelAtPeriodEnd: true,
        currentPeriodEnd: new Date(),
        provider: subscription.provider,
      },
      include: { plan: true },
    });
    return this.toSubscriptionResponse(updated);
  }

  async handleWebhook(rawBody: Buffer, signature?: string): Promise<{ received: boolean }> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!this.stripe || !webhookSecret || !signature) {
      this.logger.warn('Stripe webhook skipped: missing configuration.');
      return { received: true };
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      this.logger.warn(`Stripe webhook signature failed: ${String(err)}`);
      throw new BadRequestException('Invalid webhook signature.');
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.upsertFromStripe(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.markCanceledFromStripe(subscription);
        break;
      }
      default:
        break;
    }

    return { received: true };
  }

  async isUserPremium(userId: string): Promise<boolean> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });
    return this.isSubscriptionPremium(subscription);
  }

  private async ensureDefaultPlans(): Promise<void> {
    if (this.seededPlans) return;
    const count = await this.prisma.plan.count();
    if (count === 0) {
      await this.prisma.plan.createMany({ data: DEFAULT_PLANS });
    }
    this.seededPlans = true;
  }

  private async ensureStripePrice(plan: {
    id: string;
    name: string;
    interval: 'month' | 'year';
    priceCents: number;
    currency: string;
    stripePriceId: string | null;
  }): Promise<string> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured.');
    }
    if (plan.stripePriceId) return plan.stripePriceId;

    const price = await this.stripe.prices.create({
      currency: plan.currency,
      unit_amount: plan.priceCents,
      recurring: { interval: plan.interval },
      product_data: { name: plan.name },
      metadata: { planId: plan.id },
    });
    await this.prisma.plan.update({
      where: { id: plan.id },
      data: { stripePriceId: price.id },
    });
    return price.id;
  }

  private async activateMockSubscription(
    userId: string,
    planId: string,
    interval: 'month' | 'year',
  ): Promise<void> {
    const now = new Date();
    const periodEnd = new Date(now);
    if (interval === 'month') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }
    await this.prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        planId,
        status: 'active',
        provider: 'mock',
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      },
      update: {
        planId,
        status: 'active',
        provider: 'mock',
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      },
    });
  }

  private async upsertFromStripe(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      this.logger.warn('Stripe subscription missing userId metadata.');
      return;
    }

    const planId =
      subscription.metadata?.planId ??
      (subscription.items.data[0]?.price?.id
        ? await this.findPlanIdByPrice(subscription.items.data[0].price.id)
        : null);
    if (!planId) {
      this.logger.warn('Stripe subscription missing planId metadata.');
      return;
    }

    const currentPeriodEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000)
      : null;
    const status = this.mapStripeStatus(subscription.status);

    await this.prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        planId,
        status,
        provider: 'stripe',
        stripeCustomerId: subscription.customer?.toString() ?? null,
        stripeSubscriptionId: subscription.id,
        currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
      update: {
        planId,
        status,
        provider: 'stripe',
        stripeCustomerId: subscription.customer?.toString() ?? null,
        stripeSubscriptionId: subscription.id,
        currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
  }

  private async markCanceledFromStripe(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata?.userId;
    if (!userId) return;
    await this.prisma.subscription.update({
      where: { userId },
      data: {
        status: 'canceled',
        cancelAtPeriodEnd: true,
        currentPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : new Date(),
      },
    });
  }

  private async findPlanIdByPrice(priceId: string): Promise<string | null> {
    const plan = await this.prisma.plan.findFirst({
      where: { stripePriceId: priceId },
      select: { id: true },
    });
    return plan?.id ?? null;
  }

  private isSubscriptionPremium(
    subscription: { status: string; currentPeriodEnd: Date | null } | null,
  ): boolean {
    if (!subscription) return false;
    const activeStatuses = new Set(['active', 'trialing']);
    if (!activeStatuses.has(subscription.status)) return false;
    if (!subscription.currentPeriodEnd) return true;
    return subscription.currentPeriodEnd.getTime() > Date.now();
  }

  private toPlanResponse(plan: {
    id: string;
    name: string;
    interval: string;
    priceCents: number;
    currency: string;
    features: unknown;
    isActive: boolean;
  }): PlanResponse {
    return {
      id: plan.id,
      name: plan.name,
      interval: plan.interval as PlanResponse['interval'],
      priceCents: plan.priceCents,
      currency: plan.currency,
      features: plan.features as PlanResponse['features'],
      isActive: plan.isActive,
    };
  }

  private toSubscriptionResponse(subscription: {
    id: string;
    status: string;
    provider: string;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
    plan: {
      id: string;
      name: string;
      interval: string;
      priceCents: number;
      currency: string;
      features: unknown;
      isActive: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
  }): SubscriptionResponse {
    return {
      id: subscription.id,
      status: subscription.status as SubscriptionResponse['status'],
      provider: subscription.provider as SubscriptionResponse['provider'],
      currentPeriodEnd: subscription.currentPeriodEnd
        ? subscription.currentPeriodEnd.toISOString()
        : null,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      plan: this.toPlanResponse(subscription.plan),
      createdAt: subscription.createdAt.toISOString(),
      updatedAt: subscription.updatedAt.toISOString(),
    };
  }

  private mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionResponse['status'] {
    switch (status) {
      case 'active':
      case 'trialing':
      case 'past_due':
      case 'canceled':
      case 'incomplete':
      case 'incomplete_expired':
      case 'unpaid':
        return status;
      default:
        return 'incomplete';
    }
  }

  private safeUrl(candidate: string | undefined, fallback: string): string {
    if (!candidate) return fallback;
    try {
      const url = new URL(candidate);
      if (!['http:', 'https:'].includes(url.protocol)) return fallback;
      return url.toString();
    } catch {
      return fallback;
    }
  }
}
