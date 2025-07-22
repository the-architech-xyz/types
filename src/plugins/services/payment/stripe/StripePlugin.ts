/**
 * Stripe Payment Plugin - Pure Technology Implementation
 * 
 * Provides Stripe payment processing and subscription management setup.
 * Focuses only on payment technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */

import { IPlugin, PluginMetadata, PluginArtifact, ValidationResult, PluginCategory, PluginContext, PluginResult, TargetPlatform, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../../../types/plugin.js';
import { TemplateService, templateService } from '../../../../core/templates/template-service.js';
import { CommandRunner } from '../../../../core/cli/command-runner.js';
import { ValidationError } from '../../../../types/agent.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { structureService, StructureInfo } from '../../../../core/project/structure-service.js';
import { StripeConfig, StripeConfigSchema, StripeDefaultConfig } from './StripeSchema.js';
import { StripeGenerator } from './StripeGenerator.js';

export class StripePlugin implements IPlugin {
  private templateService: TemplateService;
  private runner: CommandRunner;

  constructor() {
    this.templateService = templateService;
    this.runner = new CommandRunner();
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

  async install(context: PluginContext): Promise<PluginResult> {
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
            path: path.join(projectPath, 'src', 'lib', 'payment', 'service.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'payment', 'index.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'app', 'api', 'stripe', 'webhook', 'route.ts')
          }
        ],
        dependencies: [
          {
            name: 'stripe',
            version: '^14.0.0',
            type: 'production',
            category: PluginCategory.PAYMENT
          }
        ],
        scripts: [
          {
            name: 'stripe:test',
            command: 'node -e "require(\'./src/lib/payment/service.js\').paymentService.createPaymentIntent(1000, \'usd\')\"',
            description: 'Test payment intent creation',
            category: 'dev'
          },
          {
            name: 'stripe:webhook',
            command: 'stripe listen --forward-to localhost:3000/api/stripe/webhook',
            description: 'Listen for webhook events',
            category: 'dev'
          },
          {
            name: 'stripe:test-webhook',
            command: 'stripe trigger payment_intent.succeeded',
            description: 'Trigger test webhook events',
            category: 'dev'
          }
        ],
        configs: [
          {
            file: '.env',
            content: StripeGenerator.generateEnvConfig(pluginConfig as StripeConfig),
            mergeStrategy: 'append'
          }
        ],
        errors: [],
        warnings: [],
        duration
      };

    } catch (error) {
      return this.createErrorResult(
        'Failed to install Stripe payments',
        startTime,
        [],
        error
      );
    }
  }

  async uninstall(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectPath } = context;
      
      context.logger.info('Uninstalling Stripe payments...');

      // Remove Stripe dependencies
      await this.runner.execCommand(['npm', 'uninstall', 'stripe'], { cwd: projectPath });

      // Remove payment service files
      const filesToRemove = [
        path.join(projectPath, 'src', 'lib', 'payment', 'stripe.ts'),
        path.join(projectPath, 'src', 'lib', 'payment', 'service.ts'),
        path.join(projectPath, 'src', 'lib', 'payment', 'index.ts'),
        path.join(projectPath, 'src', 'app', 'api', 'stripe', 'webhook', 'route.ts')
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
        warnings: ['Stripe payment files removed. You may need to manually remove dependencies from package.json'],
        duration
      };

    } catch (error) {
      return this.createErrorResult(
        'Failed to uninstall Stripe payments',
        startTime,
        [],
        error
      );
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      context.logger.info('Updating Stripe payments...');

      // Update Stripe dependencies
      await this.runner.execCommand(['npm', 'update', 'stripe']);

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

    } catch (error) {
      return this.createErrorResult(
        'Failed to update Stripe payments',
        startTime,
        [],
        error
      );
    }
  }

  async validate(context: PluginContext): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    try {
      // Check if Stripe client is properly configured
      const stripePath = path.join(context.projectPath, 'src', 'lib', 'payment', 'stripe.ts');
      if (!await fsExtra.pathExists(stripePath)) {
        errors.push({
          field: 'stripe.client',
          message: 'Stripe client configuration file not found',
          code: 'MISSING_CLIENT',
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
        if (!envContent.includes('STRIPE_WEBHOOK_SECRET')) {
          warnings.push('STRIPE_WEBHOOK_SECRET not found in .env file');
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
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

  getCompatibility(): CompatibilityMatrix {
    return {
      frameworks: ['nextjs', 'react', 'vue', 'angular', 'express', 'fastify', 'nest'],
      platforms: [TargetPlatform.WEB, TargetPlatform.SERVER],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
      databases: [],
      conflicts: []
    };
  }

  getDependencies(): string[] {
    return ['stripe'];
  }

  getConflicts(): string[] {
    return [];
  }

  getRequirements(): PluginRequirement[] {
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
    return StripeDefaultConfig;
  }

  getConfigSchema(): ConfigSchema {
    return StripeConfigSchema;
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private async installDependencies(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Installing Stripe dependencies...');

    const dependencies = ['stripe@^14.0.0'];

    await this.runner.execCommand(['npm', 'install', ...dependencies], { cwd: projectPath });
  }

  private async initializeStripeConfig(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Initializing Stripe configuration...');

    // Create payment lib directory
    const paymentLibDir = path.join(projectPath, 'src', 'lib', 'payment');
    await fsExtra.ensureDir(paymentLibDir);

    // Generate Stripe client
    const clientContent = StripeGenerator.generateStripeClient(pluginConfig as StripeConfig);
    await fsExtra.writeFile(
      path.join(paymentLibDir, 'stripe.ts'),
      clientContent
    );

    // Generate payment service
    const serviceContent = StripeGenerator.generatePaymentService(pluginConfig as StripeConfig);
    await fsExtra.writeFile(
      path.join(paymentLibDir, 'service.ts'),
      serviceContent
    );
  }

  private async createPaymentFiles(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Creating payment files...');

    // Create API routes directory
    const apiDir = path.join(projectPath, 'src', 'app', 'api', 'stripe', 'webhook');
    await fsExtra.ensureDir(apiDir);

    // Generate webhook route
    const webhookContent = StripeGenerator.generateWebhookRoute(pluginConfig as StripeConfig);
    await fsExtra.writeFile(
      path.join(apiDir, 'route.ts'),
      webhookContent
    );
  }

  private async generateUnifiedInterfaceFiles(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Generating unified interface files...');

    const paymentLibDir = path.join(projectPath, 'src', 'lib', 'payment');
    await fsExtra.ensureDir(paymentLibDir);

    // Generate unified index
    const indexContent = `/**
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
    await fsExtra.writeFile(
      path.join(paymentLibDir, 'index.ts'),
      indexContent
    );
  }

  private createErrorResult(
    message: string,
    startTime: number,
    errors: any[] = [],
    originalError?: any
  ): PluginResult {
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