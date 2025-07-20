/**
 * Email Agent - Email Service Orchestrator
 * 
 * Orchestrates email service setup and configuration through unified interfaces.
 * Supports multiple email providers (Resend, SendGrid, Mailgun) with consistent APIs.
 */

import { existsSync } from 'fs';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { AbstractAgent } from './base/abstract-agent.js';
import { PluginSystem } from '../core/plugin/plugin-system.js';
import { PluginContext, ProjectType, TargetPlatform } from '../types/plugin.js';
import {
  IAgent,
  AgentContext,
  AgentResult,
  AgentMetadata,
  AgentCapability,
  AgentCategory,
  CapabilityCategory,
  ValidationResult,
  Artifact,
  ValidationError,
  Logger
} from '../types/agent.js';
import { CommandRunner } from '../core/cli/command-runner.js';

interface EmailSetupConfig {
  provider: 'resend' | 'sendgrid' | 'mailgun' | 'none';
  fromEmail: string;
  fromName?: string;
  replyTo?: string;
  templates: {
    welcome: boolean;
    verification: boolean;
    resetPassword: boolean;
    notification: boolean;
    marketing: boolean;
  };
  validation: {
    emailValidation: boolean;
    domainValidation: boolean;
    deliverabilityCheck: boolean;
  };
  analytics: {
    tracking: boolean;
    webhooks: boolean;
    stats: boolean;
  };
}

interface EmailSetupResult {
  provider: string;
  templates: string[];
  validation: boolean;
  analytics: boolean;
  config: Record<string, any>;
}

export class EmailAgent implements IAgent {
  private pluginSystem: PluginSystem;
  private logger: Logger;
  private runner: CommandRunner;

  constructor() {
    this.pluginSystem = PluginSystem.getInstance();
    this.logger = this.pluginSystem.getLogger();
    this.runner = new CommandRunner();
  }

  // ============================================================================
  // AGENT METADATA
  // ============================================================================

  getMetadata(): AgentMetadata {
    return {
      name: 'Email Service Orchestrator',
      version: '1.00',
      description: 'AI-powered email service setup and configuration',
      author: 'The Architech Team',
      category: AgentCategory.EMAIL,
      tags: ['email', 'communication', 'notifications', 'templates'],
      dependencies: ['base-project'],
      requirements: [{
        type: 'package',
        name: 'email-provider',
        description: 'Email service provider package'
      }]
    };
  }

  getCapabilities(): AgentCapability[] {
    return [
      {
        name: 'email-provider-setup',
        description: 'Setup and configure email service providers',
        category: CapabilityCategory.SETUP
      },
      {
        name: 'email-template-creation',
        description: 'Create and manage email templates',
        category: CapabilityCategory.GENERATION
      },
      {
        name: 'email-validation-configuration',
        description: 'Configure email validation and verification',
        category: CapabilityCategory.CONFIGURATION
      },
      {
        name: 'email-analytics-setup',
        description: 'Setup email analytics and tracking',
        category: CapabilityCategory.SETUP
      },
      {
        name: 'email-webhook-configuration',
        description: 'Configure email webhooks and callbacks',
        category: CapabilityCategory.CONFIGURATION
      }
    ];
  }

  // ============================================================================
  // MAIN EXECUTION
  // ============================================================================

  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Starting email service orchestration...');

      // Step 1: Analyze email requirements
      const config = await this.analyzeEmailRequirements(context);
      
      // Step 2: Select email provider
      const provider = await this.selectEmailProvider(config, context);
      
      // Step 3: Setup email service
      const setupResult = await this.setupEmailService(provider, config, context);
      
      // Step 4: Configure templates
      const templateResult = await this.configureEmailTemplates(setupResult, context);
      
      // Step 5: Setup validation and analytics
      const validationResult = await this.setupEmailValidation(setupResult, config, context);
      const analyticsResult = await this.setupEmailAnalytics(setupResult, config, context);

      const duration = Date.now() - startTime;

      return {
        success: true,
        data: {
          provider: setupResult.provider,
          templates: templateResult.templates,
          validation: validationResult.success,
          analytics: analyticsResult.success,
          config: setupResult.config
        },
        artifacts: [
          ...setupResult.artifacts,
          ...templateResult.artifacts,
          ...validationResult.artifacts,
          ...analyticsResult.artifacts
        ],
        warnings: [
          ...setupResult.warnings,
          ...templateResult.warnings,
          ...validationResult.warnings,
          ...analyticsResult.warnings
        ],
        duration
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult(
        `Email service setup failed: ${errorMessage}`,
        startTime,
        [],
        error
      );
    }
  }

  // ============================================================================
  // REQUIREMENTS ANALYSIS
  // ============================================================================

  private async analyzeEmailRequirements(context: AgentContext): Promise<EmailSetupConfig> {
    this.logger.info('Analyzing email service requirements...');

    const userInput = context.config.userInput || '';
    const projectType = context.config.projectType || 'scalable-monorepo';
    
    // Extract email requirements from user input
    const hasAuth = userInput.toLowerCase().includes('auth') || userInput.toLowerCase().includes('authentication');
    const hasNotifications = userInput.toLowerCase().includes('notification') || userInput.toLowerCase().includes('email');
    const hasMarketing = userInput.toLowerCase().includes('marketing') || userInput.toLowerCase().includes('newsletter');
    
    // Determine required templates based on project needs
    const templates = {
      welcome: hasAuth,
      verification: hasAuth,
      resetPassword: hasAuth,
      notification: hasNotifications,
      marketing: hasMarketing
    };

    // Determine validation and analytics needs
    const validation = {
      emailValidation: hasAuth || hasNotifications,
      domainValidation: true, // Always recommended
      deliverabilityCheck: hasMarketing
    };

    const analytics = {
      tracking: hasMarketing,
      webhooks: hasNotifications,
      stats: hasMarketing || hasNotifications
    };

    this.logger.success('Email requirements analysis completed');
    
    return {
      provider: 'none', // Will be selected later
      fromEmail: 'noreply@example.com', // Placeholder
      templates,
      validation,
      analytics
    };
  }

  // ============================================================================
  // PROVIDER SELECTION
  // ============================================================================

  private async selectEmailProvider(config: EmailSetupConfig, context: AgentContext): Promise<string> {
    this.logger.info('Selecting email service provider...');

    // Get available email plugins
    const availablePlugins = this.pluginSystem.getPluginsByCategory('EMAIL');
    
    if (availablePlugins.length === 0) {
      this.logger.warn('No email plugins available, skipping email setup');
      return 'none';
    }

    // Use default provider if in --yes mode
    if (context.options.useDefaults) {
      const defaultProvider = availablePlugins.find(p => p.name === 'resend') || availablePlugins[0];
      this.logger.info(`Using default email provider: ${defaultProvider.name}`);
      return defaultProvider.name;
    }

    // Interactive provider selection would go here
    // For now, use the first available provider
    const selectedProvider = availablePlugins[0];
    this.logger.info(`Selected email provider: ${selectedProvider.name}`);
    
    return selectedProvider.name;
  }

  // ============================================================================
  // EMAIL SERVICE SETUP
  // ============================================================================

  private async setupEmailService(provider: string, config: EmailSetupConfig, context: AgentContext): Promise<{
    provider: string;
    config: Record<string, any>;
    artifacts: any[];
    warnings: string[];
  }> {
    try {
      context.logger.info(`Setting up email service with provider: ${provider}`);

      // Get the email plugin
      const plugin = this.pluginSystem.getRegistry().get(provider);
      if (!plugin) {
        throw new Error(`Email plugin not found: ${provider}`);
      }

      // Prepare plugin context
      const pluginContext: PluginContext = {
        ...context,
        pluginId: provider,
        pluginConfig: {
          provider,
          fromEmail: config.fromEmail,
          fromName: config.fromName,
          replyTo: config.replyTo,
          templates: config.templates,
          validation: config.validation,
          analytics: config.analytics
        },
        installedPlugins: [],
        projectType: ProjectType.NEXTJS,
        targetPlatform: [TargetPlatform.WEB, TargetPlatform.SERVER]
      };

      // Validate plugin
      const validation = await plugin.validate(pluginContext);
      if (!validation.valid) {
        throw new Error(`Email plugin validation failed: ${validation.errors.map((e: any) => e.message).join(', ')}`);
      }

      // Execute plugin
      const result = await plugin.install(pluginContext);
      if (!result.success) {
        throw new Error(`Email plugin execution failed: ${result.errors.map((e: any) => e.message).join(', ')}`);
      }

      context.logger.success(`Email service setup completed for ${provider}`);

      return {
        provider,
        config: pluginContext.pluginConfig,
        artifacts: result.artifacts || [],
        warnings: result.warnings || []
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to setup email service: ${errorMessage}`);
    }
  }

  // ============================================================================
  // TEMPLATE CONFIGURATION
  // ============================================================================

  private async configureEmailTemplates(setupResult: any, context: AgentContext): Promise<{
    templates: string[];
    artifacts: any[];
    warnings: string[];
  }> {
    try {
      context.logger.info('Configuring email templates...');

      // Get the email plugin
      const plugin = this.pluginSystem.getRegistry().get(setupResult.provider);
      if (!plugin) {
        throw new Error(`Email plugin not found: ${setupResult.provider}`);
      }

      // Check if unified interface files exist
      const unifiedFiles = [
        path.join(context.projectPath, 'src', 'lib', 'email', 'index.ts'),
        path.join(context.projectPath, 'src', 'lib', 'email', 'templates.ts'),
        path.join(context.projectPath, 'src', 'lib', 'email', 'config.ts')
      ];

      const createdTemplates: string[] = [];
      const artifacts: any[] = [];

      for (const file of unifiedFiles) {
        if (await fsExtra.pathExists(file)) {
          const fileName = path.basename(file, path.extname(file));
          createdTemplates.push(fileName);
          artifacts.push({
            type: 'file',
            path: file,
            description: `Email ${fileName} template`
          });
        }
      }

      context.logger.success(`Email templates configured: ${createdTemplates.join(', ')}`);

      return {
        templates: createdTemplates,
        artifacts,
        warnings: []
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to configure email templates: ${errorMessage}`);
    }
  }

  // ============================================================================
  // VALIDATION SETUP
  // ============================================================================

  private async setupEmailValidation(setupResult: any, config: EmailSetupConfig, context: AgentContext): Promise<{
    success: boolean;
    artifacts: any[];
    warnings: string[];
  }> {
    try {
      context.logger.info('Setting up email validation...');

      // Check if validation utilities exist
      const validationFiles = [
        path.join(context.projectPath, 'src', 'lib', 'email', 'validation.ts'),
        path.join(context.projectPath, 'src', 'lib', 'email', 'utils.ts')
      ];

      const artifacts: any[] = [];
      for (const file of validationFiles) {
        if (await fsExtra.pathExists(file)) {
          artifacts.push({
            type: 'file',
            path: file,
            description: 'Email validation utility'
          });
        }
      }

      context.logger.success('Email validation setup completed');

      return {
        success: true,
        artifacts,
        warnings: []
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to setup email validation: ${errorMessage}`);
    }
  }

  // ============================================================================
  // ANALYTICS SETUP
  // ============================================================================

  private async setupEmailAnalytics(setupResult: any, config: EmailSetupConfig, context: AgentContext): Promise<{
    success: boolean;
    artifacts: any[];
    warnings: string[];
  }> {
    try {
      context.logger.info('Setting up email analytics...');

      // Check if analytics utilities exist
      const analyticsFiles = [
        path.join(context.projectPath, 'src', 'lib', 'email', 'analytics.ts'),
        path.join(context.projectPath, 'src', 'lib', 'email', 'tracking.ts')
      ];

      const artifacts: any[] = [];
      for (const file of analyticsFiles) {
        if (await fsExtra.pathExists(file)) {
          artifacts.push({
            type: 'file',
            path: file,
            description: 'Email analytics utility'
          });
        }
      }

      context.logger.success('Email analytics setup completed');

      return {
        success: true,
        artifacts,
        warnings: []
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to setup email analytics: ${errorMessage}`);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private async createEmailConfigFiles(provider: string, context: AgentContext): Promise<any[]> {
    const artifacts: any[] = [];
    
    // Create email configuration file
    const configPath = path.join(context.projectPath, 'src', 'lib', 'email', 'config.ts');
    const configContent = this.generateEmailConfig(provider);
    await fsExtra.writeFile(configPath, configContent);
    
    artifacts.push({
      type: 'file',
      path: configPath,
      description: 'Email service configuration'
    });

    return artifacts;
  }

  private async createEmailEnvTemplate(requiredEnvVars: string[], context: AgentContext): Promise<any> {
    const envPath = path.join(context.projectPath, '.env.local');
    const envContent = `# Email Service Configuration\n${requiredEnvVars.map(varName => `${varName}=""`).join('\n')}\n`;
    
    // Append to existing .env.local or create new
    let existingContent = '';
    if (await fsExtra.pathExists(envPath)) {
      existingContent = await fsExtra.readFile(envPath, 'utf-8');
    }
    
    await fsExtra.writeFile(envPath, existingContent + '\n' + envContent);
    
    return {
      type: 'file',
      path: envPath,
      description: 'Email environment variables'
    };
  }

  private async createEmailValidationUtils(context: AgentContext): Promise<any[]> {
    const artifacts: any[] = [];
    
    // Create validation utility file
    const validationPath = path.join(context.projectPath, 'src', 'lib', 'email', 'validation.ts');
    const validationContent = this.generateEmailValidationUtils();
    await fsExtra.writeFile(validationPath, validationContent);
    
    artifacts.push({
      type: 'file',
      path: validationPath,
      description: 'Email validation utilities'
    });

    return artifacts;
  }

  private async createEmailAnalyticsUtils(context: AgentContext): Promise<any[]> {
    const artifacts: any[] = [];
    
    // Create analytics utility file
    const analyticsPath = path.join(context.projectPath, 'src', 'lib', 'email', 'analytics.ts');
    const analyticsContent = this.generateEmailAnalyticsUtils();
    await fsExtra.writeFile(analyticsPath, analyticsContent);
    
    artifacts.push({
      type: 'file',
      path: analyticsPath,
      description: 'Email analytics utilities'
    });

    return artifacts;
  }

  private generateEmailConfig(provider: string): string {
    return `/**
 * Email Service Configuration
 * Generated by The Architech Email Agent
 */

export interface EmailConfig {
  provider: '${provider}';
  fromEmail: string;
  fromName?: string;
  replyTo?: string;
  templates: {
    welcome: boolean;
    verification: boolean;
    resetPassword: boolean;
    notification: boolean;
    marketing: boolean;
  };
  validation: {
    emailValidation: boolean;
    domainValidation: boolean;
    deliverabilityCheck: boolean;
  };
  analytics: {
    tracking: boolean;
    webhooks: boolean;
    stats: boolean;
  };
}

export const emailConfig: EmailConfig = {
  provider: '${provider}',
  fromEmail: process.env.EMAIL_FROM || '',
  fromName: process.env.EMAIL_FROM_NAME || '',
  replyTo: process.env.EMAIL_REPLY_TO || '',
  templates: {
    welcome: true,
    verification: true,
    resetPassword: true,
    notification: true,
    marketing: false
  },
  validation: {
    emailValidation: true,
    domainValidation: true,
    deliverabilityCheck: true
  },
  analytics: {
    tracking: true,
    webhooks: true,
    stats: true
  }
};

export default emailConfig;
`;
  }

  private generateEmailValidationUtils(): string {
    return `/**
 * Email Validation Utilities
 * Generated by The Architech Email Agent
 */

export interface EmailValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class EmailValidator {
  /**
   * Validate email address format
   */
  static validateEmail(email: string): EmailValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }

    // Check for common issues
    if (email.length > 254) {
      errors.push('Email address too long');
    }

    if (email.includes('..')) {
      errors.push('Email contains consecutive dots');
    }

    // Domain validation
    const domain = email.split('@')[1];
    if (domain && domain.length > 253) {
      errors.push('Domain name too long');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate domain for email sending
   */
  static async validateDomain(domain: string): Promise<EmailValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check if domain has MX records
      // This would require DNS lookup in a real implementation
      warnings.push('Domain validation requires DNS lookup implementation');

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      errors.push('Failed to validate domain');
      return {
        valid: false,
        errors,
        warnings
      };
    }
  }

  /**
   * Check email deliverability
   */
  static async checkDeliverability(email: string): Promise<EmailValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // This would integrate with email service providers
      // For now, just return basic validation
      const basicValidation = this.validateEmail(email);
      
      if (!basicValidation.valid) {
        errors.push(...basicValidation.errors);
      }

      warnings.push('Deliverability check requires email service provider integration');

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      errors.push('Failed to check deliverability');
      return {
        valid: false,
        errors,
        warnings
      };
    }
  }
}

export default EmailValidator;
`;
  }

  private generateEmailAnalyticsUtils(): string {
    return `/**
 * Email Analytics Utilities
 * Generated by The Architech Email Agent
 */

export interface EmailAnalytics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
}

export interface EmailEvent {
  id: string;
  email: string;
  event: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class EmailAnalyticsTracker {
  private events: EmailEvent[] = [];

  /**
   * Track email event
   */
  trackEvent(event: Omit<EmailEvent, 'id' | 'timestamp'>): void {
    const emailEvent: EmailEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date()
    };

    this.events.push(emailEvent);
  }

  /**
   * Get analytics summary
   */
  getAnalytics(): EmailAnalytics {
    const analytics: EmailAnalytics = {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0
    };

    for (const event of this.events) {
      analytics[event.event]++;
    }

    return analytics;
  }

  /**
   * Get events for specific email
   */
  getEmailEvents(email: string): EmailEvent[] {
    return this.events.filter(event => event.email === email);
  }

  /**
   * Get events by type
   */
  getEventsByType(eventType: EmailEvent['event']): EmailEvent[] {
    return this.events.filter(event => event.event === eventType);
  }

  /**
   * Get events in date range
   */
  getEventsInRange(startDate: Date, endDate: Date): EmailEvent[] {
    return this.events.filter(event => 
      event.timestamp >= startDate && event.timestamp <= endDate
    );
  }

  /**
   * Export analytics data
   */
  exportAnalytics(): EmailEvent[] {
    return [...this.events];
  }

  /**
   * Clear analytics data
   */
  clearAnalytics(): void {
    this.events = [];
  }

  private generateEventId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

export default EmailAnalyticsTracker;
`;
  }

  private createErrorResult(
    message: string,
    startTime: number,
    errors: any[] = [],
    originalError?: any
  ): AgentResult {
    return {
      success: false,
      errors: [
        {
          code: 'EMAIL_SETUP_ERROR',
          message,
          details: originalError,
          recoverable: false,
          timestamp: new Date()
        },
        ...errors
      ],
      duration: Date.now() - startTime
    };
  }
} 