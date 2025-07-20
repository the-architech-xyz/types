/**
 * Auth Agent - Authentication Orchestrator
 * 
 * Pure orchestrator for authentication setup using the Better Auth plugin.
 * Handles user interaction, decision making, and coordinates the Better Auth plugin.
 * No direct installation logic - delegates everything to plugins.
 */

import { existsSync } from 'fs';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { AbstractAgent } from './base/abstract-agent.js';
import { PluginSystem } from '../utils/plugin-system.js';
import { PluginContext, ProjectType, TargetPlatform } from '../types/plugin.js';
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

interface AuthConfig {
  providers: ('email' | 'github' | 'google')[];
  requireEmailVerification: boolean;
  sessionDuration: number;
  databaseUrl: string;
}

export class AuthAgent extends AbstractAgent {
  private pluginSystem: PluginSystem;

  constructor() {
    super();
    this.pluginSystem = PluginSystem.getInstance();
  }

  // ============================================================================
  // AGENT METADATA
  // ============================================================================

  protected getAgentMetadata(): AgentMetadata {
    return {
      name: 'AuthAgent',
      version: '2.0.0',
      description: 'Authentication orchestrator - coordinates Better Auth plugin for authentication setup',
      author: 'The Architech Team',
      category: AgentCategory.AUTHENTICATION,
      tags: ['authentication', 'orchestrator', 'plugin-coordinator', 'better-auth'],
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
        description: 'Creates a complete authentication setup using Better Auth plugin',
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
            description: 'Creates authentication with email/password using Better Auth plugin',
            parameters: { providers: ['email'], requireEmailVerification: true },
            expectedResult: 'Complete authentication setup with email auth via plugin'
          },
          {
            name: 'Setup social authentication',
            description: 'Creates authentication with social providers using Better Auth plugin',
            parameters: { providers: ['email', 'github', 'google'] },
            expectedResult: 'Authentication setup with social login support via plugin'
          }
        ],
        category: CapabilityCategory.SETUP
      },
      {
        name: 'configure-providers',
        description: 'Configures additional authentication providers using plugin system',
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
            description: 'Adds GitHub OAuth configuration using Better Auth plugin',
            parameters: { provider: 'github' },
            expectedResult: 'GitHub OAuth configured via plugin'
          }
        ],
        category: CapabilityCategory.CONFIGURATION
      }
    ];
  }

  // ============================================================================
  // CORE EXECUTION - Pure Plugin Orchestration
  // ============================================================================

  protected async executeInternal(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      context.logger.info('Setting up authentication for project: ' + context.projectName);

      // For monorepo, install Better Auth in the auth package directory
      const isMonorepo = context.projectStructure?.type === 'monorepo';
      let installPath: string;
      
      if (isMonorepo) {
        // Install in the auth package directory (packages/auth)
        installPath = path.join(context.projectPath, 'packages', 'auth');
        context.logger.info(`Authentication package path: ${installPath}`);
        
        // Ensure the auth package directory exists
        await fsExtra.ensureDir(installPath);
        context.logger.info(`Using auth package directory for auth setup: ${installPath}`);
      } else {
        // For single-app, use the project root
        installPath = context.projectPath;
        context.logger.info(`Using project root for auth setup: ${installPath}`);
      }

      // Get authentication configuration
      const authConfig = await this.getAuthConfig(context);

      // Execute Better Auth plugin in the correct location
      context.logger.info('Executing Better Auth plugin...');
      const result = await this.executeBetterAuthPlugin(context, authConfig, installPath);

      // Validate the setup
      await this.validateAuthSetup(context, installPath);

      const duration = Date.now() - startTime;
      
      return {
        success: true,
        artifacts: result.artifacts || [],
        data: {
          plugin: 'better-auth',
          installPath,
          providers: authConfig.providers
        },
        errors: [],
        warnings: result.warnings || [],
        duration
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      context.logger.error('Authentication setup failed', error as Error);
      
      return {
        success: false,
        artifacts: [],
        data: null,
        errors: [{
          code: 'AUTH_SETUP_FAILED',
          message: `Authentication setup failed: ${errorMessage}`,
          details: error,
          recoverable: false,
          timestamp: new Date()
        }],
        warnings: [],
        duration: Date.now() - startTime
      };
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

    // Check if authentication package exists (but don't fail if it doesn't - we'll create it)
    const packagePath = this.getPackagePath(context, 'auth');
    if (!await fsExtra.pathExists(packagePath)) {
      warnings.push(`Authentication package directory will be created at: ${packagePath}`);
    }

    // Check if Better Auth plugin is available
    const betterAuthPlugin = this.pluginSystem.getRegistry().get('better-auth');
    if (!betterAuthPlugin) {
      errors.push({
        field: 'plugin',
        message: 'Better Auth plugin not found in registry',
        code: 'PLUGIN_NOT_FOUND',
        severity: 'error'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ============================================================================
  // PRIVATE METHODS - Authentication Setup
  // ============================================================================

  private getPackagePath(context: AgentContext, packageName: string): string {
    const isMonorepo = context.projectStructure?.type === 'monorepo';
    
    if (isMonorepo) {
      return path.join(context.projectPath, 'packages', packageName);
    } else {
      // For single-app, install in the root directory (Next.js project)
      return context.projectPath;
    }
  }

  private async ensurePackageDirectory(context: AgentContext, packageName: string, packagePath: string): Promise<void> {
    const isMonorepo = context.projectStructure?.type === 'monorepo';
    
    if (isMonorepo) {
      // Create package directory and basic structure
      await fsExtra.ensureDir(packagePath);
      
      // Create package.json for the Auth package
      const packageJson = {
        name: `@${context.projectName}/${packageName}`,
        version: "0.1.0",
        private: true,
        main: "./index.ts",
        types: "./index.ts",
        scripts: {
          "build": "tsc",
          "dev": "tsc --watch",
          "lint": "eslint . --ext .ts,.tsx"
        },
        dependencies: {},
        devDependencies: {
          "typescript": "^5.0.0"
        }
      };
      
      await fsExtra.writeJSON(path.join(packagePath, 'package.json'), packageJson, { spaces: 2 });
      
      // Create index.ts
      await fsExtra.writeFile(path.join(packagePath, 'index.ts'), `// ${packageName} package exports\n`);
      
      // Create tsconfig.json
      const tsconfig = {
        extends: "../../tsconfig.json",
        compilerOptions: {
          outDir: "./dist",
          rootDir: "."
        },
        include: ["./**/*"],
        exclude: ["node_modules", "dist"]
      };
      
      await fsExtra.writeJSON(path.join(packagePath, 'tsconfig.json'), tsconfig, { spaces: 2 });
      
      context.logger.info(`Created ${packageName} package at: ${packagePath}`);
    } else {
      // For single-app, just ensure the directory exists (Next.js project already has structure)
      await fsExtra.ensureDir(packagePath);
      context.logger.info(`Using existing Next.js project at: ${packagePath}`);
    }
  }

  private async validateAuthSetup(context: AgentContext, installPath: string): Promise<void> {
    context.logger.info('Validating authentication setup...');

    // Check for essential auth files
    const essentialFiles = [
      'lib/auth.ts',
      '.env.local'
    ];
    
    for (const file of essentialFiles) {
      const filePath = path.join(installPath, file);
      if (!await fsExtra.pathExists(filePath)) {
        throw new Error(`Authentication file missing: ${file}`);
      }
    }

    context.logger.success('Authentication setup validation passed');
  }

  private async executeBetterAuthPlugin(
    context: AgentContext, 
    authConfig: AuthConfig,
    installPath: string
  ): Promise<any> {
    // Get the Better Auth plugin
    const betterAuthPlugin = this.pluginSystem.getRegistry().get('better-auth');
    if (!betterAuthPlugin) {
      throw new Error('Better Auth plugin not found in registry');
    }

    // Prepare plugin context with correct path
    const pluginContext: PluginContext = {
      ...context,
      projectPath: installPath, // Use install path instead of package path
      pluginId: 'better-auth',
      pluginConfig: this.getPluginConfig(authConfig),
      installedPlugins: [],
      projectType: ProjectType.NEXTJS,
      targetPlatform: [TargetPlatform.WEB, TargetPlatform.SERVER]
    };

    // Validate plugin compatibility
    const validation = await betterAuthPlugin.validate(pluginContext);
    if (!validation.valid) {
      throw new Error(`Better Auth plugin validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Execute the plugin
    context.logger.info('Executing Better Auth plugin...');
    const result = await betterAuthPlugin.install(pluginContext);

    if (!result.success) {
      throw new Error(`Better Auth plugin execution failed: ${result.errors.map(e => e.message).join(', ')}`);
    }

    return result;
  }

  private async getAuthConfig(context: AgentContext): Promise<AuthConfig> {
    // Get configuration from context or use defaults
    const userConfig = context.config.authentication || {};
    const dbConfig = context.config.database || {};
    
    return {
      providers: userConfig.providers || ['email'],
      requireEmailVerification: userConfig.requireEmailVerification !== false,
      sessionDuration: userConfig.sessionDuration || 604800,
      databaseUrl: dbConfig.connectionString || dbConfig.databaseUrl || ''
    };
  }

  private getPluginConfig(authConfig: AuthConfig): Record<string, any> {
    return {
      providers: authConfig.providers,
      requireEmailVerification: authConfig.requireEmailVerification,
      sessionDuration: authConfig.sessionDuration,
      databaseUrl: authConfig.databaseUrl,
      secret: process.env.AUTH_SECRET || 'your-secret-key-here',
      skipDb: false,
      skipPlugins: false
    };
  }

  // ============================================================================
  // ROLLBACK
  // ============================================================================

  async rollback(context: AgentContext): Promise<void> {
    context.logger.warn('Rolling back authentication setup...');

    try {
      // Get the Better Auth plugin for uninstallation
      const betterAuthPlugin = this.pluginSystem.getRegistry().get('better-auth');
      if (betterAuthPlugin) {
        const packagePath = this.getPackagePath(context, 'auth');
        const pluginContext: PluginContext = {
          ...context,
          projectPath: packagePath, // Use package path for uninstallation
          pluginId: 'better-auth',
          pluginConfig: {},
          installedPlugins: [],
          projectType: ProjectType.NEXTJS,
          targetPlatform: [TargetPlatform.WEB, TargetPlatform.SERVER]
        };

        await betterAuthPlugin.uninstall(pluginContext);
      }

      context.logger.success('Authentication setup rollback completed');
    } catch (error) {
      context.logger.error('Authentication rollback failed', error as Error);
    }
  }
} 