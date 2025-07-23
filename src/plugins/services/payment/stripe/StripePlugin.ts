/**
 * Stripe Payment Plugin - Pure Technology Implementation
 * 
 * Provides Stripe payment processing and subscription management setup.
 * Focuses only on payment technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */

import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata, PluginCategory, IUIPaymentPlugin, UnifiedInterfaceTemplate } from '../../../../types/plugins.js';
import { ValidationResult, ValidationError } from '../../../../types/agents.js';
import { StripeConfig, StripeConfigSchema, StripeDefaultConfig } from './StripeSchema.js';
import { StripeGenerator } from './StripeGenerator.js';

export class StripePlugin extends BasePlugin implements IUIPaymentPlugin {
  private generator!: StripeGenerator;

  constructor() {
    super();
    // Generator will be initialized in install method when pathResolver is available
  }

  // ============================================================================
  // PLUGIN METADATA
  // ============================================================================

  getMetadata(): PluginMetadata {
    return {
      id: 'stripe',
      name: 'Stripe Payments',
      version: '1.0.0',
      description: 'Payment processing and subscription management with Stripe',
      author: 'The Architech Team',
      category: PluginCategory.PAYMENT,
      tags: ['payment', 'stripe', 'subscriptions', 'invoices', 'marketplace', 'checkout'],
      license: 'MIT',
      repository: 'https://github.com/stripe/stripe-node',
      homepage: 'https://stripe.com',
      documentation: 'https://stripe.com/docs'
    };
  }

  // ============================================================================
  // ENHANCED PLUGIN INTERFACE IMPLEMENTATIONS
  // ============================================================================

  getParameterSchema() {
    return {
      category: PluginCategory.PAYMENT,
      groups: [
        { id: 'credentials', name: 'Credentials', description: 'Configure Stripe API credentials.', order: 1, parameters: ['publishableKey', 'secretKey', 'webhookSecret'] },
        { id: 'features', name: 'Features', description: 'Configure payment features.', order: 2, parameters: ['enableSubscriptions', 'enableInvoices', 'enableTaxes', 'enableConnect'] },
        { id: 'paymentMethods', name: 'Payment Methods', description: 'Configure accepted payment methods.', order: 3, parameters: ['enableCards', 'enableBankTransfers', 'enableDigitalWallets', 'enableCrypto'] },
        { id: 'security', name: 'Security', description: 'Configure security settings.', order: 4, parameters: ['enable3DSecure', 'enableSCA', 'enableFraudDetection'] },
        { id: 'webhooks', name: 'Webhooks', description: 'Configure webhook events.', order: 5, parameters: ['enablePaymentSuccess', 'enableSubscriptionEvents', 'enableInvoiceEvents'] },
        { id: 'currency', name: 'Currency & Locale', description: 'Configure currency and locale settings.', order: 6, parameters: ['currency', 'locale'] }
      ],
      parameters: [
        {
          id: 'publishableKey',
          name: 'Publishable Key',
          type: 'string' as const,
          description: 'Stripe publishable key for client-side operations.',
          required: true,
          group: 'credentials'
        },
        {
          id: 'secretKey',
          name: 'Secret Key',
          type: 'string' as const,
          description: 'Stripe secret key for server-side operations.',
          required: true,
          group: 'credentials'
        },
        {
          id: 'webhookSecret',
          name: 'Webhook Secret',
          type: 'string' as const,
          description: 'Stripe webhook endpoint secret.',
          required: true,
          group: 'credentials'
        },
        {
          id: 'enableSubscriptions',
          name: 'Enable Subscriptions',
          type: 'boolean' as const,
          description: 'Enable subscription management.',
          required: false,
          default: true,
          group: 'features'
        },
        {
          id: 'enableInvoices',
          name: 'Enable Invoices',
          type: 'boolean' as const,
          description: 'Enable invoice generation.',
          required: false,
          default: true,
          group: 'features'
        },
        {
          id: 'enableTaxes',
          name: 'Enable Taxes',
          type: 'boolean' as const,
          description: 'Enable tax calculation.',
          required: false,
          default: false,
          group: 'features'
        },
        {
          id: 'enableConnect',
          name: 'Enable Connect',
          type: 'boolean' as const,
          description: 'Enable Stripe Connect for marketplaces.',
          required: false,
          default: false,
          group: 'features'
        },
        {
          id: 'enableCards',
          name: 'Enable Cards',
          type: 'boolean' as const,
          description: 'Enable credit/debit card payments.',
          required: false,
          default: true,
          group: 'paymentMethods'
        },
        {
          id: 'enableBankTransfers',
          name: 'Enable Bank Transfers',
          type: 'boolean' as const,
          description: 'Enable bank transfer payments.',
          required: false,
          default: false,
          group: 'paymentMethods'
        },
        {
          id: 'enableDigitalWallets',
          name: 'Enable Digital Wallets',
          type: 'boolean' as const,
          description: 'Enable digital wallet payments (Apple Pay, Google Pay).',
          required: false,
          default: true,
          group: 'paymentMethods'
        },
        {
          id: 'enableCrypto',
          name: 'Enable Crypto',
          type: 'boolean' as const,
          description: 'Enable cryptocurrency payments.',
          required: false,
          default: false,
          group: 'paymentMethods'
        },
        {
          id: 'enable3DSecure',
          name: 'Enable 3D Secure',
          type: 'boolean' as const,
          description: 'Enable 3D Secure authentication.',
          required: false,
          default: true,
          group: 'security'
        },
        {
          id: 'enableSCA',
          name: 'Enable SCA',
          type: 'boolean' as const,
          description: 'Enable Strong Customer Authentication.',
          required: false,
          default: true,
          group: 'security'
        },
        {
          id: 'enableFraudDetection',
          name: 'Enable Fraud Detection',
          type: 'boolean' as const,
          description: 'Enable Stripe Radar fraud detection.',
          required: false,
          default: true,
          group: 'security'
        },
        {
          id: 'enablePaymentSuccess',
          name: 'Payment Success Webhooks',
          type: 'boolean' as const,
          description: 'Enable payment success webhook events.',
          required: false,
          default: true,
          group: 'webhooks'
        },
        {
          id: 'enableSubscriptionEvents',
          name: 'Subscription Webhooks',
          type: 'boolean' as const,
          description: 'Enable subscription-related webhook events.',
          required: false,
          default: true,
          group: 'webhooks'
        },
        {
          id: 'enableInvoiceEvents',
          name: 'Invoice Webhooks',
          type: 'boolean' as const,
          description: 'Enable invoice-related webhook events.',
          required: false,
          default: true,
          group: 'webhooks'
        },
        {
          id: 'currency',
          name: 'Currency',
          type: 'select' as const,
          description: 'Default currency for payments.',
          required: false,
          default: 'usd',
          options: [
            { value: 'usd', label: 'USD - US Dollar' },
            { value: 'eur', label: 'EUR - Euro' },
            { value: 'gbp', label: 'GBP - British Pound' },
            { value: 'cad', label: 'CAD - Canadian Dollar' },
            { value: 'aud', label: 'AUD - Australian Dollar' },
            { value: 'jpy', label: 'JPY - Japanese Yen' }
          ],
          group: 'currency'
        },
        {
          id: 'locale',
          name: 'Locale',
          type: 'select' as const,
          description: 'Default locale for payment forms.',
          required: false,
          default: 'en',
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
            { value: 'it', label: 'Italian' },
            { value: 'ja', label: 'Japanese' }
          ],
          group: 'currency'
        }
      ],
      dependencies: [],
      validations: []
    };
  }

  // Plugins NEVER generate questions - agents handle this
  getDynamicQuestions(context: PluginContext): any[] {
    return [];
  }

  validateConfiguration(config: Record<string, any>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!config.publishableKey) {
      errors.push({
        field: 'publishableKey',
        message: 'Stripe publishable key is required',
        code: 'MISSING_FIELD',
        severity: 'error'
      });
    }

    if (!config.secretKey) {
      errors.push({
        field: 'secretKey',
        message: 'Stripe secret key is required',
        code: 'MISSING_FIELD',
        severity: 'error'
      });
    }

    if (!config.webhookSecret) {
      errors.push({
        field: 'webhookSecret',
        message: 'Stripe webhook secret is required',
        code: 'MISSING_FIELD',
        severity: 'error'
      });
    }

    // Validate key formats
    if (config.publishableKey && !config.publishableKey.startsWith('pk_')) {
      warnings.push('Publishable key should start with "pk_"');
    }

    if (config.secretKey && !config.secretKey.startsWith('sk_')) {
      warnings.push('Secret key should start with "sk_"');
    }

    if (config.webhookSecret && !config.webhookSecret.startsWith('whsec_')) {
      warnings.push('Webhook secret should start with "whsec_"');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate {
    return {
      category: PluginCategory.PAYMENT,
      exports: [
        {
          name: 'stripe',
          type: 'constant',
          implementation: 'Stripe client configuration',
          documentation: 'Stripe API client for payment processing'
        },
        {
          name: 'paymentService',
          type: 'class' as const,
          implementation: 'Payment service class',
          documentation: 'Unified payment service for Stripe operations'
        },
        {
          name: 'payment',
          type: 'constant',
          implementation: 'Payment utilities',
          documentation: 'Stripe payment processing utilities'
        }
      ],
      types: [],
      utilities: [],
      constants: [],
      documentation: 'Stripe payment processing and subscription management integration'
    };
  }

  // ============================================================================
  // IUIPaymentPlugin INTERFACE IMPLEMENTATIONS
  // ============================================================================

  getPaymentProviders(): string[] {
    return ['stripe', 'stripe-checkout', 'stripe-subscriptions'];
  }

  getPaymentFeatures(): string[] {
    return ['one-time-payments', 'subscriptions', 'invoices', 'marketplace', 'refunds', 'disputes'];
  }

  getCurrencyOptions(): string[] {
    return ['usd', 'eur', 'gbp', 'cad', 'aud', 'jpy', 'chf', 'sek', 'nok', 'dkk'];
  }

  // ============================================================================
  // PLUGIN LIFECYCLE - Pure Technology Implementation
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectName, projectPath, pluginConfig } = context;
      
      context.logger.info('Installing Stripe payment processing...');

      // Initialize path resolver
      this.initializePathResolver(context);
      
      // Initialize generator
      this.generator = new StripeGenerator();

      // Validate configuration
      const validation = this.validateConfiguration(pluginConfig);
      if (!validation.valid) {
        return this.createErrorResult('Invalid Stripe configuration', validation.errors, startTime);
      }

      // Step 1: Install dependencies
      await this.installDependencies(['stripe']);

      // Step 2: Generate files using the generator
      const stripeClient = StripeGenerator.generateStripeClient(pluginConfig as any);
      const paymentService = StripeGenerator.generatePaymentService(pluginConfig as any);
      const webhookRoute = StripeGenerator.generateWebhookRoute(pluginConfig as any);
      const envConfig = StripeGenerator.generateEnvConfig(pluginConfig as any);
      
      // Step 3: Write files to project
      await this.generateFile('src/lib/payment/stripe.ts', stripeClient);
      await this.generateFile('src/lib/payment/service.ts', paymentService);
      await this.generateFile('src/app/api/stripe/webhook/route.ts', webhookRoute);
      await this.generateFile('.env.local', envConfig);

      // Step 4: Generate unified interface
      const unifiedIndex = `/**
 * Unified Payment Interface - Stripe Implementation
 * 
 * This file provides a unified interface for payment operations
 * that works with Stripe.
 */

export { stripe } from './stripe.js';
export { paymentService } from './service.js';
export type * from 'stripe';

// Default export for convenience
export { paymentService as default } from './service.js';
`;
      await this.generateFile('src/lib/payment/index.ts', unifiedIndex);

      const duration = Date.now() - startTime;

      return this.createSuccessResult(
        [
          { type: 'file' as const, path: 'src/lib/payment/stripe.ts' },
          { type: 'file' as const, path: 'src/lib/payment/service.ts' },
          { type: 'file' as const, path: 'src/lib/payment/index.ts' },
          { type: 'file' as const, path: 'src/app/api/stripe/webhook/route.ts' },
          { type: 'file' as const, path: '.env.local' }
        ],
        [
          {
            name: 'stripe',
            version: '^14.0.0',
            type: 'production',
            category: PluginCategory.PAYMENT
          }
        ],
        [
          { name: 'stripe:test', command: 'node -e "require(\'./src/lib/payment/service.js\').paymentService.createPaymentIntent(1000, \'usd\')"', description: 'Test payment intent creation', category: 'dev' as const },
          { name: 'stripe:webhook', command: 'stripe listen --forward-to localhost:3000/api/stripe/webhook', description: 'Listen for webhook events', category: 'dev' as const },
          { name: 'stripe:test-webhook', command: 'stripe trigger payment_intent.succeeded', description: 'Trigger test webhook events', category: 'dev' as const }
        ],
        [],
        validation.warnings,
        startTime
      );

    } catch (error) {
      return this.createErrorResult(
        'Failed to install Stripe payment processing',
        [],
        startTime
      );
    }
  }

  // ============================================================================
  // PLUGIN INTERFACE IMPLEMENTATIONS
  // ============================================================================

  getDependencies(): string[] {
    return ['stripe'];
  }

  getDevDependencies(): string[] {
    return [];
  }

  getCompatibility(): any {
    return {
      frameworks: ['nextjs', 'react', 'vue', 'svelte'],
      platforms: ['web', 'mobile'],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm'],
      conflicts: ['paypal']
    };
  }

  getConflicts(): string[] {
    return ['paypal'];
  }

  getRequirements(): any[] {
    return [
      {
        type: 'package',
        name: 'stripe',
        description: 'Stripe payment processing library',
        version: '^14.0.0'
      },
      {
        type: 'config',
        name: 'STRIPE_PUBLISHABLE_KEY',
        description: 'Stripe publishable key for client-side operations',
        optional: false
      },
      {
        type: 'config',
        name: 'STRIPE_SECRET_KEY',
        description: 'Stripe secret key for server-side operations',
        optional: false
      },
      {
        type: 'config',
        name: 'STRIPE_WEBHOOK_SECRET',
        description: 'Stripe webhook endpoint secret',
        optional: false
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return {
      publishableKey: '',
      secretKey: '',
      webhookSecret: '',
      enableSubscriptions: true,
      enableInvoices: true,
      enableTaxes: false,
      enableConnect: false,
      enableCards: true,
      enableBankTransfers: false,
      enableDigitalWallets: true,
      enableCrypto: false,
      enable3DSecure: true,
      enableSCA: true,
      enableFraudDetection: true,
      enablePaymentSuccess: true,
      enableSubscriptionEvents: true,
      enableInvoiceEvents: true,
      currency: 'usd',
      locale: 'en'
    };
  }

  getConfigSchema(): any {
    return StripeConfigSchema;
  }
} 