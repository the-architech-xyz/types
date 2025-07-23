/**
 * PayPal Payment Plugin - Pure Technology Implementation
 * 
 * Provides PayPal payment processing and subscription management setup.
 * Focuses only on payment technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */

import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata, PluginCategory, IUIPaymentPlugin, UnifiedInterfaceTemplate } from '../../../../types/plugins.js';
import { ValidationResult, ValidationError } from '../../../../types/agents.js';
import { PayPalConfig, PayPalConfigSchema, PayPalDefaultConfig } from './PayPalSchema.js';
import { PayPalGenerator } from './PayPalGenerator.js';

export class PayPalPlugin extends BasePlugin implements IUIPaymentPlugin {
  private generator!: PayPalGenerator;

  constructor() {
    super();
    // Generator will be initialized in install method when pathResolver is available
  }

  // ============================================================================
  // PLUGIN METADATA
  // ============================================================================

  getMetadata(): PluginMetadata {
    return {
      id: 'paypal',
      name: 'PayPal Payments',
      version: '1.0.0',
      description: 'Payment processing and subscription management with PayPal',
      author: 'The Architech Team',
      category: PluginCategory.PAYMENT,
      tags: ['payment', 'paypal', 'subscriptions', 'invoices', 'marketplace', 'checkout'],
      license: 'MIT',
      repository: 'https://github.com/paypal/paypal-checkout-components',
      homepage: 'https://www.paypal.com',
      documentation: 'https://developer.paypal.com'
    };
  }

  // ============================================================================
  // ENHANCED PLUGIN INTERFACE IMPLEMENTATIONS
  // ============================================================================

  getParameterSchema() {
    return {
      category: PluginCategory.PAYMENT,
      groups: [
        { id: 'credentials', name: 'Credentials', description: 'Configure PayPal API credentials.', order: 1, parameters: ['clientId', 'clientSecret', 'environment'] },
        { id: 'payment', name: 'Payment Settings', description: 'Configure payment behavior.', order: 2, parameters: ['currency', 'intent', 'enableSubscriptions'] },
        { id: 'webhooks', name: 'Webhooks', description: 'Configure webhook notifications.', order: 3, parameters: ['webhookId'] }
      ],
      parameters: [
        {
          id: 'clientId',
          name: 'Client ID',
          type: 'string' as const,
          description: 'Your PayPal REST API client ID.',
          required: true,
          group: 'credentials'
        },
        {
          id: 'clientSecret',
          name: 'Client Secret',
          type: 'string' as const,
          description: 'Your PayPal REST API client secret.',
          required: true,
          group: 'credentials'
        },
        {
          id: 'environment',
          name: 'Environment',
          type: 'select' as const,
          description: 'The environment to use for PayPal API requests.',
          required: true,
          default: 'sandbox',
          options: [
            { value: 'sandbox', label: 'Sandbox (Testing)' },
            { value: 'live', label: 'Live (Production)' }
          ],
          group: 'credentials'
        },
        {
          id: 'currency',
          name: 'Currency',
          type: 'string' as const,
          description: 'The default currency code for transactions (e.g., USD, EUR).',
          required: false,
          default: 'USD',
          group: 'payment'
        },
        {
          id: 'intent',
          name: 'Payment Intent',
          type: 'select' as const,
          description: 'The default payment intent.',
          required: false,
          default: 'capture',
          options: [
            { value: 'capture', label: 'Capture (Immediate)' },
            { value: 'authorize', label: 'Authorize (Delayed)' }
          ],
          group: 'payment'
        },
        {
          id: 'enableSubscriptions',
          name: 'Enable Subscriptions',
          type: 'boolean' as const,
          description: 'Enable support for PayPal Subscriptions.',
          required: false,
          default: false,
          group: 'payment'
        },
        {
          id: 'webhookId',
          name: 'Webhook ID',
          type: 'string' as const,
          description: 'Your PayPal webhook ID for receiving event notifications.',
          required: false,
          group: 'webhooks'
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
    if (!config.clientId) {
      errors.push({
        field: 'clientId',
        message: 'PayPal client ID is required',
        code: 'MISSING_FIELD',
        severity: 'error'
      });
    }

    if (!config.clientSecret) {
      errors.push({
        field: 'clientSecret',
        message: 'PayPal client secret is required',
        code: 'MISSING_FIELD',
        severity: 'error'
      });
    }

    if (!config.environment) {
      errors.push({
        field: 'environment',
        message: 'Environment is required',
        code: 'MISSING_FIELD',
        severity: 'error'
      });
    }

    // Validate currency format
    if (config.currency && !config.currency.match(/^[A-Z]{3}$/)) {
      warnings.push('Currency should be a 3-letter ISO code (e.g., USD, EUR)');
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
          name: 'paypal',
          type: 'constant',
          implementation: 'PayPal client configuration',
          documentation: 'PayPal API client for payment processing'
        },
        {
          name: 'PayPalProvider',
          type: 'class' as const,
          implementation: 'React provider for PayPal integration',
          documentation: 'Provider component for PayPal checkout integration'
        },
        {
          name: 'payment',
          type: 'constant',
          implementation: 'Payment utilities',
          documentation: 'PayPal payment processing utilities'
        }
      ],
      types: [],
      utilities: [],
      constants: [],
      documentation: 'PayPal payment processing and subscription management integration'
    };
  }

  // ============================================================================
  // IUIPaymentPlugin INTERFACE IMPLEMENTATIONS
  // ============================================================================

  getPaymentProviders(): string[] {
    return ['paypal', 'paypal-checkout', 'paypal-subscriptions'];
  }

  getPaymentFeatures(): string[] {
    return ['one-time-payments', 'subscriptions', 'invoices', 'marketplace', 'refunds'];
  }

  getCurrencyOptions(): string[] {
    return ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK'];
  }

  // ============================================================================
  // PLUGIN LIFECYCLE - Pure Technology Implementation
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectName, projectPath, pluginConfig } = context;
      
      context.logger.info('Installing PayPal payment processing...');

      // Initialize path resolver
      this.initializePathResolver(context);
      
      // Initialize generator
      this.generator = new PayPalGenerator();

      // Validate configuration
      const validation = this.validateConfiguration(pluginConfig);
      if (!validation.valid) {
        return this.createErrorResult('Invalid PayPal configuration', validation.errors, startTime);
      }

      // Step 1: Install dependencies
      await this.installDependencies(['@paypal/checkout-server-sdk', '@paypal/react-paypal-js']);

      // Step 2: Generate files using the generator
      const paypalClient = PayPalGenerator.generatePayPalClient(pluginConfig as any);
      const createOrderRoute = PayPalGenerator.generateCreateOrderRoute(pluginConfig as any);
      const captureOrderRoute = PayPalGenerator.generateCaptureOrderRoute(pluginConfig as any);
      const envConfig = PayPalGenerator.generateEnvConfig(pluginConfig as any);
      
      // Step 3: Write files to project
      await this.generateFile('src/lib/paypal/client.ts', paypalClient);
      await this.generateFile('src/pages/api/paypal/orders/index.ts', createOrderRoute);
      await this.generateFile('src/pages/api/paypal/orders/[orderID]/capture.ts', captureOrderRoute);
      await this.generateFile('.env.local', envConfig);

      // Step 4: Generate webhook route if webhook ID is provided
      if (pluginConfig.webhookId) {
        const webhookRoute = PayPalGenerator.generateWebhookRoute(pluginConfig as any);
        await this.generateFile('src/pages/api/paypal/webhook.ts', webhookRoute);
      }

      const duration = Date.now() - startTime;

      return this.createSuccessResult(
        [
          { type: 'file' as const, path: 'src/lib/paypal/client.ts' },
          { type: 'file' as const, path: 'src/pages/api/paypal/orders/index.ts' },
          { type: 'file' as const, path: 'src/pages/api/paypal/orders/[orderID]/capture.ts' },
          { type: 'file' as const, path: '.env.local' },
          ...(pluginConfig.webhookId ? [{ type: 'file' as const, path: 'src/pages/api/paypal/webhook.ts' }] : [])
        ],
        [
          {
            name: '@paypal/checkout-server-sdk',
            version: '^1.0.3',
            type: 'production',
            category: PluginCategory.PAYMENT
          },
          {
            name: '@paypal/react-paypal-js',
            version: '^8.1.3',
            type: 'production',
            category: PluginCategory.PAYMENT
          }
        ],
        [],
        [],
        validation.warnings,
        startTime
      );

    } catch (error) {
      return this.createErrorResult(
        'Failed to install PayPal payment processing',
        [],
        startTime
      );
    }
  }

  // ============================================================================
  // PLUGIN INTERFACE IMPLEMENTATIONS
  // ============================================================================

  getDependencies(): string[] {
    return ['@paypal/checkout-server-sdk', '@paypal/react-paypal-js'];
  }

  getDevDependencies(): string[] {
    return [];
  }

  getCompatibility(): any {
    return {
      frameworks: ['nextjs', 'react', 'vue', 'svelte'],
      platforms: ['web'],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm'],
      conflicts: ['stripe']
    };
  }

  getConflicts(): string[] {
    return ['stripe'];
  }

  getRequirements(): any[] {
    return [
      {
        type: 'package',
        name: '@paypal/checkout-server-sdk',
        description: 'PayPal Checkout Server SDK',
        version: '^1.0.3'
      },
      {
        type: 'package',
        name: '@paypal/react-paypal-js',
        description: 'React components for PayPal JS SDK',
        version: '^8.1.3'
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return {
      clientId: '',
      clientSecret: '',
      environment: 'sandbox',
      currency: 'USD',
      intent: 'capture',
      enableSubscriptions: false,
      webhookId: ''
    };
  }

  getConfigSchema(): any {
    return PayPalConfigSchema;
  }
} 