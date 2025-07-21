/**
 * Auth Agent - Authentication Orchestrator
 * 
 * The brain for authentication decisions and plugin orchestration.
 * Handles user interaction, decision making, and coordinates auth plugins through unified interfaces.
 * Pure orchestrator - no direct installation logic.
 */

import { existsSync } from 'fs';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { AbstractAgent } from './base/abstract-agent.js';
import { PluginContext, ProjectType, TargetPlatform } from '../types/plugin.js';
import { TemplateService, templateService } from '../core/templates/template-service.js';
import {
  AgentContext,
  AgentResult,
  AgentMetadata,
  AgentCapability,
  AgentCategory,
  CapabilityCategory,
  ValidationResult,
  Artifact,
  ValidationError
} from '../types/agent.js';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { structureService, StructureInfo } from '../core/project/structure-service.js';

interface AuthConfig {
  providers: string[];
  features: {
    emailVerification: boolean;
    passwordReset: boolean;
    twoFactor: boolean;
    sessionManagement: boolean;
    rbac: boolean;
    oauthCallbacks: boolean;
  };
  sessionDuration: number;
  redirectUrl: string;
  callbackUrl: string;
  databaseUrl?: string;
}

export class AuthAgent extends AbstractAgent {
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
        throw new Error(`${pluginName} plugin validation failed: ${validation.errors.map((e: ValidationError) => e.message).join(', ')}`);
      }

      context.logger.info(`${pluginName} plugin validation passed`);

      // Execute the plugin
      context.logger.info(`Executing ${pluginName} plugin...`);
      const result = await plugin.install(pluginContext);

      if (!result.success) {
        throw new Error(`${pluginName} plugin execution failed: ${result.errors.map((e: any) => e.message).join(', ')}`);
      }

      context.logger.info(`${pluginName} plugin execution completed successfully`);

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
    const structure = context.projectStructure!;
    const unifiedPath = structureService.getUnifiedInterfacePath(context.projectPath, structure, 'auth');
    
    // Check for unified interface files
    const requiredFiles = [
      'index.ts',
      'components.tsx',
      'config.ts'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(unifiedPath, file);
      if (!await fsExtra.pathExists(filePath)) {
        throw new Error(`Missing unified interface file: ${filePath}`);
      }
    }

    context.logger.success(`✅ ${pluginName} unified interface validation passed`);
  }

  // ============================================================================
  // PLUGIN SELECTION
  // ============================================================================

  private async selectAuthPlugin(context: AgentContext): Promise<string> {
    // Get plugin selection from context to determine which auth to use
    const pluginSelection = context.state.get('pluginSelection') as any;
    const selectedAuth = pluginSelection?.authentication?.type;
    
    if (selectedAuth && selectedAuth !== 'none') {
      context.logger.info(`Using user selection for auth: ${selectedAuth}`);
      return selectedAuth;
    }
    
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
    const structure = context.projectStructure!;
    return structureService.getModulePath(context.projectPath, structure, packageName);
  }

  private async ensurePackageDirectory(context: AgentContext, packageName: string, packagePath: string): Promise<void> {
    const structure = context.projectStructure!;
    
    if (structure.isMonorepo) {
      // For monorepo, ensure the package directory exists
      await fsExtra.ensureDir(packagePath);
      
      // Create package.json if it doesn't exist
      const packageJsonPath = path.join(packagePath, 'package.json');
      if (!await fsExtra.pathExists(packageJsonPath)) {
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
        
        await fsExtra.writeJSON(packageJsonPath, packageJson, { spaces: 2 });
      }
    }
    // For single app, the directory is already created by the base project agent
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
      features: {
        emailVerification: userConfig.features?.emailVerification !== false,
        passwordReset: userConfig.features?.passwordReset !== false,
        twoFactor: userConfig.features?.twoFactor || false,
        sessionManagement: userConfig.features?.sessionManagement !== false,
        rbac: userConfig.features?.rbac || false,
        oauthCallbacks: userConfig.features?.oauthCallbacks !== false
      },
      sessionDuration: userConfig.sessionDuration || 604800,
      redirectUrl: userConfig.redirectUrl || 'http://localhost:3000',
      callbackUrl: userConfig.callbackUrl || 'http://localhost:3000/auth/callback',
      databaseUrl: dbConfig.connectionString || dbConfig.databaseUrl || ''
    };
  }

  private getPluginConfig(authConfig: AuthConfig, pluginName: string): Record<string, any> {
    const config: Record<string, any> = {
      providers: authConfig.providers,
      features: authConfig.features,
      sessionDuration: authConfig.sessionDuration,
      redirectUrl: authConfig.redirectUrl,
      callbackUrl: authConfig.callbackUrl,
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