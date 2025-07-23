/**
 * MongoDB Database Provider Plugin - Updated with Latest Best Practices
 *
 * Provides MongoDB database infrastructure setup.
 * Follows latest MongoDB documentation and TypeScript best practices.
 *
 * References:
 * - https://docs.mongodb.com/drivers/node/current/
 * - https://docs.mongodb.com/manual/
 * - https://docs.mongodb.com/atlas/
 * - https://docs.mongodb.com/manual/replication/
 */
import { IPlugin, PluginMetadata, ValidationResult, PluginContext, PluginResult, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../../../types/plugins.js';
export declare class MongoDBPlugin implements IPlugin {
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
    private initializeMongoDBConfig;
    private createDatabaseFiles;
    private generateUnifiedInterfaceFiles;
    private setupMonitoring;
    private createErrorResult;
}
