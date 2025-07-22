/**
 * Drizzle Plugin - Refactored with New Architecture
 * 
 * Uses the new base classes and separated concerns:
 * - DrizzleSchema: Parameter schema and configuration
 * - DrizzleGenerator: File generation logic
 * - DrizzlePlugin: Main plugin class (this file)
 */

import { BaseDatabasePlugin } from '../../../base/BaseDatabasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata, PluginCategory } from '../../../../types/plugin.js';
import { DatabasePluginConfig, DatabaseProvider, ORMOption, DatabaseFeature, ParameterSchema, UnifiedInterfaceTemplate } from '../../../../types/plugin-interfaces.js';
import { ValidationResult, ValidationError } from '../../../../types/agent.js';
import { DrizzleSchema } from './DrizzleSchema.js';
import { DrizzleGenerator } from './DrizzleGenerator.js';

export class DrizzlePlugin extends BaseDatabasePlugin {
  private generator!: DrizzleGenerator;

  constructor() {
    super();
    // Generator will be initialized in install method when pathResolver is available
  }

  // ============================================================================
  // PLUGIN METADATA
  // ============================================================================

  getMetadata(): PluginMetadata {
    return {
      id: 'drizzle',
      name: 'Drizzle ORM',
      version: '0.44.3',
      description: 'TypeScript ORM for SQL databases with excellent type safety',
      author: 'The Architech Team',
      category: PluginCategory.DATABASE,
      tags: ['orm', 'typescript', 'sql', 'database'],
      repository: 'https://github.com/drizzle-team/drizzle-orm',
      documentation: 'https://orm.drizzle.team/',
      license: 'MIT'
    };
  }

  // ============================================================================
  // ENHANCED PLUGIN INTERFACE IMPLEMENTATION
  // ============================================================================

  getParameterSchema(): ParameterSchema {
    return DrizzleSchema.getParameterSchema();
  }

  getDynamicQuestions(context: PluginContext): any[] {
    // For now, return a simplified set of questions
    // This will eventually use DynamicQuestionGenerator
    return [
      {
        id: 'provider',
        type: 'select',
        name: 'provider',
        message: 'Select database provider',
        choices: [
          { name: 'Neon (PostgreSQL)', value: DatabaseProvider.NEON },
          { name: 'Supabase', value: DatabaseProvider.SUPABASE },
          { name: 'MongoDB', value: DatabaseProvider.MONGODB },
          { name: 'PlanetScale', value: DatabaseProvider.PLANETSCALE },
          { name: 'Local SQLite', value: DatabaseProvider.LOCAL }
        ],
        default: DatabaseProvider.NEON
      },
      {
        id: 'connectionString',
        type: 'input',
        name: 'connectionString',
        message: 'Database connection string',
        when: (answers: any) => answers.provider !== DatabaseProvider.LOCAL
      },
      {
        id: 'features',
        type: 'checkbox',
        name: 'features',
        message: 'Select database features',
        choices: [
          { name: 'Migrations', value: DatabaseFeature.MIGRATIONS, checked: true },
          { name: 'Seeding', value: DatabaseFeature.SEEDING },
          { name: 'Backup', value: DatabaseFeature.BACKUP },
          { name: 'Connection Pooling', value: DatabaseFeature.CONNECTION_POOLING },
          { name: 'SSL', value: DatabaseFeature.SSL }
        ]
      }
    ];
  }

  validateConfiguration(config: Record<string, any>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!config.provider) {
      errors.push({
        field: 'provider',
        message: 'Database provider is required',
        code: 'MISSING_PROVIDER',
        severity: 'error'
      });
    }

    if (config.provider !== DatabaseProvider.LOCAL && !config.connectionString) {
      errors.push({
        field: 'connectionString',
        message: 'Connection string is required for remote databases',
        code: 'MISSING_CONNECTION_STRING',
        severity: 'error'
      });
    }

    // Provider-specific validation
    if (config.provider === DatabaseProvider.NEON && !config.connectionString?.includes('neon.tech')) {
      warnings.push('Connection string should be from Neon (neon.tech)');
    }

    if (config.provider === DatabaseProvider.SUPABASE && !config.connectionString?.includes('supabase.co')) {
      warnings.push('Connection string should be from Supabase (supabase.co)');
    }

    if (config.provider === DatabaseProvider.MONGODB && config.ormType !== ORMOption.MONGOOSE) {
      warnings.push('MongoDB works best with Mongoose ORM');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate {
    return {
      category: PluginCategory.DATABASE,
      exports: [
        {
          name: 'connect',
          type: 'function',
          implementation: 'export const connect = () => db;',
          documentation: 'Connect to the database',
          parameters: [],
          returnType: 'Database',
          examples: ['const db = connect();']
        },
        {
          name: 'query',
          type: 'function',
          implementation: 'export const query = (sql: string, params?: any[]) => db.execute(sql, params);',
          documentation: 'Execute a raw SQL query',
          parameters: [
            { id: 'sql', name: 'sql', type: 'string', description: 'SQL query string', required: true },
            { id: 'params', name: 'params', type: 'array', description: 'Query parameters', required: false }
          ],
          returnType: 'Promise<any>',
          examples: ['const result = await query("SELECT * FROM users WHERE id = ?", [1]);']
        },
        {
          name: 'DatabaseClient',
          type: 'class',
          implementation: 'export class DatabaseClient { /* implementation */ }',
          documentation: 'Type-safe database client for common operations',
          parameters: [],
          returnType: 'DatabaseClient',
          examples: ['const client = new DatabaseClient(db);']
        }
      ],
      types: [
        {
          name: 'DatabaseConfig',
          type: 'interface',
          definition: 'interface DatabaseConfig { provider: string; connection: any; features: any; orm?: any; }',
          documentation: 'Database configuration interface',
          properties: [
            { name: 'provider', type: 'string', required: true, description: 'Database provider' },
            { name: 'connection', type: 'any', required: true, description: 'Connection configuration' },
            { name: 'features', type: 'any', required: true, description: 'Database features' },
            { name: 'orm', type: 'any', required: false, description: 'ORM configuration' }
          ]
        }
      ],
      utilities: [
        {
          name: 'createConnection',
          type: 'function',
          implementation: 'export const createConnection = () => db;',
          documentation: 'Create a new database connection',
          parameters: [],
          returnType: 'Database',
          examples: ['const connection = createConnection();']
        }
      ],
      constants: [
        {
          name: 'DEFAULT_TIMEOUT',
          value: 30000,
          documentation: 'Default database connection timeout (30 seconds)',
          type: 'number'
        }
      ],
      documentation: 'Database module providing unified interface for database operations'
    };
  }

  // ============================================================================
  // DATABASE-SPECIFIC ABSTRACT METHODS IMPLEMENTATION
  // ============================================================================

  getDatabaseProviders(): DatabaseProvider[] {
    return DrizzleSchema.getDatabaseProviders();
  }

  getORMOptions(): ORMOption[] {
    return DrizzleSchema.getORMOptions();
  }

  getDatabaseFeatures(): string[] {
    return DrizzleSchema.getDatabaseFeatures();
  }

  getConnectionOptions(provider: DatabaseProvider): any[] {
    switch (provider) {
      case DatabaseProvider.NEON:
        return [
          { name: 'connectionString', type: 'string', required: true, description: 'Neon connection string' },
          { name: 'region', type: 'string', required: false, description: 'Neon region' }
        ];
      case DatabaseProvider.SUPABASE:
        return [
          { name: 'projectUrl', type: 'string', required: true, description: 'Supabase project URL' },
          { name: 'apiKey', type: 'string', required: true, description: 'Supabase API key' },
          { name: 'anonKey', type: 'string', required: false, description: 'Supabase anonymous key' }
        ];
      case DatabaseProvider.MONGODB:
        return [
          { name: 'connectionString', type: 'string', required: true, description: 'MongoDB connection string' },
          { name: 'databaseName', type: 'string', required: true, description: 'MongoDB database name' }
        ];
      default:
        return [
          { name: 'connectionString', type: 'string', required: true, description: 'Database connection string' }
        ];
    }
  }

  getProviderLabel(provider: DatabaseProvider): string {
    return DrizzleSchema.getProviderLabel(provider);
  }

  getProviderDescription(provider: DatabaseProvider): string {
    return DrizzleSchema.getProviderDescription(provider);
  }

  getFeatureLabel(feature: string): string {
    return DrizzleSchema.getFeatureLabel(feature as DatabaseFeature);
  }

  getFeatureDescription(feature: string): string {
    return DrizzleSchema.getFeatureDescription(feature as DatabaseFeature);
  }

  // ============================================================================
  // MAIN INSTALLATION LOGIC
  // ============================================================================

  async install(context: PluginContext): Promise<PluginResult> {
    const startTime = Date.now();
    const config = context.pluginConfig as DatabasePluginConfig;

    try {
      // Initialize path resolver first
      this.initializePathResolver(context);

      // 1. Generate all file contents
      const allFiles = this.generator.generateAllFiles(config);
      
      // 2. Use BasePlugin to write files
      for (const file of allFiles) {
        // Correctly determine if it's a root config or a lib file
        const isRootConfig = file.path === 'drizzle.config.ts';
        const filePath = isRootConfig
          ? this.pathResolver.getConfigPath(file.path)
          : this.pathResolver.getLibPath('db', file.path.replace('db/', ''));
        await this.generateFile(filePath, file.content);
      }

      // 3. Add dependencies
      await this.installDependencies(
        ['drizzle-orm', 'postgres'],
        ['drizzle-kit', 'dotenv']
      );

      // 4. Add scripts
      const scripts = this.generator.generateScripts(config);
      await this.addScripts(scripts);

      // 5. Add environment variables
      const envVars = this.generator.generateEnvVars(config);
      // await this.addEnvVariables(envVars); // Assuming a method exists in BasePlugin

      return this.createSuccessResult([], [], Object.entries(scripts).map(([name, command]) => ({ name, command })), [], [], startTime);

    } catch (error: any) {
      return this.createErrorResult('Drizzle installation failed', [error], startTime);
    }
  }

  // ============================================================================
  // DEPENDENCIES AND CONFIGURATION
  // ============================================================================

  getDependencies(): string[] {
    return [
      'drizzle-orm',
      '@neondatabase/serverless',
      'postgres'
    ];
  }

  getDevDependencies(): string[] {
    return [
      'drizzle-kit',
      '@types/pg'
    ];
  }

  getCompatibility(): any {
    return {
      frameworks: ['nextjs', 'react', 'vue', 'svelte'],
      platforms: ['node', 'browser'],
      nodeVersions: ['>=16.0.0'],
      packageManagers: ['npm', 'yarn', 'pnpm'],
      conflicts: ['prisma', 'typeorm']
    };
  }

  getConflicts(): string[] {
    return ['prisma', 'typeorm'];
  }

  getRequirements(): any[] {
    return [
      { type: 'database', name: 'PostgreSQL, MySQL, SQLite, or MongoDB' },
      { type: 'node', version: '>=16.0.0' }
    ];
  }

  getDefaultConfig(): Record<string, any> {
    return {
      provider: DatabaseProvider.NEON,
      features: {
        migrations: true,
        seeding: false,
        backup: false,
        connectionPooling: false,
        ssl: true
      },
      orm: {
        type: ORMOption.DRIZZLE
      }
    };
  }

  getConfigSchema(): any {
    return {
      type: 'object',
      properties: {
        provider: { type: 'string', enum: Object.values(DatabaseProvider) },
        connection: { type: 'object' },
        features: { type: 'object' },
        orm: { type: 'object' }
      },
      required: ['provider', 'connection']
    };
  }
} 