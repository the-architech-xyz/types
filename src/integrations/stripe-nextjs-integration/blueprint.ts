import { Blueprint } from '../../types/adapter.js';

export const blueprint: Blueprint = {
  id: 'stripe-nextjs-integration',
  name: 'Stripe Next.js Integration',
  description: 'Complete Next.js integration for Stripe',
  version: '1.0.0',
  actions: [
    // Webhook Handler
    {
      type: 'CREATE_FILE',
      path: 'src/app/api/stripe/webhooks/route.ts',
      content: `import { NextRequest, NextResponse } from 'next/server';
import { stripeWebhookHandler } from '@/lib/payment/webhooks';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const event = await stripeWebhookHandler(body, signature);
    
    return NextResponse.json({ received: true, event: event.type });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
  }
}
`,
      condition: '{{#if integration.features.webhooks}}'
    },

    // Checkout API Route
    {
      type: 'ADD_CONTENT',
      target: 'src/app/api/stripe/checkout/route.ts',
      content: `import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/payment/checkout';

export async function POST(request: NextRequest) {
  try {
    const { priceId, quantity = 1, successUrl, cancelUrl } = await request.json();
    
    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    const session = await createCheckoutSession({
      priceId,
      quantity,
      successUrl: successUrl || \`\${request.nextUrl.origin}/success\`,
      cancelUrl: cancelUrl || \`\${request.nextUrl.origin}/cancel\`
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
`,
      condition: '{{#if integration.features.checkout}}'
    },

    // Subscriptions API Route
    {
      type: 'ADD_CONTENT',
      target: 'src/app/api/stripe/subscriptions/route.ts',
      content: `import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payment/stripe';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    
    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all'
    });

    return NextResponse.json({ subscriptions: subscriptions.data });
  } catch (error) {
    console.error('Subscriptions error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { customerId, priceId } = await request.json();
    
    if (!customerId || !priceId) {
      return NextResponse.json({ error: 'Customer ID and Price ID are required' }, { status: 400 });
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent']
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}
`,
      condition: '{{#if integration.features.subscriptions}}'
    },

    // Invoices API Route
    {
      type: 'ADD_CONTENT',
      target: 'src/app/api/stripe/invoices/route.ts',
      content: `import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payment/stripe';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    
    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 100
    });

    return NextResponse.json({ invoices: invoices.data });
  } catch (error) {
    console.error('Invoices error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { customerId, amount, currency = 'usd', description } = await request.json();
    
    if (!customerId || !amount) {
      return NextResponse.json({ error: 'Customer ID and amount are required' }, { status: 400 });
    }

    const invoice = await stripe.invoices.create({
      customer: customerId,
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      description: description || 'Invoice'
    });

    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

    return NextResponse.json({ invoice: finalizedInvoice });
  } catch (error) {
    console.error('Invoice creation error:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
`,
      condition: '{{#if integration.features.invoices}}'
    },

    // Refunds API Route
    {
      type: 'ADD_CONTENT',
      target: 'src/app/api/stripe/refunds/route.ts',
      content: `import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payment/stripe';

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, amount, reason = 'requested_by_customer' } = await request.json();
    
    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment Intent ID is required' }, { status: 400 });
    }

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents if provided
      reason
    });

    return NextResponse.json({ refund });
  } catch (error) {
    console.error('Refund error:', error);
    return NextResponse.json({ error: 'Failed to process refund' }, { status: 500 });
  }
}
`,
      condition: '{{#if integration.features.refunds}}'
    },

    // Stripe Webhook Handler
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/payment/webhooks.ts',
      content: `import { stripe } from './stripe';
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
        console.log(\`Unhandled event type: \${event.type}\`);
    }

    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw error;
  }
}
`,
      condition: '{{#if integration.features.webhooks}}'
    },

    // Stripe Checkout Helper
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/payment/checkout.ts',
      content: `import { stripe } from './stripe';

interface CreateCheckoutSessionParams {
  priceId: string;
  quantity: number;
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

export async function createCheckoutSession({
  priceId,
  quantity,
  successUrl,
  cancelUrl,
  customerId,
  metadata = {}
}: CreateCheckoutSessionParams) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity
      }
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer: customerId,
    metadata,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    shipping_address_collection: {
      allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE', 'NO', 'DK', 'FI']
    }
  });

  return session;
}

export async function createSubscriptionCheckoutSession({
  priceId,
  successUrl,
  cancelUrl,
  customerId,
  metadata = {}
}: Omit<CreateCheckoutSessionParams, 'quantity'>) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer: customerId,
    metadata,
    allow_promotion_codes: true,
    billing_address_collection: 'required'
  });

  return session;
}
`,
      condition: '{{#if integration.features.checkout}}'
    },

    // Stripe Subscriptions Helper
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/payment/subscriptions.ts',
      content: `import { stripe } from './stripe';

export async function createSubscription(customerId: string, priceId: string) {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent']
  });

  return subscription;
}

export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.cancel(subscriptionId);
  return subscription;
}

export async function updateSubscription(subscriptionId: string, priceId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: priceId
      }
    ],
    proration_behavior: 'create_prorations'
  });

  return updatedSubscription;
}

export async function getSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return subscription;
}

export async function listSubscriptions(customerId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all'
  });

  return subscriptions.data;
}
`,
      condition: '{{#if integration.features.subscriptions}}'
    }
  ]
};
