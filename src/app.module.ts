import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './user/users.module';
import { SubscriptionsModule } from './subscription/subscriptions.module';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module'; // Import AuthModule

@Module({
  imports: [
    // Makes the ConfigModule available globally
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    UsersModule,
    AuthModule,
    SubscriptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
