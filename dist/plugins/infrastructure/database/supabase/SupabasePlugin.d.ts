/**
 * Supabase Database Provider Plugin - Pure Technology Implementation
 *
 * Provides Supabase PostgreSQL database infrastructure setup.
 * Focuses only on database technology setup and artifact generation.
 * Authentication functionality is handled by separate auth plugins.
 * No user interaction or business logic - that's handled by agents.
 */
import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata, PluginCategory, IUIDatabasePlugin, UnifiedInterfaceTemplate } from '../../../../types/plugins.js';
import { ValidationResult } from '../../../../types/agents.js';
export declare class SupabasePlugin extends BasePlugin implements IUIDatabasePlugin {
    private generator;
    constructor();
    getMetadata(): PluginMetadata;
    getParameterSchema(): {
        category: PluginCategory;
        groups: {
            id: string;
            name: string;
            description: string;
            order: number;
            parameters: string[];
        }[];
        parameters: ({
            id: string;
            name: string;
            type: "string";
            description: string;
            required: boolean;
            group: string;
            default?: never;
        } | {
            id: string;
            name: string;
            type: "boolean";
            description: string;
            required: boolean;
            default: boolean;
            group: string;
        } | {
            id: string;
            name: string;
            type: "number";
            description: string;
            required: boolean;
            default: number;
            group: string;
        })[];
        dependencies: never[];
        validations: never[];
    };
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
    install(context: PluginContext): Promise<PluginResult>;
    getDependencies(): string[];
    getDevDependencies(): string[];
    getCompatibility(): any;
    getConflicts(): string[];
    getRequirements(): any[];
    getDefaultConfig(): Record<string, any>;
    getConfigSchema(): any;
}
