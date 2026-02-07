import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  email!: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Phone (E.164-like)' })
  phone?: string;

  @ApiProperty({ example: 'securePassword123', minLength: 8, description: 'Password (min 8 characters)' })
  password!: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'password', description: 'User password' })
  password!: string;
}

export class RefreshDto {
  @ApiProperty({ description: 'JWT refresh token' })
  refreshToken!: string;
}

export class LogoutBodyDto {
  @ApiPropertyOptional({ description: 'Optional refresh token to invalidate' })
  refreshToken?: string;
}
