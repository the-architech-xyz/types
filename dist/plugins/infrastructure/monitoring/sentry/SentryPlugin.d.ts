/**
 * Sentry Monitoring Plugin - Pure Technology Implementation
 *
 * Provides Sentry error tracking and performance monitoring setup.
 * Focuses only on monitoring technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata, PluginCategory, IUIMonitoringPlugin, UnifiedInterfaceTemplate } from '../../../../types/plugins.js';
import { ValidationResult } from '../../../../types/agents.js';
export declare class SentryPlugin extends BasePlugin implements IUIMonitoringPlugin {
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
            type: "string";
            description: string;
            required: boolean;
            default: string;
            group: string;
        } | {
            id: string;
            name: string;
            type: "number";
            description: string;
            required: boolean;
            default: number;
            group: string;
        } | {
            id: string;
            name: string;
            type: "boolean";
            description: string;
            required: boolean;
            default: boolean;
            group: string;
        })[];
        dependencies: never[];
        validations: never[];
    };
    validateConfiguration(config: Record<string, any>): ValidationResult;
    generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate;
    getMonitoringServices(): string[];
    getAnalyticsOptions(): string[];
    getAlertOptions(): string[];
    install(context: PluginContext): Promise<PluginResult>;
    getDependencies(): string[];
    getDevDependencies(): string[];
    getCompatibility(): any;
    getConflicts(): string[];
    getRequirements(): any[];
    getDefaultConfig(): Record<string, any>;
    getConfigSchema(): any;
}
