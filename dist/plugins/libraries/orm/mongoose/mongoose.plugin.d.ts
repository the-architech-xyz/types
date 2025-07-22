/**
 * Mongoose ORM Plugin - Updated with Latest Best Practices
 *
 * Provides Mongoose ODM integration with MongoDB database providers.
 * Follows latest Mongoose documentation and TypeScript best practices.
 *
 * References:
 * - https://mongoosejs.com/docs/typescript.html
 * - https://mongoosejs.com/docs/plugins.html
 * - https://mongoosejs.com/docs/schematypes.html
 * - https://mongoosejs.com/docs/middleware.html
 */
import { IPlugin, PluginMetadata, ValidationResult, PluginContext, PluginResult, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../../../types/plugin.js';
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
    private createPluginsAndMiddleware;
    private createErrorResult;
}
