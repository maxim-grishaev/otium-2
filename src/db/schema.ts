// src/db/schema.ts
import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  doublePrecision,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey().notNull(), // UUID
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(), // Hashed password
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(), // Use defaultNow for PostgreSQL timestamp
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export type DbRawUser = typeof users.$inferSelect;

// Subscription Plans table
export const subscriptionPlans = pgTable('subscription_plans', {
  id: varchar('id', { length: 255 }).primaryKey().notNull(), // e.g., 'premium-monthly', 'premium-annual'
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  priceAmount: doublePrecision('price_amount').notNull(),
  priceCurrency: varchar('price_currency', { length: 3 }).notNull(), // e.g., 'EUR'
  billingCycle: varchar('billing_cycle', { length: 50 }).notNull(), // e.g., 'monthly', 'annually'
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export type DbRawSubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export enum SubscriptionPlanBillingCycle {
  Monthly = 'monthly',
  Annually = 'annually',
}

// Subscriptions table (linking users to plans)
export const subscriptions = pgTable('subscriptions', {
  id: varchar('id', { length: 255 }).primaryKey().notNull(), // UUID
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.id),
  planId: varchar('plan_id', { length: 255 })
    .notNull()
    .references(() => subscriptionPlans.id),
  status: varchar('status', { length: 50 }).notNull(), // e.g., 'active', 'pending', 'cancelled', 'trial'
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'), // Null for active, filled on cancellation/expiry
  nextBillingDate: timestamp('next_billing_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export type DbRawSubscription = typeof subscriptions.$inferSelect;
export enum SubscriptionStatus {
  Active = 'active',
  Pending = 'pending',
  Canceled = 'canceled',
}

// Relations for Drizzle (optional but good practice)
export const usersRelations = relations(users, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [subscriptions.planId],
    references: [subscriptionPlans.id],
  }),
}));
