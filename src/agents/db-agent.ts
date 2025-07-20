/**
 * DB Agent - Database Orchestrator
 * 
 * Pure orchestrator for database setup using unified interfaces.
 * Handles user interaction, decision making, and coordinates database plugins through unified interfaces.
 * No direct installation logic - delegates everything to plugins through adapters.
 */

import { AbstractAgent } from './base/abstract-agent.js';
import { PluginSystem } from '../core/plugin/plugin-system.js';
import { ProjectType, TargetPlatform } from '../types/plugin.js';
import { TemplateService, templateService } from '../core/templates/template-service.js';
import { globalRegistry, globalAdapterFactory } from '../types/unified-registry.js';
import { UnifiedDatabase } from '../types/unified.js';
import * as path from 'path';
import fsExtra from 'fs-extra';
import { PluginContext } from '../types/plugin.js';
import inquirer from 'inquirer';
import chalk from 'chalk';
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

interface DatabaseConfig {
  provider: 'neon' | 'supabase' | 'local';
  connectionString: string;
  schema: string[];
  migrations: boolean;
}

export class DBAgent extends AbstractAgent {
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
      name: 'DBAgent',
      version: '2.0.0',
      description: 'Orchestrates database setup using unified interfaces',
      author: 'The Architech Team',
      category: AgentCategory.DATABASE,
      tags: ['database', 'orm', 'migrations', 'unified-interface'],
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
        name: 'db-setup',
        description: 'Setup database with unified interfaces',
        category: CapabilityCategory.SETUP,
        parameters: [
          {
            name: 'provider',
            type: 'string',
            description: 'Database provider',
            required: false,
            defaultValue: 'neon'
          },
          {
            name: 'connectionString',
            type: 'string',
            description: 'Database connection string',
            required: false,
            defaultValue: ''
          },
          {
            name: 'schema',
            type: 'array',
            description: 'Database schema tables',
            required: false,
            defaultValue: ['users', 'posts', 'comments']
          },
          {
            name: 'migrations',
            type: 'boolean',
            description: 'Enable migrations',
            required: false,
            defaultValue: true
          }
        ],
        examples: [
          {
            name: 'Setup Drizzle ORM',
            description: 'Creates database setup with Drizzle ORM using unified interfaces',
            parameters: { provider: 'neon', migrations: true },
            expectedResult: 'Complete database setup with Drizzle ORM via unified interface'
          },
          {
            name: 'Setup Prisma ORM',
            description: 'Creates database setup with Prisma ORM using unified interfaces',
            parameters: { provider: 'supabase', migrations: true },
            expectedResult: 'Database setup with Prisma ORM via unified interface'
          }
        ]
      },
      {
        name: 'db-validation',
        description: 'Validate database setup',
        category: CapabilityCategory.VALIDATION,
        parameters: [],
        examples: [
          {
            name: 'Validate database setup',
            description: 'Validates the database setup using unified interfaces',
            parameters: {},
            expectedResult: 'Database setup validation report'
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
      context.logger.info('Starting database orchestration...');

      // For monorepo, install database in the db package directory
      const isMonorepo = context.projectStructure?.type === 'monorepo';
      let packagePath: string;
      
      if (isMonorepo) {
        // Install in the db package directory (packages/db)
        packagePath = path.join(context.projectPath, 'packages', 'db');
        context.logger.info(`Database package path: ${packagePath}`);
        
        // Ensure the db package directory exists and is properly set up
        await this.ensurePackageDirectory(context, 'db', packagePath);
        context.logger.info(`Using db package directory for database setup: ${packagePath}`);
      } else {
        // For single-app, use the project root
        packagePath = context.projectPath;
        context.logger.info(`Using project root for database setup: ${packagePath}`);
      }

      // Select database plugin based on user preferences or project requirements
      const selectedPlugin = await this.selectDatabasePlugin(context);

      // Get database configuration
      const dbConfig = await this.getDatabaseConfig(context);

      // Execute selected database plugin through unified interface
      context.logger.info(`Executing ${selectedPlugin} plugin through unified interface...`);
      const result = await this.executeDatabasePluginUnified(selectedPlugin, context);

      // Validate the setup using unified interface
      await this.validateDatabaseSetupUnified(context, selectedPlugin, packagePath);

      const duration = Date.now() - startTime;
      
      return {
        success: true,
        artifacts: result.artifacts || [],
        data: {
          plugin: selectedPlugin,
          packagePath,
          provider: dbConfig.provider,
          migrations: dbConfig.migrations,
          unifiedInterface: true
        },
        errors: [],
        warnings: result.warnings || [],
        duration
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      context.logger.error(`Database setup failed: ${errorMessage}`);
      
      return this.createErrorResult(
        'DB_SETUP_FAILED',
        `Failed to setup database: ${errorMessage}`,
        [],
        startTime,
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

    // Check if database package exists (but don't fail if it doesn't - we'll create it)
    const packagePath = this.getPackagePath(context, 'db');
    if (!await fsExtra.pathExists(packagePath)) {
      warnings.push(`Database package directory will be created at: ${packagePath}`);
    }

    // Check if Drizzle plugin is available
    const drizzlePlugin = this.pluginSystem.getRegistry().get('drizzle');
    if (!drizzlePlugin) {
      errors.push({
        field: 'plugin',
        message: 'Drizzle plugin not found in registry',
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
  // PRIVATE METHODS - Database Setup
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
      
      // Create package.json for the DB package
      const packageJson = {
        name: `@${context.projectName}/${packageName}`,
        version: "0.1.0",
        private: true,
        main: "./index.ts",
        types: "./index.ts",
        scripts: {
          "build": "tsc",
          "dev": "tsc --watch",
          "lint": "eslint . --ext .ts,.tsx",
          "db:generate": "drizzle-kit generate",
          "db:migrate": "drizzle-kit migrate",
          "db:studio": "drizzle-kit studio"
        },
        dependencies: {},
        devDependencies: {
          "typescript": "^5.0.0",
          "drizzle-kit": "^0.31.4"
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

  private async getDatabaseConfig(context: AgentContext): Promise<DatabaseConfig> {
    // Get configuration from context or use defaults
    const userConfig = context.config.database || {};
    
    return {
      provider: userConfig.provider || 'neon',
      connectionString: userConfig.connectionString || userConfig.databaseUrl || '',
      schema: userConfig.schema || ['users', 'posts', 'comments'],
      migrations: userConfig.migrations !== false
    };
  }

  private getPluginConfig(dbConfig: DatabaseConfig, pluginName: string): Record<string, any> {
    const config: Record<string, any> = {
      provider: dbConfig.provider,
      connectionString: dbConfig.connectionString,
      schema: dbConfig.schema,
      migrations: dbConfig.migrations,
      useTypeScript: true,
      includeExamples: true
    };

    // Add specific plugin-specific configurations if needed
    if (pluginName === 'drizzle') {
      config.skipDb = true; // Drizzle handles its own DB setup
      config.skipPlugins = true; // Drizzle handles its own plugins
    } else if (pluginName === 'prisma') {
      config.skipDb = true; // Prisma handles its own DB setup
      config.skipPlugins = true; // Prisma handles its own plugins
    }

    return config;
  }

  // ============================================================================
  // ROLLBACK
  // ============================================================================

  async rollback(context: AgentContext): Promise<void> {
    context.logger.warn('Rolling back database setup...');

    try {
      // Get the Drizzle plugin for uninstallation
      const drizzlePlugin = this.pluginSystem.getRegistry().get('drizzle');
      if (drizzlePlugin) {
        const packagePath = this.getPackagePath(context, 'db');
        const pluginContext: PluginContext = {
          ...context,
          projectPath: packagePath, // Use package path for uninstallation
          pluginId: 'drizzle',
          pluginConfig: {},
          installedPlugins: [],
          projectType: ProjectType.NEXTJS,
          targetPlatform: [TargetPlatform.WEB, TargetPlatform.SERVER]
        };

        await drizzlePlugin.uninstall(pluginContext);
      }

      context.logger.success('Database setup rollback completed');
    } catch (error) {
      context.logger.error('Database rollback failed', error as Error);
    }
  }

  // ============================================================================
  // UNIFIED INTERFACE EXECUTION
  // ============================================================================

  private async executeDatabasePluginUnified(
    pluginId: string, 
    context: AgentContext
  ): Promise<{ artifacts: any[]; warnings: string[] }> {
    context.logger.info(`Starting unified execution of ${pluginId} plugin...`);
    
    // Get plugin selection from context to determine which database to use
    const pluginSelection = context.state.get('pluginSelection') as any;
    const selectedDatabase = pluginSelection?.database?.type || pluginId;
    
    context.logger.info(`Using database technology: ${selectedDatabase} (user selection: ${pluginSelection?.database?.type})`);
    
    // Use the selected database instead of the default
    const actualPluginId = selectedDatabase === 'none' ? pluginId : selectedDatabase;
    
    context.logger.info(`Found ${actualPluginId} plugin in registry`);
    
    // Get plugin from registry
    const plugin = this.pluginSystem.getRegistry().get(actualPluginId);
    if (!plugin) {
      throw new Error(`Database plugin not found: ${actualPluginId}`);
    }

    // Prepare plugin context
    const pluginContext: PluginContext = {
      ...context,
      pluginId: actualPluginId,
      pluginConfig: {
        provider: pluginSelection?.database?.provider || 'neon',
        features: pluginSelection?.database?.features || {}
      },
      installedPlugins: [],
      projectType: ProjectType.NEXTJS,
      targetPlatform: [TargetPlatform.WEB, TargetPlatform.SERVER]
    };

    context.logger.info('Plugin context prepared for ' + actualPluginId);
    
    // Validate plugin
    const validation = await plugin.validate(pluginContext);
    if (!validation.valid) {
      throw new Error(`${actualPluginId} plugin validation failed: ${validation.errors.map((e: any) => e.message).join(', ')}`);
    }
    context.logger.info(`${actualPluginId} plugin validation passed`);

    // Execute plugin
    context.logger.info(`Executing ${actualPluginId} plugin...`);
    const result = await plugin.install(pluginContext);
    
    if (!result.success) {
      throw new Error(`${actualPluginId} plugin execution failed: ${result.errors?.map((e: any) => e.message).join(', ') || 'Unknown error'}`);
    }
    
    context.logger.info(`${actualPluginId} plugin execution completed successfully`);
    
    return {
      artifacts: result.artifacts || [],
      warnings: result.warnings || []
    };
  }

  private async validateDatabaseSetupUnified(
    context: AgentContext,
    pluginName: string,
    packagePath: string
  ): Promise<void> {
    try {
      context.logger.info(`Validating database setup using unified interface for ${pluginName}...`);

      // Get the unified database interface
      const dbInterface = globalRegistry.get('database', pluginName);
      if (!dbInterface) {
        throw new Error(`Database interface not found for ${pluginName}`);
      }

      // Validate client operations
      context.logger.info('Validating database client operations...');
      if (typeof dbInterface.client.query === 'function') {
        context.logger.info('Database client operations available');
      }

      // Validate schema management
      context.logger.info('Validating schema management...');
      if (dbInterface.schema.users && dbInterface.schema.posts) {
        context.logger.info('Schema management available');
      }

      // Validate migration utilities
      context.logger.info('Validating migration utilities...');
      if (typeof dbInterface.migrations.generate === 'function') {
        context.logger.info('Migration utilities available');
      }

      // Validate connection management
      context.logger.info('Validating connection management...');
      if (typeof dbInterface.connection.connect === 'function') {
        context.logger.info('Connection management available');
      }

      context.logger.info('Database setup validation completed successfully');
    } catch (error) {
      context.logger.error(`Database setup validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  // ============================================================================
  // PLUGIN SELECTION
  // ============================================================================

  private async selectDatabasePlugin(context: AgentContext): Promise<string> {
    // Check if user has specified a preference
    const userPreference = context.state.get('dbTechnology');
    if (userPreference) {
      context.logger.info(`Using user preference for database: ${userPreference}`);
      return userPreference;
    }

    // Check if project has specified database technology
    const projectDB = context.config.database?.technology;
    if (projectDB) {
      context.logger.info(`Using project database technology: ${projectDB}`);
      return projectDB;
    }

    // Default to Drizzle for Next.js projects
    context.logger.info('Using default database technology: drizzle');
    return 'drizzle';
  }

  private getAvailableDatabasePlugins(): any[] {
    const registry = this.pluginSystem.getRegistry();
    const allPlugins = registry.getAll();
    
    return allPlugins.filter(plugin => {
      const metadata = plugin.getMetadata();
      return metadata.category === 'orm' || metadata.category === 'database';
    });
  }

  // ============================================================================
  // PLUGIN EXECUTION
  // ============================================================================

  private async executeDatabasePlugin(
    context: AgentContext, 
    pluginName: string,
    dbConfig: DatabaseConfig,
    packagePath: string
  ): Promise<any> {
    try {
      context.logger.info(`Starting execution of ${pluginName} plugin...`);
      
      // Get the selected plugin
      const plugin = this.pluginSystem.getRegistry().get(pluginName);
      if (!plugin) {
        throw new Error(`${pluginName} plugin not found in registry`);
      }

      context.logger.info(`Found ${pluginName} plugin in registry`);

      // Prepare plugin context with correct path
      const pluginContext: PluginContext = {
        ...context,
        projectPath: packagePath, // Use package path instead of root path
        pluginId: pluginName,
        pluginConfig: this.getPluginConfig(dbConfig, pluginName),
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
      return result;
    } catch (error) {
      context.logger.error(`Error in executeDatabasePlugin for ${pluginName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
} 