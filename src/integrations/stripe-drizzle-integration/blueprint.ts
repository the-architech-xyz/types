import { Blueprint } from '../../types/adapter.js';

export const blueprint: Blueprint = {
  id: 'stripe-drizzle-integration',
  name: 'Stripe Drizzle Integration',
  description: 'Complete Drizzle ORM integration for Stripe',
  version: '1.0.0',
  actions: [
    // Stripe Database Schema
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/db/schema/stripe.ts',
      content: `import { pgTable, text, timestamp, decimal, boolean, jsonb, varchar, integer } from 'drizzle-orm/pg-core';
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
`,
      condition: '{{#if integration.features.paymentSchema}}'
    },

    // Database Migrations
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/db/migrations/stripe.sql',
      content: `-- Stripe Integration Database Migrations

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_customer_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  address JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_payment_intent_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'usd',
  status VARCHAR(20) NOT NULL,
  description TEXT,
  metadata JSONB,
  receipt_url TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  status VARCHAR(20) NOT NULL,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP,
  trial_start TIMESTAMP,
  trial_end TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_invoice_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT,
  amount_paid DECIMAL(10,2),
  amount_due DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'usd',
  status VARCHAR(20) NOT NULL,
  number TEXT,
  description TEXT,
  hosted_invoice_url TEXT,
  invoice_pdf TEXT,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create webhook events table
CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type VARCHAR(50) NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processing_error TEXT,
  event_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create refunds table
CREATE TABLE IF NOT EXISTS refunds (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_refund_id TEXT NOT NULL UNIQUE,
  stripe_payment_intent_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'usd',
  reason VARCHAR(20),
  status VARCHAR(20) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_stripe_customer_id ON customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_customer_id ON payments(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_customer_id ON invoices(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_event_id ON webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_refunds_stripe_refund_id ON refunds(stripe_refund_id);
CREATE INDEX IF NOT EXISTS idx_refunds_stripe_payment_intent_id ON refunds(stripe_payment_intent_id);
`,
      condition: '{{#if integration.features.migrations}}'
    },

    // Stripe Drizzle Adapter
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/stripe/drizzle-adapter.ts',
      content: `import { db } from '@/lib/db';
import { 
  customers, 
  payments, 
  subscriptions, 
  invoices, 
  refunds,
  type Customer,
  type Payment,
  type Subscription,
  type Invoice,
  type Refund
} from '@/lib/db/schema/stripe';
import { eq, and, desc } from 'drizzle-orm';

export class StripeDrizzleAdapter {
  // Customer operations
  async createCustomer(stripeCustomerId: string, email: string, data?: Partial<Customer>) {
    const [customer] = await db.insert(customers).values({
      stripeCustomerId,
      email,
      ...data
    }).returning();
    return customer;
  }

  async getCustomerByStripeId(stripeCustomerId: string) {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.stripeCustomerId, stripeCustomerId))
      .limit(1);
    return customer;
  }

  async updateCustomer(stripeCustomerId: string, data: Partial<Customer>) {
    const [customer] = await db
      .update(customers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customers.stripeCustomerId, stripeCustomerId))
      .returning();
    return customer;
  }

  // Payment operations
  async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) {
    const [payment] = await db.insert(payments).values({
      ...paymentData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return payment;
  }

  async updatePaymentStatus(stripePaymentIntentId: string, status: string, receiptUrl?: string) {
    const [payment] = await db
      .update(payments)
      .set({ 
        status, 
        receiptUrl,
        updatedAt: new Date() 
      })
      .where(eq(payments.stripePaymentIntentId, stripePaymentIntentId))
      .returning();
    return payment;
  }

  async getPaymentsByCustomer(stripeCustomerId: string, limit = 50) {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.stripeCustomerId, stripeCustomerId))
      .orderBy(desc(payments.createdAt))
      .limit(limit);
  }

  // Subscription operations
  async createSubscription(subscriptionData: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) {
    const [subscription] = await db.insert(subscriptions).values({
      ...subscriptionData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return subscription;
  }

  async updateSubscription(stripeSubscriptionId: string, data: Partial<Subscription>) {
    const [subscription] = await db
      .update(subscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
      .returning();
    return subscription;
  }

  async getSubscriptionsByCustomer(stripeCustomerId: string) {
    return await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeCustomerId, stripeCustomerId))
      .orderBy(desc(subscriptions.createdAt));
  }

  async cancelSubscription(stripeSubscriptionId: string, canceledAt: Date) {
    const [subscription] = await db
      .update(subscriptions)
      .set({ 
        status: 'canceled',
        canceledAt,
        updatedAt: new Date() 
      })
      .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
      .returning();
    return subscription;
  }

  // Invoice operations
  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) {
    const [invoice] = await db.insert(invoices).values({
      ...invoiceData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return invoice;
  }

  async updateInvoiceStatus(stripeInvoiceId: string, status: string, paidAt?: Date) {
    const [invoice] = await db
      .update(invoices)
      .set({ 
        status, 
        paidAt,
        updatedAt: new Date() 
      })
      .where(eq(invoices.stripeInvoiceId, stripeInvoiceId))
      .returning();
    return invoice;
  }

  async getInvoicesByCustomer(stripeCustomerId: string, limit = 50) {
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.stripeCustomerId, stripeCustomerId))
      .orderBy(desc(invoices.createdAt))
      .limit(limit);
  }

  // Refund operations
  async createRefund(refundData: Omit<Refund, 'id' | 'createdAt' | 'updatedAt'>) {
    const [refund] = await db.insert(refunds).values({
      ...refundData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return refund;
  }

  async getRefundsByPayment(stripePaymentIntentId: string) {
    return await db
      .select()
      .from(refunds)
      .where(eq(refunds.stripePaymentIntentId, stripePaymentIntentId))
      .orderBy(desc(refunds.createdAt));
  }

  // Analytics and reporting
  async getPaymentStats(customerId?: string) {
    const baseQuery = db.select({
      totalAmount: db.$sum(payments.amount),
      totalCount: db.$count(payments.id),
      successCount: db.$count(payments.id)
    }).from(payments);

    if (customerId) {
      return await baseQuery.where(
        and(
          eq(payments.stripeCustomerId, customerId),
          eq(payments.status, 'succeeded')
        )
      );
    }

    return await baseQuery.where(eq(payments.status, 'succeeded'));
  }

  async getSubscriptionStats() {
    return await db
      .select({
        totalSubscriptions: db.$count(subscriptions.id),
        activeSubscriptions: db.$count(subscriptions.id)
      })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'));
  }
}

export const stripeDrizzleAdapter = new StripeDrizzleAdapter();
`,
      condition: '{{#if integration.features.paymentSchema}}'
    },

    // Webhook Logger
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/stripe/webhook-logger.ts',
      content: `import { db } from '@/lib/db';
import { webhookEvents, type NewWebhookEvent } from '@/lib/db/schema/stripe';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

export class StripeWebhookLogger {
  async logEvent(event: Stripe.Event): Promise<void> {
    try {
      await db.insert(webhookEvents).values({
        stripeEventId: event.id,
        eventType: event.type,
        eventData: event as any,
        processed: false,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Failed to log webhook event:', error);
      throw error;
    }
  }

  async markEventAsProcessed(stripeEventId: string): Promise<void> {
    try {
      await db
        .update(webhookEvents)
        .set({ processed: true })
        .where(eq(webhookEvents.stripeEventId, stripeEventId));
    } catch (error) {
      console.error('Failed to mark event as processed:', error);
      throw error;
    }
  }

  async markEventAsFailed(stripeEventId: string, error: string): Promise<void> {
    try {
      await db
        .update(webhookEvents)
        .set({ 
          processed: false,
          processingError: error
        })
        .where(eq(webhookEvents.stripeEventId, stripeEventId));
    } catch (err) {
      console.error('Failed to mark event as failed:', err);
      throw err;
    }
  }

  async getUnprocessedEvents(): Promise<any[]> {
    try {
      return await db
        .select()
        .from(webhookEvents)
        .where(eq(webhookEvents.processed, false))
        .orderBy(webhookEvents.createdAt);
    } catch (error) {
      console.error('Failed to get unprocessed events:', error);
      throw error;
    }
  }

  async getEventById(stripeEventId: string): Promise<any> {
    try {
      const [event] = await db
        .select()
        .from(webhookEvents)
        .where(eq(webhookEvents.stripeEventId, stripeEventId))
        .limit(1);
      return event;
    } catch (error) {
      console.error('Failed to get event by ID:', error);
      throw error;
    }
  }

  async getEventsByType(eventType: string, limit = 100): Promise<any[]> {
    try {
      return await db
        .select()
        .from(webhookEvents)
        .where(eq(webhookEvents.eventType, eventType))
        .orderBy(webhookEvents.createdAt)
        .limit(limit);
    } catch (error) {
      console.error('Failed to get events by type:', error);
      throw error;
    }
  }

  async getFailedEvents(): Promise<any[]> {
    try {
      return await db
        .select()
        .from(webhookEvents)
        .where(eq(webhookEvents.processingError, null))
        .orderBy(webhookEvents.createdAt);
    } catch (error) {
      console.error('Failed to get failed events:', error);
      throw error;
    }
  }
}

export const stripeWebhookLogger = new StripeWebhookLogger();
`,
      condition: '{{#if integration.features.webhookLogs}}'
    },

    // Payment Tracker
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/stripe/payment-tracker.ts',
      content: `import { stripeDrizzleAdapter } from './drizzle-adapter';
import { stripeWebhookLogger } from './webhook-logger';
import Stripe from 'stripe';

export class StripePaymentTracker {
  async trackPaymentIntent(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      // Get or create customer
      let customer = await stripeDrizzleAdapter.getCustomerByStripeId(paymentIntent.customer as string);
      if (!customer && paymentIntent.customer) {
        // In a real implementation, you'd fetch customer details from Stripe
        customer = await stripeDrizzleAdapter.createCustomer(
          paymentIntent.customer as string,
          'unknown@example.com' // You'd get this from Stripe
        );
      }

      // Create payment record
      await stripeDrizzleAdapter.createPayment({
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: paymentIntent.customer as string,
        amount: (paymentIntent.amount / 100).toString(),
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        description: paymentIntent.description || undefined,
        metadata: paymentIntent.metadata,
        receiptUrl: paymentIntent.charges?.data[0]?.receipt_url || undefined
      });
    } catch (error) {
      console.error('Failed to track payment intent:', error);
      throw error;
    }
  }

  async trackSubscription(subscription: Stripe.Subscription): Promise<void> {
    try {
      await stripeDrizzleAdapter.createSubscription({
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0]?.price.id || '',
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : undefined,
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : undefined,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
        metadata: subscription.metadata
      });
    } catch (error) {
      console.error('Failed to track subscription:', error);
      throw error;
    }
  }

  async trackInvoice(invoice: Stripe.Invoice): Promise<void> {
    try {
      await stripeDrizzleAdapter.createInvoice({
        stripeInvoiceId: invoice.id,
        stripeCustomerId: invoice.customer as string,
        stripeSubscriptionId: invoice.subscription as string || undefined,
        amountPaid: invoice.amount_paid ? (invoice.amount_paid / 100).toString() : undefined,
        amountDue: (invoice.amount_due / 100).toString(),
        currency: invoice.currency,
        status: invoice.status || 'draft',
        number: invoice.number || undefined,
        description: invoice.description || undefined,
        hostedInvoiceUrl: invoice.hosted_invoice_url || undefined,
        invoicePdf: invoice.invoice_pdf || undefined,
        paidAt: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000) : undefined
      });
    } catch (error) {
      console.error('Failed to track invoice:', error);
      throw error;
    }
  }

  async trackRefund(refund: Stripe.Refund): Promise<void> {
    try {
      await stripeDrizzleAdapter.createRefund({
        stripeRefundId: refund.id,
        stripePaymentIntentId: refund.payment_intent as string,
        amount: (refund.amount / 100).toString(),
        currency: refund.currency,
        reason: refund.reason || undefined,
        status: refund.status,
        metadata: refund.metadata
      });
    } catch (error) {
      console.error('Failed to track refund:', error);
      throw error;
    }
  }

  async processWebhookEvent(event: Stripe.Event): Promise<void> {
    try {
      // Log the event
      await stripeWebhookLogger.logEvent(event);

      // Process based on event type
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.trackPaymentIntent(event.data.object as Stripe.PaymentIntent);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.trackSubscription(event.data.object as Stripe.Subscription);
          break;
        case 'invoice.payment_succeeded':
          await this.trackInvoice(event.data.object as Stripe.Invoice);
          break;
        case 'charge.dispute.created':
          // Handle disputes
          console.log('Dispute created:', event.data.object);
          break;
        default:
          console.log(\`Unhandled event type: \${event.type}\`);
      }

      // Mark as processed
      await stripeWebhookLogger.markEventAsProcessed(event.id);
    } catch (error) {
      console.error('Failed to process webhook event:', error);
      await stripeWebhookLogger.markEventAsFailed(event.id, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async getPaymentAnalytics(customerId?: string) {
    try {
      const stats = await stripeDrizzleAdapter.getPaymentStats(customerId);
      const subscriptionStats = await stripeDrizzleAdapter.getSubscriptionStats();
      
      return {
        payments: stats[0] || { totalAmount: '0', totalCount: 0, successCount: 0 },
        subscriptions: subscriptionStats[0] || { totalSubscriptions: 0, activeSubscriptions: 0 }
      };
    } catch (error) {
      console.error('Failed to get payment analytics:', error);
      throw error;
    }
  }
}

export const stripePaymentTracker = new StripePaymentTracker();
`,
      condition: '{{#if integration.features.paymentTracking}}'
    }
  ]
};
