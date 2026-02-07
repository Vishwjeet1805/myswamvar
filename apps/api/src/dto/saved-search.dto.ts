import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SavedSearchFiltersDto {
  @ApiPropertyOptional()
  ageMin?: number;
  @ApiPropertyOptional()
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
}

export class CreateSavedSearchDto {
  @ApiProperty({ example: 'My search', maxLength: 100 })
  name!: string;

  @ApiProperty({ description: 'Search filters' })
  filters!: SavedSearchFiltersDto;

  @ApiPropertyOptional({ default: false, description: 'Notify on new matches' })
  notify?: boolean;
}

export class UpdateSavedSearchDto {
  @ApiPropertyOptional()
  name?: string;
  @ApiPropertyOptional()
  filters?: SavedSearchFiltersDto;
  @ApiPropertyOptional()
  notify?: boolean;
}
