import { stripeDrizzleAdapter } from './drizzle-adapter';
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
          console.log(`Unhandled event type: ${event.type}`);
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
