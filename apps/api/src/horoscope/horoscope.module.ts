import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { HoroscopeService } from './horoscope.service';

@Module({
  imports: [PrismaModule],
  providers: [HoroscopeService],
  exports: [HoroscopeService],
})
export class HoroscopeModule {}
