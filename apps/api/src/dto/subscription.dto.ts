import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckoutDto {
  @ApiProperty({ description: 'Plan UUID' })
  planId!: string;

  @ApiPropertyOptional({ description: 'URL to redirect after successful checkout' })
  successUrl?: string;

  @ApiPropertyOptional({ description: 'URL to redirect if checkout is cancelled' })
  cancelUrl?: string;
}
