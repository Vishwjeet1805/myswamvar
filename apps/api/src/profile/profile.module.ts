import { Module } from '@nestjs/common';
import { HoroscopeModule } from '../horoscope/horoscope.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [HoroscopeModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
