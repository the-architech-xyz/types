/**
 * Stripe Payment Processing Blueprint
 * 
 * Sets up complete Stripe integration for payments and subscriptions
 * Creates payment components, API routes, and webhook handling
 */

import { Blueprint } from '../../../types/adapter.js';
import { IntegrationGuideGenerator } from '../../../core/services/integration/integration-guide-generator.js';

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
      target: 'package.json',
      content: `{
  "scripts": {
    "stripe:listen": "stripe listen --forward-to localhost:3000/api/stripe/webhook",
    "stripe:test": "stripe trigger payment_intent.succeeded"
  }
}`
    },
    {
      type: 'ADD_CONTENT',
      target: '{{paths.payment_config}}/stripe.ts',
      content: `import Stripe from 'stripe';

// Initialize Stripe with your secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
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
  currency: '{{module.parameters.currency}}',
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
      target: '{{paths.payment_config}}/client.ts',
      content: `import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe on the client side
export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
};

// Payment intent creation
export const createPaymentIntent = async (amount: number, currency = '{{module.parameters.currency}}') => {
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
      target: '{{paths.api_routes}}/stripe/create-payment-intent/route.ts',
      content: `import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_CONFIG } from '@/lib/payment/stripe';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = '{{module.parameters.currency}}' } = await request.json();

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
      target: '{{paths.api_routes}}/stripe/create-subscription/route.ts',
      content: `import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_CONFIG } from '@/lib/payment/stripe';

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
      target: '{{paths.api_routes}}/stripe/webhook/route.ts',
      content: `import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_CONFIG } from '@/lib/payment/stripe';
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
import { getStripe } from '@/lib/payment/client';
import { createPaymentIntent } from '@/lib/payment/client';

interface PaymentButtonProps {
  amount: number;
  currency?: string;
  description?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PaymentButton({
  amount,
  currency = '{{module.parameters.currency}}',
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
import { PRODUCTS, PRICE_IDS } from '@/lib/payment/stripe';
import { createSubscription } from '@/lib/payment/client';

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
    },
    {
      type: 'ADD_CONTENT',
      target: '{{paths.payment_config}}/INTEGRATION_GUIDE.md',
      content: `# Stripe Payment Processing Integration Guide

## Overview
Stripe provides complete payment processing capabilities including one-time payments, subscriptions, and marketplace functionality.

## Prerequisites
No specific prerequisites required.

## Manual Integration Steps

### Stripe CLI Setup (Recommended for Development)
1. **Install Stripe CLI**:
   \`\`\`bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Windows
   winget install stripe.stripe-cli
   
   # Linux
   wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_X.X.X_linux_x86_64.tar.gz
   tar -xvf stripe_X.X.X_linux_x86_64.tar.gz
   sudo mv stripe /usr/local/bin
   \`\`\`

2. **Login to Stripe**:
   \`\`\`bash
   stripe login
   \`\`\`

3. **Start webhook forwarding** (for development):
   \`\`\`bash
   npm run stripe:listen
   \`\`\`

4. **Test webhooks**:
   \`\`\`bash
   npm run stripe:test
   \`\`\`

### Environment Setup
1. **Add Stripe keys** to your environment variables:
\`\`\`bash
# .env.local
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### Framework Integration
1. **Create Stripe client** in your app:
\`\`\`typescript
// {{paths.payment_config}}/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
});
\`\`\`

2. **Add API routes** for payment processing:
\`\`\`typescript
// {{paths.api_routes}}/stripe/checkout/route.ts
import { stripe } from '@/lib/payment/stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { priceId, quantity = 1 } = await request.json();
  
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity,
      },
    ],
    success_url: \`\${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}\`,
    cancel_url: \`\${process.env.NEXT_PUBLIC_APP_URL}/cancel\`,
  });

  return NextResponse.json({ sessionId: session.id });
}
\`\`\`

### Webhook Integration
1. **Create webhook endpoint**:
\`\`\`typescript
// {{paths.api_routes}}/stripe/webhook/route.ts
import { stripe } from '@/lib/payment/stripe';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      // Handle successful payment
      console.log('Payment succeeded:', session.id);
      break;
    default:
      console.log(\`Unhandled event type: \${event.type}\`);
  }

  return NextResponse.json({ received: true });
}
\`\`\`

## Configuration Examples

### Configuration Options

#### currency
- **Type**: select
- **Required**: No
- **Default**: \`"usd"\`
- **Choices**: usd, eur, gbp, cad, aud, jpy
- **Description**: Default currency for payments

#### mode
- **Type**: select
- **Required**: No
- **Default**: \`"test"\`
- **Choices**: test, live
- **Description**: Stripe mode (test or live)

#### webhooks
- **Type**: boolean
- **Required**: No
- **Default**: \`true\`
- **Description**: Enable webhook handling

#### dashboard
- **Type**: boolean
- **Required**: No
- **Default**: \`true\`
- **Description**: Enable Stripe Dashboard integration

## Troubleshooting

### Common Issues

#### Configuration Errors
- Ensure all required environment variables are set
- Check that all dependencies are properly installed
- Verify that the module is correctly imported

#### Integration Issues
- Make sure the module is compatible with your framework version
- Check that all required adapters are installed first
- Verify that the configuration matches the expected format

#### Performance Issues
- Check for memory leaks in long-running processes
- Monitor resource usage during peak times
- Consider implementing caching strategies

### Getting Help
- Check the [Stripe documentation](https://stripe.com/docs)
- Search for existing issues in the project repository
- Create a new issue with detailed error information

## Support
For more information, visit the [Stripe documentation](https://stripe.com/docs).
`
    }
  ]
};
