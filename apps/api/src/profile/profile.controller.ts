import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { UserResponse } from '@matrimony/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt.guard';
import { ProfileService } from './profile.service';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@Req() req: { user: UserResponse }) {
    const profile = await this.profile.getMyProfile(req.user.id);
    if (!profile) {
      return null;
    }
    return profile;
  }

  @Post('me')
  @UseGuards(JwtAuthGuard)
  async createProfile(
    @Req() req: { user: UserResponse },
    @Body() body: unknown,
  ) {
    return this.profile.createProfile(req.user.id, body);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Req() req: { user: UserResponse },
    @Body() body: unknown,
  ) {
    return this.profile.updateProfile(req.user.id, body);
  }

  @Post('me/photos')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async addPhoto(@Req() req: { user: UserResponse; file?: Express.Multer.File }) {
    return this.profile.addPhoto(req.user.id, req.file!);
  }

  @Patch('me/photos/:id/primary')
  @UseGuards(JwtAuthGuard)
  async setPrimaryPhoto(
    @Req() req: { user: UserResponse },
    @Param('id') photoId: string,
  ) {
    return this.profile.setPrimaryPhoto(req.user.id, photoId);
  }

  @Delete('me/photos/:id')
  @UseGuards(JwtAuthGuard)
  async deletePhoto(
    @Req() req: { user: UserResponse },
    @Param('id') photoId: string,
  ) {
    return this.profile.deletePhoto(req.user.id, photoId);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async getProfileById(
    @Param('id') profileId: string,
    @Req() req: { user?: UserResponse },
  ) {
    const viewer = req.user
      ? {
          userId: req.user.id,
          isPremium: this.profile.isPremiumUser(req.user.id),
        }
      : null;
    const profile = await this.profile.getProfileById(profileId, viewer);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }
}
