/**
 * DB Agent - Database Orchestrator
 * 
 * Pure orchestrator for database setup using the Drizzle plugin.
 * Handles user interaction, decision making, and coordinates the Drizzle plugin.
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
    const { projectName, projectPath } = context;
    
    context.logger.info(`Setting up database for project: ${projectName}`);

    try {
      // Start spinner for actual work
      await this.startSpinner(`🗄️ Setting up database with Drizzle ORM...`, context);

      // Step 1: Get database configuration
      const dbConfig = await this.getDatabaseConfig(context);
      
      // Step 2: Execute Drizzle plugin
      const pluginResult = await this.executeDrizzlePlugin(context, dbConfig);
      
      // Step 3: Validate database setup
      await this.validateDatabaseSetup(context);

      await this.succeedSpinner(`✅ Database setup completed successfully`);

      return {
        success: true,
        data: {
          provider: dbConfig.provider,
          plugin: 'drizzle',
          artifacts: pluginResult.artifacts.length,
          dependencies: pluginResult.dependencies.length,
          scripts: pluginResult.scripts.length
        },
        artifacts: pluginResult.artifacts,
        warnings: pluginResult.warnings,
        duration: Date.now() - this.startTime
      };

    } catch (error) {
      await this.failSpinner(`❌ Database setup failed`);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult(
        'DATABASE_SETUP_FAILED',
        `Database setup failed: ${errorMessage}`,
        [],
        this.startTime,
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

    // Check if project directory exists
    if (!existsSync(context.projectPath)) {
      errors.push({
        field: 'projectPath',
        message: `Project directory does not exist: ${context.projectPath}`,
        code: 'PROJECT_NOT_FOUND',
        severity: 'error'
      });
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

    // Check for database configuration
    const dbConfig = context.config.database || {};
    if (!dbConfig.connectionString && !dbConfig.databaseUrl) {
      warnings.push('Database connection string not configured - you will need to set DATABASE_URL');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ============================================================================
  // PRIVATE METHODS - Plugin Orchestration
  // ============================================================================

  private async executeDrizzlePlugin(
    context: AgentContext, 
    dbConfig: DatabaseConfig
  ): Promise<any> {
    // Get the Drizzle plugin
    const drizzlePlugin = this.pluginSystem.getRegistry().get('drizzle');
    if (!drizzlePlugin) {
      throw new Error('Drizzle plugin not found in registry');
    }

    // Prepare plugin context
    const pluginContext: PluginContext = {
      ...context,
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

  private async validateDatabaseSetup(context: AgentContext): Promise<void> {
    const { projectPath } = context;
    
    context.logger.info('Validating database setup...');

    // Check for essential database files
    const essentialFiles = ['drizzle.config.ts', 'db/schema.ts', 'db/index.ts'];
    for (const file of essentialFiles) {
      const filePath = path.join(projectPath, file);
      if (!await fsExtra.pathExists(filePath)) {
        throw new Error(`Database file missing: ${file}`);
      }
    }

    // Check for package.json dependencies
    const packageJsonPath = path.join(projectPath, 'package.json');
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

  private getPluginConfig(dbConfig: DatabaseConfig): Record<string, any> {
    return {
      provider: dbConfig.provider,
      databaseUrl: dbConfig.connectionString,
      connectionString: dbConfig.connectionString,
      schema: './db/schema.ts',
      out: './drizzle',
      dialect: 'postgresql'
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
        const pluginContext: PluginContext = {
          ...context,
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
} 