import { db } from '@/lib/db';
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
