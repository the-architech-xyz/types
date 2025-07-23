/**
 * Resend Email Plugin - Pure Technology Implementation
 * 
 * Provides Resend email API integration for modern email delivery.
 * Resend is a developer-first email API with excellent TypeScript support,
 * webhooks, and analytics. Focuses only on email technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */

import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata, PluginCategory, IUIEmailPlugin, UnifiedInterfaceTemplate } from '../../../../types/plugins.js';
import { ValidationResult, ValidationError } from '../../../../types/agents.js';
import { ResendConfig, ResendConfigSchema, ResendDefaultConfig } from './ResendSchema.js';
import { ResendGenerator } from './ResendGenerator.js';

export class ResendPlugin extends BasePlugin implements IUIEmailPlugin {
  private generator!: ResendGenerator;

  constructor() {
    super();
    // Generator will be initialized in install method when pathResolver is available
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
  // ENHANCED PLUGIN INTERFACE IMPLEMENTATIONS
  // ============================================================================

  getParameterSchema() {
    return {
      category: PluginCategory.EMAIL,
      groups: [
        { id: 'credentials', name: 'Credentials', description: 'Configure Resend API credentials.', order: 1, parameters: ['apiKey'] },
        { id: 'sender', name: 'Sender Settings', description: 'Configure default sender information.', order: 2, parameters: ['fromEmail', 'fromName', 'replyTo'] },
        { id: 'templates', name: 'Email Templates', description: 'Configure email templates.', order: 3, parameters: ['welcome', 'verification', 'resetPassword', 'notification', 'marketing'] },
        { id: 'features', name: 'Features', description: 'Configure email features.', order: 4, parameters: ['analytics', 'webhooks', 'templates', 'validation'] },
        { id: 'delivery', name: 'Delivery Settings', description: 'Configure email delivery settings.', order: 5, parameters: ['retryAttempts', 'timeout', 'priority'] },
        { id: 'security', name: 'Security Settings', description: 'Configure email security settings.', order: 6, parameters: ['enableDKIM', 'enableSPF', 'enableDMARC'] },
        { id: 'analytics', name: 'Analytics Settings', description: 'Configure email analytics.', order: 7, parameters: ['enableOpenTracking', 'enableClickTracking', 'enableUnsubscribeTracking'] }
      ],
      parameters: [
        {
          id: 'apiKey',
          name: 'API Key',
          type: 'string' as const,
          description: 'Resend API key.',
          required: true,
          group: 'credentials'
        },
        {
          id: 'fromEmail',
          name: 'From Email',
          type: 'string' as const,
          description: 'Default sender email address.',
          required: true,
          default: 'noreply@yourdomain.com',
          group: 'sender'
        },
        {
          id: 'fromName',
          name: 'From Name',
          type: 'string' as const,
          description: 'Default sender name.',
          required: false,
          default: 'Your App',
          group: 'sender'
        },
        {
          id: 'replyTo',
          name: 'Reply To',
          type: 'string' as const,
          description: 'Reply-to email address.',
          required: false,
          default: 'support@yourdomain.com',
          group: 'sender'
        },
        {
          id: 'welcome',
          name: 'Welcome Template',
          type: 'boolean' as const,
          description: 'Enable welcome email template.',
          required: false,
          default: true,
          group: 'templates'
        },
        {
          id: 'verification',
          name: 'Verification Template',
          type: 'boolean' as const,
          description: 'Enable email verification template.',
          required: false,
          default: true,
          group: 'templates'
        },
        {
          id: 'resetPassword',
          name: 'Reset Password Template',
          type: 'boolean' as const,
          description: 'Enable password reset template.',
          required: false,
          default: true,
          group: 'templates'
        },
        {
          id: 'notification',
          name: 'Notification Template',
          type: 'boolean' as const,
          description: 'Enable notification template.',
          required: false,
          default: true,
          group: 'templates'
        },
        {
          id: 'marketing',
          name: 'Marketing Template',
          type: 'boolean' as const,
          description: 'Enable marketing email template.',
          required: false,
          default: false,
          group: 'templates'
        },
        {
          id: 'analytics',
          name: 'Analytics',
          type: 'boolean' as const,
          description: 'Enable email analytics.',
          required: false,
          default: true,
          group: 'features'
        },
        {
          id: 'webhooks',
          name: 'Webhooks',
          type: 'boolean' as const,
          description: 'Enable webhook notifications.',
          required: false,
          default: true,
          group: 'features'
        },
        {
          id: 'templates',
          name: 'Templates',
          type: 'boolean' as const,
          description: 'Enable email templates.',
          required: false,
          default: true,
          group: 'features'
        },
        {
          id: 'validation',
          name: 'Validation',
          type: 'boolean' as const,
          description: 'Enable email validation.',
          required: false,
          default: true,
          group: 'features'
        },
        {
          id: 'retryAttempts',
          name: 'Retry Attempts',
          type: 'number' as const,
          description: 'Number of retry attempts for failed emails.',
          required: false,
          default: 3,
          group: 'delivery'
        },
        {
          id: 'timeout',
          name: 'Timeout',
          type: 'number' as const,
          description: 'Email sending timeout in seconds.',
          required: false,
          default: 30,
          group: 'delivery'
        },
        {
          id: 'priority',
          name: 'Priority',
          type: 'select' as const,
          description: 'Email delivery priority.',
          required: false,
          default: 'normal',
          options: [
            { value: 'high', label: 'High' },
            { value: 'normal', label: 'Normal' },
            { value: 'low', label: 'Low' }
          ],
          group: 'delivery'
        },
        {
          id: 'enableDKIM',
          name: 'Enable DKIM',
          type: 'boolean' as const,
          description: 'Enable DKIM authentication.',
          required: false,
          default: true,
          group: 'security'
        },
        {
          id: 'enableSPF',
          name: 'Enable SPF',
          type: 'boolean' as const,
          description: 'Enable SPF authentication.',
          required: false,
          default: true,
          group: 'security'
        },
        {
          id: 'enableDMARC',
          name: 'Enable DMARC',
          type: 'boolean' as const,
          description: 'Enable DMARC authentication.',
          required: false,
          default: true,
          group: 'security'
        },
        {
          id: 'enableOpenTracking',
          name: 'Open Tracking',
          type: 'boolean' as const,
          description: 'Enable email open tracking.',
          required: false,
          default: true,
          group: 'analytics'
        },
        {
          id: 'enableClickTracking',
          name: 'Click Tracking',
          type: 'boolean' as const,
          description: 'Enable email click tracking.',
          required: false,
          default: true,
          group: 'analytics'
        },
        {
          id: 'enableUnsubscribeTracking',
          name: 'Unsubscribe Tracking',
          type: 'boolean' as const,
          description: 'Enable unsubscribe tracking.',
          required: false,
          default: true,
          group: 'analytics'
        }
      ],
      dependencies: [],
      validations: []
    };
  }

  validateConfiguration(config: Record<string, any>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!config.apiKey) {
      errors.push({
        field: 'apiKey',
        message: 'Resend API key is required',
        code: 'MISSING_FIELD',
        severity: 'error'
      });
    }

    if (!config.fromEmail) {
      errors.push({
        field: 'fromEmail',
        message: 'From email address is required',
        code: 'MISSING_FIELD',
        severity: 'error'
      });
    }

    // Validate email format
    if (config.fromEmail && !this.isValidEmail(config.fromEmail)) {
      errors.push({
        field: 'fromEmail',
        message: 'Invalid email format for from email address',
        code: 'INVALID_EMAIL',
        severity: 'error'
      });
    }

    if (config.replyTo && !this.isValidEmail(config.replyTo)) {
      errors.push({
        field: 'replyTo',
        message: 'Invalid email format for reply-to address',
        code: 'INVALID_EMAIL',
        severity: 'error'
      });
    }

    // Validate API key format
    if (config.apiKey && !config.apiKey.startsWith('re_')) {
      warnings.push('Resend API key should start with "re_"');
    }

    // Validate numeric fields
    if (config.retryAttempts && (config.retryAttempts < 1 || config.retryAttempts > 10)) {
      warnings.push('Retry attempts should be between 1 and 10');
    }

    if (config.timeout && (config.timeout < 5 || config.timeout > 120)) {
      warnings.push('Timeout should be between 5 and 120 seconds');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate {
    return {
      category: PluginCategory.EMAIL,
      exports: [
        {
          name: 'resend',
          type: 'constant',
          implementation: 'Resend client configuration',
          documentation: 'Resend API client for email sending'
        },
        {
          name: 'EmailService',
          type: 'class' as const,
          implementation: 'Email service class',
          documentation: 'Unified email service for Resend operations'
        },
        {
          name: 'email',
          type: 'constant',
          implementation: 'Email utilities',
          documentation: 'Resend email processing utilities'
        }
      ],
      types: [],
      utilities: [],
      constants: [],
      documentation: 'Resend email API integration with TypeScript support, webhooks, and analytics'
    };
  }

  // ============================================================================
  // IUIEmailPlugin INTERFACE IMPLEMENTATIONS
  // ============================================================================

  getEmailServices(): string[] {
    return ['resend', 'resend-api', 'resend-webhooks'];
  }

  getEmailFeatures(): string[] {
    return ['transactional-emails', 'email-templates', 'email-tracking', 'analytics', 'webhooks'];
  }

  getTemplateOptions(): string[] {
    return ['react-templates', 'html-templates', 'text-templates', 'dynamic-templates'];
  }

  // ============================================================================
  // PLUGIN LIFECYCLE - Pure Technology Implementation
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectName, projectPath, pluginConfig } = context;
      
      context.logger.info('Installing Resend email service...');

      // Initialize path resolver
      this.initializePathResolver(context);
      
      // Initialize generator
      this.generator = new ResendGenerator();

      // Validate configuration
      const validation = this.validateConfiguration(pluginConfig);
      if (!validation.valid) {
        return this.createErrorResult('Invalid Resend configuration', validation.errors, startTime);
      }

      // Step 1: Install dependencies
      await this.installDependencies(['resend']);

      // Step 2: Generate files using the generator
      const emailClient = ResendGenerator.generateEmailClient(pluginConfig as any);
      const emailConfig = ResendGenerator.generateEmailConfig(pluginConfig as any);
      const emailTypes = ResendGenerator.generateEmailTypes();
      const emailService = ResendGenerator.generateEmailService();
      const envConfig = ResendGenerator.generateEnvConfig(pluginConfig as any);
      
      // Step 3: Write files to project
      await this.generateFile('src/lib/email/resend.ts', emailClient);
      await this.generateFile('src/lib/email/config.ts', emailConfig);
      await this.generateFile('src/lib/email/types.ts', emailTypes);
      await this.generateFile('src/lib/email/service.ts', emailService);
      await this.generateFile('.env.local', envConfig);

      // Step 4: Generate unified interface
      const unifiedIndex = `/**
 * Unified Email Interface - Resend Implementation
 * 
 * This file provides a unified interface for email operations
 * that works with Resend.
 */

export { resend } from './resend.js';
export { EmailService } from './service.js';
export type * from './types.js';

// Default export for convenience
export { EmailService as default } from './service.js';
`;
      await this.generateFile('src/lib/email/index.ts', unifiedIndex);

      const duration = Date.now() - startTime;

      return this.createSuccessResult(
        [
          { type: 'file' as const, path: 'src/lib/email/resend.ts' },
          { type: 'file' as const, path: 'src/lib/email/config.ts' },
          { type: 'file' as const, path: 'src/lib/email/types.ts' },
          { type: 'file' as const, path: 'src/lib/email/service.ts' },
          { type: 'file' as const, path: 'src/lib/email/index.ts' },
          { type: 'file' as const, path: '.env.local' }
        ],
        [
          {
            name: 'resend',
            version: '^3.1.0',
            type: 'production',
            category: PluginCategory.EMAIL
          }
        ],
        [
          { name: 'email:test', command: 'node -e "require(\'./src/lib/email/service.js\').EmailService.sendEmail({to:\'test@example.com\',subject:\'Test\',html:\'<h1>Test</h1>\'})"', description: 'Test email sending', category: 'dev' as const },
          { name: 'email:validate', command: 'node -e "require(\'./src/lib/email/service.js\').EmailService.validateEmail(\'test@example.com\')"', description: 'Validate email addresses', category: 'dev' as const },
          { name: 'email:webhook', command: 'npx resend webhook:listen', description: 'Listen for webhook events', category: 'dev' as const }
        ],
        [],
        validation.warnings,
        startTime
      );

    } catch (error) {
      return this.createErrorResult(
        'Failed to install Resend email service',
        [],
        startTime
      );
    }
  }

  // ============================================================================
  // PLUGIN INTERFACE IMPLEMENTATIONS
  // ============================================================================

  getDependencies(): string[] {
    return ['resend'];
  }

  getDevDependencies(): string[] {
    return [];
  }

  getCompatibility(): any {
    return {
      frameworks: ['nextjs', 'react', 'vue', 'svelte', 'express', 'fastify'],
      platforms: ['web', 'server'],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm'],
      conflicts: []
    };
  }

  getConflicts(): string[] {
    return [];
  }

  getRequirements(): any[] {
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
    return {
      apiKey: '',
      fromEmail: 'noreply@yourdomain.com',
      fromName: 'Your App',
      replyTo: 'support@yourdomain.com',
      welcome: true,
      verification: true,
      resetPassword: true,
      notification: true,
      marketing: false,
      analytics: true,
      webhooks: true,
      templates: true,
      validation: true,
      retryAttempts: 3,
      timeout: 30,
      priority: 'normal',
      enableDKIM: true,
      enableSPF: true,
      enableDMARC: true,
      enableOpenTracking: true,
      enableClickTracking: true,
      enableUnsubscribeTracking: true
    };
  }

  getConfigSchema(): any {
    return ResendConfigSchema;
  }

  // ============================================================================
  // PRIVATE UTILITY METHODS
  // ============================================================================

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
} 