import { stripe } from './stripe';
import Stripe from 'stripe';

export async function stripeWebhookHandler(body: string, signature: string): Promise<Stripe.Event> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object);
        // Handle successful payment
        break;
      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object);
        // Handle failed payment
        break;
      case 'customer.subscription.created':
        console.log('Subscription created:', event.data.object);
        // Handle subscription creation
        break;
      case 'customer.subscription.updated':
        console.log('Subscription updated:', event.data.object);
        // Handle subscription update
        break;
      case 'customer.subscription.deleted':
        console.log('Subscription deleted:', event.data.object);
        // Handle subscription cancellation
        break;
      case 'invoice.payment_succeeded':
        console.log('Invoice payment succeeded:', event.data.object);
        // Handle successful invoice payment
        break;
      case 'invoice.payment_failed':
        console.log('Invoice payment failed:', event.data.object);
        // Handle failed invoice payment
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw error;
  }
}
