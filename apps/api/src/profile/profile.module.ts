import { Module } from '@nestjs/common';
import { HoroscopeModule } from '../horoscope/horoscope.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [HoroscopeModule, SubscriptionModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
