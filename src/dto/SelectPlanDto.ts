import { IsNotEmpty, IsString } from 'class-validator';

export class SelectPlanDto {
  @IsNotEmpty()
  @IsString()
  planId: string;

  @IsNotEmpty()
  @IsString()
  // In a real app, this would be a token from a payment gateway (e.g., Stripe's token)
  // For mock purposes, it can be any string.
  paymentMethodToken: string;
}
