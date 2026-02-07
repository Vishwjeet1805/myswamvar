import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class LocationDto {
  @ApiPropertyOptional()
  city?: string;
  @ApiPropertyOptional()
  state?: string;
  @ApiPropertyOptional()
  country?: string;
}

class PreferencesDto {
  @ApiPropertyOptional()
  minAge?: number;
  @ApiPropertyOptional()
  maxAge?: number;
  @ApiPropertyOptional()
  maritalStatus?: string;
  @ApiPropertyOptional()
  religion?: string;
  @ApiPropertyOptional()
  caste?: string;
  @ApiPropertyOptional()
  motherTongue?: string;
  @ApiPropertyOptional()
  country?: string;
  @ApiPropertyOptional()
  state?: string;
}

class BirthLatLongDto {
  @ApiProperty()
  lat!: number;
  @ApiProperty()
  lng!: number;
}

export class CreateProfileDto {
  @ApiProperty({ example: 'John Doe', maxLength: 100 })
  displayName!: string;

  @ApiProperty({ example: '1990-01-15', description: 'YYYY-MM-DD' })
  dob!: string;

  @ApiProperty({ enum: ['male', 'female', 'other'] })
  gender!: 'male' | 'female' | 'other';

  @ApiPropertyOptional()
  location?: LocationDto;

  @ApiPropertyOptional()
  religion?: string;

  @ApiPropertyOptional()
  education?: string;

  @ApiPropertyOptional()
  occupation?: string;

  @ApiPropertyOptional()
  bio?: string;

  @ApiPropertyOptional()
  preferences?: PreferencesDto;

  @ApiPropertyOptional({ enum: ['all', 'premium', 'none'] })
  privacyContactVisibleTo?: 'all' | 'premium' | 'none';

  @ApiPropertyOptional({ example: '14:30', description: 'HH:MM' })
  timeOfBirth?: string;

  @ApiPropertyOptional()
  placeOfBirth?: string;

  @ApiPropertyOptional()
  birthLatLong?: BirthLatLongDto;
}

export class UpdateProfileDto {
  @ApiPropertyOptional()
  displayName?: string;
  @ApiPropertyOptional()
  dob?: string;
  @ApiPropertyOptional()
  gender?: 'male' | 'female' | 'other';
  @ApiPropertyOptional()
  location?: LocationDto;
  @ApiPropertyOptional()
  religion?: string;
  @ApiPropertyOptional()
  education?: string;
  @ApiPropertyOptional()
  occupation?: string;
  @ApiPropertyOptional()
  bio?: string;
  @ApiPropertyOptional()
  preferences?: PreferencesDto;
  @ApiPropertyOptional()
  privacyContactVisibleTo?: 'all' | 'premium' | 'none';
  @ApiPropertyOptional()
  timeOfBirth?: string;
  @ApiPropertyOptional()
  placeOfBirth?: string;
  @ApiPropertyOptional()
  birthLatLong?: BirthLatLongDto;
}
