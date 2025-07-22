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
import { ValidationResult } from '../../types/plugin.js';
import { DatabasePluginConfig, DatabaseProvider, ORMOption } from '../../types/plugin-interfaces.js';
export declare abstract class BaseDatabasePlugin extends BasePlugin {
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
    /**
     * Setup database connection
     */
    protected setupDatabaseConnection(config: DatabasePluginConfig): Promise<void>;
    /**
     * Generate database schema
     */
    protected generateDatabaseSchema(config: DatabasePluginConfig): Promise<void>;
    /**
     * Setup migrations
     */
    protected setupMigrations(config: DatabasePluginConfig): Promise<void>;
    /**
     * Validate database configuration
     */
    protected validateDatabaseConfig(config: DatabasePluginConfig): ValidationResult;
    /**
     * Generate environment variables for database
     */
    protected generateDatabaseEnvVars(config: DatabasePluginConfig): Record<string, string>;
    /**
     * Add database scripts to package.json
     */
    protected addDatabaseScripts(config: DatabasePluginConfig): Promise<void>;
    protected generateConnectionConfig(config: DatabasePluginConfig): any;
    protected generateConnectionFile(config: any): string;
    protected generateSchemaFile(config: DatabasePluginConfig): string;
    protected generateInitialMigration(config: DatabasePluginConfig): string;
    protected validateProviderConfig(config: DatabasePluginConfig): ValidationResult;
    protected validateORMConfig(config: DatabasePluginConfig): ValidationResult;
    protected isPostgresProvider(provider: DatabaseProvider): boolean;
    protected isMongoProvider(provider: DatabaseProvider): boolean;
    protected isSQLiteProvider(provider: DatabaseProvider): boolean;
    protected getDefaultPort(provider: DatabaseProvider): number;
    protected getDefaultSSL(provider: DatabaseProvider): boolean;
}
