import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ example: 'Hello!', maxLength: 2000, description: 'Message content' })
  content!: string;
}
