import { ApiProperty } from '@nestjs/swagger';

export class AddShortlistDto {
  @ApiProperty({ description: 'Profile UUID to add to shortlist' })
  profileId!: string;
}
