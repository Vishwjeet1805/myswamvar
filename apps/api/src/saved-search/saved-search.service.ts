import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { SavedSearchResponse } from '@matrimony/shared';
import {
  createSavedSearchBodySchema,
  updateSavedSearchBodySchema,
} from '@matrimony/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavedSearchService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, body: unknown): Promise<SavedSearchResponse> {
    const parsed = createSavedSearchBodySchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('; ');
      throw new BadRequestException(msg);
    }
    const { name, filters, notify } = parsed.data;
    const saved = await this.prisma.savedSearch.create({
      data: { userId, name, filters: filters as object, notify },
    });
    return this.toResponse(saved);
  }

  async list(userId: string): Promise<SavedSearchResponse[]> {
    const list = await this.prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((s) => this.toResponse(s));
  }

  async getById(userId: string, id: string): Promise<SavedSearchResponse> {
    const saved = await this.prisma.savedSearch.findFirst({
      where: { id, userId },
    });
    if (!saved) {
      throw new NotFoundException('Saved search not found');
    }
    return this.toResponse(saved);
  }

  async update(
    userId: string,
    id: string,
    body: unknown,
  ): Promise<SavedSearchResponse> {
    const parsed = updateSavedSearchBodySchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('; ');
      throw new BadRequestException(msg);
    }
    const existing = await this.prisma.savedSearch.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException('Saved search not found');
    }
    const data: { name?: string; filters?: object; notify?: boolean } = {};
    if (parsed.data.name !== undefined) data.name = parsed.data.name;
    if (parsed.data.filters !== undefined) data.filters = parsed.data.filters as object;
    if (parsed.data.notify !== undefined) data.notify = parsed.data.notify;
    const updated = await this.prisma.savedSearch.update({
      where: { id },
      data,
    });
    return this.toResponse(updated);
  }

  async delete(userId: string, id: string): Promise<{ message: string }> {
    const existing = await this.prisma.savedSearch.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException('Saved search not found');
    }
    await this.prisma.savedSearch.delete({ where: { id } });
    return { message: 'Saved search deleted.' };
  }

  private toResponse(row: {
    id: string;
    name: string;
    filters: unknown;
    notify: boolean;
    createdAt: Date;
  }): SavedSearchResponse {
    return {
      id: row.id,
      name: row.name,
      filters: row.filters as SavedSearchResponse['filters'],
      notify: row.notify,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
