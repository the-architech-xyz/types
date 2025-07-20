/**
 * Plugin Selection Service
 * 
 * Handles interactive plugin selection and parameter collection
 * during project generation. This is the bridge between user input
 * and plugin configuration.
 */

import { Logger } from '../../types/agent.js';
import { PluginSelection, PluginPrompt, PluginChoice, ConfigParameter, PluginConfiguration } from '../../types/plugin-selection.js';
import { PluginSystem } from './plugin-system.js';
import inquirer from 'inquirer';
import chalk from 'chalk';

export class PluginSelectionService {
  private logger: Logger;
  private pluginSystem: PluginSystem;

  constructor(logger: Logger) {
    this.logger = logger;
    this.pluginSystem = PluginSystem.getInstance();
  }

  /**
   * Main method to select plugins interactively
   */
  async selectPlugins(projectType: string, userInput: string): Promise<PluginSelection> {
    this.logger.info('Starting interactive plugin selection...');

    const selection: PluginSelection = {
      database: await this.selectDatabase(userInput),
      authentication: await this.selectAuthentication(userInput),
      ui: await this.selectUI(userInput),
      deployment: await this.selectDeployment(userInput),
      testing: await this.selectTesting(userInput),
      monitoring: await this.selectMonitoring(userInput),
      email: await this.selectEmail(userInput),
      advanced: await this.selectAdvanced(userInput)
    };

    this.logger.success('Plugin selection completed');
    return selection;
  }

  /**
   * Collect plugin-specific parameters
   */
  async collectPluginParameters(pluginId: string): Promise<Record<string, any>> {
    const plugin = this.pluginSystem.getRegistry().get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    const configSchema = plugin.getConfigSchema();
    const parameters: Record<string, any> = {};

    for (const [key, property] of Object.entries(configSchema.properties)) {
      if (configSchema.required?.includes(key)) {
        const answer = await this.promptParameter(key, property);
        parameters[key] = answer;
      }
    }

    return parameters;
  }

  /**
   * Database selection
   */
  private async selectDatabase(userInput: string): Promise<PluginSelection['database']> {
    const { enabled } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'enabled',
        message: 'Do you need a database?',
        default: true
      }
    ]);

    if (!enabled) {
      return {
        enabled: false,
        type: 'none',
        provider: 'local',
        features: { migrations: false, seeding: false, backup: false }
      };
    }

    const { type } = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'Which database ORM would you like to use?',
        choices: [
          { name: 'Drizzle ORM (Recommended)', value: 'drizzle' },
          { name: 'Prisma ORM', value: 'prisma' },
          { name: 'No ORM', value: 'none' }
        ],
        default: 'drizzle'
      }
    ]);

    const { provider } = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: 'Which database provider would you like to use?',
        choices: [
          { name: 'Neon (PostgreSQL)', value: 'neon' },
          { name: 'Supabase (PostgreSQL)', value: 'supabase' },
          { name: 'Local SQLite', value: 'local' },
          { name: 'Vercel Postgres', value: 'vercel' }
        ],
        default: 'neon'
      }
    ]);

    const { features } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'features',
        message: 'Which database features do you need?',
        choices: [
          { name: 'Migrations', value: 'migrations', checked: true },
          { name: 'Seeding', value: 'seeding', checked: true },
          { name: 'Backup', value: 'backup', checked: false }
        ]
      }
    ]);

    return {
      enabled: true,
      type,
      provider,
      features: {
        migrations: features.includes('migrations'),
        seeding: features.includes('seeding'),
        backup: features.includes('backup')
      }
    };
  }

  /**
   * Authentication selection
   */
  private async selectAuthentication(userInput: string): Promise<PluginSelection['authentication']> {
    const { enabled } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'enabled',
        message: 'Do you need authentication?',
        default: true
      }
    ]);

    if (!enabled) {
      return {
        enabled: false,
        type: 'none',
        providers: [],
        features: { emailVerification: false, passwordReset: false, socialLogin: false, sessionManagement: false }
      };
    }

    const { type } = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'Which authentication provider would you like to use?',
        choices: [
          { name: 'Better Auth (Recommended)', value: 'better-auth' },
          { name: 'NextAuth.js', value: 'next-auth' },
          { name: 'No authentication', value: 'none' }
        ],
        default: 'better-auth'
      }
    ]);

    const { providers } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'providers',
        message: 'Which authentication providers do you want to support?',
        choices: [
          { name: 'Email/Password', value: 'email', checked: true },
          { name: 'GitHub', value: 'github', checked: false },
          { name: 'Google', value: 'google', checked: false },
          { name: 'Discord', value: 'discord', checked: false },
          { name: 'Twitter', value: 'twitter', checked: false }
        ]
      }
    ]);

    const { features } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'features',
        message: 'Which authentication features do you need?',
        choices: [
          { name: 'Email verification', value: 'emailVerification', checked: true },
          { name: 'Password reset', value: 'passwordReset', checked: true },
          { name: 'Social login', value: 'socialLogin', checked: true },
          { name: 'Session management', value: 'sessionManagement', checked: true }
        ]
      }
    ]);

    return {
      enabled: true,
      type,
      providers,
      features: {
        emailVerification: features.includes('emailVerification'),
        passwordReset: features.includes('passwordReset'),
        socialLogin: features.includes('socialLogin'),
        sessionManagement: features.includes('sessionManagement')
      }
    };
  }

  /**
   * UI selection
   */
  private async selectUI(userInput: string): Promise<PluginSelection['ui']> {
    const { enabled } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'enabled',
        message: 'Do you need a UI component library?',
        default: true
      }
    ]);

    if (!enabled) {
      return {
        enabled: false,
        type: 'none',
        theme: 'system',
        components: [],
        features: { animations: false, icons: false, responsive: false }
      };
    }

    const { type } = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'Which UI library would you like to use?',
        choices: [
          { name: 'Shadcn/ui (Recommended)', value: 'shadcn' },
          { name: 'Radix UI', value: 'radix' },
          { name: 'No UI library', value: 'none' }
        ],
        default: 'shadcn'
      }
    ]);

    const { theme } = await inquirer.prompt([
      {
        type: 'list',
        name: 'theme',
        message: 'Which theme mode would you like?',
        choices: [
          { name: 'System (auto)', value: 'system' },
          { name: 'Light only', value: 'light' },
          { name: 'Dark only', value: 'dark' }
        ],
        default: 'system'
      }
    ]);

    const { components } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'components',
        message: 'Which components do you want to include?',
        choices: [
          { name: 'Button', value: 'button', checked: true },
          { name: 'Input', value: 'input', checked: true },
          { name: 'Card', value: 'card', checked: true },
          { name: 'Dialog', value: 'dialog', checked: true },
          { name: 'Dropdown Menu', value: 'dropdown-menu', checked: true },
          { name: 'Form', value: 'form', checked: true }
        ]
      }
    ]);

    const { features } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'features',
        message: 'Which UI features do you need?',
        choices: [
          { name: 'Animations', value: 'animations', checked: true },
          { name: 'Icons', value: 'icons', checked: true },
          { name: 'Responsive design', value: 'responsive', checked: true }
        ]
      }
    ]);

    return {
      enabled: true,
      type,
      theme,
      components,
      features: {
        animations: features.includes('animations'),
        icons: features.includes('icons'),
        responsive: features.includes('responsive')
      }
    };
  }

  /**
   * Deployment selection
   */
  private async selectDeployment(userInput: string): Promise<PluginSelection['deployment']> {
    const { enabled } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'enabled',
        message: 'Do you want to configure deployment?',
        default: true
      }
    ]);

    if (!enabled) {
      return {
        enabled: false,
        platform: 'none',
        environment: 'development',
        features: { autoDeploy: false, previewDeployments: false, customDomain: false }
      };
    }

    const { platform } = await inquirer.prompt([
      {
        type: 'list',
        name: 'platform',
        message: 'Which deployment platform would you like to use?',
        choices: [
          { name: 'Vercel (Recommended)', value: 'vercel' },
          { name: 'Railway', value: 'railway' },
          { name: 'Netlify', value: 'netlify' },
          { name: 'AWS', value: 'aws' },
          { name: 'No deployment', value: 'none' }
        ],
        default: 'vercel'
      }
    ]);

    const { environment } = await inquirer.prompt([
      {
        type: 'list',
        name: 'environment',
        message: 'Which environment would you like to deploy to?',
        choices: [
          { name: 'Production', value: 'production' },
          { name: 'Staging', value: 'staging' },
          { name: 'Development', value: 'development' }
        ],
        default: 'production'
      }
    ]);

    const { features } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'features',
        message: 'Which deployment features do you need?',
        choices: [
          { name: 'Auto deploy', value: 'autoDeploy', checked: true },
          { name: 'Preview deployments', value: 'previewDeployments', checked: true },
          { name: 'Custom domain', value: 'customDomain', checked: false }
        ]
      }
    ]);

    return {
      enabled: true,
      platform,
      environment,
      features: {
        autoDeploy: features.includes('autoDeploy'),
        previewDeployments: features.includes('previewDeployments'),
        customDomain: features.includes('customDomain')
      }
    };
  }

  /**
   * Testing selection
   */
  private async selectTesting(userInput: string): Promise<PluginSelection['testing']> {
    const { enabled } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'enabled',
        message: 'Do you want to configure testing?',
        default: false
      }
    ]);

    if (!enabled) {
      return {
        enabled: false,
        framework: 'none',
        coverage: false,
        e2e: false
      };
    }

    const { framework } = await inquirer.prompt([
      {
        type: 'list',
        name: 'framework',
        message: 'Which testing framework would you like to use?',
        choices: [
          { name: 'Vitest (Recommended)', value: 'vitest' },
          { name: 'Jest', value: 'jest' },
          { name: 'Playwright (E2E)', value: 'playwright' },
          { name: 'No testing', value: 'none' }
        ],
        default: 'vitest'
      }
    ]);

    const { features } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'features',
        message: 'Which testing features do you need?',
        choices: [
          { name: 'Code coverage', value: 'coverage', checked: true },
          { name: 'End-to-end testing', value: 'e2e', checked: false }
        ]
      }
    ]);

    return {
      enabled: true,
      framework,
      coverage: features.includes('coverage'),
      e2e: features.includes('e2e')
    };
  }

  /**
   * Monitoring selection
   */
  private async selectMonitoring(userInput: string): Promise<PluginSelection['monitoring']> {
    const { enabled } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'enabled',
        message: 'Do you want to configure monitoring?',
        default: false
      }
    ]);

    if (!enabled) {
      return {
        enabled: false,
        service: 'none',
        features: { errorTracking: false, performance: false, analytics: false }
      };
    }

    const { service } = await inquirer.prompt([
      {
        type: 'list',
        name: 'service',
        message: 'Which monitoring service would you like to use?',
        choices: [
          { name: 'Sentry', value: 'sentry' },
          { name: 'LogRocket', value: 'logrocket' },
          { name: 'No monitoring', value: 'none' }
        ],
        default: 'sentry'
      }
    ]);

    const { features } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'features',
        message: 'Which monitoring features do you need?',
        choices: [
          { name: 'Error tracking', value: 'errorTracking', checked: true },
          { name: 'Performance monitoring', value: 'performance', checked: true },
          { name: 'Analytics', value: 'analytics', checked: false }
        ]
      }
    ]);

    return {
      enabled: true,
      service,
      features: {
        errorTracking: features.includes('errorTracking'),
        performance: features.includes('performance'),
        analytics: features.includes('analytics')
      }
    };
  }

  /**
   * Email selection
   */
  private async selectEmail(userInput: string): Promise<PluginSelection['email']> {
    const { enabled } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'enabled',
        message: 'Do you want to configure email services?',
        default: false
      }
    ]);

    if (!enabled) {
      return {
        enabled: false,
        provider: 'none',
        features: { transactional: false, marketing: false, templates: false }
      };
    }

    const { provider } = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: 'Which email provider would you like to use?',
        choices: [
          { name: 'Resend (Recommended)', value: 'resend' },
          { name: 'SendGrid', value: 'sendgrid' },
          { name: 'Mailgun', value: 'mailgun' },
          { name: 'No email', value: 'none' }
        ],
        default: 'resend'
      }
    ]);

    const { features } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'features',
        message: 'Which email features do you need?',
        choices: [
          { name: 'Transactional emails', value: 'transactional', checked: true },
          { name: 'Marketing emails', value: 'marketing', checked: false },
          { name: 'Email templates', value: 'templates', checked: true }
        ]
      }
    ]);

    return {
      enabled: true,
      provider,
      features: {
        transactional: features.includes('transactional'),
        marketing: features.includes('marketing'),
        templates: features.includes('templates')
      }
    };
  }

  /**
   * Advanced options selection
   */
  private async selectAdvanced(userInput: string): Promise<PluginSelection['advanced']> {
    const { features } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'features',
        message: 'Which advanced features do you want to configure?',
        choices: [
          { name: 'ESLint (Linting)', value: 'linting', checked: true },
          { name: 'Prettier (Formatting)', value: 'formatting', checked: true },
          { name: 'Husky (Git hooks)', value: 'gitHooks', checked: true },
          { name: 'Security headers', value: 'security', checked: true },
          { name: 'Rate limiting', value: 'rateLimiting', checked: false }
        ]
      }
    ]);

    const { bundling } = await inquirer.prompt([
      {
        type: 'list',
        name: 'bundling',
        message: 'Which bundler would you like to use?',
        choices: [
          { name: 'Vite (Recommended)', value: 'vite' },
          { name: 'Webpack', value: 'webpack' },
          { name: 'Turbopack', value: 'turbopack' }
        ],
        default: 'vite'
      }
    ]);

    return {
      linting: features.includes('linting'),
      formatting: features.includes('formatting'),
      gitHooks: features.includes('gitHooks'),
      bundling,
      optimization: true,
      security: features.includes('security'),
      rateLimiting: features.includes('rateLimiting')
    };
  }

  /**
   * Prompt for a single parameter
   */
  private async promptParameter(name: string, property: any): Promise<any> {
    const question = {
      type: this.mapPropertyTypeToPromptType(property.type),
      name,
      message: property.description || `Enter value for ${name}`,
      default: property.default
    };

    if (property.enum) {
      (question as any).choices = property.enum.map((value: any) => ({
        name: value,
        value
      }));
    }

    const answer = await inquirer.prompt([question]);
    return answer[name];
  }

  /**
   * Map property type to prompt type
   */
  private mapPropertyTypeToPromptType(type: string): string {
    switch (type) {
      case 'boolean':
        return 'confirm';
      case 'number':
        return 'number';
      case 'array':
        return 'checkbox';
      default:
        return 'input';
    }
  }
} 