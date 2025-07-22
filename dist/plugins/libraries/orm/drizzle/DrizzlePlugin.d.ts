/**
 * Drizzle Plugin - Refactored with New Architecture
 *
 * Uses the new base classes and separated concerns:
 * - DrizzleSchema: Parameter schema and configuration
 * - DrizzleGenerator: File generation logic
 * - DrizzlePlugin: Main plugin class (this file)
 */
import { BaseDatabasePlugin } from '../../../base/index.js';
import { PluginContext, PluginResult, PluginMetadata } from '../../../../types/plugin.js';
import { DatabaseProvider, ORMOption, DatabaseFeature, ParameterSchema, UnifiedInterfaceTemplate } from '../../../../types/plugin-interfaces.js';
export declare class DrizzlePlugin extends BaseDatabasePlugin {
    private generator;
    constructor();
    getMetadata(): PluginMetadata;
    getParameterSchema(): ParameterSchema;
    getDatabaseProviders(): DatabaseProvider[];
    getORMOptions(): ORMOption[];
    getDatabaseFeatures(): DatabaseFeature[];
    getProviderLabel(provider: DatabaseProvider): string;
    getFeatureLabel(feature: DatabaseFeature): string;
    getConnectionOptions(provider: DatabaseProvider): any[];
    getProviderDescription(provider: DatabaseProvider): string;
    getFeatureDescription(feature: DatabaseFeature): string;
    generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate;
    install(context: PluginContext): Promise<PluginResult>;
}
