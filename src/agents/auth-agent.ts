/**
 * Auth Agent - Authentication Orchestrator
 * 
 * Pure orchestrator for authentication setup using unified interfaces.
 * Handles user interaction, decision making, and coordinates auth plugins through unified interfaces.
 * No direct installation logic - delegates everything to plugins through adapters.
 */

import { existsSync } from 'fs';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { AbstractAgent } from './base/abstract-agent.js';
import { PluginSystem } from '../utils/plugin-system.js';
import { PluginContext, ProjectType, TargetPlatform } from '../types/plugin.js';
import { globalRegistry, globalAdapterFactory } from '../types/unified-registry.js';
import { UnifiedAuth } from '../types/unified.js';
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
      description: 'Orchestrates authentication setup using unified interfaces',
      author: 'The Architech Team',
      category: AgentCategory.AUTHENTICATION,
      tags: ['auth', 'authentication', 'security', 'unified-interface'],
      dependencies: ['base-project'],
      conflicts: [],
      requirements: [
        {
          type: 'package',
          name: 'fs-extra',
          description: 'File system utilities'
        }
      ],
      license: 'MIT',
      repository: 'https://github.com/the-architech/cli'
    };
  }

  protected getAgentCapabilities(): AgentCapability[] {
    return [
      {
        name: 'auth-setup',
        description: 'Setup authentication with unified interfaces',
        category: CapabilityCategory.SETUP,
        parameters: [
          {
            name: 'providers',
            type: 'array',
            description: 'Authentication providers to enable',
            required: false,
            defaultValue: ['email']
          },
          {
            name: 'requireEmailVerification',
            type: 'boolean',
            description: 'Whether to require email verification',
            required: false,
            defaultValue: true
          },
          {
            name: 'sessionDuration',
            type: 'number',
            description: 'Session duration in seconds',
            required: false,
            defaultValue: 30 * 24 * 60 * 60 // 30 days
          }
        ],
        examples: [
          {
            name: 'Setup email authentication',
            description: 'Creates authentication with email/password using unified interfaces',
            parameters: { providers: ['email'], requireEmailVerification: true },
            expectedResult: 'Complete authentication setup with email auth via unified interface'
          },
          {
            name: 'Setup social authentication',
            description: 'Creates authentication with social providers using unified interfaces',
            parameters: { providers: ['email', 'github', 'google'] },
            expectedResult: 'Authentication setup with social login support via unified interface'
          }
        ]
      },
      {
        name: 'auth-validation',
        description: 'Validate authentication setup',
        category: CapabilityCategory.VALIDATION,
        parameters: [],
        examples: [
          {
            name: 'Validate auth setup',
            description: 'Validates the authentication setup using unified interfaces',
            parameters: {},
            expectedResult: 'Authentication setup validation report'
          }
        ]
      }
    ];
  }

  // ============================================================================
  // CORE EXECUTION - Pure Plugin Orchestration with Unified Interfaces
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

      // Select auth plugin based on user preferences or project requirements
      const selectedPlugin = await this.selectAuthPlugin(context);

      // Execute auth plugin through unified interface
      context.logger.info(`Executing ${selectedPlugin} plugin through unified interface...`);
      const result = await this.executeAuthPluginUnified(context, selectedPlugin, authConfig, installPath);

      // Validate the setup using unified interface
      await this.validateAuthSetupUnified(context, selectedPlugin, installPath);

      const duration = Date.now() - startTime;
      
      return {
        success: true,
        artifacts: result.artifacts || [],
        data: {
          plugin: selectedPlugin,
          installPath,
          providers: authConfig.providers,
          unifiedInterface: true
        },
        errors: [],
        warnings: result.warnings || [],
        duration
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      context.logger.error(`Authentication setup failed: ${errorMessage}`);
      
      return this.createErrorResult(
        'AUTH_SETUP_FAILED',
        `Failed to setup authentication: ${errorMessage}`,
        [],
        startTime,
        error
      );
    }
  }

  // ============================================================================
  // UNIFIED INTERFACE EXECUTION
  // ============================================================================

  private async executeAuthPluginUnified(
    context: AgentContext,
    pluginName: string,
    authConfig: AuthConfig,
    installPath: string
  ): Promise<any> {
    try {
      context.logger.info(`Starting unified execution of ${pluginName} plugin...`);
      
      // Get the selected plugin
      const plugin = this.pluginSystem.getRegistry().get(pluginName);
      if (!plugin) {
        throw new Error(`${pluginName} plugin not found in registry`);
      }

      context.logger.info(`Found ${pluginName} plugin in registry`);

      // Prepare plugin context with correct path
      const pluginContext: PluginContext = {
        ...context,
        projectPath: installPath,
        pluginId: pluginName,
        pluginConfig: this.getPluginConfig(authConfig, pluginName),
        installedPlugins: [],
        projectType: ProjectType.NEXTJS,
        targetPlatform: [TargetPlatform.WEB, TargetPlatform.SERVER]
      };

      context.logger.info(`Plugin context prepared for ${pluginName}`);

      // Validate plugin compatibility
      context.logger.info(`Validating ${pluginName} plugin...`);
      const validation = await plugin.validate(pluginContext);
      if (!validation.valid) {
        throw new Error(`${pluginName} plugin validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      context.logger.info(`${pluginName} plugin validation passed`);

      // Execute the plugin
      context.logger.info(`Executing ${pluginName} plugin...`);
      const result = await plugin.install(pluginContext);

      if (!result.success) {
        throw new Error(`${pluginName} plugin execution failed: ${result.errors.map(e => e.message).join(', ')}`);
      }

      context.logger.info(`${pluginName} plugin execution completed successfully`);

      // Create unified interface adapter
      context.logger.info(`Creating unified interface adapter for ${pluginName}...`);
      const authAdapter = await globalAdapterFactory.createAuthAdapter(pluginName);
      
      // Register the adapter in the global registry
      globalRegistry.register('auth', pluginName, authAdapter);
      context.logger.info(`Registered ${pluginName} adapter in unified registry`);

      return result;
    } catch (error) {
      context.logger.error(`Error in executeAuthPluginUnified for ${pluginName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private async validateAuthSetupUnified(
    context: AgentContext,
    pluginName: string,
    installPath: string
  ): Promise<void> {
    try {
      context.logger.info(`Validating auth setup using unified interface for ${pluginName}...`);

      // Get the unified auth interface
      const authInterface = globalRegistry.get('auth', pluginName);
      if (!authInterface) {
        throw new Error(`Auth interface not found for ${pluginName}`);
      }

      // Validate client-side functionality
      context.logger.info('Validating client-side auth functionality...');
      const isAuthenticated = await authInterface.client.isAuthenticated();
      context.logger.info(`Authentication status check: ${isAuthenticated}`);

      // Validate server-side functionality
      context.logger.info('Validating server-side auth functionality...');
      if (typeof authInterface.server.auth === 'function') {
        context.logger.info('Server-side auth function available');
      }

      // Validate components
      context.logger.info('Validating auth components...');
      const requiredComponents = ['LoginButton', 'AuthForm', 'UserProfile', 'AuthGuard'];
      for (const componentName of requiredComponents) {
        if (authInterface.components[componentName as keyof typeof authInterface.components]) {
          context.logger.info(`${componentName} component available`);
        } else {
          context.logger.warn(`${componentName} component not available`);
        }
      }

      // Validate configuration
      context.logger.info('Validating auth configuration...');
      if (authInterface.config.providers.length > 0) {
        context.logger.info(`Configured providers: ${authInterface.config.providers.map(p => p.name).join(', ')}`);
      }

      context.logger.info('Auth setup validation completed successfully');
    } catch (error) {
      context.logger.error(`Auth setup validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // ============================================================================
  // PLUGIN SELECTION
  // ============================================================================

  private async selectAuthPlugin(context: AgentContext): Promise<string> {
    // Check if user has specified a preference
    const userPreference = context.state.get('authTechnology');
    if (userPreference) {
      context.logger.info(`Using user preference for auth: ${userPreference}`);
      return userPreference;
    }

    // Check if project has specified auth technology
    const projectAuth = context.config.auth?.technology;
    if (projectAuth) {
      context.logger.info(`Using project auth technology: ${projectAuth}`);
      return projectAuth;
    }

    // Default to Better Auth for Next.js projects
    context.logger.info('Using default auth technology: better-auth');
    return 'better-auth';
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

  private getPluginConfig(authConfig: AuthConfig, pluginName: string): Record<string, any> {
    const config: Record<string, any> = {
      providers: authConfig.providers,
      requireEmailVerification: authConfig.requireEmailVerification,
      sessionDuration: authConfig.sessionDuration,
      databaseUrl: authConfig.databaseUrl,
      secret: process.env.AUTH_SECRET || 'your-secret-key-here',
      skipDb: false,
      skipPlugins: false
    };

    // Add specific plugin-specific configurations if needed
    if (pluginName === 'better-auth') {
      config.skipDb = true; // Better Auth handles its own DB
      config.skipPlugins = true; // Better Auth handles its own plugins
    }

    return config;
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