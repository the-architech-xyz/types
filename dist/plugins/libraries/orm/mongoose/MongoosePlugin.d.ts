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
import { BaseDatabasePlugin } from '../../../base/index.js';
import { PluginContext, PluginResult, PluginMetadata } from '../../../../types/plugin.js';
import { DatabaseProvider, ORMOption, DatabaseFeature, ParameterSchema, UnifiedInterfaceTemplate, ConnectionOption } from '../../../../types/plugin-interfaces.js';
export declare class MongoosePlugin extends BaseDatabasePlugin {
    private generator;
    constructor();
    getMetadata(): PluginMetadata;
    getParameterSchema(): ParameterSchema;
    getDatabaseProviders(): DatabaseProvider[];
    getORMOptions(): ORMOption[];
    getDatabaseFeatures(): DatabaseFeature[];
    getConnectionOptions(provider: DatabaseProvider): ConnectionOption[];
    getProviderLabel(provider: DatabaseProvider): string;
    getProviderDescription(provider: DatabaseProvider): string;
    getFeatureLabel(feature: DatabaseFeature): string;
    getFeatureDescription(feature: DatabaseFeature): string;
    generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate;
    install(context: PluginContext): Promise<PluginResult>;
}
