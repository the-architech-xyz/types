/**
 * Mongoose ORM Plugin - Pure Technology Implementation
 *
 * Provides Mongoose ODM integration with MongoDB database providers.
 * Focuses only on ORM technology setup and artifact generation.
 * Database provider setup is handled by separate database plugins.
 * No user interaction or business logic - that's handled by agents.
 */
import { IPlugin, PluginMetadata, ValidationResult, PluginContext, PluginResult, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../../types/plugin.js';
export declare class MongoosePlugin implements IPlugin {
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
    private initializeMongooseConfig;
    private createDatabaseFiles;
    private generateUnifiedInterfaceFiles;
    private generateMongooseConnection;
    private generateUserModel;
    private generateDatabaseClient;
    private generateSchemaTypes;
    private generateUnifiedIndex;
    private generateEnvConfig;
    private createErrorResult;
}
