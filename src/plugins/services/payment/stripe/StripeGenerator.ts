import { StripeConfig } from './StripeSchema.js';

export class StripeGenerator {
  static generateStripeClient(config: StripeConfig): string {
    const enableSubscriptions = config.features?.enableSubscriptions !== false;
    const enableInvoices = config.features?.enableInvoices !== false;
    const enableTaxes = config.features?.enableTaxes === true;
    const enableConnect = config.features?.enableConnect === true;
    
    return `import Stripe from 'stripe';

// ============================================================================
// STRIPE CLIENT CONFIGURATION
// ============================================================================

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// ============================================================================
// PAYMENT METHODS
// ============================================================================

/**
 * Create a payment intent
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = '${config.currency || 'usd'}',
  metadata?: Record<string, string>
): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });
}

/**
 * Confirm a payment intent
 */
export async function confirmPaymentIntent(
  paymentIntentId: string,
  paymentMethodId: string
): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: paymentMethodId,
  });
}

/**
 * Retrieve a payment intent
 */
export async function retrievePaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
}

// ============================================================================
// CUSTOMER MANAGEMENT
// ============================================================================

/**
 * Create a customer
 */
export async function createCustomer(
  email: string,
  name?: string,
  metadata?: Record<string, string>
): Promise<Stripe.Customer> {
  return await stripe.customers.create({
    email,
    name,
    metadata,
  });
}

/**
 * Retrieve a customer
 */
export async function retrieveCustomer(
  customerId: string
): Promise<Stripe.Customer> {
  return await stripe.customers.retrieve(customerId);
}

/**
 * Update a customer
 */
export async function updateCustomer(
  customerId: string,
  updates: Partial<Stripe.CustomerUpdateParams>
): Promise<Stripe.Customer> {
  return await stripe.customers.update(customerId, updates);
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

${enableSubscriptions ? `
/**
 * Create a subscription
 */
export async function createSubscription(
  customerId: string,
  priceId: string,
  metadata?: Record<string, string>
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    metadata,
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  });
}

/**
 * Retrieve a subscription
 */
export async function retrieveSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  prorate: boolean = true
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.cancel(subscriptionId, {
    prorate,
  });
}
` : ''}

// ============================================================================
// INVOICE MANAGEMENT
// ============================================================================

${enableInvoices ? `
/**
 * Create an invoice
 */
export async function createInvoice(
  customerId: string,
  items: Array<{ price: string; quantity?: number }>,
  metadata?: Record<string, string>
): Promise<Stripe.Invoice> {
  return await stripe.invoices.create({
    customer: customerId,
    items,
    metadata,
  });
}

/**
 * Retrieve an invoice
 */
export async function retrieveInvoice(
  invoiceId: string
): Promise<Stripe.Invoice> {
  return await stripe.invoices.retrieve(invoiceId);
}

/**
 * Send an invoice
 */
export async function sendInvoice(
  invoiceId: string
): Promise<Stripe.Invoice> {
  return await stripe.invoices.sendInvoice(invoiceId);
}
` : ''}

// ============================================================================
// PAYMENT METHOD MANAGEMENT
// ============================================================================

/**
 * Create a payment method
 */
export async function createPaymentMethod(
  type: 'card' | 'bank_account',
  card?: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
  },
  billing_details?: {
    name?: string;
    email?: string;
    address?: Stripe.Address;
  }
): Promise<Stripe.PaymentMethod> {
  return await stripe.paymentMethods.create({
    type,
    card,
    billing_details,
  });
}

/**
 * Attach a payment method to a customer
 */
export async function attachPaymentMethod(
  paymentMethodId: string,
  customerId: string
): Promise<Stripe.PaymentMethod> {
  return await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  });
}

// ============================================================================
// WEBHOOK HANDLING
// ============================================================================

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format amount for Stripe (convert to cents)
 */
export function formatAmount(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Format amount from Stripe (convert from cents)
 */
export function formatAmountFromStripe(amount: number): number {
  return amount / 100;
}

/**
 * Get Stripe publishable key for client-side
 */
export function getPublishableKey(): string {
  return process.env.STRIPE_PUBLISHABLE_KEY || '';
}

export default stripe;
`;
  }

  static generateWebhookRoute(config: StripeConfig): string {
    return `import { NextRequest, NextResponse } from 'next/server';
import { stripe, verifyWebhookSignature } from '@/lib/payment/stripe';
import type { Stripe } from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(\`Unhandled event type: \${event.type}\`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }
}

// Webhook handlers
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);
  // Add your payment success logic here
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
  // Add your payment failure logic here
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id);
  // Add your subscription creation logic here
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);
  // Add your subscription update logic here
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);
  // Add your subscription deletion logic here
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Invoice payment succeeded:', invoice.id);
  // Add your invoice payment success logic here
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id);
  // Add your invoice payment failure logic here
}
`;
  }

  static generatePaymentService(config: StripeConfig): string {
    return `import { stripe } from './stripe.js';
import type { Stripe } from 'stripe';

export class PaymentService {
  private stripe: typeof stripe;

  constructor() {
    this.stripe = stripe;
  }

  // ============================================================================
  // PAYMENT INTENTS
  // ============================================================================

  async createPaymentIntent(
    amount: number,
    currency: string = '${config.currency || 'usd'}',
    metadata?: Record<string, string>
  ): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  // ============================================================================
  // CUSTOMERS
  // ============================================================================

  async createCustomer(
    email: string,
    name?: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Customer> {
    return await this.stripe.customers.create({
      email,
      name,
      metadata,
    });
  }

  async retrieveCustomer(customerId: string): Promise<Stripe.Customer> {
    return await this.stripe.customers.retrieve(customerId);
  }

  async updateCustomer(
    customerId: string,
    updates: Partial<Stripe.CustomerUpdateParams>
  ): Promise<Stripe.Customer> {
    return await this.stripe.customers.update(customerId, updates);
  }

  // ============================================================================
  // SUBSCRIPTIONS
  // ============================================================================

  ${config.features?.enableSubscriptions ? `
  async createSubscription(
    customerId: string,
    priceId: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata,
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });
  }

  async retrieveSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async cancelSubscription(
    subscriptionId: string,
    prorate: boolean = true
  ): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.cancel(subscriptionId, {
      prorate,
    });
  }

  async updateSubscription(
    subscriptionId: string,
    updates: Partial<Stripe.SubscriptionUpdateParams>
  ): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.update(subscriptionId, updates);
  }
  ` : ''}

  // ============================================================================
  // INVOICES
  // ============================================================================

  ${config.features?.enableInvoices ? `
  async createInvoice(
    customerId: string,
    items: Array<{ price: string; quantity?: number }>,
    metadata?: Record<string, string>
  ): Promise<Stripe.Invoice> {
    return await this.stripe.invoices.create({
      customer: customerId,
      items,
      metadata,
    });
  }

  async retrieveInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    return await this.stripe.invoices.retrieve(invoiceId);
  }

  async sendInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    return await this.stripe.invoices.sendInvoice(invoiceId);
  }
  ` : ''}

  // ============================================================================
  // PAYMENT METHODS
  // ============================================================================

  async createPaymentMethod(
    type: 'card' | 'bank_account',
    card?: {
      number: string;
      exp_month: number;
      exp_year: number;
      cvc: string;
    },
    billing_details?: {
      name?: string;
      email?: string;
      address?: Stripe.Address;
    }
  ): Promise<Stripe.PaymentMethod> {
    return await this.stripe.paymentMethods.create({
      type,
      card,
      billing_details,
    });
  }

  async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string
  ): Promise<Stripe.PaymentMethod> {
    return await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }

  async listPaymentMethods(
    customerId: string,
    type?: 'card' | 'bank_account'
  ): Promise<Stripe.ApiList<Stripe.PaymentMethod>> {
    return await this.stripe.paymentMethods.list({
      customer: customerId,
      type,
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  formatAmount(amount: number): number {
    return Math.round(amount * 100);
  }

  formatAmountFromStripe(amount: number): number {
    return amount / 100;
  }

  getPublishableKey(): string {
    return process.env.STRIPE_PUBLISHABLE_KEY || '';
  }

  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    secret: string
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }
}

export const paymentService = new PaymentService();
export default paymentService;
`;
  }

  static generateEnvConfig(config: StripeConfig): string {
    return `# Stripe Payment Configuration
STRIPE_PUBLISHABLE_KEY="${config.publishableKey || 'pk_test_your_publishable_key'}"
STRIPE_SECRET_KEY="${config.secretKey || 'sk_test_your_secret_key'}"
STRIPE_WEBHOOK_SECRET="${config.webhookSecret || 'whsec_your_webhook_secret'}"

# Payment Features
STRIPE_ENABLE_SUBSCRIPTIONS="${config.features?.enableSubscriptions !== false ? 'true' : 'false'}"
STRIPE_ENABLE_INVOICES="${config.features?.enableInvoices !== false ? 'true' : 'false'}"
STRIPE_ENABLE_TAXES="${config.features?.enableTaxes ? 'true' : 'false'}"
STRIPE_ENABLE_CONNECT="${config.features?.enableConnect ? 'true' : 'false'}"

# Payment Methods
STRIPE_ENABLE_CARDS="${config.paymentMethods?.enableCards !== false ? 'true' : 'false'}"
STRIPE_ENABLE_BANK_TRANSFERS="${config.paymentMethods?.enableBankTransfers ? 'true' : 'false'}"
STRIPE_ENABLE_DIGITAL_WALLETS="${config.paymentMethods?.enableDigitalWallets !== false ? 'true' : 'false'}"
STRIPE_ENABLE_CRYPTO="${config.paymentMethods?.enableCrypto ? 'true' : 'false'}"

# Security Settings
STRIPE_ENABLE_3D_SECURE="${config.security?.enable3DSecure !== false ? 'true' : 'false'}"
STRIPE_ENABLE_SCA="${config.security?.enableSCA !== false ? 'true' : 'false'}"
STRIPE_ENABLE_FRAUD_DETECTION="${config.security?.enableFraudDetection !== false ? 'true' : 'false'}"

# Webhook Settings
STRIPE_ENABLE_PAYMENT_SUCCESS_WEBHOOKS="${config.webhooks?.enablePaymentSuccess !== false ? 'true' : 'false'}"
STRIPE_ENABLE_SUBSCRIPTION_WEBHOOKS="${config.webhooks?.enableSubscriptionEvents !== false ? 'true' : 'false'}"
STRIPE_ENABLE_INVOICE_WEBHOOKS="${config.webhooks?.enableInvoiceEvents !== false ? 'true' : 'false'}"

# Currency and Locale
STRIPE_DEFAULT_CURRENCY="${config.currency || 'usd'}"
STRIPE_DEFAULT_LOCALE="${config.locale || 'en'}"

# Rate Limiting
STRIPE_MAX_REQUESTS_PER_SECOND="${config.rateLimiting?.maxRequestsPerSecond || 100}"
STRIPE_MAX_REQUESTS_PER_MINUTE="${config.rateLimiting?.maxRequestsPerMinute || 6000}"
STRIPE_ENABLE_RETRY_LOGIC="${config.rateLimiting?.enableRetryLogic !== false ? 'true' : 'false'}"
STRIPE_RETRY_ATTEMPTS="${config.rateLimiting?.retryAttempts || 3}"
`;
  }

  static generatePackageJson(config: StripeConfig): string {
    const dependencies: Record<string, string> = {
      'stripe': '^14.0.0'
    };
    
    return JSON.stringify({
      name: 'stripe-payments',
      version: '0.1.0',
      private: true,
      scripts: {
        'stripe:test': 'node -e \"require(\'./src/lib/payment/service.js\').paymentService.createPaymentIntent(1000, \'usd\')\"',
        'stripe:webhook': 'stripe listen --forward-to localhost:3000/api/stripe/webhook',
        'stripe:test-webhook': 'stripe trigger payment_intent.succeeded'
      },
      dependencies
    }, null, 2);
  }

  static generateReadme(): string {
    return `# Stripe Payment Setup

This project uses Stripe for payment processing and subscription management.

## Features

- **Payment Processing**: Secure payment processing with multiple payment methods
- **Subscription Management**: Recurring billing and subscription handling
- **Invoice Generation**: Automatic invoice creation and management
- **Webhook Handling**: Real-time event processing
- **Customer Management**: Customer data and payment method storage
- **Security**: 3D Secure, SCA, and fraud detection
- **Tax Handling**: Automatic tax calculation (optional)
- **Connect**: Marketplace functionality (optional)

## Configuration

The Stripe payment service is configured in \`src/lib/payment/stripe.ts\`. Key settings:

- **Publishable Key**: Set via \`STRIPE_PUBLISHABLE_KEY\` environment variable
- **Secret Key**: Set via \`STRIPE_SECRET_KEY\` environment variable
- **Webhook Secret**: Set via \`STRIPE_WEBHOOK_SECRET\` environment variable
- **Currency**: Default currency for payments
- **Features**: Enable/disable specific payment features

## Environment Variables

Required:
- \`STRIPE_PUBLISHABLE_KEY\`: Your Stripe publishable key
- \`STRIPE_SECRET_KEY\`: Your Stripe secret key
- \`STRIPE_WEBHOOK_SECRET\`: Your webhook endpoint secret

Optional:
- \`STRIPE_DEFAULT_CURRENCY\`: Default currency (default: usd)
- \`STRIPE_DEFAULT_LOCALE\`: Default locale (default: en)

## Usage

\`\`\`typescript
import { paymentService } from '@/lib/payment/service';

// Create a payment intent
const paymentIntent = await paymentService.createPaymentIntent(1000, 'usd');

// Create a customer
const customer = await paymentService.createCustomer('user@example.com', 'John Doe');

// Create a subscription
const subscription = await paymentService.createSubscription(
  customer.id,
  'price_1234567890'
);

// Handle webhooks
import { verifyWebhookSignature } from '@/lib/payment/stripe';
const event = verifyWebhookSignature(payload, signature, webhookSecret);
\`\`\`

## Available Scripts

- \`npm run stripe:test\` - Test payment intent creation
- \`npm run stripe:webhook\` - Listen for webhook events
- \`npm run stripe:test-webhook\` - Trigger test webhook events

## Webhook Events

The following webhook events are handled:

- \`payment_intent.succeeded\` - Payment completed successfully
- \`payment_intent.payment_failed\` - Payment failed
- \`customer.subscription.created\` - New subscription created
- \`customer.subscription.updated\` - Subscription updated
- \`customer.subscription.deleted\` - Subscription cancelled
- \`invoice.payment_succeeded\` - Invoice paid successfully
- \`invoice.payment_failed\` - Invoice payment failed

## Best Practices

1. **Security**: Never expose secret keys in client-side code
2. **Webhooks**: Always verify webhook signatures
3. **Error Handling**: Implement proper error handling for all payment operations
4. **Testing**: Use Stripe test keys for development
5. **Logging**: Log all payment events for debugging
6. **Idempotency**: Use idempotency keys for critical operations

## Testing

Use Stripe's test mode for development:

- Test card numbers: 4242 4242 4242 4242 (success), 4000 0000 0000 0002 (declined)
- Test webhook events: Use \`stripe trigger\` command
- Test mode keys: Start with \`pk_test_\` and \`sk_test_\`

## Troubleshooting

### Payment Failures
- Check card details and expiration
- Verify 3D Secure authentication
- Check fraud detection settings

### Webhook Issues
- Verify webhook endpoint URL
- Check webhook signature verification
- Ensure webhook secret is correct

### Subscription Issues
- Verify price ID exists
- Check customer payment method
- Ensure subscription status is active
`;
  }
} 