/**
 * Auth Agent - Authentication Package Generator
 * 
 * Sets up the packages/auth authentication layer with:
 * - Better Auth configuration
 * - Database integration with Drizzle
 * - Social login providers
 * - Session management utilities
 * 
 * Migrated to the new standardized agent interface for robustness and extensibility.
 */

import { existsSync } from 'fs';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { AbstractAgent } from './base/abstract-agent.js';
import { TemplateService, templateService } from '../utils/template-service.js';
import {
  AgentContext,
  AgentResult,
  AgentMetadata,
  AgentCapability,
  AgentCategory,
  CapabilityCategory,
  ValidationResult,
  Artifact
} from '../types/agent.js';

// Dynamic import for inquirer
let inquirerModule: any = null;
async function getInquirer() {
  if (!inquirerModule) {
    inquirerModule = await import('inquirer');
  }
  return inquirerModule.default;
}

interface AuthConfig {
  providers: ('email' | 'github' | 'google')[];
  requireEmailVerification: boolean;
  sessionDuration: number;
}

export class AuthAgent extends AbstractAgent {
  private templateService: TemplateService;

  constructor() {
    super();
    this.templateService = templateService;
  }

  // ============================================================================
  // AGENT METADATA
  // ============================================================================

  protected getAgentMetadata(): AgentMetadata {
    return {
      name: 'AuthAgent',
      version: '1.0.0',
      description: 'Sets up the authentication package with Better Auth',
      author: 'The Architech Team',
      category: AgentCategory.AUTHENTICATION,
      tags: ['authentication', 'better-auth', 'oauth', 'session', 'security'],
      dependencies: ['BaseProjectAgent', 'DBAgent'],
      conflicts: [],
      requirements: [
        {
          type: 'package',
          name: 'better-auth',
          description: 'Better Auth for authentication'
        },
        {
          type: 'package',
          name: '@better-auth/utils',
          description: 'Better Auth utilities'
        },
        {
          type: 'file',
          name: 'packages/auth',
          description: 'Authentication package directory'
        },
        {
          type: 'file',
          name: 'packages/db',
          description: 'Database package for auth integration'
        }
      ],
      license: 'MIT',
      repository: 'https://github.com/the-architech/cli'
    };
  }

  protected getAgentCapabilities(): AgentCapability[] {
    return [
      {
        name: 'setup-authentication',
        description: 'Creates a complete authentication setup with Better Auth',
        parameters: [
          {
            name: 'providers',
            type: 'array',
            required: false,
            description: 'Authentication providers to enable',
            defaultValue: ['email'],
            validation: [
              {
                type: 'enum',
                value: ['email', 'github', 'google'],
                message: 'Providers must be email, github, or google'
              }
            ]
          },
          {
            name: 'requireEmailVerification',
            type: 'boolean',
            required: false,
            description: 'Whether to require email verification',
            defaultValue: true
          },
          {
            name: 'sessionDuration',
            type: 'number',
            required: false,
            description: 'Session duration in seconds',
            defaultValue: 604800,
            validation: [
              {
                type: 'range',
                value: [3600, 2592000],
                message: 'Session duration must be between 1 hour and 30 days'
              }
            ]
          }
        ],
        examples: [
          {
            name: 'Setup email authentication',
            description: 'Creates authentication with email/password',
            parameters: { providers: ['email'], requireEmailVerification: true },
            expectedResult: 'Complete authentication package with email auth'
          },
          {
            name: 'Setup social authentication',
            description: 'Creates authentication with social providers',
            parameters: { providers: ['email', 'github', 'google'] },
            expectedResult: 'Authentication package with social login support'
          }
        ],
        category: CapabilityCategory.SETUP
      },
      {
        name: 'configure-providers',
        description: 'Configures additional authentication providers',
        parameters: [
          {
            name: 'provider',
            type: 'string',
            required: true,
            description: 'Provider to configure (github, google)',
            validation: [
              {
                type: 'enum',
                value: ['github', 'google'],
                message: 'Provider must be github or google'
              }
            ]
          }
        ],
        examples: [
          {
            name: 'Configure GitHub OAuth',
            description: 'Adds GitHub OAuth configuration',
            parameters: { provider: 'github' },
            expectedResult: 'GitHub OAuth configured in auth package'
          }
        ],
        category: CapabilityCategory.CONFIGURATION
      }
    ];
  }

  // ============================================================================
  // CORE EXECUTION
  // ============================================================================

  protected async executeInternal(context: AgentContext): Promise<AgentResult> {
    const { projectName, projectPath } = context;
    const authPackagePath = path.join(projectPath, 'packages', 'auth');
    
    context.logger.info(`Setting up authentication package: ${projectName}/packages/auth`);

    try {
      // Get authentication configuration
      const authConfig = await this.getAuthConfig(context);
      
      // Update package.json with dependencies
      await this.updatePackageJson(authPackagePath, context);
      
      // Create ESLint config
      await this.createESLintConfig(authPackagePath);
      
      // Create Better Auth configuration
      await this.createAuthConfig(authPackagePath, context, authConfig);
      
      // Create auth utilities
      await this.createAuthUtils(authPackagePath, context);
      
      // Create middleware and components
      await this.createAuthMiddleware(authPackagePath, context);
      
      // Create index exports
      await this.createIndex(authPackagePath);
      
      // Update environment configuration
      await this.updateEnvConfig(projectPath, authConfig);

      const artifacts: Artifact[] = [
        {
          type: 'directory',
          path: authPackagePath,
          metadata: {
            package: 'auth',
            authProvider: 'better-auth',
            providers: authConfig.providers,
            features: ['authentication', 'session-management', 'oauth']
          }
        },
        {
          type: 'file',
          path: path.join(authPackagePath, 'package.json'),
          metadata: { type: 'package-config' }
        },
        {
          type: 'file',
          path: path.join(authPackagePath, 'auth.ts'),
          metadata: { type: 'auth-config' }
        },
        {
          type: 'file',
          path: path.join(authPackagePath, 'client.ts'),
          metadata: { type: 'client-utils' }
        },
        {
          type: 'file',
          path: path.join(authPackagePath, 'server.ts'),
          metadata: { type: 'server-utils' }
        }
      ];

      context.logger.success(`Authentication package configured successfully`);
      
      // Display setup instructions
      this.displayAuthSetupInstructions(authConfig);
      
      return this.createSuccessResult(
        { 
          authPackagePath,
          providers: authConfig.providers,
          requireEmailVerification: authConfig.requireEmailVerification,
          sessionDuration: authConfig.sessionDuration
        },
        artifacts,
        [
          'Authentication package structure created',
          'Better Auth configured',
          'Client and server utilities created',
          'Middleware and components ready',
          'Environment variables configured'
        ]
      );

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      context.logger.error(`Failed to configure authentication package: ${errorMessage}`, error as Error);
      
      return this.createErrorResult(
        'AUTH_PACKAGE_SETUP_FAILED',
        `Failed to configure authentication package: ${errorMessage}`,
        [],
        0,
        error
      );
    }
  }

  // ============================================================================
  // VALIDATION
  // ============================================================================

  async validate(context: AgentContext): Promise<ValidationResult> {
    const baseValidation = await super.validate(context);
    
    if (!baseValidation.valid) {
      return baseValidation;
    }

    const errors: any[] = [];
    const warnings: string[] = [];

    // Check if Auth package directory exists
    const authPackagePath = path.join(context.projectPath, 'packages', 'auth');
    if (!existsSync(authPackagePath)) {
      errors.push({
        field: 'authPackagePath',
        message: 'Auth package directory does not exist',
        code: 'AUTH_PACKAGE_MISSING'
      });
    }

    // Check if DB package exists (required for auth)
    const dbPackagePath = path.join(context.projectPath, 'packages', 'db');
    if (!existsSync(dbPackagePath)) {
      errors.push({
        field: 'dbPackagePath',
        message: 'Database package is required for authentication',
        code: 'DB_PACKAGE_MISSING'
      });
    }

    // Check for required environment variables
    const envFile = path.join(context.projectPath, '.env.local');
    if (!existsSync(envFile)) {
      warnings.push('Environment file (.env.local) not found - will be created');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private async getAuthConfig(context: AgentContext): Promise<AuthConfig> {
    // If useDefaults is true, return default configuration
    if (context.options.useDefaults) {
      return {
        providers: ['email'],
        requireEmailVerification: true,
        sessionDuration: 7 * 24 * 60 * 60 // 7 days in seconds
      };
    }

    const questions = [
      {
        type: 'checkbox',
        name: 'providers',
        message: 'Select authentication providers:',
        choices: [
          { name: 'Email & Password', value: 'email', checked: true },
          { name: 'GitHub OAuth', value: 'github' },
          { name: 'Google OAuth', value: 'google' }
        ],
        validate: (input: string[]) => {
          if (input.length === 0) {
            return 'Please select at least one authentication provider';
          }
          return true;
        }
      },
      {
        type: 'confirm',
        name: 'requireEmailVerification',
        message: 'Require email verification for new accounts?',
        default: true
      },
      {
        type: 'number',
        name: 'sessionDuration',
        message: 'Session duration in days:',
        default: 7,
        validate: (input: number) => {
          if (input < 1 || input > 30) {
            return 'Session duration must be between 1 and 30 days';
          }
          return true;
        },
        filter: (input: number) => input * 24 * 60 * 60 // Convert to seconds
      }
    ];

    const inquirer = await getInquirer();
    const answers = await inquirer.prompt(questions);
    
    return {
      providers: answers.providers,
      requireEmailVerification: answers.requireEmailVerification,
      sessionDuration: answers.sessionDuration
    };
  }

  private async updatePackageJson(authPackagePath: string, context: AgentContext): Promise<void> {
    const packageJson = {
      name: `@${context.projectName}/auth`,
      version: "0.1.0",
      private: true,
      description: "Authentication layer with Better Auth",
      main: "index.ts",
      types: "index.ts",
      scripts: {
        "build": "tsc",
        "dev": "tsc --watch",
        "lint": "eslint . --ext .ts",
        "type-check": "tsc --noEmit"
      },
      dependencies: {
        "better-auth": "^1.2.12",
        "@better-auth/utils": "^0.2.6",
        "jose": "^6.0.11",
        "bcryptjs": "^2.4.3",
        "zod": "^3.24.1"
      },
      devDependencies: {
        "@types/bcryptjs": "^2.4.6",
        "typescript": "^5.2.2"
      },
      peerDependencies: {
        "react": "^18.0.0",
        "next": "^14.0.0"
      }
    };

    await fsExtra.writeJSON(path.join(authPackagePath, 'package.json'), packageJson, { spaces: 2 });
  }

  private async createESLintConfig(authPackagePath: string): Promise<void> {
    const eslintConfig = {
      extends: ["../../.eslintrc.json"]
    };

    await fsExtra.writeJSON(path.join(authPackagePath, '.eslintrc.json'), eslintConfig, { spaces: 2 });
  }

  private async createAuthConfig(authPackagePath: string, context: AgentContext, authConfig: AuthConfig): Promise<void> {
    const socialProvidersConfig = authConfig.providers.includes('github') || authConfig.providers.includes('google') 
      ? `
  socialProviders: {
    ${authConfig.providers.includes('github') ? `
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },` : ''}
    ${authConfig.providers.includes('google') ? `
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },` : ''}
  },`
      : '';

    const templateData = {
      projectName: context.projectName,
      providers: authConfig.providers,
      requireEmailVerification: authConfig.requireEmailVerification,
      sessionDuration: authConfig.sessionDuration,
      socialProvidersConfig
    };

    const content = await this.templateService.renderTemplate('auth', 'auth.ts.ejs', templateData, { logger: context.logger });
    await fsExtra.writeFile(path.join(authPackagePath, 'auth.ts'), content);
  }

  private async createAuthUtils(authPackagePath: string, context: AgentContext): Promise<void> {
    const clientContent = await this.templateService.renderTemplate('auth', 'client.ts.ejs', {}, { logger: context.logger });
    await fsExtra.writeFile(path.join(authPackagePath, 'client.ts'), clientContent);

    const serverContent = await this.templateService.renderTemplate('auth', 'server.ts.ejs', {}, { logger: context.logger });
    await fsExtra.writeFile(path.join(authPackagePath, 'server.ts'), serverContent);
  }

  private async createAuthMiddleware(authPackagePath: string, context: AgentContext): Promise<void> {
    const content = await this.templateService.renderTemplate('auth', 'middleware.ts.ejs', {}, { logger: context.logger });
    await fsExtra.writeFile(path.join(authPackagePath, 'middleware.ts'), content);
  }

  private async createIndex(authPackagePath: string): Promise<void> {
    const content = await this.templateService.renderTemplate('auth', 'index.ts.ejs', {});
    await fsExtra.writeFile(path.join(authPackagePath, 'index.ts'), content);
  }

  private async updateEnvConfig(projectPath: string, authConfig: AuthConfig): Promise<void> {
    const envFile = path.join(projectPath, '.env.local');
    let envContent = '';

    // Read existing env file if it exists
    if (existsSync(envFile)) {
      envContent = await fsExtra.readFile(envFile, 'utf-8');
    }

    // Add auth-related environment variables
    const authEnvVars = [
      '',
      '# Authentication Configuration',
      'NEXT_PUBLIC_APP_URL=http://localhost:3000',
      'AUTH_SECRET=your-auth-secret-key-here',
      'AUTH_DOMAIN=localhost',
    ];

    // Add provider-specific variables
    if (authConfig.providers.includes('github')) {
      authEnvVars.push(
        '',
        '# GitHub OAuth',
        'GITHUB_CLIENT_ID=your-github-client-id',
        'GITHUB_CLIENT_SECRET=your-github-client-secret'
      );
    }

    if (authConfig.providers.includes('google')) {
      authEnvVars.push(
        '',
        '# Google OAuth',
        'GOOGLE_CLIENT_ID=your-google-client-id',
        'GOOGLE_CLIENT_SECRET=your-google-client-secret'
      );
    }

    // Only add if not already present
    const newVars = authEnvVars.filter(varLine => {
      const varName = varLine.split('=')[0];
      return varName && !envContent.includes(varName);
    });

    if (newVars.length > 0) {
      await fsExtra.appendFile(envFile, newVars.join('\n'));
    }
  }

  private displayAuthSetupInstructions(authConfig: AuthConfig): void {
    console.log('\n🔐 Authentication Setup Instructions:');
    console.log('=====================================');
    console.log('');
    console.log('1. Environment Variables:');
    console.log('   - Update .env.local with your actual values');
    console.log('   - Generate a secure AUTH_SECRET (32+ characters)');
    console.log('');
    
    if (authConfig.providers.includes('github')) {
      console.log('2. GitHub OAuth Setup:');
      console.log('   - Go to GitHub Settings > Developer settings > OAuth Apps');
      console.log('   - Create a new OAuth App');
      console.log('   - Set Authorization callback URL to: http://localhost:3000/api/auth/callback/github');
      console.log('   - Update GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env.local');
      console.log('');
    }

    if (authConfig.providers.includes('google')) {
      console.log('3. Google OAuth Setup:');
      console.log('   - Go to Google Cloud Console > APIs & Services > Credentials');
      console.log('   - Create OAuth 2.0 Client ID');
      console.log('   - Set Authorized redirect URIs to: http://localhost:3000/api/auth/callback/google');
      console.log('   - Update GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local');
      console.log('');
    }

    console.log('4. Usage:');
    console.log('   - Import auth utilities in your components');
    console.log('   - Use useSession() for client-side auth state');
    console.log('   - Use getServerSession() for server-side auth checks');
    console.log('   - Add authMiddleware to your Next.js middleware');
    console.log('');
  }

  // ============================================================================
  // ROLLBACK
  // ============================================================================

  async rollback(context: AgentContext): Promise<void> {
    const authPackagePath = path.join(context.projectPath, 'packages', 'auth');
    
    context.logger.info('Rolling back authentication package...');
    
    try {
      if (existsSync(authPackagePath)) {
        await fsExtra.remove(authPackagePath);
        context.logger.success('Authentication package removed');
      }
    } catch (error) {
      context.logger.error('Failed to rollback authentication package', error as Error);
    }
  }
} 