import { SubscriptionPlanBillingCycle } from '../db/schema';

export const getNextBillingDate = (billingCycle: string, startDate: Date) => {
  switch (billingCycle) {
    case SubscriptionPlanBillingCycle.Monthly:
      return new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        startDate.getDate(),
      );
    case SubscriptionPlanBillingCycle.Annually:
      return new Date(
        startDate.getFullYear() + 1,
        startDate.getMonth(),
        startDate.getDate(),
      );
  }
};
