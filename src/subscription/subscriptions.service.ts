import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { DB_CONNECTION, type DbClient } from '../db/db.module';
import {
  subscriptionPlans,
  type DbRawSubscriptionPlan,
  subscriptions,
  type DbRawSubscription,
  SubscriptionStatus,
  SubscriptionPlanBillingCycle,
} from '../db/schema';
import type { SelectPlanDto } from '../dto/SelectPlanDto';
import { PaymentService } from '../payment/payment.service';
import { getNextBillingDate } from 'src/lib/getNextBillingDate';

@Injectable()
export class SubscriptionsService {
  constructor(
    @Inject(DB_CONNECTION) private db: DbClient,
    @Inject(PaymentService) private payment: PaymentService,
  ) {}

  async getAvailablePlans(): Promise<DbRawSubscriptionPlan[]> {
    return this.db.query.subscriptionPlans.findMany({
      where: eq(subscriptionPlans.isActive, true),
    });
  }

  async selectPlan(
    userId: string,
    selectPlanDto: SelectPlanDto,
  ): Promise<{
    message: string;
    subscription: DbRawSubscription;
    paymentStatus: string;
  }> {
    const { planId, paymentMethodToken } = selectPlanDto;

    // 1. Verify Plan exists and is active
    const plan = await this.db.query.subscriptionPlans.findFirst({
      where: eq(subscriptionPlans.id, planId),
    });
    if (!plan?.isActive) {
      throw new NotFoundException(
        `Subscription plan '${planId}' not found or is not active.`,
      );
    }

    // 2. Payment Processing
    const paymentResult = await this.payment.process({
      amount: plan.priceAmount,
      currency: plan.priceCurrency,
      token: paymentMethodToken,
    });
    if (!paymentResult.success) {
      throw new BadRequestException(`Payment failed: ${paymentResult.message}`);
    }

    // 3. Check if user already has an active subscription
    const existingSubscription = await this.db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, SubscriptionStatus.Active),
      ),
    });

    if (existingSubscription) {
      // In a real scenario, you'd handle upgrades/downgrades here.
      // For simplicity, we'll prevent a new subscription if active.
      throw new ConflictException(
        'Upgrade NOT IMPLEMENTED. User already has an active subscription. ',
      );
    }

    // 4. Create new subscription record
    const startDate = new Date();
    const nextBillingDate = getNextBillingDate(plan.billingCycle, startDate);
    if (!nextBillingDate) {
      throw new BadRequestException('Invalid billing cycle for plan.');
    }

    const newSubscription = await this.db
      .insert(subscriptions)
      .values({
        id: uuidv4(),
        userId: userId,
        planId: planId,
        status: SubscriptionStatus.Active,
        startDate: startDate,
        nextBillingDate: nextBillingDate,
      })
      .returning()
      .execute();

    return {
      message: 'Subscription created successfully!',
      subscription: newSubscription[0],
      paymentStatus: paymentResult.status,
    };
  }

  async cancelSubscription(userId: string) {
    const existingSubscription = await this.db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, SubscriptionStatus.Active),
      ),
    });

    if (!existingSubscription) {
      throw new NotFoundException(
        `Subscription not found for user with ID ${userId}.`,
      );
    }

    const updateSub: Partial<DbRawSubscription> = {
      // Should be handles separately in "cron job" working on daily basis
      // status: SubscriptionStatus.Canceled,
      endDate: existingSubscription.nextBillingDate,
      nextBillingDate: null,
    };
    await this.db
      .update(subscriptions)
      .set(updateSub)
      .where(eq(subscriptions.id, existingSubscription.id))
      .execute();

    return {
      ...existingSubscription,
      ...updateSub,
    };
  }

  async getSubscription(userId: string) {
    return await this.db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
    });
  }
}
