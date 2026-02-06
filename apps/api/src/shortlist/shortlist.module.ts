import { Module } from '@nestjs/common';
import { ProfileModule } from '../profile/profile.module';
import { ShortlistController } from './shortlist.controller';
import { ShortlistService } from './shortlist.service';

@Module({
  imports: [ProfileModule],
  controllers: [ShortlistController],
  providers: [ShortlistService],
})
export class ShortlistModule {}
