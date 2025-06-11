import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { DbModule } from '../db/db.module';
import { UsersModule } from '../user/users.module'; // Ensure UsersModule is imported for the schema relations
import { PassportModule } from '@nestjs/passport'; // Needed for AuthGuard

@Module({
  imports: [DbModule, UsersModule, PassportModule], // DbModule for Drizzle, UsersModule for schema relations, PassportModule for AuthGuard
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
})
export class SubscriptionsModule {}
