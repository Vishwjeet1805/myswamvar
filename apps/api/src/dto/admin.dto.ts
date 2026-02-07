import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminVerifyProfileDto {
  @ApiProperty({ description: 'Whether the profile is verified' })
  verified!: boolean;

  @ApiPropertyOptional({ maxLength: 2000, description: 'Verification notes' })
  notes?: string;
}
