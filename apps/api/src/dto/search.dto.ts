import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchProfilesQueryDto {
  @ApiPropertyOptional({ minimum: 18, maximum: 100 })
  ageMin?: number;

  @ApiPropertyOptional({ minimum: 18, maximum: 100 })
  ageMax?: number;

  @ApiPropertyOptional({ enum: ['male', 'female', 'other'] })
  gender?: 'male' | 'female' | 'other';

  @ApiPropertyOptional()
  locationCountry?: string;

  @ApiPropertyOptional()
  locationState?: string;

  @ApiPropertyOptional()
  locationCity?: string;

  @ApiPropertyOptional()
  education?: string;

  @ApiPropertyOptional()
  occupation?: string;

  @ApiPropertyOptional()
  religion?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  page?: number;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 50 })
  limit?: number;
}
