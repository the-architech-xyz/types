/**
 * DB Agent - Database Orchestrator
 * 
 * Pure orchestrator for database setup using the Drizzle plugin.
 * Handles user interaction, decision making, and coordinates the Drizzle plugin.
 * No direct installation logic - delegates everything to plugins.
 */

import { AbstractAgent } from './base/abstract-agent.js';
import { PluginSystem } from '../utils/plugin-system.js';
import { ProjectType, TargetPlatform } from '../types/plugin.js';
import { TemplateService, templateService } from '../utils/template-service.js';
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
  provider: 'neon';
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
      description: 'Database orchestrator - coordinates Drizzle plugin for database setup',
      author: 'The Architech Team',
      category: AgentCategory.DATABASE,
      tags: ['database', 'orchestrator', 'plugin-coordinator', 'drizzle'],
      dependencies: ['BaseProjectAgent'],
      conflicts: [],
      requirements: [
        {
          type: 'package',
          name: 'drizzle-orm',
          description: 'Drizzle ORM for database operations'
        },
        {
          type: 'package',
          name: '@neondatabase/serverless',
          description: 'Neon PostgreSQL serverless driver'
        }
      ],
      license: 'MIT',
      repository: 'https://github.com/the-architech/cli'
    };
  }

  protected getAgentCapabilities(): AgentCapability[] {
    return [
      {
        name: 'setup-database',
        description: 'Creates a complete database setup using Drizzle plugin',
        parameters: [
          {
            name: 'provider',
            type: 'string',
            required: false,
            description: 'Database provider (neon)',
            defaultValue: 'neon',
            validation: [
              {
                type: 'enum',
                value: ['neon'],
                message: 'Provider must be neon'
              }
            ]
          },
          {
            name: 'connectionString',
            type: 'string',
            required: false,
            description: 'Database connection string',
            defaultValue: ''
          },
          {
            name: 'schema',
            type: 'array',
            required: false,
            description: 'Database schema tables to create',
            defaultValue: ['users', 'posts', 'comments']
          },
          {
            name: 'migrations',
            type: 'boolean',
            required: false,
            description: 'Enable database migrations',
            defaultValue: true
          }
        ],
        examples: [
          {
            name: 'Setup Neon PostgreSQL',
            description: 'Creates database setup with Neon PostgreSQL using Drizzle plugin',
            parameters: { provider: 'neon' },
            expectedResult: 'Complete database setup with Drizzle ORM via plugin'
          }
        ],
        category: CapabilityCategory.SETUP
      },
      {
        name: 'generate-migrations',
        description: 'Generates database migrations using Drizzle plugin',
        parameters: [],
        examples: [
          {
            name: 'Generate migrations',
            description: 'Creates migration files for schema changes via plugin',
            parameters: {},
            expectedResult: 'Migration files generated via Drizzle plugin'
          }
        ],
        category: CapabilityCategory.GENERATION
      },
      {
        name: 'design-schema',
        description: 'AI-powered database schema design using plugin system',
        parameters: [
          {
            name: 'requirements',
            type: 'string',
            required: true,
            description: 'Natural language schema requirements'
          }
        ],
        examples: [
          {
            name: 'Design user management schema',
            description: 'Creates schema for user authentication and profiles via plugin',
            parameters: { requirements: 'User authentication with profiles, roles, and permissions' },
            expectedResult: 'Complete schema with users, roles, and permissions tables via plugin'
          }
        ],
        category: CapabilityCategory.GENERATION
      }
    ];
  }

  // ============================================================================
  // CORE EXECUTION - Pure Plugin Orchestration
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

      // Execute selected database plugin in the correct location
      context.logger.info(`Executing ${selectedPlugin} plugin...`);
      const result = await this.executeDatabasePlugin(context, selectedPlugin, dbConfig, packagePath);

      // Validate the setup
      await this.validateDatabaseSetup(context, packagePath);

      const duration = Date.now() - startTime;
      
      return {
        success: true,
        artifacts: result.artifacts || [],
        data: {
          plugin: selectedPlugin,
          packagePath,
          provider: dbConfig.provider
        },
        errors: [],
        warnings: result.warnings || [],
        duration
      };

    } catch (error) {
      return {
        success: false,
        data: null,
        errors: [{
          code: 'DB_AGENT_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error,
          recoverable: false,
          suggestion: 'Check database plugin configuration and try again',
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

  private async executeDrizzlePlugin(
    context: AgentContext, 
    dbConfig: DatabaseConfig,
    packagePath: string
  ): Promise<any> {
    // Get the Drizzle plugin
    const drizzlePlugin = this.pluginSystem.getRegistry().get('drizzle');
    if (!drizzlePlugin) {
      throw new Error('Drizzle plugin not found in registry');
    }

    // Prepare plugin context with correct path
    const pluginContext: PluginContext = {
      ...context,
      projectPath: packagePath, // Use package path instead of root path
      pluginId: 'drizzle',
      pluginConfig: this.getPluginConfig(dbConfig),
      installedPlugins: [],
      projectType: ProjectType.NEXTJS,
      targetPlatform: [TargetPlatform.WEB, TargetPlatform.SERVER]
    };

    // Validate plugin compatibility
    const validation = await drizzlePlugin.validate(pluginContext);
    if (!validation.valid) {
      throw new Error(`Drizzle plugin validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Execute the plugin
    context.logger.info('Executing Drizzle plugin...');
    const result = await drizzlePlugin.install(pluginContext);

    if (!result.success) {
      throw new Error(`Drizzle plugin execution failed: ${result.errors.map(e => e.message).join(', ')}`);
    }

    return result;
  }

  private async validateDatabaseSetup(context: AgentContext, packagePath: string): Promise<void> {
    context.logger.info('Validating database setup...');

    // Check for essential database files in the package path
    const essentialFiles = [
      'drizzle.config.ts',
      'db/schema.ts',
      'db/index.ts'
    ];
    for (const file of essentialFiles) {
      const filePath = path.join(packagePath, file);
      if (!await fsExtra.pathExists(filePath)) {
        throw new Error(`Database file missing: ${file}`);
      }
    }

    // Check for package.json dependencies
    const packageJsonPath = path.join(packagePath, 'package.json');
    if (await fsExtra.pathExists(packageJsonPath)) {
      const packageJson = await fsExtra.readJSON(packageJsonPath);
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (!dependencies['drizzle-orm']) {
        throw new Error('Drizzle ORM dependency not found in package.json');
      }
    }

    context.logger.success('Database setup validation passed');
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

  private getPluginConfig(dbConfig: DatabaseConfig, pluginName?: string): Record<string, any> {
    // Return plugin-specific configuration
    if (pluginName === 'prisma') {
      return {
        provider: 'postgresql',
        databaseUrl: 'DATABASE_URL',
        shadowDatabaseUrl: 'SHADOW_DATABASE_URL',
        generateClient: true,
        generateMigrations: true,
        seedScript: true,
        studio: true,
        introspection: false
      };
    } else if (pluginName === 'drizzle') {
      return {
        provider: dbConfig.provider,
        databaseUrl: dbConfig.connectionString,
        connectionString: dbConfig.connectionString,
        schema: './db/schema.ts',
        out: './drizzle',
        dialect: 'postgresql'
      };
    }

    // Default fallback
    return {
      provider: dbConfig.provider,
      databaseUrl: dbConfig.connectionString,
      connectionString: dbConfig.connectionString
    };
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
  // PLUGIN SELECTION
  // ============================================================================

  private async selectDatabasePlugin(context: AgentContext): Promise<string> {
    // Check if user has specified a database plugin preference
    const userPreference = context.config?.database?.plugin;
    if (userPreference) {
      context.logger.info(`Using user-specified database plugin: ${userPreference}`);
      return userPreference;
    }

    // Check if we're in non-interactive mode (--yes flag) and no user preference
    if (context.options.useDefaults && !userPreference) {
      context.logger.info('Using default database plugin: drizzle');
      // Store the default selection in context
      if (!context.config.database) context.config.database = {};
      context.config.database.plugin = 'drizzle';
      return 'drizzle';
    }

    // Interactive plugin selection
    const availablePlugins = this.getAvailableDatabasePlugins();
    
    if (availablePlugins.length === 1) {
      context.logger.info(`Only one database plugin available: ${availablePlugins[0].id}`);
      // Store the selection in context
      if (!context.config.database) context.config.database = {};
      context.config.database.plugin = availablePlugins[0].id;
      return availablePlugins[0].id;
    }

    // Show plugin selection prompt
    console.log(chalk.blue.bold('\n🗄️ Choose your database ORM:\n'));
    
    const choices = availablePlugins.map(plugin => {
      const metadata = plugin.getMetadata();
      return {
        name: `${metadata.name} - ${metadata.description}`,
        value: metadata.id,
        description: `Tags: ${metadata.tags.join(', ')}`
      };
    });

    const { selectedPlugin } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedPlugin',
        message: chalk.yellow('Select database ORM:'),
        choices,
        default: 'drizzle'
      }
    ]);

    context.logger.info(`Selected database plugin: ${selectedPlugin}`);
    
    // Store the selection in context
    if (!context.config.database) context.config.database = {};
    context.config.database.plugin = selectedPlugin;
    
    return selectedPlugin;
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