import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ContactVisibility, Prisma } from '@prisma/client';
import type {
  ProfileResponse,
  PublicProfileResponse,
  ProfilePhotoResponse,
} from '@matrimony/shared';
import {
  createProfileBodySchema,
  updateProfileBodySchema,
  searchProfilesQuerySchema,
  type SearchProfilesResponse,
  PROFILE_PHOTO_MIME_TYPES,
  PROFILE_PHOTO_MAX_SIZE_BYTES,
  PROFILE_PHOTO_MAX_COUNT,
  ContactVisibility as SharedContactVisibility,
} from '@matrimony/shared';
import { HoroscopeService } from '../horoscope/horoscope.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly horoscope: HoroscopeService,
    private readonly subscription: SubscriptionService,

  ) {}

  async getMyProfile(userId: string): Promise<ProfileResponse | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { photos: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] } },
    });
    return profile ? this.toProfileResponse(profile) : null;
  }

  async createProfile(userId: string, body: unknown): Promise<ProfileResponse> {
    const parsed = createProfileBodySchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('; ');
      throw new BadRequestException(msg);
    }
    const existing = await this.prisma.profile.findUnique({
      where: { userId },
    });
    if (existing) {
      throw new BadRequestException('Profile already exists. Use PATCH to update.');
    }
    const data = this.mapBodyToProfileCreate(parsed.data);
    const profile = await this.prisma.profile.create({
      data: { ...data, userId },
      include: { photos: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] } },
    });
    return this.toProfileResponse({
      ...profile,
      photos: profile.photos ?? [],
    });
  }

  async updateProfile(userId: string, body: unknown): Promise<ProfileResponse> {
    const parsed = updateProfileBodySchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('; ');
      throw new BadRequestException(msg);
    }
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { photos: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] } },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found. Create one with POST.');
    }
    const data = this.mapBodyToProfileUpdate(parsed.data);
    
    // Check if birth details are being updated
    const birthDetailsChanged =
      data.timeOfBirth !== undefined ||
      data.placeOfBirth !== undefined ||
      data.birthLatLong !== undefined;
    
    const updated = await this.prisma.profile.update({
      where: { userId },
      data,
      include: { photos: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] } },
    });
    
    // Invalidate horoscope matches if birth details changed
    if (birthDetailsChanged) {
      await this.horoscope.invalidateMatches(updated.id).catch((err) => {
        this.logger.warn(`Failed to invalidate horoscope matches: ${err}`);
      });
    }
    
    return this.toProfileResponse(updated);
  }

  async searchProfiles(
    query: unknown,
    viewer: { userId: string; isPremium: boolean } | null,
  ): Promise<SearchProfilesResponse> {
    const parsed = searchProfilesQuerySchema.safeParse(query);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('; ');
      throw new BadRequestException(msg);
    }
    const q = parsed.data;
    const page = q.page ?? 1;
    const limit = Math.min(q.limit ?? 20, 50);
    const skip = (page - 1) * limit;

    const now = new Date();
    const minDob = q.ageMax != null ? new Date(now.getFullYear() - q.ageMax - 1, now.getMonth(), now.getDate()) : undefined;
    const maxDob = q.ageMin != null ? new Date(now.getFullYear() - q.ageMin, now.getMonth(), now.getDate()) : undefined;

    const where: Prisma.ProfileWhereInput = {};
    if (viewer?.userId) {
      where.userId = { not: viewer.userId };
    }
    if (q.gender != null) where.gender = q.gender;
    if (q.education != null) where.education = { contains: q.education, mode: 'insensitive' };
    if (q.occupation != null) where.occupation = { contains: q.occupation, mode: 'insensitive' };
    if (q.religion != null) where.religion = { contains: q.religion, mode: 'insensitive' };
    if (minDob != null || maxDob != null) {
      where.dob = {};
      if (minDob != null) where.dob.gte = minDob;
      if (maxDob != null) where.dob.lte = maxDob;
    }
    if (q.locationCountry != null || q.locationState != null || q.locationCity != null) {
      const locationConds: Prisma.ProfileWhereInput[] = [];
      if (q.locationCountry != null) {
        locationConds.push({ location: { path: ['country'], string_contains: q.locationCountry } });
      }
      if (q.locationState != null) {
        locationConds.push({ location: { path: ['state'], string_contains: q.locationState } });
      }
      if (q.locationCity != null) {
        locationConds.push({ location: { path: ['city'], string_contains: q.locationCity } });
      }
      if (locationConds.length === 1) {
        Object.assign(where, locationConds[0]);
      } else if (locationConds.length > 1) {
        where.AND = [...((where.AND as Prisma.ProfileWhereInput[] | undefined) ?? []), ...locationConds];
      }
    }

    const [profiles, total] = await Promise.all([
      this.prisma.profile.findMany({
        where,
        include: {
          user: { select: { email: true, phone: true, emailVerified: true } },
          photos: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.profile.count({ where }),
    ]);

    const data = profiles.map((p) =>
      this.toPublicProfileResponse(
        p,
        this.canViewerSeeContact(p.privacyContactVisibleTo, viewer?.isPremium ?? false),
        false,
      ),
    );
    const totalPages = Math.ceil(total / limit) || 1;
    return { data, total, page, limit, totalPages };
  }

  async getProfileById(
    profileId: string,
    viewer: { userId: string; isPremium: boolean } | null,
  ): Promise<PublicProfileResponse | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        user: { select: { email: true, phone: true, emailVerified: true } },
        photos: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }] },
      },
    });
    if (!profile) return null;
    const isOwn = viewer?.userId === profile.userId;
    if (isOwn) {
      return this.toPublicProfileResponse(profile, true, true);
    }
    const canSeeContact = this.canViewerSeeContact(
      profile.privacyContactVisibleTo,
      viewer?.isPremium ?? false,
    );
    return this.toPublicProfileResponse(profile, canSeeContact, false);
  }

  async getContactForProfile(
    profileId: string,
    viewerUserId: string,
  ): Promise<{ email?: string; phone?: string }> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      include: { user: { select: { email: true, phone: true } } },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found.');
    }
    const isOwn = profile.userId === viewerUserId;
    if (isOwn) {
      return { email: profile.user.email, phone: profile.user.phone ?? undefined };
    }

    const isPremium = await this.subscription.isUserPremium(viewerUserId);
    if (!isPremium) {
      throw new ForbiddenException('Premium membership required to view contact.');
    }

    const canSee = this.canViewerSeeContact(
      profile.privacyContactVisibleTo,
      isPremium,
    );
    if (!canSee) {
      throw new ForbiddenException('Contact details are not visible.');
    }
    return { email: profile.user.email, phone: profile.user.phone ?? undefined };
  }

  async addPhoto(
    userId: string,
    file: Express.Multer.File,
  ): Promise<ProfilePhotoResponse> {
    if (!file?.buffer) {
      throw new BadRequestException('No file uploaded');
    }
    if (!PROFILE_PHOTO_MIME_TYPES.includes(file.mimetype as never)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${PROFILE_PHOTO_MIME_TYPES.join(', ')}`,
      );
    }
    if (file.size > PROFILE_PHOTO_MAX_SIZE_BYTES) {
      throw new BadRequestException(
        `File too large. Max size: ${PROFILE_PHOTO_MAX_SIZE_BYTES / 1024 / 1024}MB`,
      );
    }
    if (!this.storage.isConfigured()) {
      throw new BadRequestException('Photo upload is not configured');
    }

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { photos: true },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found.');
    }
    if (profile.photos.length >= PROFILE_PHOTO_MAX_COUNT) {
      throw new BadRequestException(
        `Maximum ${PROFILE_PHOTO_MAX_COUNT} photos allowed.`,
      );
    }

    const ext = file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : 'jpg';
    const key = `profiles/${userId}/${Date.now()}.${ext}`;
    const { url } = await this.storage.upload(
      key,
      file.buffer,
      file.mimetype,
    );

    const isFirst = profile.photos.length === 0;
    const maxOrder = profile.photos.reduce((m, p) => Math.max(m, p.order), 0);
    const photo = await this.prisma.profilePhoto.create({
      data: {
        profileId: profile.id,
        url,
        isPrimary: isFirst,
        order: maxOrder + 1,
      },
    });
    return this.toPhotoResponse(photo);
  }

  async deletePhoto(userId: string, photoId: string): Promise<{ message: string }> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { photos: true },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found.');
    }
    const photo = profile.photos.find((p) => p.id === photoId);
    if (!photo) {
      throw new NotFoundException('Photo not found.');
    }
    const key = this.storage.keyFromUrl(photo.url);
    if (key) {
      try {
        await this.storage.delete(key);
      } catch (e) {
        this.logger.warn(`Failed to delete object ${key}: ${e}`);
      }
    }
    await this.prisma.profilePhoto.delete({ where: { id: photoId } });
    if (photo.isPrimary && profile.photos.length > 1) {
      const next = profile.photos.find((p) => p.id !== photoId);
      if (next) {
        await this.prisma.profilePhoto.update({
          where: { id: next.id },
          data: { isPrimary: true },
        });
      }
    }
    return { message: 'Photo deleted.' };
  }

  async setPrimaryPhoto(userId: string, photoId: string): Promise<ProfilePhotoResponse> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { photos: true },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found.');
    }
    const photo = profile.photos.find((p) => p.id === photoId);
    if (!photo) {
      throw new NotFoundException('Photo not found.');
    }
    await this.prisma.$transaction([
      this.prisma.profilePhoto.updateMany({
        where: { profileId: profile.id },
        data: { isPrimary: false },
      }),
      this.prisma.profilePhoto.update({
        where: { id: photoId },
        data: { isPrimary: true },
      }),
    ]);
    const updated = await this.prisma.profilePhoto.findUniqueOrThrow({
      where: { id: photoId },
    });
    return this.toPhotoResponse(updated);
  }

  private canViewerSeeContact(
    privacy: ContactVisibility,
    viewerIsPremium: boolean,
  ): boolean {
    if (!viewerIsPremium) return false;
    switch (privacy) {
      case 'all':
        return true;
      case 'premium':
        return viewerIsPremium;
      case 'none':
        return false;
      default:
        return false;
    }
  }

  private mapBodyToProfileCreate(data: {
    displayName: string;
    dob: string;
    gender: string;
    religion?: string;
    location?: { city?: string; state?: string; country?: string };
    education?: string;
    occupation?: string;
    bio?: string;
    preferences?: unknown;
    privacyContactVisibleTo?: string;
    timeOfBirth?: string;
    placeOfBirth?: string;
    birthLatLong?: { lat: number; lng: number };
  }): Omit<Prisma.ProfileUncheckedCreateInput, 'userId'> {
    const dob = new Date(data.dob + 'T00:00:00.000Z');
    return {
      displayName: data.displayName,
      dob,
      gender: data.gender,
      religion: data.religion ?? null,
      location: data.location ?? undefined,
      education: data.education ?? null,
      occupation: data.occupation ?? null,
      bio: data.bio ?? null,
      preferences: data.preferences === undefined ? undefined : (data.preferences ?? Prisma.JsonNull),
      privacyContactVisibleTo: (data.privacyContactVisibleTo as ContactVisibility) ?? 'all',
      timeOfBirth: data.timeOfBirth ?? null,
      placeOfBirth: data.placeOfBirth ?? null,
      birthLatLong: data.birthLatLong === undefined ? undefined : (data.birthLatLong ?? Prisma.JsonNull),
    };
  }

  private mapBodyToProfileUpdate(data: {
    displayName?: string;
    dob?: string;
    gender?: string;
    religion?: string;
    location?: { city?: string; state?: string; country?: string };
    education?: string;
    occupation?: string;
    bio?: string;
    preferences?: unknown;
    privacyContactVisibleTo?: string;
    timeOfBirth?: string;
    placeOfBirth?: string;
    birthLatLong?: { lat: number; lng: number };
  }): Prisma.ProfileUpdateInput {
    const update: Prisma.ProfileUpdateInput = {};
    if (data.displayName !== undefined) update.displayName = data.displayName;
    if (data.dob !== undefined) update.dob = new Date(data.dob + 'T00:00:00.000Z');
    if (data.gender !== undefined) update.gender = data.gender;
    if (data.religion !== undefined) update.religion = data.religion;
    if (data.location !== undefined) update.location = data.location;
    if (data.education !== undefined) update.education = data.education;
    if (data.occupation !== undefined) update.occupation = data.occupation;
    if (data.bio !== undefined) update.bio = data.bio;
    if (data.preferences !== undefined) update.preferences = data.preferences === null ? Prisma.JsonNull : data.preferences;
    if (data.privacyContactVisibleTo !== undefined) {
      update.privacyContactVisibleTo = data.privacyContactVisibleTo as ContactVisibility;
    }
    if (data.timeOfBirth !== undefined) update.timeOfBirth = data.timeOfBirth ?? null;
    if (data.placeOfBirth !== undefined) update.placeOfBirth = data.placeOfBirth ?? null;
    if (data.birthLatLong !== undefined) update.birthLatLong = data.birthLatLong === null ? Prisma.JsonNull : data.birthLatLong;
    return update;
  }

  private toProfileResponse(profile: {
    id: string;
    userId: string;
    displayName: string;
    dob: Date;
    gender: string;
    religion: string | null;
    location: unknown;
    education: string | null;
    occupation: string | null;
    bio: string | null;
    preferences: unknown;
    privacyContactVisibleTo: string;
    profileVerified: boolean;
    timeOfBirth: string | null;
    placeOfBirth: string | null;
    birthLatLong: unknown;
    createdAt: Date;
    updatedAt: Date;
    photos: Array<{
      id: string;
      url: string;
      isPrimary: boolean;
      order: number;
      createdAt: Date;
    }>;
  }): ProfileResponse {
    return {
      id: profile.id,
      userId: profile.userId,
      displayName: profile.displayName,
      dob: profile.dob.toISOString().slice(0, 10),
      gender: profile.gender,
      religion: profile.religion,
      location: profile.location as ProfileResponse['location'],
      education: profile.education,
      occupation: profile.occupation,
      bio: profile.bio,
      preferences: profile.preferences as ProfileResponse['preferences'],
      privacyContactVisibleTo: profile.privacyContactVisibleTo as SharedContactVisibility,
      profileVerified: profile.profileVerified,
      timeOfBirth: profile.timeOfBirth,
      placeOfBirth: profile.placeOfBirth,
      birthLatLong: profile.birthLatLong as ProfileResponse['birthLatLong'],
      photos: profile.photos.map((p) => ({
        id: p.id,
        url: this.storage.toPublicUrl(p.url),
        isPrimary: p.isPrimary,
        order: p.order,
        createdAt: p.createdAt.toISOString(),
      })),
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }

  private toPublicProfileResponse(
    profile: {
      id: string;
      displayName: string;
      dob: Date;
      gender: string;
      religion: string | null;
      location: unknown;
      education: string | null;
      occupation: string | null;
      bio: string | null;
      preferences: unknown;
      profileVerified: boolean;
      privacyContactVisibleTo: string;
      createdAt: Date;
      updatedAt: Date;
      user: { email: string; phone: string | null; emailVerified: boolean };
      photos: Array<{
        id: string;
        url: string;
        isPrimary: boolean;
        order: number;
        createdAt: Date;
      }>;
    },
    includeContact: boolean,
    isOwn: boolean,
  ): PublicProfileResponse {
    const contact =
      includeContact || isOwn
        ? {
            email: profile.user.email,
            phone: profile.user.phone ?? undefined,
          }
        : undefined;
    return {
      id: profile.id,
      displayName: profile.displayName,
      dob: profile.dob.toISOString().slice(0, 10),
      gender: profile.gender,
      religion: profile.religion,
      location: profile.location as PublicProfileResponse['location'],
      education: profile.education,
      occupation: profile.occupation,
      bio: profile.bio,
      preferences: profile.preferences as PublicProfileResponse['preferences'],
      profileVerified: profile.profileVerified,
      emailVerified: profile.user.emailVerified,
      photos: profile.photos.map((p) => ({
        id: p.id,
        url: this.storage.toPublicUrl(p.url),
        isPrimary: p.isPrimary,
        order: p.order,
        createdAt: p.createdAt.toISOString(),
      })),
      contact,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }

  private toPhotoResponse(photo: {
    id: string;
    url: string;
    isPrimary: boolean;
    order: number;
    createdAt: Date;
  }): ProfilePhotoResponse {
    return {
      id: photo.id,
      url: this.storage.toPublicUrl(photo.url),
      isPrimary: photo.isPrimary,
      order: photo.order,
      createdAt: photo.createdAt.toISOString(),
    };
  }

  /** Stub: whether the user has active premium. Replace when Story 06 is implemented. */
  async isPremiumUser(userId: string): Promise<boolean> {
    return this.subscription.isUserPremium(userId);
  }

  /** Build public profile response from DB profile (with user + photos). Used by shortlist/interest. */
  toPublicProfile(
    profile: {
      id: string;
      userId: string;
      displayName: string;
      dob: Date;
      gender: string;
      religion: string | null;
      location: unknown;
      education: string | null;
      occupation: string | null;
      bio: string | null;
      preferences: unknown;
      profileVerified: boolean;
      privacyContactVisibleTo: string;
      createdAt: Date;
      updatedAt: Date;
      user: { email: string; phone: string | null; emailVerified: boolean };
      photos: Array<{
        id: string;
        url: string;
        isPrimary: boolean;
        order: number;
        createdAt: Date;
      }>;
    },
    viewer: { userId: string; isPremium: boolean } | null,
  ): PublicProfileResponse {
    const isOwnProfile = viewer?.userId === profile.userId;
    const canSeeContact = this.canViewerSeeContact(
      profile.privacyContactVisibleTo as ContactVisibility,
      viewer?.isPremium ?? false,
    );
    return this.toPublicProfileResponse(profile, canSeeContact || isOwnProfile, isOwnProfile);
  }
}
