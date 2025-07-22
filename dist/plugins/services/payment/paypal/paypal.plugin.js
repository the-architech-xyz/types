import { PluginCategory, TargetPlatform } from '../../../../types/plugin.js';
import { AgentLogger } from '../../../../core/cli/logger.js';
export class PayPalPlugin {
    logger;
    constructor() {
        this.logger = new AgentLogger(false, 'PayPalPlugin');
    }
    getMetadata() {
        return {
            id: 'paypal',
            name: 'PayPal Payments',
            version: '1.0.0',
            description: 'Payment processing and subscription management with PayPal',
            author: 'The Architech Team',
            category: PluginCategory.PAYMENT,
            tags: ['payment', 'paypal', 'subscriptions', 'invoices', 'marketplace'],
            license: 'MIT',
            repository: 'https://github.com/paypal/paypal-checkout-components',
            homepage: 'https://www.paypal.com',
            documentation: 'https://developer.paypal.com'
        };
    }
    async validate(context) {
        this.logger.info('Validating PayPal plugin configuration');
        const { pluginConfig } = context;
        if (!pluginConfig.clientId) {
            return {
                valid: false,
                errors: [{
                        field: 'clientId',
                        message: 'PayPal client ID is required',
                        code: 'MISSING_CLIENT_ID',
                        severity: 'error'
                    }],
                warnings: []
            };
        }
        if (!pluginConfig.clientSecret) {
            return {
                valid: false,
                errors: [{
                        field: 'clientSecret',
                        message: 'PayPal client secret is required',
                        code: 'MISSING_CLIENT_SECRET',
                        severity: 'error'
                    }],
                warnings: []
            };
        }
        return {
            valid: true,
            errors: [],
            warnings: []
        };
    }
    async install(context) {
        this.logger.info('Installing PayPal plugin');
        const { pluginConfig, projectPath } = context;
        try {
            // Install dependencies
            await this.installDependencies(projectPath);
            // Generate configuration files
            const files = await this.generateFiles(pluginConfig);
            // Add environment variables
            const envVars = this.generateEnvironmentVariables(pluginConfig);
            return {
                success: true,
                artifacts: files.map(file => ({
                    type: 'file',
                    path: file.path,
                    content: file.content
                })),
                dependencies: [
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
                scripts: [
                    {
                        name: 'paypal:dev',
                        command: 'echo "PayPal enabled in development mode"',
                        description: 'Development PayPal status',
                        category: 'dev'
                    },
                    {
                        name: 'paypal:test',
                        command: 'echo "PayPal test mode activated"',
                        description: 'Test PayPal integration',
                        category: 'test'
                    }
                ],
                configs: [],
                errors: [],
                warnings: [],
                duration: 0
            };
        }
        catch (error) {
            this.logger.error('Failed to install PayPal plugin:', error);
            return {
                success: false,
                artifacts: [],
                dependencies: [],
                scripts: [],
                configs: [],
                errors: [{
                        code: 'INSTALL_FAILED',
                        message: `Failed to setup PayPal: ${error}`,
                        severity: 'error'
                    }],
                warnings: [],
                duration: 0
            };
        }
    }
    async uninstall(context) {
        this.logger.info('Uninstalling PayPal plugin');
        return {
            success: true,
            artifacts: [],
            dependencies: [],
            scripts: [],
            configs: [],
            errors: [],
            warnings: [],
            duration: 0
        };
    }
    async update(context) {
        this.logger.info('Updating PayPal plugin');
        return this.install(context);
    }
    getCompatibility() {
        return {
            frameworks: ['nextjs', 'react', 'vue', 'angular'],
            platforms: [TargetPlatform.WEB],
            nodeVersions: ['>=16.0.0'],
            packageManagers: ['npm', 'yarn', 'pnpm'],
            conflicts: []
        };
    }
    getDependencies() {
        return ['@paypal/checkout-server-sdk', '@paypal/react-paypal-js'];
    }
    getConflicts() {
        return [];
    }
    getRequirements() {
        return [
            {
                type: 'package',
                name: '@paypal/checkout-server-sdk',
                description: 'PayPal server SDK',
                version: '^1.0.3'
            },
            {
                type: 'package',
                name: '@paypal/react-paypal-js',
                description: 'PayPal React components',
                version: '^8.1.3'
            }
        ];
    }
    getDefaultConfig() {
        return {
            clientId: '',
            clientSecret: '',
            environment: 'sandbox',
            enableSubscriptions: false,
            enableInvoices: false,
            enableMarketplace: false,
            enableSmartButtons: true,
            enableAdvancedCards: false,
            currency: 'USD',
            locale: 'en_US'
        };
    }
    getConfigSchema() {
        return {
            type: 'object',
            properties: {
                clientId: {
                    type: 'string',
                    description: 'PayPal client ID from developer dashboard',
                    default: ''
                },
                clientSecret: {
                    type: 'string',
                    description: 'PayPal client secret from developer dashboard',
                    default: ''
                },
                environment: {
                    type: 'string',
                    description: 'PayPal environment (sandbox or live)',
                    default: 'sandbox',
                    enum: ['sandbox', 'live']
                },
                enableSubscriptions: {
                    type: 'boolean',
                    description: 'Enable subscription management',
                    default: false
                },
                enableInvoices: {
                    type: 'boolean',
                    description: 'Enable invoice generation',
                    default: false
                },
                enableMarketplace: {
                    type: 'boolean',
                    description: 'Enable marketplace features',
                    default: false
                },
                enableSmartButtons: {
                    type: 'boolean',
                    description: 'Enable PayPal Smart Buttons',
                    default: true
                },
                enableAdvancedCards: {
                    type: 'boolean',
                    description: 'Enable advanced card processing',
                    default: false
                },
                currency: {
                    type: 'string',
                    description: 'Default currency for payments',
                    default: 'USD'
                },
                locale: {
                    type: 'string',
                    description: 'Default locale for PayPal interface',
                    default: 'en_US'
                }
            },
            required: ['clientId', 'clientSecret']
        };
    }
    async installDependencies(projectPath) {
        this.logger.info('Installing PayPal dependencies');
        // This would be handled by the package manager
        // For now, we just log the required packages
        this.logger.info('Required packages: @paypal/checkout-server-sdk, @paypal/react-paypal-js');
    }
    async generateFiles(config) {
        const files = [];
        // Generate PayPal configuration
        files.push({
            path: 'src/lib/paypal.ts',
            content: this.generatePayPalConfig(config),
            mergeStrategy: 'replace'
        });
        // Generate PayPal provider component
        files.push({
            path: 'src/components/providers/paypal-provider.tsx',
            content: this.generatePayPalProvider(config),
            mergeStrategy: 'replace'
        });
        // Generate PayPal utilities
        files.push({
            path: 'src/lib/paypal-utils.ts',
            content: this.generatePayPalUtils(config),
            mergeStrategy: 'replace'
        });
        // Generate API routes
        files.push({
            path: 'src/app/api/paypal/create-order/route.ts',
            content: this.generateCreateOrderRoute(config),
            mergeStrategy: 'replace'
        });
        files.push({
            path: 'src/app/api/paypal/capture-order/route.ts',
            content: this.generateCaptureOrderRoute(config),
            mergeStrategy: 'replace'
        });
        if (config.enableSubscriptions) {
            files.push({
                path: 'src/app/api/paypal/subscriptions/route.ts',
                content: this.generateSubscriptionsRoute(config),
                mergeStrategy: 'replace'
            });
        }
        return files;
    }
    generatePayPalConfig(config) {
        const enableSubscriptions = config.enableSubscriptions === true;
        const enableInvoices = config.enableInvoices === true;
        const enableMarketplace = config.enableMarketplace === true;
        const enableSmartButtons = config.enableSmartButtons !== false;
        const enableAdvancedCards = config.enableAdvancedCards === true;
        return `import { PayPalScriptProvider } from '@paypal/react-paypal-js';

// ============================================================================
// PAYPAL CONFIGURATION
// ============================================================================

export const paypalConfig = {
  // Client configuration
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '${config.clientId}',
  clientSecret: process.env.PAYPAL_CLIENT_SECRET || '${config.clientSecret}',
  
  // Environment
  environment: process.env.NODE_ENV === 'production' ? 'live' : '${config.environment}',
  
  // Feature flags
  enableSubscriptions: ${enableSubscriptions},
  enableInvoices: ${enableInvoices},
  enableMarketplace: ${enableMarketplace},
  enableSmartButtons: ${enableSmartButtons},
  enableAdvancedCards: ${enableAdvancedCards},
  
  // Default settings
  currency: '${config.currency}',
  locale: '${config.locale}',
  
  // Debug mode
  debug: process.env.NODE_ENV === 'development',
};

// ============================================================================
// PAYPAL SCRIPT OPTIONS
// ============================================================================

export const paypalScriptOptions = {
  'client-id': paypalConfig.clientId,
  currency: paypalConfig.currency,
  intent: 'capture',
  'disable-funding': enableAdvancedCards ? '' : 'card,credit',
  'enable-funding': enableAdvancedCards ? 'card,credit' : '',
  'data-client-token': '',
  'data-page-type': 'checkout',
  'data-order-id': '',
  'data-custom': '',
  'data-shipping-preferences': 'NO_SHIPPING',
  'data-payment-source': 'paypal',
  'data-application-context': JSON.stringify({
    brand_name: 'Your App Name',
    landing_page: 'LOGIN',
    user_action: 'PAY_NOW',
    return_url: window.location.origin + '/payment/success',
    cancel_url: window.location.origin + '/payment/cancel',
  }),
};

// ============================================================================
// PAYPAL PROVIDER COMPONENT
// ============================================================================

export function PayPalProvider({ children }: { children: React.ReactNode }) {
  return (
    <PayPalScriptProvider options={paypalScriptOptions}>
      {children}
    </PayPalScriptProvider>
  );
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export interface PaymentItem {
  name: string;
  description?: string;
  quantity: string;
  unit_amount: {
    currency_code: string;
    value: string;
  };
  category: 'DIGITAL_GOODS' | 'PHYSICAL_GOODS' | 'DONATION' | 'SERVICE';
}

export interface PaymentOrder {
  id: string;
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED';
  intent: 'CAPTURE' | 'AUTHORIZE';
  payment_source: {
    paypal: {
      experience_context: {
        payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED';
        brand_name: string;
        locale: string;
        landing_page: 'LOGIN' | 'GUEST_CHECKOUT' | 'NO_PREFERENCE';
        user_action: 'CONTINUE' | 'PAY_NOW';
        return_url: string;
        cancel_url: string;
      };
    };
  };
  purchase_units: Array<{
    reference_id: string;
    amount: {
      currency_code: string;
      value: string;
      breakdown?: {
        item_total: {
          currency_code: string;
          value: string;
        };
        shipping: {
          currency_code: string;
          value: string;
        };
        tax_total: {
          currency_code: string;
          value: string;
        };
      };
    };
    items?: PaymentItem[];
    description?: string;
    custom_id?: string;
    invoice_id?: string;
    soft_descriptor?: string;
  }>;
  create_time: string;
  update_time: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

${enableSubscriptions ? `
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  type: 'FIXED' | 'INFINITE';
  payment_definitions: Array<{
    id: string;
    name: string;
    type: 'REGULAR' | 'TRIAL';
    frequency: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
    frequency_interval: string;
    amount: {
      currency: string;
      value: string;
    };
    cycles: string;
    charge_models?: Array<{
      type: 'SHIPPING' | 'TAX';
      amount: {
        currency: string;
        value: string;
      };
    }>;
  }>;
  merchant_preferences: {
    setup_fee: {
      currency: string;
      value: string;
    };
    return_url: string;
    cancel_url: string;
    auto_bill_amount: 'YES' | 'NO';
    initial_fail_amount_action: 'CONTINUE' | 'CANCEL';
    max_fail_attempts: string;
  };
}
` : ''}

// ============================================================================
// EXPORTS
// ============================================================================

export { PayPalScriptProvider };
`;
    }
    generatePayPalProvider(config) {
        return `'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { paypalScriptOptions } from '../../lib/paypal';

// ============================================================================
// PAYPAL PROVIDER COMPONENT
// ============================================================================

interface PayPalProviderProps {
  children: React.ReactNode;
}

export function PayPalProvider({ children }: PayPalProviderProps) {
  return (
    <PayPalScriptProvider options={paypalScriptOptions}>
      {children}
    </PayPalScriptProvider>
  );
}

// ============================================================================
// PAYPAL HOOKS
// ============================================================================

import { usePayPalScriptReducer } from '@paypal/react-paypal-js';

export function usePayPal() {
  const [{ isPending, isRejected, isResolved }] = usePayPalScriptReducer();

  return {
    isPending,
    isRejected,
    isResolved,
    isReady: isResolved,
  };
}
`;
    }
    generatePayPalUtils(config) {
        const enableSubscriptions = config.enableSubscriptions === true;
        const enableInvoices = config.enableInvoices === true;
        return `// ============================================================================
// PAYPAL UTILITIES
// ============================================================================

/**
 * Create a PayPal order
 */
export async function createPayPalOrder(items: Array<{
  name: string;
  description?: string;
  quantity: number;
  price: number;
  currency?: string;
}>): Promise<{ orderId: string; approvalUrl: string }> {
  try {
    const response = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items,
        currency: '${config.currency}',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create PayPal order');
    }

    const data = await response.json();
    return {
      orderId: data.orderId,
      approvalUrl: data.approvalUrl,
    };
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    throw error;
  }
}

/**
 * Capture a PayPal order
 */
export async function capturePayPalOrder(orderId: string): Promise<{
  transactionId: string;
  status: string;
  amount: number;
  currency: string;
}> {
  try {
    const response = await fetch('/api/paypal/capture-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId }),
    });

    if (!response.ok) {
      throw new Error('Failed to capture PayPal order');
    }

    const data = await response.json();
    return {
      transactionId: data.transactionId,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
    };
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    throw error;
  }
}

/**
 * Format currency for PayPal
 */
export function formatCurrency(amount: number, currency: string = '${config.currency}'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

/**
 * Validate PayPal configuration
 */
export function validatePayPalConfig(): boolean {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
  return !!(clientId && clientSecret);
}

${enableSubscriptions ? `
/**
 * Create a PayPal subscription
 */
export async function createPayPalSubscription(planId: string, customerId: string): Promise<{
  subscriptionId: string;
  status: string;
}> {
  try {
    const response = await fetch('/api/paypal/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        customerId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create PayPal subscription');
    }

    const data = await response.json();
    return {
      subscriptionId: data.subscriptionId,
      status: data.status,
    };
  } catch (error) {
    console.error('Error creating PayPal subscription:', error);
    throw error;
  }
}

/**
 * Cancel a PayPal subscription
 */
export async function cancelPayPalSubscription(subscriptionId: string): Promise<{
  status: string;
}> {
  try {
    const response = await fetch(\`/api/paypal/subscriptions/\${subscriptionId}\`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to cancel PayPal subscription');
    }

    const data = await response.json();
    return {
      status: data.status,
    };
  } catch (error) {
    console.error('Error canceling PayPal subscription:', error);
    throw error;
  }
}
` : ''}

${enableInvoices ? `
/**
 * Create a PayPal invoice
 */
export async function createPayPalInvoice(invoiceData: {
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  customerEmail: string;
  dueDate?: string;
}): Promise<{
  invoiceId: string;
  status: string;
  invoiceUrl: string;
}> {
  try {
    const response = await fetch('/api/paypal/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });

    if (!response.ok) {
      throw new Error('Failed to create PayPal invoice');
    }

    const data = await response.json();
    return {
      invoiceId: data.invoiceId,
      status: data.status,
      invoiceUrl: data.invoiceUrl,
    };
  } catch (error) {
    console.error('Error creating PayPal invoice:', error);
    throw error;
  }
}
` : ''}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class PayPalError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'PayPalError';
  }
}

export function handlePayPalError(error: any): PayPalError {
  if (error instanceof PayPalError) {
    return error;
  }

  return new PayPalError(
    error.message || 'PayPal operation failed',
    error.code || 'UNKNOWN_ERROR',
    error.details
  );
}
`;
    }
    generateCreateOrderRoute(config) {
        return `import { NextRequest, NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';

// ============================================================================
// PAYPAL CLIENT CONFIGURATION
// ============================================================================

const environment = process.env.NODE_ENV === 'production' 
  ? new paypal.core.LiveEnvironment('${config.clientId}', '${config.clientSecret}')
  : new paypal.core.SandboxEnvironment('${config.clientId}', '${config.clientSecret}');

const client = new paypal.core.PayPalHttpClient(environment);

// ============================================================================
// CREATE ORDER API ROUTE
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const { items, currency = '${config.currency}' } = await request.json();

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Create PayPal order request
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: totalAmount.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: currency,
              value: totalAmount.toFixed(2)
            }
          }
        },
        items: items.map((item: any) => ({
          name: item.name,
          description: item.description || '',
          quantity: item.quantity.toString(),
          unit_amount: {
            currency_code: currency,
            value: item.price.toFixed(2)
          },
          category: 'DIGITAL_GOODS'
        }))
      }],
      application_context: {
        brand_name: 'Your App Name',
        landing_page: 'LOGIN',
        user_action: 'PAY_NOW',
        return_url: \`\${process.env.NEXT_PUBLIC_APP_URL}/payment/success\`,
        cancel_url: \`\${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel\`,
      }
    });

    // Execute the request
    const order = await client.execute(request);

    return NextResponse.json({
      orderId: order.result.id,
      status: order.result.status,
      links: order.result.links
    });

  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return NextResponse.json(
      { error: 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}
`;
    }
    generateCaptureOrderRoute(config) {
        return `import { NextRequest, NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';

// ============================================================================
// PAYPAL CLIENT CONFIGURATION
// ============================================================================

const environment = process.env.NODE_ENV === 'production' 
  ? new paypal.core.LiveEnvironment('${config.clientId}', '${config.clientSecret}')
  : new paypal.core.SandboxEnvironment('${config.clientId}', '${config.clientSecret}');

const client = new paypal.core.PayPalHttpClient(environment);

// ============================================================================
// CAPTURE ORDER API ROUTE
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Create capture request
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    // Execute the request
    const capture = await client.execute(request);

    const captureId = capture.result.purchase_units[0].payments.captures[0].id;
    const amount = capture.result.purchase_units[0].payments.captures[0].amount.value;
    const currency = capture.result.purchase_units[0].payments.captures[0].amount.currency_code;

    return NextResponse.json({
      transactionId: captureId,
      status: capture.result.status,
      amount: parseFloat(amount),
      currency: currency
    });

  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    return NextResponse.json(
      { error: 'Failed to capture PayPal order' },
      { status: 500 }
    );
  }
}
`;
    }
    generateSubscriptionsRoute(config) {
        return `import { NextRequest, NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';

// ============================================================================
// PAYPAL CLIENT CONFIGURATION
// ============================================================================

const environment = process.env.NODE_ENV === 'production' 
  ? new paypal.core.LiveEnvironment('${config.clientId}', '${config.clientSecret}')
  : new paypal.core.SandboxEnvironment('${config.clientId}', '${config.clientSecret}');

const client = new paypal.core.PayPalHttpClient(environment);

// ============================================================================
// SUBSCRIPTIONS API ROUTE
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const { planId, customerId } = await request.json();

    if (!planId || !customerId) {
      return NextResponse.json(
        { error: 'Plan ID and Customer ID are required' },
        { status: 400 }
      );
    }

    // Create subscription request
    const request = new paypal.catalogs.ProductsPostRequest();
    request.requestBody({
      plan_id: planId,
      subscriber: {
        name: {
          given_name: 'John',
          surname: 'Doe'
        },
        email_address: 'customer@example.com'
      },
      application_context: {
        brand_name: 'Your App Name',
        locale: '${config.locale}',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        payment_method: {
          payer_selected: 'PAYPAL',
          payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
        },
        return_url: \`\${process.env.NEXT_PUBLIC_APP_URL}/subscription/success\`,
        cancel_url: \`\${process.env.NEXT_PUBLIC_APP_URL}/subscription/cancel\`,
      }
    });

    // Execute the request
    const subscription = await client.execute(request);

    return NextResponse.json({
      subscriptionId: subscription.result.id,
      status: subscription.result.status,
      links: subscription.result.links
    });

  } catch (error) {
    console.error('Error creating PayPal subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create PayPal subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('id');

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    // Cancel subscription request
    const request = new paypal.billing.SubscriptionsCancelRequest(subscriptionId);
    request.requestBody({
      reason: 'User requested cancellation'
    });

    // Execute the request
    await client.execute(request);

    return NextResponse.json({
      status: 'CANCELLED'
    });

  } catch (error) {
    console.error('Error canceling PayPal subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel PayPal subscription' },
      { status: 500 }
    );
  }
}
`;
    }
    generateEnvironmentVariables(config) {
        return {
            NEXT_PUBLIC_PAYPAL_CLIENT_ID: config.clientId,
            PAYPAL_CLIENT_SECRET: config.clientSecret,
            PAYPAL_ENVIRONMENT: config.environment,
            NEXT_PUBLIC_PAYPAL_ENVIRONMENT: config.environment,
            NEXT_PUBLIC_PAYPAL_CURRENCY: config.currency,
            NEXT_PUBLIC_PAYPAL_LOCALE: config.locale
        };
    }
}
//# sourceMappingURL=paypal.plugin.js.map