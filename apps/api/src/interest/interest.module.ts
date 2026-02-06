import { Module } from '@nestjs/common';
import { ProfileModule } from '../profile/profile.module';
import { InterestController } from './interest.controller';
import { InterestService } from './interest.service';

@Module({
  imports: [ProfileModule],
  controllers: [InterestController],
  providers: [InterestService],
})
export class InterestModule {}
