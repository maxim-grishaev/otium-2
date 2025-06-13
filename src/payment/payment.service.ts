import { Injectable } from '@nestjs/common';
import { Subscription } from 'rxjs';
import { SubscriptionStatus } from 'src/db/schema';

@Injectable()
export class PaymentService {
  public async process({
    amount,
    currency,
    token,
  }: {
    amount: number;
    currency: string;
    token: string;
  }): Promise<{
    success: boolean;
    status: string;
    message: string;
  }> {
    console.log(
      `Mocking payment for ${amount} ${currency} with token: ${token}`,
    );
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
    if (token === 'SUCCESS_TOKEN') {
      return {
        success: true,
        status: 'ok',
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
  }
}
