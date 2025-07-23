/**
 * SendGrid Plugin - Pure Technology Implementation
 */

import { IPlugin, PluginMetadata, PluginContext, PluginResult, ValidationResult, ConfigSchema, PluginRequirement, PluginCategory, CompatibilityMatrix, TargetPlatform } from '../../../../types/plugins.js';
import { CommandRunner } from '../../../../core/cli/command-runner.js';
import { ValidationError } from '../../../../types/agents.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { SendGridConfig, SendGridConfigSchema, SendGridDefaultConfig } from './SendGridSchema.js';
import { SendGridGenerator } from './SendGridGenerator.js';

export class SendGridPlugin implements IPlugin {
  private runner: CommandRunner;

  constructor() {
    this.runner = new CommandRunner();
  }

  getMetadata(): PluginMetadata {
    return {
      id: 'sendgrid',
      name: 'SendGrid',
      version: '1.0.0',
      description: 'Enterprise-grade email delivery service with advanced analytics and marketing features',
      author: 'The Architech Team',
      category: PluginCategory.EMAIL,
      tags: ['email', 'api', 'enterprise', 'analytics', 'marketing', 'sendgrid', 'transactional'],
      license: 'MIT',
      repository: 'https://github.com/sendgrid/sendgrid-nodejs',
      homepage: 'https://sendgrid.com',
      documentation: 'https://sendgrid.com/docs'
    };
  }

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    try {
      const { projectPath, pluginConfig } = context;
      context.logger.info('Installing SendGrid email service...');

      await this.installDependencies(context);
      await this.createEmailFiles(context);

      const duration = Date.now() - startTime;
      return {
        success: true,
        artifacts: [
          { type: 'file', path: path.join(projectPath, 'src', 'lib', 'email', 'client.ts') },
          { type: 'file', path: path.join(projectPath, 'src', 'lib', 'email', 'config.ts') },
          { type: 'file', path: path.join(projectPath, 'src', 'lib', 'email', 'types.ts') },
          { type: 'file', path: path.join(projectPath, 'src', 'lib', 'email', 'service.ts') },
        ],
        dependencies: [{ name: '@sendgrid/mail', version: '^8.1.0', type: 'production', category: PluginCategory.EMAIL }],
        scripts: [],
        configs: [{
          file: '.env',
          content: SendGridGenerator.generateEnvConfig(pluginConfig as SendGridConfig),
          mergeStrategy: 'append'
        }],
        errors: [],
        warnings: [],
        duration
      };
    } catch (error) {
      return this.createErrorResult('Failed to install SendGrid', startTime, [], error);
    }
  }

  async uninstall(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    try {
      const { projectPath } = context;
      context.logger.info('Uninstalling SendGrid...');

      await this.runner.execCommand(['npm', 'uninstall', '@sendgrid/mail'], { cwd: projectPath });

      const emailDir = path.join(projectPath, 'src', 'lib', 'email');
      if (await fsExtra.pathExists(emailDir)) {
        await fsExtra.remove(emailDir);
      }

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
      return this.createErrorResult('Failed to uninstall SendGrid', startTime, [], error);
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    try {
      context.logger.info('Updating SendGrid...');
      await this.installDependencies(context);
      await this.createEmailFiles(context);
      const duration = Date.now() - startTime;
      return {
        success: true,
        artifacts: [],
        dependencies: [],
        scripts: [],
        configs: [],
        errors: [],
        warnings: ['SendGrid files have been updated. Please review the changes.'],
        duration
      };
    } catch (error) {
      return this.createErrorResult('Failed to update SendGrid', startTime, [], error);
    }
  }

  async validate(context: PluginContext): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const { pluginConfig } = context;

    if (!pluginConfig.apiKey) {
      errors.push({
        field: 'apiKey',
        message: 'SendGrid API key is required.',
        code: 'MISSING_API_KEY',
        severity: 'error'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  getCompatibility(): CompatibilityMatrix {
    return {
      frameworks: ['nextjs', 'react', 'node'],
      platforms: [TargetPlatform.SERVER],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm'],
      conflicts: ['resend', 'mailgun', 'nodemailer']
    };
  }

  getDependencies(): string[] {
    return ['@sendgrid/mail'];
  }

  getConflicts(): string[] {
    return ['resend', 'mailgun', 'nodemailer', 'aws-ses'];
  }

  getRequirements(): PluginRequirement[] {
    return [
      {
        type: 'service',
        name: 'SendGrid Account',
        description: 'A SendGrid account with an API key is required.',
        optional: false
      },
      {
        type: 'config',
        name: 'SENDGRID_API_KEY',
        description: 'Your SendGrid API key, set as an environment variable.',
        optional: false
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return SendGridDefaultConfig;
  }

  getConfigSchema(): ConfigSchema {
    return SendGridConfigSchema;
  }

  private async installDependencies(context: PluginContext): Promise<void> {
    context.logger.info('Installing SendGrid dependencies...');
    await this.runner.execCommand(['npm', 'install', '@sendgrid/mail'], { cwd: context.projectPath });
  }

  private async createEmailFiles(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    const config = pluginConfig as SendGridConfig;

    context.logger.info('Creating SendGrid email files...');
    const emailDir = path.join(projectPath, 'src', 'lib', 'email');
    await fsExtra.ensureDir(emailDir);

    await fsExtra.writeFile(path.join(emailDir, 'client.ts'), SendGridGenerator.generateEmailClient(config));
    await fsExtra.writeFile(path.join(emailDir, 'config.ts'), SendGridGenerator.generateEmailConfig(config));
    await fsExtra.writeFile(path.join(emailDir, 'types.ts'), SendGridGenerator.generateEmailTypes());
    await fsExtra.writeFile(path.join(emailDir, 'service.ts'), SendGridGenerator.generateEmailService(config));
  }

  private createErrorResult(message: string, startTime: number, errors: any[] = [], originalError?: any): PluginResult {
    const duration = Date.now() - startTime;
    return {
      success: false,
      artifacts: [],
      dependencies: [],
      scripts: [],
      configs: [],
      errors: [
        {
          code: 'SENDGRID_PLUGIN_ERROR',
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