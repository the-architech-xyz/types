/**
 * Neon Database Provider Plugin - Pure Infrastructure Implementation
 *
 * Provides Neon PostgreSQL database infrastructure setup.
 * Focuses only on database connection and configuration.
 * ORM functionality is handled by separate ORM plugins.
 */
import { IPlugin, PluginMetadata, ValidationResult, PluginContext, PluginResult, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../../types/plugin.js';
export declare class NeonPlugin implements IPlugin {
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
    private installNeonCLI;
    private createDatabaseConfig;
    private addEnvironmentConfig;
    private generateUnifiedInterfaceFiles;
    private generateNeonConfig;
    private generateNeonConnection;
    private generateEnvConfig;
    private createErrorResult;
}
