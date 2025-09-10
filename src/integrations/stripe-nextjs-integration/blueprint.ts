import { Blueprint } from '../../types/adapter.js';

export const blueprint: Blueprint = {
  id: 'stripe-nextjs-integration',
  name: 'Stripe Next.js Integration',
  description: 'Complete Next.js integration for Stripe',
  version: '1.0.0',
  actions: [
    // Install Stripe packages
    {
      type: 'INSTALL_PACKAGES',
      packages: ['stripe', '@stripe/stripe-js'],
      isDev: false
    },
    // Add environment variables
    {
      type: 'ADD_ENV_VAR',
      key: 'STRIPE_SECRET_KEY',
      value: 'sk_test_...',
      description: 'Stripe secret key for server-side operations'
    },
    {
      type: 'ADD_ENV_VAR',
      key: 'STRIPE_PUBLISHABLE_KEY',
      value: 'pk_test_...',
      description: 'Stripe publishable key for client-side operations'
    },
    {
      type: 'ADD_ENV_VAR',
      key: 'STRIPE_WEBHOOK_SECRET',
      value: 'whsec_...',
      description: 'Stripe webhook secret for verifying webhook signatures'
    },
    // Enhance Stripe configuration using modifier
    {
      type: 'ENHANCE_FILE',
      path: 'src/lib/payment/stripe.ts',
      modifier: 'stripe-config-merger',
      params: {
        framework: 'nextjs',
        features: ['payments', 'webhooks', 'checkout'],
        publishableKey: 'process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        secretKey: 'process.env.STRIPE_SECRET_KEY',
        webhookSecret: 'process.env.STRIPE_WEBHOOK_SECRET',
        webhookEndpoint: '/api/stripe/webhooks'
      }
    },
    // Webhook Handler - only create if it doesn't exist
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
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
  }
}
`
    }
  ]
};