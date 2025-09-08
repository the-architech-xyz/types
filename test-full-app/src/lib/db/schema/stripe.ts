import { pgTable, text, timestamp, decimal, boolean, jsonb, varchar, integer } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

// Customers table
export const customers = pgTable('customers', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  stripeCustomerId: text('stripe_customer_id').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  phone: text('phone'),
  address: jsonb('address'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Payments table
export const payments = pgTable('payments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  stripePaymentIntentId: text('stripe_payment_intent_id').notNull().unique(),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('usd'),
  status: varchar('status', { length: 20 }).notNull(),
  description: text('description'),
  metadata: jsonb('metadata'),
  receiptUrl: text('receipt_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  stripePriceId: text('stripe_price_id').notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  canceledAt: timestamp('canceled_at'),
  trialStart: timestamp('trial_start'),
  trialEnd: timestamp('trial_end'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Invoices table
export const invoices = pgTable('invoices', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  stripeInvoiceId: text('stripe_invoice_id').notNull().unique(),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  stripeSubscriptionId: text('stripe_subscription_id'),
  amountPaid: decimal('amount_paid', { precision: 10, scale: 2 }),
  amountDue: decimal('amount_due', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('usd'),
  status: varchar('status', { length: 20 }).notNull(),
  number: text('number'),
  description: text('description'),
  hostedInvoiceUrl: text('hosted_invoice_url'),
  invoicePdf: text('invoice_pdf'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Webhook events table
export const webhookEvents = pgTable('webhook_events', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  stripeEventId: text('stripe_event_id').notNull().unique(),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  processed: boolean('processed').default(false),
  processingError: text('processing_error'),
  eventData: jsonb('event_data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Refunds table
export const refunds = pgTable('refunds', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  stripeRefundId: text('stripe_refund_id').notNull().unique(),
  stripePaymentIntentId: text('stripe_payment_intent_id').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('usd'),
  reason: varchar('reason', { length: 20 }),
  status: varchar('status', { length: 20 }).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Relations
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type NewWebhookEvent = typeof webhookEvents.$inferInsert;
export type Refund = typeof refunds.$inferSelect;
export type NewRefund = typeof refunds.$inferInsert;
