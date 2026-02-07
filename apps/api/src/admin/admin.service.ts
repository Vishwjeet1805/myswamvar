import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type {
  AdminAnalyticsResponse,
  AdminProfileListItem,
  AdminSubscriptionListItem,
  AdminUserListItem,
} from '@matrimony/shared';
import { adminVerifyProfileBodySchema } from '@matrimony/shared';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly subscription: SubscriptionService,
  ) {}

  /** List users with optional status filter; audit logged by controller */
  async getUsers(status?: 'pending' | 'approved' | 'rejected'): Promise<AdminUserListItem[]> {
    const where = status ? { status } : {};
    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        profile: { select: { id: true, displayName: true } },
      },
    });
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      phone: u.phone,
      role: u.role,
      status: u.status,
      emailVerified: u.emailVerified,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
      profileId: u.profile?.id,
      displayName: u.profile?.displayName,
    }));
  }

  async approveUser(userId: string, adminId: string): Promise<AdminUserListItem> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: { select: { id: true, displayName: true } } },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    if (user.status === 'approved') {
      throw new BadRequestException('User is already approved.');
    }
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'approved' },
      include: { profile: { select: { id: true, displayName: true } } },
    });
    return this.toUserListItem(updated);
  }

  async rejectUser(userId: string, adminId: string): Promise<AdminUserListItem> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: { select: { id: true, displayName: true } } },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'rejected' },
      include: { profile: { select: { id: true, displayName: true } } },
    });
    return this.toUserListItem(updated);
  }

  /** List profiles with optional verified filter */
  async getProfiles(verified?: boolean): Promise<AdminProfileListItem[]> {
    const where = verified !== undefined ? { profileVerified: verified } : {};
    const profiles = await this.prisma.profile.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
    return profiles.map((p) => ({
      id: p.id,
      userId: p.userId,
      displayName: p.displayName,
      gender: p.gender,
      profileVerified: p.profileVerified,
      verifiedAt: p.verifiedAt?.toISOString() ?? null,
      verifiedBy: p.verifiedBy ?? null,
      verificationNotes: p.verificationNotes ?? null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  }

  async verifyProfile(
    profileId: string,
    adminId: string,
    body: unknown,
  ): Promise<AdminProfileListItem> {
    const parsed = adminVerifyProfileBodySchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('; ');
      throw new BadRequestException(msg);
    }
    const { verified, notes } = parsed.data;
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found.');
    }
    const updated = await this.prisma.profile.update({
      where: { id: profileId },
      data: {
        profileVerified: verified,
        verifiedAt: verified ? new Date() : null,
        verifiedBy: verified ? adminId : null,
        verificationNotes: notes ?? null,
      },
    });
    return {
      id: updated.id,
      userId: updated.userId,
      displayName: updated.displayName,
      gender: updated.gender,
      profileVerified: updated.profileVerified,
      verifiedAt: updated.verifiedAt?.toISOString() ?? null,
      verifiedBy: updated.verifiedBy ?? null,
      verificationNotes: updated.verificationNotes ?? null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  /** List active subscriptions with user and plan */
  async getSubscriptions(): Promise<AdminSubscriptionListItem[]> {
    const subs = await this.prisma.subscription.findMany({
      where: { status: { in: ['active', 'trialing'] } },
      orderBy: { createdAt: 'desc' },
      include: { user: true, plan: true },
    });
    return subs.map((s) => this.toAdminSubscriptionItem(s));
  }

  /** Cancel a subscription (admin override) */
  async cancelSubscriptionAdmin(
    subscriptionId: string,
    _adminId: string,
  ): Promise<AdminSubscriptionListItem> {
    const sub = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { user: true, plan: true },
    });
    if (!sub) {
      throw new NotFoundException('Subscription not found.');
    }
    await this.subscription.cancelSubscription(sub.userId);
    const updated = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { user: true, plan: true },
    });
    if (!updated) throw new NotFoundException('Subscription not found.');
    return this.toAdminSubscriptionItem(updated);
  }

  private toAdminSubscriptionItem(sub: {
    id: string;
    status: string;
    provider: string;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: { id: string; email: string };
    plan: {
      id: string;
      name: string;
      interval: string;
      priceCents: number;
      currency: string;
      features: unknown;
      isActive: boolean;
    };
  }): AdminSubscriptionListItem {
    return {
      id: sub.id,
      status: sub.status as AdminSubscriptionListItem['status'],
      provider: sub.provider as AdminSubscriptionListItem['provider'],
      currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      plan: {
        id: sub.plan.id,
        name: sub.plan.name,
        interval: sub.plan.interval as AdminSubscriptionListItem['plan']['interval'],
        priceCents: sub.plan.priceCents,
        currency: sub.plan.currency,
        features: sub.plan.features as AdminSubscriptionListItem['plan']['features'],
        isActive: sub.plan.isActive,
      },
      createdAt: sub.createdAt.toISOString(),
      updatedAt: sub.updatedAt.toISOString(),
      userEmail: sub.user.email,
      userId: sub.user.id,
    };
  }

  async getAnalytics(): Promise<AdminAnalyticsResponse> {
    const [totalUsers, totalProfiles, activeSubscriptions, pendingUsers, signups7, signups30] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.profile.count(),
        this.prisma.subscription.count({
          where: {
            status: { in: ['active', 'trialing'] },
            currentPeriodEnd: { gt: new Date() },
          },
        }),
        this.prisma.user.count({ where: { status: 'pending' } }),
        this.prisma.user.count({
          where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        }),
        this.prisma.user.count({
          where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        }),
      ]);
    return {
      totalUsers,
      totalProfiles,
      activeSubscriptions,
      pendingUsers,
      signupsLast7Days: signups7,
      signupsLast30Days: signups30,
    };
  }

  /** Write audit log entry */
  async logAudit(
    adminId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    payload?: Record<string, unknown>,
  ): Promise<void> {
    await this.prisma.adminAuditLog.create({
      data: {
        adminId,
        action,
        resourceType,
        resourceId,
        payload: (payload ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }

  private toUserListItem(user: {
    id: string;
    email: string;
    phone: string | null;
    role: string;
    status: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    profile: { id: string; displayName: string } | null;
  }): AdminUserListItem {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status as AdminUserListItem['status'],
      emailVerified: user.emailVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      profileId: user.profile?.id,
      displayName: user.profile?.displayName,
    };
  }
}
