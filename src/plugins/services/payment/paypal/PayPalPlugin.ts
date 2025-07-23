import { IPlugin, PluginMetadata, PluginCategory, PluginContext, PluginResult, ValidationResult, ConfigSchema, CompatibilityMatrix, PluginRequirement, TargetPlatform } from '../../../../types/plugins.js';
import { ValidationError } from '../../../../types/agents.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { PayPalConfig, PayPalConfigSchema, PayPalDefaultConfig } from './PayPalSchema.js';
import { PayPalGenerator } from './PayPalGenerator.js';
import { CommandRunner } from '../../../../core/cli/command-runner.js';

export class PayPalPlugin implements IPlugin {
  private runner: CommandRunner;

  constructor() {
    this.runner = new CommandRunner();
  }

  getMetadata(): PluginMetadata {
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

  async validate(context: PluginContext): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const { pluginConfig } = context;

    if (!pluginConfig.clientId) {
      errors.push({ field: 'clientId', message: 'PayPal client ID is required', code: 'MISSING_CLIENT_ID', severity: 'error' });
    }
    if (!pluginConfig.clientSecret) {
      errors.push({ field: 'clientSecret', message: 'PayPal client secret is required', code: 'MISSING_CLIENT_SECRET', severity: 'error' });
    }

    return { valid: errors.length === 0, errors, warnings: [] };
  }

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    try {
      await this.installDependencies(context);
      await this.createProjectFiles(context);

      const duration = Date.now() - startTime;
      return {
        success: true,
        artifacts: [
          { type: 'file', path: path.join('src', 'lib', 'paypal', 'client.ts') },
          { type: 'file', path: path.join('src', 'pages', 'api', 'paypal', 'orders', 'index.ts') },
          { type: 'file', path: path.join('src', 'pages', 'api', 'paypal', 'orders', '[orderID]', 'capture.ts') },
        ],
        dependencies: [
          { name: '@paypal/checkout-server-sdk', version: '^1.0.3', type: 'production', category: PluginCategory.PAYMENT },
          { name: '@paypal/react-paypal-js', version: '^8.1.3', type: 'production', category: PluginCategory.PAYMENT },
        ],
        scripts: [],
        configs: [{
          file: '.env',
          content: PayPalGenerator.generateEnvConfig(context.pluginConfig as PayPalConfig),
          mergeStrategy: 'append'
        }],
        errors: [],
        warnings: [],
        duration
      };
    } catch (error) {
      return this.createErrorResult('Failed to install PayPal plugin', startTime, error);
    }
  }

  async uninstall(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    try {
      await this.runner.execCommand(['npm', 'uninstall', '@paypal/checkout-server-sdk', '@paypal/react-paypal-js'], { cwd: context.projectPath });
      
      const libDir = path.join(context.projectPath, 'src', 'lib', 'paypal');
      if (await fsExtra.pathExists(libDir)) await fsExtra.remove(libDir);
      
      const apiDir = path.join(context.projectPath, 'src', 'pages', 'api', 'paypal');
      if (await fsExtra.pathExists(apiDir)) await fsExtra.remove(apiDir);
      
      return {
        success: true,
        artifacts: [],
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [],
        warnings: ['PayPal files and dependencies have been removed.'],
        duration: Date.now() - startTime
      };
    } catch (error) {
      return this.createErrorResult('Failed to uninstall PayPal plugin', startTime, error);
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    return this.install(context);
  }

  getCompatibility(): CompatibilityMatrix {
    return {
      frameworks: ['nextjs', 'react'],
      platforms: [TargetPlatform.WEB],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm'],
      conflicts: ['stripe']
    };
  }

  getDependencies(): string[] {
    return ['@paypal/checkout-server-sdk', '@paypal/react-paypal-js'];
  }

  getConflicts(): string[] {
    return ['stripe'];
  }

  getRequirements(): PluginRequirement[] {
    return [
      { type: 'package', name: '@paypal/checkout-server-sdk', description: 'PayPal Checkout Server SDK', version: '^1.0.3' },
      { type: 'package', name: '@paypal/react-paypal-js', description: 'React components for PayPal JS SDK', version: '^8.1.3' },
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return PayPalDefaultConfig;
  }

  getConfigSchema(): ConfigSchema {
    return PayPalConfigSchema;
  }

  private async installDependencies(context: PluginContext): Promise<void> {
    await this.runner.execCommand(['npm', 'install', '@paypal/checkout-server-sdk', '@paypal/react-paypal-js'], { cwd: context.projectPath });
  }

  private async createProjectFiles(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    const config = pluginConfig as PayPalConfig;

    const libDir = path.join(projectPath, 'src', 'lib', 'paypal');
    await fsExtra.ensureDir(libDir);
    await fsExtra.writeFile(path.join(libDir, 'client.ts'), PayPalGenerator.generatePayPalClient(config));

    const apiDir = path.join(projectPath, 'src', 'pages', 'api', 'paypal');
    await fsExtra.ensureDir(path.join(apiDir, 'orders', '[orderID]'));
    
    await fsExtra.writeFile(path.join(apiDir, 'orders', 'index.ts'), PayPalGenerator.generateCreateOrderRoute(config));
    await fsExtra.writeFile(path.join(apiDir, 'orders', '[orderID]', 'capture.ts'), PayPalGenerator.generateCaptureOrderRoute(config));

    if (config.webhookId) {
      await fsExtra.writeFile(path.join(apiDir, 'webhook.ts'), PayPalGenerator.generateWebhookRoute(config));
    }
  }

  private createErrorResult(message: string, startTime: number, error: any): PluginResult {
    return {
      success: false,
      artifacts: [],
      dependencies: [],
      scripts: [],
      configs: [],
      errors: [{ code: 'PAYPAL_PLUGIN_ERROR', message, details: error, severity: 'error' }],
      warnings: [],
      duration: Date.now() - startTime
    };
  }
} 