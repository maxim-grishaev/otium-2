import * as schema from './schema';
import * as dotenv from 'dotenv';
import { createDbClient } from './createDbClient';

dotenv.config();
const PLANS = [
  {
    id: 'premium-monthly',
    name: 'Premium Monthly',
    description: 'Monthly access to exclusive benefits.',
    priceAmount: 9.99,
    priceCurrency: 'EUR',
    billingCycle: 'monthly',
    isActive: true,
  },
  {
    id: 'premium-annual',
    name: 'Premium Annual',
    description: 'Annual access with a discount!',
    priceAmount: 99.99,
    priceCurrency: 'EUR',
    billingCycle: 'annually',
    isActive: true,
  },
  {
    id: 'basic-monthly',
    name: 'Basic Monthly',
    description: 'Essential benefits for a budget price.',
    priceAmount: 4.99,
    priceCurrency: 'EUR',
    billingCycle: 'monthly',
    isActive: false, // Example of an inactive plan
  },
];

async function seed() {
  const db = createDbClient();

  console.log('--- Starting Seed ---');
  // Clear existing plans (optional, for development)
  await db
    .delete(schema.subscriptionPlans)
    .then(() => db.insert(schema.subscriptionPlans).values(PLANS))
    .then(() => console.log('Subscription plans seeded successfully!'))
    .catch((error) => console.error('Seed failed:', error))
    .finally(() => db.$client.end());
}

seed();
