/**
 * Stripe Config Merger Modifier
 * 
 * Merges Stripe configuration into existing config files.
 * This is essential for proper Stripe integration without duplication.
 */

import { BaseModifier, ModifierParams, ModifierResult } from './base-modifier.js';
import { ProjectContext } from '../../../types/agent.js';

export class StripeConfigMergerModifier extends BaseModifier {
  getDescription(): string {
    return 'Merges Stripe configuration into existing config files';
  }

  getSupportedFileTypes(): string[] {
    return ['ts', 'js', 'mjs'];
  }

  getParamsSchema(): any {
    return {
      type: 'object',
      required: ['framework'],
      properties: {
        framework: {
          type: 'string',
          enum: ['nextjs', 'react', 'vue', 'svelte'],
          description: 'Target framework for Stripe configuration'
        },
        features: {
          type: 'array',
          items: { 
            type: 'string',
            enum: ['payments', 'subscriptions', 'webhooks', 'checkout', 'elements']
          },
          description: 'Stripe features to enable'
        },
        publishableKey: {
          type: 'string',
          description: 'Stripe publishable key (will use environment variable if not provided)'
        },
        secretKey: {
          type: 'string',
          description: 'Stripe secret key (will use environment variable if not provided)'
        },
        webhookSecret: {
          type: 'string',
          description: 'Stripe webhook secret (will use environment variable if not provided)'
        },
        apiVersion: {
          type: 'string',
          description: 'Stripe API version to use'
        },
        currency: {
          type: 'string',
          default: 'usd',
          description: 'Default currency for payments'
        },
        webhookEndpoint: {
          type: 'string',
          description: 'Webhook endpoint path'
        },
        checkoutSettings: {
          type: 'object',
          description: 'Stripe Checkout settings'
        },
        elementsSettings: {
          type: 'object',
          description: 'Stripe Elements settings'
        }
      }
    };
  }

  async execute(
    filePath: string,
    params: ModifierParams,
    context: ProjectContext
  ): Promise<ModifierResult> {
    try {
      // Validate parameters
      const validation = this.validateParams(params);
      if (!validation.valid) {
        return {
          success: false,
          error: `Parameter validation failed: ${validation.errors.join(', ')}`
        };
      }

      // Check if file exists
      const fileExists = this.engine.fileExists(filePath);
      if (!fileExists) {
        return {
          success: false,
          error: `Target file ${filePath} does not exist`
        };
      }

      // Read existing content
      const existingContent = await this.readFile(filePath);
      
      // Generate Stripe configuration based on framework
      const stripeConfig = this.generateStripeConfig(params, context);
      
      // Merge with existing content
      const mergedContent = this.mergeStripeConfig(existingContent, stripeConfig, params.framework);
      
      // Write back to VFS
      await this.writeFile(filePath, mergedContent);

      return {
        success: true,
        message: `Successfully merged Stripe configuration for ${params.framework}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private generateStripeConfig(params: ModifierParams, context: ProjectContext): any {
    const {
      features = ['payments'],
      publishableKey,
      secretKey,
      webhookSecret,
      apiVersion = '2023-10-16',
      currency = 'usd',
      webhookEndpoint = '/api/webhooks/stripe',
      checkoutSettings = {},
      elementsSettings = {}
    } = params;

    const config: any = {
      publishableKey: publishableKey || 'process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      secretKey: secretKey || 'process.env.STRIPE_SECRET_KEY',
      apiVersion,
      currency
    };

    // Add webhook configuration
    if (features.includes('webhooks')) {
      config.webhookSecret = webhookSecret || 'process.env.STRIPE_WEBHOOK_SECRET';
      config.webhookEndpoint = webhookEndpoint;
    }

    // Add checkout settings
    if (features.includes('checkout')) {
      config.checkout = {
        mode: 'payment',
        currency,
        ...checkoutSettings
      };
    }

    // Add elements settings
    if (features.includes('elements')) {
      config.elements = {
        appearance: {
          theme: 'stripe',
          ...elementsSettings
        }
      };
    }

    return config;
  }

  private mergeStripeConfig(existingContent: string, stripeConfig: any, framework: string): string {
    if (framework === 'nextjs') {
      return this.mergeNextjsStripeConfig(existingContent, stripeConfig);
    }
    
    // For other frameworks, add basic Stripe configuration
    return this.mergeBasicStripeConfig(existingContent, stripeConfig);
  }

  private mergeNextjsStripeConfig(existingContent: string, stripeConfig: any): string {
    // Check if Stripe is already configured
    if (existingContent.includes('stripe')) {
      return existingContent; // Already configured
    }

    // Add Stripe import
    const importStatement = `import Stripe from 'stripe';\n`;
    
    // Add Stripe configuration
    const configCode = `
// Stripe configuration
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '${stripeConfig.apiVersion}',
});

export const stripeConfig = {
  publishableKey: ${stripeConfig.publishableKey},
  currency: '${stripeConfig.currency}',${stripeConfig.webhookSecret ? `\n  webhookSecret: ${stripeConfig.webhookSecret},` : ''}${stripeConfig.webhookEndpoint ? `\n  webhookEndpoint: '${stripeConfig.webhookEndpoint}',` : ''}
};
`;

    // Insert after imports
    const importEndIndex = existingContent.lastIndexOf('import');
    if (importEndIndex !== -1) {
      const nextLineIndex = existingContent.indexOf('\n', importEndIndex) + 1;
      return existingContent.slice(0, nextLineIndex) + importStatement + existingContent.slice(nextLineIndex) + configCode;
    }

    // If no imports found, add at the beginning
    return importStatement + existingContent + configCode;
  }

  private mergeBasicStripeConfig(existingContent: string, stripeConfig: any): string {
    // Check if Stripe is already configured
    if (existingContent.includes('stripe')) {
      return existingContent; // Already configured
    }

    // Add Stripe import
    const importStatement = `import { loadStripe } from '@stripe/stripe-js';\n`;
    
    // Add Stripe configuration
    const configCode = `
// Stripe configuration
export const stripePromise = loadStripe(${stripeConfig.publishableKey});

export const stripeConfig = {
  publishableKey: ${stripeConfig.publishableKey},
  currency: '${stripeConfig.currency}',
};
`;

    // Insert after imports
    const importEndIndex = existingContent.lastIndexOf('import');
    if (importEndIndex !== -1) {
      const nextLineIndex = existingContent.indexOf('\n', importEndIndex) + 1;
      return existingContent.slice(0, nextLineIndex) + importStatement + existingContent.slice(nextLineIndex) + configCode;
    }

    // If no imports found, add at the beginning
    return importStatement + existingContent + configCode;
  }
}

