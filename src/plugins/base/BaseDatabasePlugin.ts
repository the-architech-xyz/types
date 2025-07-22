/**
 * Base Database Plugin Class
 * 
 * Provides common functionality for all database plugins:
 * - Database connection setup
 * - Schema generation
 * - Migration management
 * - Database-specific validation
 */

import { BasePlugin } from './BasePlugin.js';
import { PluginContext, PluginResult, ValidationResult } from '../../types/plugin.js';
import { DatabasePluginConfig, DatabaseProvider, ORMOption } from '../../types/plugin-interfaces.js';
import { ValidationError } from '../../types/agent.js';
import { NeonConfig, SupabaseConfig, MongoDBConfig } from '../../types/plugin-interfaces.js';

export abstract class BaseDatabasePlugin extends BasePlugin {
  
  // ============================================================================
  // DATABASE-SPECIFIC ABSTRACT METHODS
  // ============================================================================

  /**
   * Get available database providers for this plugin
   */
  abstract getDatabaseProviders(): DatabaseProvider[];

  /**
   * Get available ORM options for this plugin
   */
  abstract getORMOptions(): ORMOption[];

  /**
   * Get available database features for this plugin
   */
  abstract getDatabaseFeatures(): string[];

  /**
   * Get connection options for a specific provider
   */
  abstract getConnectionOptions(provider: DatabaseProvider): any[];

  /**
   * Get provider label for display
   */
  abstract getProviderLabel(provider: DatabaseProvider): string;

  /**
   * Get provider description
   */
  abstract getProviderDescription(provider: DatabaseProvider): string;

  /**
   * Get feature label for display
   */
  abstract getFeatureLabel(feature: string): string;

  /**
   * Get feature description
   */
  abstract getFeatureDescription(feature: string): string;

  // ============================================================================
  // DATABASE-SPECIFIC COMMON FUNCTIONALITY
  // ============================================================================

  /**
   * Setup database connection
   */
  protected async setupDatabaseConnection(config: DatabasePluginConfig): Promise<void> {
    try {
      const connectionConfig = this.generateConnectionConfig(config);
      const connectionPath = this.pathResolver.getLibPath('db', 'connection.ts');
      
      const connectionContent = this.generateConnectionFile(connectionConfig);
      await this.generateFile(connectionPath, connectionContent);
      
    } catch (error) {
      throw new Error(`Failed to setup database connection: ${error}`);
    }
  }

  /**
   * Generate database schema
   */
  protected async generateDatabaseSchema(config: DatabasePluginConfig): Promise<void> {
    try {
      const schemaPath = this.pathResolver.getSchemaPath();
      const schemaContent = this.generateSchemaFile(config);
      await this.generateFile(schemaPath, schemaContent);
      
    } catch (error) {
      throw new Error(`Failed to generate database schema: ${error}`);
    }
  }

  /**
   * Setup migrations
   */
  protected async setupMigrations(config: DatabasePluginConfig): Promise<void> {
    try {
      const migrationDir = this.pathResolver.getMigrationPath('');
      await this.ensureDirectory(migrationDir);
      
      // Create initial migration
      const initialMigration = this.generateInitialMigration(config);
      const migrationPath = this.pathResolver.getMigrationPath('0001_initial.ts');
      await this.generateFile(migrationPath, initialMigration);
      
    } catch (error) {
      throw new Error(`Failed to setup migrations: ${error}`);
    }
  }

  /**
   * Validate database configuration
   */
  protected validateDatabaseConfig(config: DatabasePluginConfig): ValidationResult {
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

    if (!config.connection) {
      errors.push({
        field: 'connection',
        message: 'Database connection configuration is required',
        code: 'MISSING_CONNECTION',
        severity: 'error'
      });
    }

    // Provider-specific validation
    if (config.provider) {
      const providerValidation = this.validateProviderConfig(config);
      errors.push(...providerValidation.errors);
      warnings.push(...providerValidation.warnings);
    }

    // ORM-specific validation
    if (config.orm) {
      const ormValidation = this.validateORMConfig(config);
      errors.push(...ormValidation.errors);
      warnings.push(...ormValidation.warnings);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Generate environment variables for database
   */
  protected generateDatabaseEnvVars(config: DatabasePluginConfig): Record<string, string> {
    const envVars: Record<string, string> = {};

    // Common database environment variables
    if ('connectionString' in config.connection) {
      envVars.DATABASE_URL = config.connection.connectionString || '';
    }
    
    if (config.provider === DatabaseProvider.NEON) {
      const neonConfig = config as NeonConfig;
      envVars.NEON_DATABASE_URL = neonConfig.connection.connectionString || '';
      if (neonConfig.connection.region) {
        envVars.NEON_REGION = neonConfig.connection.region;
      }
    }

    if (config.provider === DatabaseProvider.SUPABASE) {
      const supabaseConfig = config as SupabaseConfig;
      envVars.SUPABASE_URL = supabaseConfig.connection.projectUrl || '';
      envVars.SUPABASE_ANON_KEY = supabaseConfig.connection.anonKey || '';
      envVars.SUPABASE_SERVICE_ROLE_KEY = supabaseConfig.connection.serviceRoleKey || '';
    }

    if (config.provider === DatabaseProvider.MONGODB) {
      const mongoConfig = config as MongoDBConfig;
      envVars.MONGODB_URI = mongoConfig.connection.connectionString || '';
      envVars.MONGODB_DATABASE = mongoConfig.connection.databaseName || '';
    }

    return envVars;
  }

  /**
   * Add database scripts to package.json
   */
  protected async addDatabaseScripts(config: DatabasePluginConfig): Promise<void> {
    const scripts: Record<string, string> = {};

    // Add migration scripts
    scripts['db:migrate'] = 'drizzle-kit migrate';
    scripts['db:generate'] = 'drizzle-kit generate';
    scripts['db:studio'] = 'drizzle-kit studio';
    scripts['db:push'] = 'drizzle-kit push';

    // Add database-specific scripts
    if (config.provider === 'neon') {
      scripts['db:neon:deploy'] = 'drizzle-kit migrate:deploy';
    }

    if (config.provider === 'supabase') {
      scripts['db:supabase:push'] = 'drizzle-kit push:pg';
    }

    await this.addScripts(scripts);
  }

  // ============================================================================
  // HELPER METHODS - TO BE OVERRIDDEN BY SUBCLASSES
  // ============================================================================

  protected generateConnectionConfig(config: DatabasePluginConfig): any {
    // Default implementation - override in subclasses
    return {
      ...config
    };
  }

  protected generateConnectionFile(config: any): string {
    // Default implementation - override in subclasses
    return `// Database connection configuration
export const dbConfig = ${JSON.stringify(config, null, 2)};

export const createConnection = () => {
  // Implementation specific to each database plugin
  throw new Error('Connection creation not implemented');
};
`;
  }

  protected generateSchemaFile(config: DatabasePluginConfig): string {
    // Default implementation - override in subclasses
    return `// Database schema
// This file will be generated by the specific database plugin
export const schema = {
  // Schema definition
};
`;
  }

  protected generateInitialMigration(config: DatabasePluginConfig): string {
    // Default implementation - override in subclasses
    return `// Initial migration
// This file will be generated by the specific database plugin
export const up = async () => {
  // Migration up logic
};

export const down = async () => {
  // Migration down logic
};
`;
  }

  protected validateProviderConfig(config: DatabasePluginConfig): ValidationResult {
    // Default implementation - override in subclasses
    return {
      valid: true,
      errors: [],
      warnings: []
    };
  }

  protected validateORMConfig(config: DatabasePluginConfig): ValidationResult {
    // Default implementation - override in subclasses
    return {
      valid: true,
      errors: [],
      warnings: []
    };
  }

  // ============================================================================
  // COMMON DATABASE UTILITIES
  // ============================================================================

  protected isPostgresProvider(provider: DatabaseProvider): boolean {
    return [DatabaseProvider.NEON, DatabaseProvider.SUPABASE].includes(provider);
  }

  protected isMongoProvider(provider: DatabaseProvider): boolean {
    return [DatabaseProvider.MONGODB].includes(provider);
  }

  protected isSQLiteProvider(provider: DatabaseProvider): boolean {
    return [DatabaseProvider.LOCAL].includes(provider);
  }

  protected getDefaultPort(provider: DatabaseProvider): number {
    switch (provider) {
      case DatabaseProvider.NEON:
      case DatabaseProvider.SUPABASE:
        return 5432;
      case DatabaseProvider.MONGODB:
        return 27017;
      case DatabaseProvider.LOCAL:
        return 0; // No port for local/SQLite
      default:
        return 5432;
    }
  }

  protected getDefaultSSL(provider: DatabaseProvider): boolean {
    return [DatabaseProvider.NEON, DatabaseProvider.SUPABASE].includes(provider);
  }
} 