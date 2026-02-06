import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InterestStatus as PrismaInterestStatus } from '@prisma/client';
import type { InterestResponse } from '@matrimony/shared';
import { sendInterestBodySchema } from '@matrimony/shared';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileService } from '../profile/profile.service';

@Injectable()
export class InterestService {
  private readonly logger = new Logger(InterestService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly profileService: ProfileService,
  ) {}

  async send(userId: string, body: unknown): Promise<InterestResponse> {
    const parsed = sendInterestBodySchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('; ');
      throw new BadRequestException(msg);
    }
    const { profileId } = parsed.data;

    const toProfile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        user: { select: { id: true, email: true, phone: true, emailVerified: true } },
        photos: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
      },
    });
    if (!toProfile) {
      throw new NotFoundException('Profile not found');
    }
    const toUserId = toProfile.userId;
    if (toUserId === userId) {
      throw new BadRequestException('Cannot send interest to your own profile');
    }

    const existing = await this.prisma.interest.findUnique({
      where: { fromUserId_toUserId: { fromUserId: userId, toUserId } },
    });
    if (existing) {
      throw new ConflictException('Interest already sent to this profile');
    }

    const interest = await this.prisma.interest.create({
      data: { fromUserId: userId, toUserId, status: 'pending' },
      include: {
        toUser: { include: { profile: { include: { photos: true } } } },
      },
    });

    const toProfileWithUser = await this.prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        user: { select: { email: true, phone: true, emailVerified: true } },
        photos: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
      },
    });
    if (!toProfileWithUser) throw new NotFoundException('Profile not found');

    const viewer = { userId, isPremium: this.profileService.isPremiumUser(userId) };
    const toProfilePublic = this.profileService.toPublicProfile(
      toProfileWithUser as Parameters<ProfileService['toPublicProfile']>[0],
      viewer,
    );

    return {
      id: interest.id,
      fromUserId: interest.fromUserId,
      toUserId: interest.toUserId,
      toProfile: toProfilePublic,
      status: interest.status as InterestResponse['status'],
      createdAt: interest.createdAt.toISOString(),
    };
  }

  async listSent(userId: string): Promise<InterestResponse[]> {
    const interests = await this.prisma.interest.findMany({
      where: { fromUserId: userId },
      include: {
        toUser: {
          include: {
            profile: {
              include: {
                user: { select: { email: true, phone: true, emailVerified: true } },
                photos: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const viewer = { userId, isPremium: this.profileService.isPremiumUser(userId) };
    return interests
      .filter((i) => i.toUser.profile != null)
      .map((i) => {
        const profile = i.toUser.profile!;
        const publicProfile = this.profileService.toPublicProfile(
          profile as Parameters<ProfileService['toPublicProfile']>[0],
          viewer,
        );
        return {
          id: i.id,
          fromUserId: i.fromUserId,
          toUserId: i.toUserId,
          toProfile: publicProfile,
          status: i.status as InterestResponse['status'],
          createdAt: i.createdAt.toISOString(),
        };
      });
  }

  async listReceived(userId: string): Promise<InterestResponse[]> {
    const interests = await this.prisma.interest.findMany({
      where: { toUserId: userId },
      include: {
        fromUser: {
          include: {
            profile: {
              include: {
                user: { select: { email: true, phone: true, emailVerified: true } },
                photos: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const viewer = { userId, isPremium: this.profileService.isPremiumUser(userId) };
    return interests
      .filter((i) => i.fromUser.profile != null)
      .map((i) => {
        const profile = i.fromUser.profile!;
        const publicProfile = this.profileService.toPublicProfile(
          profile as Parameters<ProfileService['toPublicProfile']>[0],
          viewer,
        );
        return {
          id: i.id,
          fromUserId: i.fromUserId,
          toUserId: i.toUserId,
          fromProfile: publicProfile,
          status: i.status as InterestResponse['status'],
          createdAt: i.createdAt.toISOString(),
        };
      });
  }

  async accept(userId: string, interestId: string): Promise<InterestResponse> {
    const interest = await this.prisma.interest.findUnique({
      where: { id: interestId },
      include: {
        fromUser: {
          include: {
            profile: {
              include: {
                user: { select: { email: true, phone: true, emailVerified: true } },
                photos: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
              },
            },
          },
        },
      },
    });
    if (!interest) {
      throw new NotFoundException('Interest not found');
    }
    if (interest.toUserId !== userId) {
      throw new NotFoundException('Interest not found');
    }
    if (interest.status !== 'pending') {
      throw new BadRequestException('Interest is already accepted or declined');
    }

    const updated = await this.prisma.interest.update({
      where: { id: interestId },
      data: { status: 'accepted' as PrismaInterestStatus },
      include: {
        fromUser: {
          include: {
            profile: {
              include: {
                user: { select: { email: true, phone: true, emailVerified: true } },
                photos: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
              },
            },
          },
        },
      },
    });

    const profile = updated.fromUser.profile;
    if (!profile) throw new NotFoundException('Sender profile not found');
    const viewer = { userId, isPremium: this.profileService.isPremiumUser(userId) };
    const publicProfile = this.profileService.toPublicProfile(
      profile as Parameters<ProfileService['toPublicProfile']>[0],
      viewer,
    );

    return {
      id: updated.id,
      fromUserId: updated.fromUserId,
      toUserId: updated.toUserId,
      fromProfile: publicProfile,
      status: updated.status as InterestResponse['status'],
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async decline(userId: string, interestId: string): Promise<{ message: string }> {
    const interest = await this.prisma.interest.findUnique({
      where: { id: interestId },
    });
    if (!interest) {
      throw new NotFoundException('Interest not found');
    }
    if (interest.toUserId !== userId) {
      throw new NotFoundException('Interest not found');
    }
    if (interest.status !== 'pending') {
      throw new BadRequestException('Interest is already accepted or declined');
    }

    await this.prisma.interest.update({
      where: { id: interestId },
      data: { status: 'declined' as PrismaInterestStatus },
    });
    return { message: 'Interest declined.' };
  }
}
