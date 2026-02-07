import { ApiProperty } from '@nestjs/swagger';

export class SendInterestDto {
  @ApiProperty({ description: 'Profile UUID to send interest to' })
  profileId!: string;
}
