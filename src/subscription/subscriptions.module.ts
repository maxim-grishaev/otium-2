import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { DbModule } from '../db/db.module';
import { UsersModule } from '../user/users.module';
import { PaymentService } from '../payment/payment.service';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports: [DbModule, UsersModule, PassportModule, PaymentModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, PaymentService],
})
export class SubscriptionsModule {}
