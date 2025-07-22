/**
 * NextAuth Plugin - Updated with Latest Best Practices
 * 
 * Provides NextAuth authentication integration using the official NextAuth.js.
 * Follows latest NextAuth documentation and TypeScript best practices.
 * 
 * References:
 * - https://next-auth.js.org/configuration
 * - https://next-auth.js.org/providers
 * - https://next-auth.js.org/adapters
 */

import { IPlugin, PluginMetadata, PluginArtifact, ValidationResult, PluginCategory, PluginContext, PluginResult, TargetPlatform, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../../../types/plugin.js';
import { TemplateService, templateService } from '../../../../core/templates/template-service.js';
import { CommandRunner } from '../../../../core/cli/command-runner.js';
import { ValidationError } from '../../../../types/agent.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { structureService, StructureInfo } from '../../../../core/project/structure-service.js';
import { NextAuthConfig, NextAuthConfigSchema, NextAuthDefaultConfig } from './NextAuthSchema.js';
import { NextAuthGenerator } from './NextAuthGenerator.js';

export class NextAuthPlugin implements IPlugin {
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
      id: 'nextauth',
      name: 'NextAuth.js',
      version: '1.0.0',
      description: 'Complete authentication solution for Next.js applications',
      author: 'The Architech Team',
      category: PluginCategory.AUTHENTICATION,
      tags: ['authentication', 'oauth', 'session', 'security', 'nextjs'],
      license: 'MIT',
      repository: 'https://github.com/nextauthjs/next-auth',
      homepage: 'https://next-auth.js.org',
      documentation: 'https://next-auth.js.org/configuration'
    };
  }

  // ============================================================================
  // PLUGIN LIFECYCLE - Pure Technology Implementation
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      const { projectPath, pluginConfig } = context;
      
      context.logger.info('Installing NextAuth.js...');

      // Step 1: Install dependencies
      await this.installDependencies(context);

      // Step 2: Initialize NextAuth configuration
      await this.initializeNextAuth(context);

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
          },
          {
            type: 'file',
            path: path.join(projectPath, 'prisma', 'schema.prisma')
          }
        ],
        dependencies: [
          {
            name: 'next-auth',
            version: '^4.24.0',
            type: 'production',
            category: PluginCategory.AUTHENTICATION
          },
          {
            name: '@auth/prisma-adapter',
            version: '^1.0.0',
            type: 'production',
            category: PluginCategory.AUTHENTICATION
          },
          {
            name: '@prisma/client',
            version: '^5.0.0',
            type: 'production',
            category: PluginCategory.AUTHENTICATION
          },
          {
            name: 'bcryptjs',
            version: '^2.4.3',
            type: 'production',
            category: PluginCategory.AUTHENTICATION
          }
        ],
        scripts: [
          {
            name: 'auth:init',
            command: 'npx next-auth@latest init',
            description: 'Initialize NextAuth configuration',
            category: 'dev'
          },
          {
            name: 'auth:generate',
            command: 'npx prisma generate',
            description: 'Generate Prisma client',
            category: 'dev'
          }
        ],
        configs: [
          {
            file: '.env',
            content: NextAuthGenerator.generateEnvConfig(pluginConfig as NextAuthConfig),
            mergeStrategy: 'append'
          }
        ],
        errors: [],
        warnings: [],
        duration
      };

    } catch (error) {
      return this.createErrorResult(
        'Failed to install NextAuth.js',
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
      
      context.logger.info('Uninstalling NextAuth.js...');

      // Remove NextAuth files
      const filesToRemove = [
        path.join(projectPath, 'src', 'lib', 'auth'),
        path.join(projectPath, 'src', 'app', 'api', 'auth'),
        path.join(projectPath, 'next-auth.config.ts')
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
        warnings: ['NextAuth.js files removed. You may need to manually remove dependencies from package.json'],
        duration
      };

    } catch (error) {
      return this.createErrorResult(
        'Failed to uninstall NextAuth.js',
        startTime,
        [],
        error
      );
    }
  }

  async update(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    
    try {
      context.logger.info('Updating NextAuth.js...');

      // Update dependencies
      await this.runner.execCommand(['npm', 'update', 'next-auth', '@auth/prisma-adapter', '@prisma/client', 'bcryptjs']);

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
        'Failed to update NextAuth.js',
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
          field: 'nextauth.config',
          message: 'NextAuth configuration file not found',
          code: 'MISSING_CONFIG',
          severity: 'error'
        });
      }

      // Check if auth API routes exist
      const apiPath = path.join(context.projectPath, 'src', 'app', 'api', 'auth');
      if (!await fsExtra.pathExists(apiPath)) {
        errors.push({
          field: 'nextauth.api',
          message: 'NextAuth API routes not found',
          code: 'MISSING_API',
          severity: 'error'
        });
      }

      // Check if database schema exists
      const schemaPath = path.join(context.projectPath, 'src', 'lib', 'auth', 'schema.sql');
      if (!await fsExtra.pathExists(schemaPath)) {
        warnings.push('NextAuth database schema not found');
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
      frameworks: ['nextjs', 'react'],
      platforms: [TargetPlatform.WEB],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
      databases: ['postgresql', 'mysql', 'sqlite', 'mongodb'],
      conflicts: ['better-auth', 'auth0', 'firebase-auth']
    };
  }

  getDependencies(): string[] {
    return ['next-auth', '@auth/prisma-adapter', '@prisma/client', 'bcryptjs'];
  }

  getConflicts(): string[] {
    return ['better-auth', 'auth0', 'firebase-auth'];
  }

  getRequirements(): PluginRequirement[] {
    return [
      {
        type: 'package',
        name: 'next-auth',
        description: 'NextAuth.js core library',
        version: '^4.24.0'
      },
      {
        type: 'package',
        name: '@auth/prisma-adapter',
        description: 'Prisma adapter for NextAuth',
        version: '^1.0.0'
      },
      {
        type: 'package',
        name: '@prisma/client',
        description: 'Prisma client for database access',
        version: '^5.0.0'
      },
      {
        type: 'package',
        name: 'bcryptjs',
        description: 'Password hashing utility',
        version: '^2.4.3'
      }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return NextAuthDefaultConfig;
  }

  getConfigSchema(): ConfigSchema {
    return NextAuthConfigSchema;
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private async installDependencies(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Installing NextAuth.js dependencies...');

    const dependencies = [
      'next-auth@^4.24.0',
      '@auth/prisma-adapter@^1.0.0',
      '@prisma/client@^5.0.0',
      'bcryptjs@^2.4.3'
    ];

    await this.runner.execCommand(['npm', 'install', ...dependencies], { cwd: projectPath });
  }

  private async initializeNextAuth(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Initializing NextAuth.js...');

    // Create NextAuth configuration
    const nextAuthConfig = {
      "providers": pluginConfig.providers || ['credentials', 'google', 'github'],
      "database": {
        "url": pluginConfig.databaseUrl || 'postgresql://user:password@localhost:5432/nextauth'
      },
      "session": {
        "strategy": pluginConfig.enableJWT ? "jwt" : "database",
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
      path.join(projectPath, 'next-auth.config.ts'),
      `export default ${JSON.stringify(nextAuthConfig, null, 2)};`
    );
  }

  private async generateDatabaseSchema(context: PluginContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Generating database schema...');

    // Create auth lib directory
    const authLibDir = path.join(projectPath, 'src', 'lib', 'auth');
    await fsExtra.ensureDir(authLibDir);

    // Generate database schema
    const schemaContent = NextAuthGenerator.generateDatabaseSchema();
    await fsExtra.writeFile(
      path.join(authLibDir, 'schema.sql'),
      schemaContent
    );

    // Generate Prisma schema
    const prismaDir = path.join(projectPath, 'prisma');
    await fsExtra.ensureDir(prismaDir);
    
    const prismaSchema = NextAuthGenerator.generatePrismaSchema();
    await fsExtra.writeFile(
      path.join(prismaDir, 'schema.prisma'),
      prismaSchema
    );
  }

  private async createAuthConfiguration(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Creating authentication configuration...');

    // Create auth lib directory
    const authLibDir = path.join(projectPath, 'src', 'lib', 'auth');
    await fsExtra.ensureDir(authLibDir);

    // Generate auth configuration
    const authConfig = NextAuthGenerator.generateAuthConfig(pluginConfig as NextAuthConfig);
    await fsExtra.writeFile(
      path.join(authLibDir, 'auth.ts'),
      authConfig
    );

    // Generate auth utilities
    const authUtils = NextAuthGenerator.generateAuthUtils();
    await fsExtra.writeFile(
      path.join(authLibDir, 'auth-utils.ts'),
      authUtils
    );

    // Generate auth components
    const authComponents = NextAuthGenerator.generateAuthComponents();
    await fsExtra.writeFile(
      path.join(authLibDir, 'auth-components.tsx'),
      authComponents
    );
  }

  private async addEnvironmentConfig(context: PluginContext): Promise<void> {
    const { projectPath, pluginConfig } = context;
    
    context.logger.info('Adding environment configuration...');

    // Generate environment configuration
    const envConfig = NextAuthGenerator.generateEnvConfig(pluginConfig as NextAuthConfig);
    
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
    const unifiedContent = NextAuthGenerator.generateUnifiedIndex();
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
          code: 'NEXTAUTH_INSTALL_ERROR',
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