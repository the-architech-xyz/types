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
import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata, IUIDatabasePlugin, UnifiedInterfaceTemplate, ValidationResult } from '../../../../types/plugins.js';
export declare class MongoosePlugin extends BasePlugin implements IUIDatabasePlugin {
    private generator;
    constructor();
    getMetadata(): PluginMetadata;
    install(context: PluginContext): Promise<PluginResult>;
    uninstall(context: PluginContext): Promise<PluginResult>;
    update(context: PluginContext): Promise<PluginResult>;
    validate(context: PluginContext): Promise<ValidationResult>;
    getCompatibility(): any;
    getDependencies(): string[];
    getConflicts(): string[];
    getRequirements(): any[];
    getDefaultConfig(): Record<string, any>;
    getConfigSchema(): any;
    getParameterSchema(): any;
    validateConfiguration(config: Record<string, any>): ValidationResult;
    generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate;
    getDatabaseProviders(): string[];
    getORMOptions(): string[];
    getDatabaseFeatures(): string[];
    getConnectionOptions(): string[];
    getProviderLabel(provider: string): string;
    getProviderDescription(provider: string): string;
    getFeatureLabel(feature: string): string;
    getFeatureDescription(feature: string): string;
    private installMongooseDependencies;
    private initializeMongooseConfig;
    private createDatabaseFiles;
    private generateUnifiedInterfaceFiles;
    private createPluginsAndMiddleware;
}
