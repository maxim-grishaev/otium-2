import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { DB_CONNECTION, type DbClient } from '../db/db.module'; // Changed from PG_CONNECTION
import {
  subscriptionPlans,
  type SubscriptionPlan,
  subscriptions,
  type Subscription,
} from '../db/schema';
import type { SelectPlanDto } from '../dto/SelectPlanDto';

@Injectable()
export class SubscriptionsService {
  constructor(@Inject(DB_CONNECTION) private db: DbClient) {}

  async getAvailablePlans(): Promise<SubscriptionPlan[]> {
    return this.db.query.subscriptionPlans.findMany({
      where: eq(subscriptionPlans.isActive, true),
    });
  }

  async selectPlan(
    userId: string,
    selectPlanDto: SelectPlanDto,
  ): Promise<{
    message: string;
    subscription: Omit<Subscription, 'passwordHash'>;
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

    // 2. Mock Payment Processing
    const paymentResult = await processMockPayment(
      plan.priceAmount,
      plan.priceCurrency,
      paymentMethodToken,
    );
    if (!paymentResult.success) {
      throw new BadRequestException(`Payment failed: ${paymentResult.message}`);
    }

    // 3. Check if user already has an active subscription
    const existingSubscription = await this.db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, userId),
        // And the status is 'active'
        eq(subscriptions.status, 'active'),
      ),
    });

    if (existingSubscription) {
      // In a real scenario, you'd handle upgrades/downgrades here.
      // For simplicity, we'll prevent a new subscription if active.
      throw new ConflictException('User already has an active subscription.');
    }

    // 4. Create new subscription record
    const newSubscriptionId = uuidv4();
    const startDate = new Date();
    let nextBillingDate: Date;

    if (plan.billingCycle === 'monthly') {
      nextBillingDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        startDate.getDate(),
      );
    } else if (plan.billingCycle === 'annually') {
      nextBillingDate = new Date(
        startDate.getFullYear() + 1,
        startDate.getMonth(),
        startDate.getDate(),
      );
    } else {
      throw new BadRequestException('Invalid billing cycle for plan.');
    }

    const newSubscription = await this.db
      .insert(subscriptions)
      .values({
        id: newSubscriptionId,
        userId: userId,
        planId: planId,
        status: 'active',
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
}

const processMockPayment = async (
  amount: number,
  currency: string,
  token: string,
): Promise<{
  success: boolean;
  status: string;
  message: string;
}> => {
  console.log(`Mocking payment for ${amount} ${currency} with token: ${token}`);
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
  if (token === 'SUCCESS_TOKEN') {
    return {
      success: true,
      status: 'approved',
      message: 'Payment approved by mock gateway.',
    };
  }
  if (token === 'FAIL_TOKEN') {
    return {
      success: false,
      status: 'declined',
      message: 'Payment declined by mock gateway.',
    };
  }
  return {
    success: false,
    status: 'invalid_token',
    message: 'Invalid payment token provided.',
  };
};
