import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ShortlistItemResponse } from '@matrimony/shared';
import { addShortlistBodySchema } from '@matrimony/shared';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileService } from '../profile/profile.service';

@Injectable()
export class ShortlistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profileService: ProfileService,
  ) {}

  async add(userId: string, body: unknown): Promise<ShortlistItemResponse> {
    const parsed = addShortlistBodySchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('; ');
      throw new BadRequestException(msg);
    }
    const { profileId } = parsed.data;

    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        user: { select: { email: true, phone: true, emailVerified: true } },
        photos: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
      },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    if (profile.userId === userId) {
      throw new BadRequestException('Cannot shortlist your own profile');
    }

    const existing = await this.prisma.shortlist.findUnique({
      where: { userId_profileId: { userId, profileId } },
    });
    if (existing) {
      throw new ConflictException('Profile already in shortlist');
    }

    const shortlist = await this.prisma.shortlist.create({
      data: { userId, profileId },
      include: {
        profile: {
          include: {
            user: { select: { email: true, phone: true, emailVerified: true } },
            photos: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
          },
        },
      },
    });

    const publicProfile = this.profileService.toPublicProfile(
      shortlist.profile as Parameters<ProfileService['toPublicProfile']>[0],
      { userId, isPremium: this.profileService.isPremiumUser(userId) },
    );
    return {
      id: shortlist.id,
      profileId: shortlist.profileId,
      profile: publicProfile,
      createdAt: shortlist.createdAt.toISOString(),
    };
  }

  async list(userId: string): Promise<ShortlistItemResponse[]> {
    const items = await this.prisma.shortlist.findMany({
      where: { userId },
      include: {
        profile: {
          include: {
            user: { select: { email: true, phone: true, emailVerified: true } },
            photos: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const viewer = { userId, isPremium: this.profileService.isPremiumUser(userId) };
    return items.map((item) => ({
      id: item.id,
      profileId: item.profileId,
      profile: this.profileService.toPublicProfile(
        item.profile as Parameters<ProfileService['toPublicProfile']>[0],
        viewer,
      ),
      createdAt: item.createdAt.toISOString(),
    }));
  }

  async remove(userId: string, profileId: string): Promise<{ message: string }> {
    const shortlist = await this.prisma.shortlist.findUnique({
      where: { userId_profileId: { userId, profileId } },
    });
    if (!shortlist) {
      throw new NotFoundException('Shortlist item not found');
    }
    await this.prisma.shortlist.delete({
      where: { id: shortlist.id },
    });
    return { message: 'Removed from shortlist.' };
  }
}
