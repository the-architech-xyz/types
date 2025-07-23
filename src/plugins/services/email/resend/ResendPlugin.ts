/**
 * Resend Plugin - Pure Technology Implementation
 * 
 * Provides Resend email API integration for modern email delivery.
 * Resend is a developer-first email API with excellent TypeScript support,
 * webhooks, and analytics. Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */

import { IPlugin, PluginMetadata, PluginArtifact, ValidationResult, PluginCategory, PluginContext, PluginResult, TargetPlatform, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../../../types/plugins.js';
import { TemplateService, templateService } from '../../../../core/templates/template-service.js';
import { CommandRunner } from '../../../../core/cli/command-runner.js';
import { ValidationError } from '../../../../types/agents.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { structureService, StructureInfo } from '../../../../core/project/structure-service.js';
import { ResendConfig, ResendConfigSchema, ResendDefaultConfig } from './ResendSchema.js';
import { ResendGenerator } from './ResendGenerator.js';

export class ResendPlugin implements IPlugin {
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
      id: 'resend',
      name: 'Resend',
      version: '1.0.0',
      description: 'Developer-first email API with excellent TypeScript support, webhooks, and analytics',
      author: 'The Architech Team',
      category: PluginCategory.EMAIL,
      tags: ['email', 'api', 'typescript', 'webhooks', 'analytics', 'resend', 'transactional'],
      license: 'MIT',
      repository: 'https://github.com/resendlabs/resend-node',
      homepage: 'https://resend.com',
      documentation: 'https://resend.com/docs'
    };
  }

  // ============================================================================
  // PLUGIN LIFECYCLE - Pure Technology Implementation
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectName, projectPath, pluginConfig } = context;
      
      context.logger.info('Installing Resend email service...');

      // Step 1: Install dependencies
      await this.installDependencies(context);

      // Step 2: Create email service configuration
      await this.createEmailConfiguration(context);

      // Step 3: Create email templates
      await this.createEmailTemplates(context);

      // Step 4: Create API routes for webhooks
      await this.createAPIRoutes(context);

      // Step 5: Generate unified interface files
      await this.generateUnifiedInterfaceFiles(context);

      // Step 6: Create email utilities
      await this.createEmailUtilities(context);

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'email', 'resend.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'email', 'config.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'email', 'types.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'email', 'service.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'email', 'index.ts')
          }
        ],
        dependencies: [
          {
            name: 'resend',
            version: '^3.1.0',
            type: 'production',
            category: PluginCategory.EMAIL
          }
        ],
        scripts: [
          {
            name: 'email:test',
            command: 'node -e "require(\'./src/lib/email/service.js\').emailService.sendEmail({to:\'test@example.com\',subject:\'Test\',html:\'<h1>Test</h1>\'})\"',
            description: 'Test email sending',
            category: 'dev'
          },
          {
            name: 'email:validate',
            command: 'node -e "require(\'./src/lib/email/service.js\').emailService.validateEmail(\'test@example.com\')\"',
            description: 'Validate email addresses',
            category: 'dev'
          },
          {
            name: 'email:webhook',
            command: 'npx resend webhook:listen',
            description: 'Listen for webhook events',
            category: 'dev'
          }
        ],
        configs: [
          {
            file: '.env',
            content: ResendGenerator.generateEnvConfig(pluginConfig as ResendConfig),
            mergeStrategy: 'append'
          }
        ],
        errors: [],
        warnings: [],
        duration
      };

    } catch (error) {
      return this.createErrorResult(
        'Failed to install Resend email service',
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
      
      context.logger.info('Uninstalling Resend email service...');

      // Remove Resend dependencies
      await this.runner.execCommand(['npm', 'uninstall', 'resend'], { cwd: projectPath });

      // Remove email service files
      const filesToRemove = [
        path.join(projectPath, 'src', 'lib', 'email', 'resend.ts'),
        path.join(projectPath, 'src', 'lib', 'email', 'config.ts'),
        path.join(projectPath, 'src', 'lib', 'email', 'types.ts'),
        path.join(projectPath, 'src', 'lib', 'email', 'service.ts'),
        path.join(projectPath, 'src', 'lib', 'email', 'index.ts')
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
        warnings: ['Resend email service files removed. You may need to manually remove dependencies from package.json'],
        duration
      };

    } catch (error) {
      return this.createErrorResult(
        'Failed to uninstall Resend email service',
        startTime,
        [],
        error
      );
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      context.logger.info('Updating Resend email service...');

      // Update Resend dependencies
      await this.runner.execCommand(['npm', 'update', 'resend']);

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
        'Failed to update Resend email service',
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
      // Check if Resend client is properly configured
      const resendPath = path.join(context.projectPath, 'src', 'lib', 'email', 'resend.ts');
      if (!await fsExtra.pathExists(resendPath)) {
        errors.push({
          field: 'resend.client',
          message: 'Resend client configuration file not found',
          code: 'MISSING_CLIENT',
          severity: 'error'
        });
      }

      // Validate environment variables
      const envPath = path.join(context.projectPath, '.env');
      if (await fsExtra.pathExists(envPath)) {
        const envContent = await fsExtra.readFile(envPath, 'utf-8');
        if (!envContent.includes('RESEND_API_KEY')) {
          warnings.push('RESEND_API_KEY not found in .env file');
        }
        if (!envContent.includes('EMAIL_FROM')) {
          warnings.push('EMAIL_FROM not found in .env file');
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
    return ['resend'];
  }

  getConflicts(): string[] {
    return [];
  }

  getRequirements(): PluginRequirement[] {
    return [
      {
        type: 'package',
        name: 'resend',
        description: 'Resend email API client',
        version: '^3.1.0'
      },
      {
        type: 'config',
        name: 'RESEND_API_KEY',
        description: 'Resend API key',
        optional: false
      },
      {
        type: 'config',
        name: 'EMAIL_FROM',
        description: 'Default sender email address',
        optional: false
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return ResendDefaultConfig;
  }

  getConfigSchema(): ConfigSchema {
    return ResendConfigSchema;
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private async installDependencies(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Installing Resend dependencies...');

    const dependencies = ['resend@^3.1.0'];

    await this.runner.execCommand(['npm', 'install', ...dependencies], { cwd: projectPath });
  }

  private async createEmailConfiguration(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Creating email configuration...');

    // Create email lib directory
    const emailLibDir = path.join(projectPath, 'src', 'lib', 'email');
    await fsExtra.ensureDir(emailLibDir);

    // Generate Resend client
    const clientContent = ResendGenerator.generateEmailClient(pluginConfig as ResendConfig);
    await fsExtra.writeFile(
      path.join(emailLibDir, 'resend.ts'),
      clientContent
    );

    // Generate email configuration
    const configContent = ResendGenerator.generateEmailConfig(pluginConfig as ResendConfig);
    await fsExtra.writeFile(
      path.join(emailLibDir, 'config.ts'),
      configContent
    );

    // Generate email types
    const typesContent = ResendGenerator.generateEmailTypes();
    await fsExtra.writeFile(
      path.join(emailLibDir, 'types.ts'),
      typesContent
    );
  }

  private async createEmailTemplates(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Creating email templates...');

    // Create templates directory
    const templatesDir = path.join(projectPath, 'src', 'lib', 'email', 'templates');
    await fsExtra.ensureDir(templatesDir);

    // Note: Template generation would be handled by the generator
    // For now, we'll create a basic template structure
  }

  private async createAPIRoutes(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Creating API routes for webhooks...');

    // Create API routes directory
    const apiDir = path.join(projectPath, 'src', 'app', 'api', 'webhooks', 'resend');
    await fsExtra.ensureDir(apiDir);

    // Note: Webhook route generation would be handled by the generator
  }

  private async createEmailUtilities(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Creating email utilities...');

    const emailLibDir = path.join(projectPath, 'src', 'lib', 'email');
    await fsExtra.ensureDir(emailLibDir);

    // Generate email service
    const serviceContent = ResendGenerator.generateEmailService();
    await fsExtra.writeFile(
      path.join(emailLibDir, 'service.ts'),
      serviceContent
    );
  }

  private async generateUnifiedInterfaceFiles(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Generating unified interface files...');

    const emailLibDir = path.join(projectPath, 'src', 'lib', 'email');
    await fsExtra.ensureDir(emailLibDir);

    // Generate unified index
    const indexContent = `/**
 * Unified Email Interface - Resend Implementation
 * 
 * This file provides a unified interface for email operations
 * that works with Resend.
 */

export { default as resend } from './resend.js';
export { default as emailConfig } from './config.js';
export { emailService } from './service.js';
export type * from './types.js';

// Default export for convenience
export { emailService as default } from './service.js';
`;
    await fsExtra.writeFile(
      path.join(emailLibDir, 'index.ts'),
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
          code: 'RESEND_INSTALL_ERROR',
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