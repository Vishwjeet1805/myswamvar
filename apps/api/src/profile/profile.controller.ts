import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { UserResponse } from '@matrimony/shared';
import { CreateProfileDto, UpdateProfileDto } from '../dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt.guard';
import { HoroscopeService } from '../horoscope/horoscope.service';
import { ProfileService } from './profile.service';

@ApiTags('profiles')
@Controller('profiles')
export class ProfileController {
  constructor(
    private readonly profile: ProfileService,
    private readonly horoscope: HoroscopeService,
  ) {}

  @Get('search')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Search profiles', description: 'Search with filters. Optional JWT for premium features.' })
  @ApiQuery({ name: 'ageMin', required: false, type: Number })
  @ApiQuery({ name: 'ageMax', required: false, type: Number })
  @ApiQuery({ name: 'gender', required: false, enum: ['male', 'female', 'other'] })
  @ApiQuery({ name: 'locationCountry', required: false })
  @ApiQuery({ name: 'locationState', required: false })
  @ApiQuery({ name: 'locationCity', required: false })
  @ApiQuery({ name: 'education', required: false })
  @ApiQuery({ name: 'occupation', required: false })
  @ApiQuery({ name: 'religion', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of public profiles.' })
  async searchProfiles(
    @Query() query: Record<string, string>,
    @Req() req: { user?: UserResponse },
  ) {
    const viewer = req.user
      ? {
          userId: req.user.id,
          isPremium: await this.profile.isPremiumUser(req.user.id),
        }
      : null;
    return this.profile.searchProfiles(query, viewer);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get my profile', description: 'Get the authenticated user\'s full profile.' })
  @ApiResponse({ status: 200, description: 'Own profile or null if not created.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getMyProfile(@Req() req: { user: UserResponse }) {
    const profile = await this.profile.getMyProfile(req.user.id);
    if (!profile) {
      return null;
    }
    return profile;
  }

  @Post('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create profile', description: 'Create the authenticated user\'s profile.' })
  @ApiBody({ type: CreateProfileDto })
  @ApiResponse({ status: 201, description: 'Profile created.' })
  @ApiResponse({ status: 400, description: 'Validation error.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async createProfile(
    @Req() req: { user: UserResponse },
    @Body() body: unknown,
  ) {
    return this.profile.createProfile(req.user.id, body);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update profile', description: 'Update the authenticated user\'s profile.' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Profile updated.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updateProfile(
    @Req() req: { user: UserResponse },
    @Body() body: unknown,
  ) {
    return this.profile.updateProfile(req.user.id, body);
  }

  @Post('me/photos')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Add photo', description: 'Upload a profile photo (multipart/form-data, field: file).' })
  @ApiResponse({ status: 201, description: 'Photo added.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async addPhoto(@Req() req: { user: UserResponse; file?: Express.Multer.File }) {
    return this.profile.addPhoto(req.user.id, req.file!);
  }

  @Patch('me/photos/:id/primary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Set primary photo', description: 'Set a photo as the primary profile photo.' })
  @ApiParam({ name: 'id', description: 'Photo ID' })
  @ApiResponse({ status: 200, description: 'Primary photo updated.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async setPrimaryPhoto(
    @Req() req: { user: UserResponse },
    @Param('id') photoId: string,
  ) {
    return this.profile.setPrimaryPhoto(req.user.id, photoId);
  }

  @Delete('me/photos/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete photo', description: 'Remove a profile photo.' })
  @ApiParam({ name: 'id', description: 'Photo ID' })
  @ApiResponse({ status: 200, description: 'Photo deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async deletePhoto(
    @Req() req: { user: UserResponse },
    @Param('id') photoId: string,
  ) {
    return this.profile.deletePhoto(req.user.id, photoId);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get profile by ID', description: 'Get a public profile by ID. Optional JWT for contact visibility.' })
  @ApiParam({ name: 'id', description: 'Profile ID' })
  @ApiResponse({ status: 200, description: 'Public profile.' })
  @ApiResponse({ status: 404, description: 'Profile not found.' })
  async getProfileById(
    @Param('id') profileId: string,
    @Req() req: { user?: UserResponse },
  ) {
    const viewer = req.user
      ? {
          userId: req.user.id,
          isPremium: await this.profile.isPremiumUser(req.user.id),
        }
      : null;
    const profile = await this.profile.getProfileById(profileId, viewer);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }


  @Get(':id/horoscope-match')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Horoscope match', description: 'Get horoscope match between current user and profile.' })
  @ApiParam({ name: 'id', description: 'Profile ID' })
  @ApiResponse({ status: 200, description: 'Horoscope match result.' })
  @ApiResponse({ status: 404, description: 'Profile or match not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getHoroscopeMatch(
    @Param('id') profileId: string,
    @Req() req: { user: UserResponse },
  ) {
    const viewerProfile = await this.profile.getMyProfile(req.user.id);
    if (!viewerProfile) {
      throw new NotFoundException('Your profile not found');
    }
    const match = await this.horoscope.getMatch(viewerProfile.id, profileId);
    if (!match) {
      throw new NotFoundException(
        'Horoscope match not available. Both profiles need complete birth details.',
      );
    }
    return match;
  }

  @Get(':id/contact')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get contact', description: 'Get contact info for a profile (subject to visibility rules).' })
  @ApiParam({ name: 'id', description: 'Profile ID' })
  @ApiResponse({ status: 200, description: 'Contact info if allowed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getContact(
    @Param('id') profileId: string,
    @Req() req: { user: UserResponse },
  ) {
    return this.profile.getContactForProfile(profileId, req.user.id);
  }
}
