/**
 * MongoDB Database Provider Plugin - Pure Technology Implementation
 *
 * Provides MongoDB database infrastructure setup.
 * Focuses only on database technology setup and artifact generation.
 * ORM functionality is handled by separate plugins (Mongoose, Prisma MongoDB).
 * No user interaction or business logic - that's handled by agents.
 */
import { IPlugin, PluginMetadata, ValidationResult, PluginContext, PluginResult, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../../types/plugin.js';
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
    private generateMongoDBClient;
    private generateTypes;
    private generateDatabaseClient;
    private generateUnifiedIndex;
    private generateEnvConfig;
    private createErrorResult;
}
