/**
 * Drizzle Plugin - Refactored with New Architecture
 *
 * Uses the new base classes and separated concerns:
 * - DrizzleSchema: Parameter schema and configuration
 * - DrizzleGenerator: File generation logic
 * - DrizzlePlugin: Main plugin class (this file)
 */
import { BaseDatabasePlugin } from '../../../base/BaseDatabasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata } from '../../../../types/plugins.js';
import { DatabaseProvider, ORMOption, ParameterSchema, UnifiedInterfaceTemplate } from '../../../../types/plugin-interfaces.js';
import { ValidationResult } from '../../../../types/agents.js';
export declare class DrizzlePlugin extends BaseDatabasePlugin {
    private generator;
    constructor();
    getMetadata(): PluginMetadata;
    getParameterSchema(): ParameterSchema;
    getDynamicQuestions(context: PluginContext): any[];
    validateConfiguration(config: Record<string, any>): ValidationResult;
    generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate;
    getDatabaseProviders(): DatabaseProvider[];
    getORMOptions(): ORMOption[];
    getDatabaseFeatures(): string[];
    getConnectionOptions(provider: DatabaseProvider): any[];
    getProviderLabel(provider: DatabaseProvider): string;
    getProviderDescription(provider: DatabaseProvider): string;
    getFeatureLabel(feature: string): string;
    getFeatureDescription(feature: string): string;
    install(context: PluginContext): Promise<PluginResult>;
    getDependencies(): string[];
    getDevDependencies(): string[];
    getCompatibility(): any;
    getConflicts(): string[];
    getRequirements(): any[];
    getDefaultConfig(): Record<string, any>;
    getConfigSchema(): any;
}
