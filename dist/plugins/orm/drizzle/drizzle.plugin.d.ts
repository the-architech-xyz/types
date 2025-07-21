/**
 * Drizzle ORM Plugin - Pure ORM Implementation
 *
 * Provides Drizzle ORM integration that can work with any database provider.
 * Focuses only on ORM functionality and schema management.
 * Database connection is handled by separate database provider plugins.
 */
import { IPlugin, PluginMetadata, ValidationResult, PluginContext, PluginResult, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../../types/plugin.js';
export declare class DrizzlePlugin implements IPlugin {
    private templateService;
    private runner;
    constructor();
    getMetadata(): PluginMetadata;
    install(context: PluginContext): Promise<PluginResult>;
    uninstall(context: PluginContext): Promise<PluginResult>;
    update(context: PluginContext): Promise<PluginResult>;
    validate(context: PluginContext): Promise<ValidationResult>;
    getCompatibility(): CompatibilityMatrix;
    getDependencies(): string[];
    getConflicts(): string[];
    getRequirements(): PluginRequirement[];
    getDefaultConfig(): Record<string, any>;
    getConfigSchema(): ConfigSchema;
    private installDependencies;
    private initializeDrizzleKit;
    private createORMFiles;
    private generateUnifiedInterfaceFiles;
    private generateDrizzleConfig;
    private generateDatabaseSchema;
    private generateORMConnection;
    private generateMigrationUtils;
    private generateUnifiedIndex;
    private createErrorResult;
}
