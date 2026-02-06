import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { UserResponse } from '@matrimony/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SavedSearchService } from './saved-search.service';

@Controller('saved-searches')
@UseGuards(JwtAuthGuard)
export class SavedSearchController {
  constructor(private readonly savedSearch: SavedSearchService) {}

  @Post()
  async create(
    @Req() req: { user: UserResponse },
    @Body() body: unknown,
  ) {
    return this.savedSearch.create(req.user.id, body);
  }

  @Get()
  async list(@Req() req: { user: UserResponse }) {
    return this.savedSearch.list(req.user.id);
  }

  @Get(':id')
  async getById(
    @Req() req: { user: UserResponse },
    @Param('id') id: string,
  ) {
    return this.savedSearch.getById(req.user.id, id);
  }

  @Patch(':id')
  async update(
    @Req() req: { user: UserResponse },
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.savedSearch.update(req.user.id, id, body);
  }

  @Delete(':id')
  async delete(
    @Req() req: { user: UserResponse },
    @Param('id') id: string,
  ) {
    return this.savedSearch.delete(req.user.id, id);
  }
}
