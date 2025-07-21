/**
 * Stripe Payment Plugin - Pure Technology Implementation
 *
 * Provides Stripe payment processing and subscription management setup.
 * Focuses only on payment technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { PluginCategory, TargetPlatform } from '../../../types/plugin.js';
import { templateService } from '../../../core/templates/template-service.js';
import { CommandRunner } from '../../../core/cli/command-runner.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
export class StripePlugin {
    templateService;
    runner;
    constructor() {
        this.templateService = templateService;
        this.runner = new CommandRunner();
    }
    // ============================================================================
    // PLUGIN METADATA
    // ============================================================================
    getMetadata() {
        return {
            id: 'stripe',
            name: 'Stripe Payments',
            version: '1.0.0',
            description: 'Payment processing and subscription management with Stripe',
            author: 'The Architech Team',
            category: PluginCategory.PAYMENT,
            tags: ['payment', 'stripe', 'subscriptions', 'invoices', 'marketplace'],
            license: 'MIT',
            repository: 'https://github.com/stripe/stripe-node',
            homepage: 'https://stripe.com',
            documentation: 'https://stripe.com/docs'
        };
    }
    // ============================================================================
    // PLUGIN LIFECYCLE - Pure Technology Implementation
    // ============================================================================
    async install(context) {
        const startTime = Date.now();
        try {
            const { projectName, projectPath, pluginConfig } = context;
            context.logger.info('Installing Stripe payments...');
            // Step 1: Install dependencies
            await this.installDependencies(context);
            // Step 2: Initialize Stripe configuration
            await this.initializeStripeConfig(context);
            // Step 3: Create payment utilities
            await this.createPaymentFiles(context);
            // Step 4: Generate unified interface files
            await this.generateUnifiedInterfaceFiles(context);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'payment', 'stripe.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'lib', 'payment', 'index.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'app', 'api', 'stripe', 'webhook', 'route.ts')
                    },
                    {
                        type: 'file',
                        path: path.join(projectPath, 'src', 'app', 'api', 'stripe', 'create-payment-intent', 'route.ts')
                    }
                ],
                dependencies: [
                    {
                        name: 'stripe',
                        version: '^14.0.0',
                        type: 'production',
                        category: PluginCategory.PAYMENT
                    },
                    {
                        name: '@stripe/stripe-js',
                        version: '^2.0.0',
                        type: 'production',
                        category: PluginCategory.PAYMENT
                    }
                ],
                scripts: [
                    {
                        name: 'stripe:listen',
                        command: 'stripe listen --forward-to localhost:3000/api/stripe/webhook',
                        description: 'Listen to Stripe webhooks locally',
                        category: 'dev'
                    }
                ],
                configs: [
                    {
                        file: '.env',
                        content: this.generateEnvConfig(pluginConfig),
                        mergeStrategy: 'append'
                    }
                ],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to install Stripe payments', startTime, [], error);
        }
    }
    async uninstall(context) {
        const startTime = Date.now();
        try {
            const { projectPath } = context;
            context.logger.info('Uninstalling Stripe payments...');
            // Remove Stripe files
            const filesToRemove = [
                path.join(projectPath, 'src', 'lib', 'payment'),
                path.join(projectPath, 'src', 'app', 'api', 'stripe')
            ];
            for (const file of filesToRemove) {
                if (await fsExtra.pathExists(file)) {
                    await fsExtra.remove(file);
                }
            }
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [],
                warnings: ['Stripe files removed. You may need to manually remove dependencies from package.json'],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to uninstall Stripe payments', startTime, [], error);
        }
    }
    async update(context) {
        const startTime = Date.now();
        try {
            context.logger.info('Updating Stripe payments...');
            // Update dependencies
            await this.runner.execCommand(['npm', 'update', 'stripe', '@stripe/stripe-js']);
            const duration = Date.now() - startTime;
            return {
                success: true,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [],
                warnings: [],
                duration
            };
        }
        catch (error) {
            return this.createErrorResult('Failed to update Stripe payments', startTime, [], error);
        }
    }
    async validate(context) {
        const errors = [];
        const warnings = [];
        try {
            // Check if Stripe configuration exists
            const stripePath = path.join(context.projectPath, 'src', 'lib', 'payment', 'stripe.ts');
            if (!await fsExtra.pathExists(stripePath)) {
                errors.push({
                    field: 'stripe.config',
                    message: 'Stripe configuration file not found',
                    code: 'MISSING_CONFIG',
                    severity: 'error'
                });
            }
            // Validate environment variables
            const envPath = path.join(context.projectPath, '.env');
            if (await fsExtra.pathExists(envPath)) {
                const envContent = await fsExtra.readFile(envPath, 'utf-8');
                if (!envContent.includes('STRIPE_PUBLISHABLE_KEY')) {
                    warnings.push('STRIPE_PUBLISHABLE_KEY not found in .env file');
                }
                if (!envContent.includes('STRIPE_SECRET_KEY')) {
                    warnings.push('STRIPE_SECRET_KEY not found in .env file');
                }
            }
            return {
                valid: errors.length === 0,
                errors,
                warnings
            };
        }
        catch (error) {
            return {
                valid: false,
                errors: [{
                        field: 'validation',
                        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        code: 'VALIDATION_ERROR',
                        severity: 'error'
                    }],
                warnings: []
            };
        }
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react', 'vue', 'angular'],
            platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
            databases: ['postgresql', 'mysql', 'sqlite', 'mongodb'],
            conflicts: []
        };
    }
    getDependencies() {
        return ['stripe', '@stripe/stripe-js'];
    }
    getConflicts() {
        return [];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: 'stripe',
                description: 'Stripe Node.js SDK',
                version: '^14.0.0'
            },
            {
                type: 'package',
                name: '@stripe/stripe-js',
                description: 'Stripe JavaScript SDK',
                version: '^2.0.0'
            },
            {
                type: 'config',
                name: 'STRIPE_PUBLISHABLE_KEY',
                description: 'Stripe publishable key',
                optional: false
            },
            {
                type: 'config',
                name: 'STRIPE_SECRET_KEY',
                description: 'Stripe secret key',
                optional: false
            }
        ];
    }
    getDefaultConfig() {
        return {
            publishableKey: '',
            secretKey: '',
            webhookSecret: '',
            enableSubscriptions: true,
            enableInvoices: true,
            enableTaxes: false,
            enableConnect: false
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                publishableKey: {
                    type: 'string',
                    description: 'Stripe publishable key',
                    default: ''
                },
                secretKey: {
                    type: 'string',
                    description: 'Stripe secret key',
                    default: ''
                },
                webhookSecret: {
                    type: 'string',
                    description: 'Stripe webhook secret',
                    default: ''
                },
                enableSubscriptions: {
                    type: 'boolean',
                    description: 'Enable subscription management',
                    default: true
                },
                enableInvoices: {
                    type: 'boolean',
                    description: 'Enable invoice management',
                    default: true
                },
                enableTaxes: {
                    type: 'boolean',
                    description: 'Enable tax calculation',
                    default: false
                },
                enableConnect: {
                    type: 'boolean',
                    description: 'Enable Stripe Connect',
                    default: false
                }
            },
            required: ['publishableKey', 'secretKey']
        };
    }
    // ============================================================================
    // PRIVATE IMPLEMENTATION METHODS
    // ============================================================================
    async installDependencies(context) {
        const { projectPath } = context;
        context.logger.info('Installing Stripe dependencies...');
        const dependencies = [
            'stripe@^14.0.0',
            '@stripe/stripe-js@^2.0.0'
        ];
        await this.runner.execCommand(['npm', 'install', ...dependencies], { cwd: projectPath });
    }
    async initializeStripeConfig(context) {
        const { projectPath, pluginConfig } = context;
        context.logger.info('Initializing Stripe configuration...');
        // Create payment lib directory
        const paymentDir = path.join(projectPath, 'src', 'lib', 'payment');
        await fsExtra.ensureDir(paymentDir);
        // Generate Stripe client configuration
        const stripeContent = this.generateStripeClient(pluginConfig);
        await fsExtra.writeFile(path.join(paymentDir, 'stripe.ts'), stripeContent);
        // Create API routes directory
        const apiDir = path.join(projectPath, 'src', 'app', 'api', 'stripe');
        await fsExtra.ensureDir(apiDir);
        // Generate webhook route
        const webhookDir = path.join(apiDir, 'webhook');
        await fsExtra.ensureDir(webhookDir);
        const webhookContent = this.generateWebhookRoute(pluginConfig);
        await fsExtra.writeFile(path.join(webhookDir, 'route.ts'), webhookContent);
        // Generate payment intent route
        const paymentIntentDir = path.join(apiDir, 'create-payment-intent');
        await fsExtra.ensureDir(paymentIntentDir);
        const paymentIntentContent = this.generatePaymentIntentRoute(pluginConfig);
        await fsExtra.writeFile(path.join(paymentIntentDir, 'route.ts'), paymentIntentContent);
    }
    async createPaymentFiles(context) {
        const { projectPath } = context;
        context.logger.info('Creating payment files...');
        const paymentDir = path.join(projectPath, 'src', 'lib', 'payment');
        await fsExtra.ensureDir(paymentDir);
        // Generate payment utilities
        const utilitiesContent = this.generatePaymentUtilities();
        await fsExtra.writeFile(path.join(paymentDir, 'utilities.ts'), utilitiesContent);
    }
    async generateUnifiedInterfaceFiles(context) {
        const { projectPath } = context;
        context.logger.info('Generating unified interface files...');
        const paymentDir = path.join(projectPath, 'src', 'lib', 'payment');
        await fsExtra.ensureDir(paymentDir);
        // Generate unified payment interface
        const unifiedContent = this.generateUnifiedIndex();
        await fsExtra.writeFile(path.join(paymentDir, 'index.ts'), unifiedContent);
    }
    generateStripeClient(config) {
        const enableSubscriptions = config.enableSubscriptions !== false;
        const enableInvoices = config.enableInvoices !== false;
        const enableTaxes = config.enableTaxes === true;
        const enableConnect = config.enableConnect === true;
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
  currency: string = 'usd',
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
  });
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  atPeriodEnd: boolean = false
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: atPeriodEnd,
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
 * List customer subscriptions
 */
export async function listCustomerSubscriptions(
  customerId: string
): Promise<Stripe.ApiList<Stripe.Subscription>> {
  return await stripe.subscriptions.list({
    customer: customerId,
  });
}` : ''}

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
    collection_method: 'charge_automatically',
    items,
    metadata,
  });
}

/**
 * Send an invoice
 */
export async function sendInvoice(
  invoiceId: string
): Promise<Stripe.Invoice> {
  return await stripe.invoices.sendInvoice(invoiceId);
}

/**
 * Retrieve an invoice
 */
export async function retrieveInvoice(
  invoiceId: string
): Promise<Stripe.Invoice> {
  return await stripe.invoices.retrieve(invoiceId);
}` : ''}

// ============================================================================
// TAX CALCULATION
// ============================================================================

${enableTaxes ? `
/**
 * Calculate tax for a transaction
 */
export async function calculateTax(
  currency: string,
  lineItems: Array<{
    amount: number;
    reference: string;
  }>,
  customerDetails?: {
    address?: Stripe.Address;
    shipping?: Stripe.Shipping;
  }
): Promise<Stripe.Tax.Calculation> {
  return await stripe.tax.calculations.create({
    currency,
    line_items: lineItems,
    customer_details: customerDetails,
  });
}` : ''}

// ============================================================================
// STRIPE CONNECT
// ============================================================================

${enableConnect ? `
/**
 * Create a Connect account
 */
export async function createConnectAccount(
  type: 'express' | 'standard' | 'custom',
  country: string,
  email: string,
  capabilities?: Record<string, 'active' | 'inactive'>
): Promise<Stripe.Account> {
  return await stripe.accounts.create({
    type,
    country,
    email,
    capabilities,
  });
}

/**
 * Create a Connect account link
 */
export async function createAccountLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
): Promise<Stripe.AccountLink> {
  return await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });
}` : ''}

// ============================================================================
// WEBHOOK VERIFICATION
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
// RE-EXPORTS
// ============================================================================

export { Stripe };
export default stripe;
`;
    }
    generateWebhookRoute(config) {
        return `import { NextRequest, NextResponse } from 'next/server';
import { stripe, verifyWebhookSignature } from '@/lib/payment/stripe.js';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  try {
    // Verify webhook signature
    const event = verifyWebhookSignature(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        // Handle successful payment
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        // Handle failed payment
        break;

      case 'customer.subscription.created':
        const subscription = event.data.object;
        console.log('Subscription created:', subscription.id);
        // Handle new subscription
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object;
        console.log('Subscription updated:', updatedSubscription.id);
        // Handle subscription update
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        console.log('Subscription deleted:', deletedSubscription.id);
        // Handle subscription deletion
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        console.log('Invoice paid:', invoice.id);
        // Handle successful invoice payment
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        console.log('Invoice payment failed:', failedInvoice.id);
        // Handle failed invoice payment
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
`;
    }
    generatePaymentIntentRoute(config) {
        return `import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/payment/stripe.js';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'usd', metadata } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent(amount, currency, metadata);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
`;
    }
    generatePaymentUtilities() {
        return `/**
 * Payment Utilities
 * 
 * Common utilities for payment processing
 */

// ============================================================================
// AMOUNT CONVERSION
// ============================================================================

/**
 * Convert dollars to cents (Stripe uses cents)
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Convert cents to dollars
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Format amount for display
 */
export function formatAmount(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate card number (basic Luhn algorithm)
 */
export function isValidCardNumber(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Validate CVC
 */
export function isValidCVC(cvc: string): boolean {
  return /^\\d{3,4}$/.test(cvc);
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Get user-friendly error message
 */
export function getPaymentErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.type) {
    switch (error.type) {
      case 'card_error':
        return error.message || 'Card error occurred';
      case 'validation_error':
        return error.message || 'Validation error occurred';
      case 'rate_limit_error':
        return 'Too many requests. Please try again later.';
      case 'invalid_request_error':
        return error.message || 'Invalid request';
      case 'authentication_error':
        return 'Authentication failed. Please try again.';
      case 'api_connection_error':
        return 'Unable to connect to payment service.';
      case 'api_error':
        return 'Payment service error. Please try again.';
      default:
        return error.message || 'An unexpected error occurred';
    }
  }
  
  return 'An unexpected error occurred';
}

// ============================================================================
// SUBSCRIPTION HELPERS
// ============================================================================

/**
 * Calculate subscription end date
 */
export function calculateSubscriptionEndDate(
  startDate: Date,
  interval: 'day' | 'week' | 'month' | 'year',
  intervalCount: number = 1
): Date {
  const endDate = new Date(startDate);
  
  switch (interval) {
    case 'day':
      endDate.setDate(endDate.getDate() + intervalCount);
      break;
    case 'week':
      endDate.setDate(endDate.getDate() + (intervalCount * 7));
      break;
    case 'month':
      endDate.setMonth(endDate.getMonth() + intervalCount);
      break;
    case 'year':
      endDate.setFullYear(endDate.getFullYear() + intervalCount);
      break;
  }
  
  return endDate;
}

/**
 * Check if subscription is active
 */
export function isSubscriptionActive(
  status: string,
  currentPeriodEnd?: number
): boolean {
  if (status === 'active') return true;
  if (status === 'trialing') return true;
  if (status === 'past_due' && currentPeriodEnd) {
    return new Date(currentPeriodEnd * 1000) > new Date();
  }
  return false;
}

// ============================================================================
// CURRENCY HELPERS
// ============================================================================

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'CHF',
    CNY: '¥',
    INR: '₹',
    BRL: 'R$',
  };
  
  return symbols[currency.toUpperCase()] || currency;
}

/**
 * Get currency name
 */
export function getCurrencyName(currency: string): string {
  const names: Record<string, string> = {
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    JPY: 'Japanese Yen',
    CAD: 'Canadian Dollar',
    AUD: 'Australian Dollar',
    CHF: 'Swiss Franc',
    CNY: 'Chinese Yuan',
    INR: 'Indian Rupee',
    BRL: 'Brazilian Real',
  };
  
  return names[currency.toUpperCase()] || currency;
}
`;
    }
    generateUnifiedIndex() {
        return `/**
 * Unified Payment Interface - Stripe Implementation
 * 
 * This file provides a unified interface for payment operations
 * that works with Stripe. It abstracts away Stripe-specific details
 * and provides a clean API for payment operations.
 */

import * as Stripe from './stripe.js';
import { 
  dollarsToCents, 
  centsToDollars, 
  formatAmount, 
  getPaymentErrorMessage,
  isSubscriptionActive 
} from './utilities.js';

// ============================================================================
// UNIFIED PAYMENT INTERFACE
// ============================================================================

export interface UnifiedPayment {
  // Payment processing
  createPayment: (amount: number, currency?: string, metadata?: Record<string, string>) => Promise<any>;
  confirmPayment: (paymentId: string, paymentMethodId: string) => Promise<any>;
  getPayment: (paymentId: string) => Promise<any>;
  
  // Customer management
  createCustomer: (email: string, name?: string, metadata?: Record<string, string>) => Promise<any>;
  getCustomer: (customerId: string) => Promise<any>;
  updateCustomer: (customerId: string, updates: any) => Promise<any>;
  
  // Subscription management
  createSubscription: (customerId: string, priceId: string, metadata?: Record<string, string>) => Promise<any>;
  cancelSubscription: (subscriptionId: string, atPeriodEnd?: boolean) => Promise<any>;
  getSubscription: (subscriptionId: string) => Promise<any>;
  listSubscriptions: (customerId: string) => Promise<any>;
  
  // Invoice management
  createInvoice: (customerId: string, items: any[], metadata?: Record<string, string>) => Promise<any>;
  sendInvoice: (invoiceId: string) => Promise<any>;
  getInvoice: (invoiceId: string) => Promise<any>;
  
  // Utility
  formatAmount: (amount: number, currency?: string, locale?: string) => string;
  getErrorMessage: (error: any) => string;
  isSubscriptionActive: (status: string, currentPeriodEnd?: number) => boolean;
}

// ============================================================================
// STRIPE IMPLEMENTATION
// ============================================================================

export const createUnifiedPayment = (): UnifiedPayment => {
  return {
    // Payment processing
    createPayment: async (amount: number, currency: string = 'usd', metadata?: Record<string, string>) => {
      return await Stripe.createPaymentIntent(amount, currency, metadata);
    },

    confirmPayment: async (paymentId: string, paymentMethodId: string) => {
      return await Stripe.confirmPaymentIntent(paymentId, paymentMethodId);
    },

    getPayment: async (paymentId: string) => {
      return await Stripe.retrievePaymentIntent(paymentId);
    },

    // Customer management
    createCustomer: async (email: string, name?: string, metadata?: Record<string, string>) => {
      return await Stripe.createCustomer(email, name, metadata);
    },

    getCustomer: async (customerId: string) => {
      return await Stripe.retrieveCustomer(customerId);
    },

    updateCustomer: async (customerId: string, updates: any) => {
      return await Stripe.updateCustomer(customerId, updates);
    },

    // Subscription management
    createSubscription: async (customerId: string, priceId: string, metadata?: Record<string, string>) => {
      return await Stripe.createSubscription(customerId, priceId, metadata);
    },

    cancelSubscription: async (subscriptionId: string, atPeriodEnd: boolean = false) => {
      return await Stripe.cancelSubscription(subscriptionId, atPeriodEnd);
    },

    getSubscription: async (subscriptionId: string) => {
      return await Stripe.retrieveSubscription(subscriptionId);
    },

    listSubscriptions: async (customerId: string) => {
      return await Stripe.listCustomerSubscriptions(customerId);
    },

    // Invoice management
    createInvoice: async (customerId: string, items: any[], metadata?: Record<string, string>) => {
      return await Stripe.createInvoice(customerId, items, metadata);
    },

    sendInvoice: async (invoiceId: string) => {
      return await Stripe.sendInvoice(invoiceId);
    },

    getInvoice: async (invoiceId: string) => {
      return await Stripe.retrieveInvoice(invoiceId);
    },

    // Utility
    formatAmount,
    getErrorMessage: getPaymentErrorMessage,
    isSubscriptionActive,
  };
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export const payment = createUnifiedPayment();
export default payment;

// ============================================================================
// RE-EXPORTS
// ============================================================================

export * from './stripe.js';
export * from './utilities.js';
`;
    }
    generateEnvConfig(config) {
        return `# Stripe Payment Configuration
STRIPE_PUBLISHABLE_KEY="${config.publishableKey || ''}"
STRIPE_SECRET_KEY="${config.secretKey || ''}"
STRIPE_WEBHOOK_SECRET="${config.webhookSecret || ''}"

# Stripe features
STRIPE_ENABLE_SUBSCRIPTIONS="${config.enableSubscriptions !== false ? 'true' : 'false'}"
STRIPE_ENABLE_INVOICES="${config.enableInvoices !== false ? 'true' : 'false'}"
STRIPE_ENABLE_TAXES="${config.enableTaxes === true ? 'true' : 'false'}"
STRIPE_ENABLE_CONNECT="${config.enableConnect === true ? 'true' : 'false'}"
`;
    }
    createErrorResult(message, startTime, errors = [], originalError) {
        const duration = Date.now() - startTime;
        return {
            success: false,
            artifacts: [],
            dependencies: [],
            scripts: [],
            configs: [],
            errors: [
                {
                    code: 'STRIPE_INSTALL_ERROR',
                    message,
                    details: originalError,
                    severity: 'error'
                },
                ...errors
            ],
            warnings: [],
            duration
        };
    }
}
//# sourceMappingURL=stripe.plugin.js.map