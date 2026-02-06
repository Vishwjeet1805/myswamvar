import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { HoroscopeModule } from './horoscope/horoscope.module';
import { InterestModule } from './interest/interest.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';
import { RedisModule } from './redis/redis.module';
import { SavedSearchModule } from './saved-search/saved-search.module';
import { ShortlistModule } from './shortlist/shortlist.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    StorageModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 60000,
        limit: 100,
      },
    ]),
    AuthModule,
    ProfileModule,
    HoroscopeModule,
    ShortlistModule,
    InterestModule,
    SavedSearchModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
