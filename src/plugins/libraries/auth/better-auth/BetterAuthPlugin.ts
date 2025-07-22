/**
 * Better Auth Plugin - Updated with Latest Best Practices
 * 
 * Provides Better Auth authentication integration using the official @better-auth/cli.
 * Follows latest Better Auth documentation and TypeScript best practices.
 * 
 * References:
 * - https://better-auth.com/docs
 * - https://better-auth.com/docs/providers
 * - https://better-auth.com/docs/adapters
 */

import { IPlugin, PluginMetadata, PluginArtifact, ValidationResult, PluginCategory, PluginContext, PluginResult, TargetPlatform, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../../../types/plugin.js';
import { TemplateService, templateService } from '../../../../core/templates/template-service.js';
import { CommandRunner } from '../../../../core/cli/command-runner.js';
import { ValidationError } from '../../../../types/agent.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { structureService, StructureInfo } from '../../../../core/project/structure-service.js';
import { BetterAuthConfig, BetterAuthConfigSchema, BetterAuthDefaultConfig } from './BetterAuthSchema.js';
import { BetterAuthGenerator } from './BetterAuthGenerator.js';

export class BetterAuthPlugin implements IPlugin {
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
      id: 'better-auth',
      name: 'Better Auth',
      version: '1.0.0',
      description: 'Modern authentication library with excellent TypeScript support',
      author: 'The Architech Team',
      category: PluginCategory.AUTHENTICATION,
      tags: ['authentication', 'oauth', 'session', 'security', 'typescript'],
      license: 'MIT',
      repository: 'https://github.com/next-auth/better-auth',
      homepage: 'https://better-auth.com',
      documentation: 'https://better-auth.com/docs'
    };
  }

  // ============================================================================
  // PLUGIN LIFECYCLE - Pure Technology Implementation
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectPath, pluginConfig } = context;
      
      context.logger.info('Installing Better Auth using official CLI...');

      // Step 1: Install dependencies
      await this.installDependencies(context);

      // Step 2: Initialize Better Auth using official CLI
      await this.initializeBetterAuth(context);

      // Step 3: Generate database schema
      await this.generateDatabaseSchema(context);

      // Step 4: Create authentication configuration
      await this.createAuthConfiguration(context);

      // Step 5: Add environment configuration
      await this.addEnvironmentConfig(context);

      // Step 6: Generate unified interface files
      await this.generateUnifiedInterfaceFiles(context);

      const duration = Date.now() - startTime;

      return {
        success: true,
        artifacts: [
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'auth', 'index.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'auth', 'auth.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'auth', 'auth-utils.ts')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'auth', 'auth-components.tsx')
          },
          {
            type: 'file',
            path: path.join(projectPath, 'src', 'lib', 'auth', 'schema.sql')
          }
        ],
        dependencies: [
          {
            name: 'better-auth',
            version: '^1.3.0',
            type: 'production',
            category: PluginCategory.AUTHENTICATION
          },
          {
            name: '@better-auth/drizzle-adapter',
            version: '^1.3.0',
            type: 'production',
            category: PluginCategory.AUTHENTICATION
          },
          {
            name: '@better-auth/utils',
            version: '^0.2.6',
            type: 'production',
            category: PluginCategory.AUTHENTICATION
          }
        ],
        scripts: [
          {
            name: 'auth:init',
            command: 'npx @better-auth/cli@latest init',
            description: 'Initialize Better Auth configuration',
            category: 'dev'
          },
          {
            name: 'auth:generate',
            command: 'npx @better-auth/cli@latest generate',
            description: 'Generate Better Auth files',
            category: 'dev'
          }
        ],
        configs: [
          {
            file: '.env',
            content: BetterAuthGenerator.generateEnvConfig(pluginConfig as BetterAuthConfig),
            mergeStrategy: 'append'
          }
        ],
        errors: [],
        warnings: [],
        duration
      };

    } catch (error) {
      return this.createErrorResult(
        'Failed to install Better Auth',
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
      
      context.logger.info('Uninstalling Better Auth...');

      // Remove Better Auth files
      const filesToRemove = [
        path.join(projectPath, 'src', 'lib', 'auth'),
        path.join(projectPath, 'src', 'app', 'api', 'auth'),
        path.join(projectPath, 'better-auth.config.ts')
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
        warnings: ['Better Auth files removed. You may need to manually remove dependencies from package.json'],
        duration
      };

    } catch (error) {
      return this.createErrorResult(
        'Failed to uninstall Better Auth',
        startTime,
        [],
        error
      );
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      context.logger.info('Updating Better Auth...');

      // Update dependencies
      await this.runner.execCommand(['npm', 'update', 'better-auth', '@better-auth/drizzle-adapter', '@better-auth/utils']);

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
        'Failed to update Better Auth',
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
      // Check if auth configuration exists
      const configPath = path.join(context.projectPath, 'src', 'lib', 'auth', 'auth.ts');
      if (!await fsExtra.pathExists(configPath)) {
      errors.push({
          field: 'better-auth.config',
          message: 'Better Auth configuration file not found',
          code: 'MISSING_CONFIG',
        severity: 'error'
      });
    }

      // Check if auth API routes exist
      const apiPath = path.join(context.projectPath, 'src', 'app', 'api', 'auth');
      if (!await fsExtra.pathExists(apiPath)) {
        errors.push({
          field: 'better-auth.api',
          message: 'Better Auth API routes not found',
          code: 'MISSING_API',
          severity: 'error'
        });
      }

      // Check if database schema exists
      const schemaPath = path.join(context.projectPath, 'src', 'lib', 'auth', 'schema.sql');
      if (!await fsExtra.pathExists(schemaPath)) {
        warnings.push('Better Auth database schema not found');
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
      frameworks: ['nextjs', 'react', 'vue', 'svelte'],
      platforms: [TargetPlatform.WEB],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
      databases: ['postgresql', 'mysql', 'sqlite', 'mongodb'],
      conflicts: ['nextauth', 'auth0', 'firebase-auth']
    };
  }

  getDependencies(): string[] {
    return ['better-auth', '@better-auth/drizzle-adapter', '@better-auth/utils'];
  }

  getConflicts(): string[] {
    return ['nextauth', 'auth0', 'firebase-auth'];
  }

  getRequirements(): PluginRequirement[] {
    return [
      {
        type: 'package',
        name: 'better-auth',
        description: 'Better Auth core library',
        version: '^1.3.0'
      },
      {
        type: 'package',
        name: '@better-auth/drizzle-adapter',
        description: 'Drizzle adapter for Better Auth',
        version: '^1.3.0'
      },
      {
        type: 'package',
        name: '@better-auth/utils',
        description: 'Better Auth utilities',
        version: '^0.2.6'
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return BetterAuthDefaultConfig;
  }

  getConfigSchema(): ConfigSchema {
    return BetterAuthConfigSchema;
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private async installDependencies(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Installing Better Auth dependencies...');

    const dependencies = [
      'better-auth@^1.3.0',
      '@better-auth/drizzle-adapter@^1.3.0',
      '@better-auth/utils@^0.2.6'
    ];

    await this.runner.execCommand(['npm', 'install', ...dependencies], { cwd: projectPath });
  }

  private async initializeBetterAuth(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Initializing Better Auth...');
    
    // Create Better Auth configuration
    const betterAuthConfig = {
      "providers": pluginConfig.providers || ['credentials', 'google', 'github'],
      "database": {
        "url": pluginConfig.databaseUrl || 'postgresql://user:password@localhost:5432/better_auth'
      },
      "session": {
        "strategy": "jwt",
        "maxAge": pluginConfig.sessionDuration || 30 * 24 * 60 * 60
      },
      "features": {
        "emailVerification": pluginConfig.requireEmailVerification !== false,
        "oauth": pluginConfig.enableOAuth !== false,
        "credentials": pluginConfig.enableCredentials !== false,
        "magicLinks": pluginConfig.enableMagicLinks || false,
        "twoFactor": pluginConfig.enableTwoFactor || false,
        "webAuthn": pluginConfig.enableWebAuthn || false,
        "rateLimiting": pluginConfig.enableRateLimiting !== false,
        "auditLogs": pluginConfig.enableAuditLogs !== false
      }
    };

    await fsExtra.writeFile(
      path.join(projectPath, 'better-auth.config.ts'),
      `export default ${JSON.stringify(betterAuthConfig, null, 2)};`
    );
  }

  private async generateDatabaseSchema(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Generating database schema...');

    // Create auth lib directory
    const authLibDir = path.join(projectPath, 'src', 'lib', 'auth');
    await fsExtra.ensureDir(authLibDir);

    // Generate database schema
    const schemaContent = BetterAuthGenerator.generateDatabaseSchema();
    await fsExtra.writeFile(
      path.join(authLibDir, 'schema.sql'),
      schemaContent
    );
  }

  private async createAuthConfiguration(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Creating authentication configuration...');

    // Create auth lib directory
    const authLibDir = path.join(projectPath, 'src', 'lib', 'auth');
    await fsExtra.ensureDir(authLibDir);

    // Generate auth configuration
    const authConfig = BetterAuthGenerator.generateAuthConfig(pluginConfig as BetterAuthConfig);
    await fsExtra.writeFile(
      path.join(authLibDir, 'auth.ts'),
      authConfig
    );

    // Generate auth utilities
    const authUtils = BetterAuthGenerator.generateAuthUtils();
    await fsExtra.writeFile(
      path.join(authLibDir, 'auth-utils.ts'),
      authUtils
    );

    // Generate auth components
    const authComponents = BetterAuthGenerator.generateAuthComponents();
    await fsExtra.writeFile(
      path.join(authLibDir, 'auth-components.tsx'),
      authComponents
    );
  }

  private async addEnvironmentConfig(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Adding environment configuration...');

    // Generate environment configuration
    const envConfig = BetterAuthGenerator.generateEnvConfig(pluginConfig as BetterAuthConfig);
    
    // Append to .env file
    const envPath = path.join(projectPath, '.env');
    if (await fsExtra.pathExists(envPath)) {
      const existingEnv = await fsExtra.readFile(envPath, 'utf-8');
      await fsExtra.writeFile(envPath, existingEnv + '\n' + envConfig);
    } else {
      await fsExtra.writeFile(envPath, envConfig);
    }
  }

  private async generateUnifiedInterfaceFiles(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Generating unified interface files...');

    // Create auth lib directory
    const authLibDir = path.join(projectPath, 'src', 'lib', 'auth');
    await fsExtra.ensureDir(authLibDir);

    // Generate unified interface
    const unifiedContent = BetterAuthGenerator.generateUnifiedIndex();
    await fsExtra.writeFile(
      path.join(authLibDir, 'index.ts'),
      unifiedContent
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
          code: 'BETTER_AUTH_INSTALL_ERROR',
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