/**
 * Drizzle ORM Plugin - Pure Technology Implementation
 *
 * Provides Drizzle ORM integration with Neon PostgreSQL using the official drizzle-kit CLI.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { IPlugin, PluginMetadata, ValidationResult, PluginContext, PluginResult, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../types/plugin.js';
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
    private createDatabaseFiles;
    private generateInitialMigration;
    private generateUnifiedInterfaceFiles;
    private generateDrizzleConfig;
    private generateDatabaseSchema;
    private generateDatabaseConnection;
    private generateMigrationUtils;
    private generateUnifiedIndex;
    private generateEnvConfig;
    private createErrorResult;
}
