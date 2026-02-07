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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { UserResponse } from '@matrimony/shared';
import { CreateSavedSearchDto, UpdateSavedSearchDto } from '../dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SavedSearchService } from './saved-search.service';

@ApiTags('saved-searches')
@Controller('saved-searches')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class SavedSearchController {
  constructor(private readonly savedSearch: SavedSearchService) {}

  @Post()
  @ApiOperation({ summary: 'Create saved search', description: 'Create a new saved search with filters.' })
  @ApiBody({ type: CreateSavedSearchDto })
  @ApiResponse({ status: 201, description: 'Saved search created.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create(
    @Req() req: { user: UserResponse },
    @Body() body: unknown,
  ) {
    return this.savedSearch.create(req.user.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'List saved searches', description: 'List current user saved searches.' })
  @ApiResponse({ status: 200, description: 'List of saved searches.' })
  async list(@Req() req: { user: UserResponse }) {
    return this.savedSearch.list(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get saved search', description: 'Get a saved search by ID.' })
  @ApiParam({ name: 'id', description: 'Saved search ID' })
  @ApiResponse({ status: 200, description: 'Saved search.' })
  @ApiResponse({ status: 404, description: 'Not found.' })
  async getById(
    @Req() req: { user: UserResponse },
    @Param('id') id: string,
  ) {
    return this.savedSearch.getById(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update saved search', description: 'Update a saved search.' })
  @ApiParam({ name: 'id', description: 'Saved search ID' })
  @ApiBody({ type: UpdateSavedSearchDto })
  @ApiResponse({ status: 200, description: 'Saved search updated.' })
  async update(
    @Req() req: { user: UserResponse },
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.savedSearch.update(req.user.id, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete saved search', description: 'Delete a saved search.' })
  @ApiParam({ name: 'id', description: 'Saved search ID' })
  @ApiResponse({ status: 200, description: 'Saved search deleted.' })
  async delete(
    @Req() req: { user: UserResponse },
    @Param('id') id: string,
  ) {
    return this.savedSearch.delete(req.user.id, id);
  }
}
