/**
 * Stripe Payment Processing Blueprint
 * 
 * Sets up complete Stripe integration for payments and subscriptions
 * Creates payment components, API routes, and webhook handling
 */

import { Blueprint } from '../../../types/adapter.js';

export const stripeBlueprint: Blueprint = {
  id: 'stripe-payment-setup',
  name: 'Stripe Payment Processing Setup',
  actions: [
    {
      type: 'RUN_COMMAND',
      command: 'npm install stripe @stripe/stripe-js'
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/stripe/config.ts',
      content: `import Stripe from 'stripe';

// Initialize Stripe with your secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  appInfo: {
    name: '{{project.name}}',
    version: '1.0.0',
  },
});

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  successUrl: process.env.NEXT_PUBLIC_APP_URL + '/payment/success',
  cancelUrl: process.env.NEXT_PUBLIC_APP_URL + '/payment/cancel',
  currency: 'usd',
  mode: 'payment' as const,
};

// Price IDs for different subscription tiers
export const PRICE_IDS = {
  basic: process.env.STRIPE_BASIC_PRICE_ID!,
  pro: process.env.STRIPE_PRO_PRICE_ID!,
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
};

// Product configuration
export const PRODUCTS = {
  basic: {
    name: 'Basic Plan',
    description: 'Perfect for individuals',
    price: 9.99,
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
  },
  pro: {
    name: 'Pro Plan',
    description: 'Great for small teams',
    price: 29.99,
    features: ['All Basic features', 'Feature 4', 'Feature 5', 'Feature 6'],
  },
  enterprise: {
    name: 'Enterprise Plan',
    description: 'For large organizations',
    price: 99.99,
    features: ['All Pro features', 'Feature 7', 'Feature 8', 'Feature 9', 'Priority Support'],
  },
};`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/lib/stripe/client.ts',
      content: `import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe on the client side
export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
};

// Payment intent creation
export const createPaymentIntent = async (amount: number, currency = 'usd') => {
  const response = await fetch('/api/stripe/create-payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amount * 100, // Convert to cents
      currency,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create payment intent');
  }

  return response.json();
};

// Subscription creation
export const createSubscription = async (priceId: string, customerId?: string) => {
  const response = await fetch('/api/stripe/create-subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      priceId,
      customerId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create subscription');
  }

  return response.json();
};

// Customer portal
export const createCustomerPortalSession = async (customerId: string) => {
  const response = await fetch('/api/stripe/create-portal-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create portal session');
  }

  return response.json();
};`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/app/api/stripe/create-payment-intent/route.ts',
      content: `import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe/config';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'usd' } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        project: '{{project.name}}',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/app/api/stripe/create-subscription/route.ts',
      content: `import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe/config';

export async function POST(request: NextRequest) {
  try {
    const { priceId, customerId, email } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    let customer;

    if (customerId) {
      customer = await stripe.customers.retrieve(customerId);
    } else if (email) {
      // Create or retrieve customer
      const existingCustomers = await stripe.customers.list({
        email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await stripe.customers.create({
          email,
          metadata: {
            project: '{{project.name}}',
          },
        });
      }
    } else {
      return NextResponse.json(
        { error: 'Customer ID or email is required' },
        { status: 400 }
      );
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        project: '{{project.name}}',
      },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/app/api/stripe/webhook/route.ts',
      content: `import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe/config';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_CONFIG.webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);
        // Handle successful payment
        break;

      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription created:', subscription.id);
        // Handle new subscription
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        console.log('Subscription updated:', updatedSubscription.id);
        // Handle subscription update
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        console.log('Subscription deleted:', deletedSubscription.id);
        // Handle subscription cancellation
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Invoice payment succeeded:', invoice.id);
        // Handle successful invoice payment
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        console.log('Invoice payment failed:', failedInvoice.id);
        // Handle failed invoice payment
        break;

      default:
        console.log(\`Unhandled event type: \${event.type}\`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/components/payment/payment-button.tsx',
      content: `'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getStripe } from '@/lib/stripe/client';
import { createPaymentIntent } from '@/lib/stripe/client';

interface PaymentButtonProps {
  amount: number;
  currency?: string;
  description?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PaymentButton({
  amount,
  currency = 'usd',
  description,
  onSuccess,
  onError,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Create payment intent
      const { clientSecret } = await createPaymentIntent(amount, currency);

      // Initialize Stripe
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      // Redirect to Stripe Checkout
      const { error } = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: window.location.origin + '/payment/success',
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Payment</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-2xl font-bold">
            \${amount.toFixed(2)} {currency.toUpperCase()}
          </div>
          <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}`
    },
    {
      type: 'ADD_CONTENT',
      target: 'src/components/payment/subscription-plans.tsx',
      content: `'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PRODUCTS, PRICE_IDS } from '@/lib/stripe/config';
import { createSubscription } from '@/lib/stripe/client';

interface SubscriptionPlansProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function SubscriptionPlans({ onSuccess, onError }: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: keyof typeof PRODUCTS) => {
    try {
      setLoading(planId);

      const priceId = PRICE_IDS[planId];
      const { clientSecret } = await createSubscription(priceId);

      // Initialize Stripe
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      // Redirect to Stripe Checkout
      const { error } = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: window.location.origin + '/payment/success',
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Subscription failed';
      onError?.(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Object.entries(PRODUCTS).map(([planId, plan]) => (
        <Card key={planId} className="relative">
          {planId === 'pro' && (
            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              Popular
            </Badge>
          )}
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <div className="text-3xl font-bold">
              \${plan.price}
              <span className="text-sm font-normal text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => handleSubscribe(planId as keyof typeof PRODUCTS)}
              disabled={loading === planId}
              className="w-full"
              variant={planId === 'pro' ? 'default' : 'outline'}
            >
              {loading === planId ? 'Processing...' : 'Subscribe'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}`
    },
    {
      type: 'ADD_CONTENT',
      target: '.env.example',
      content: `# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Stripe Price IDs (create these in your Stripe dashboard)
STRIPE_BASIC_PRICE_ID="price_..."
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_ENTERPRISE_PRICE_ID="price_..."

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."`
    }
  ]
};
