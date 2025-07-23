/**
 * Railway Deployment Plugin - Pure Technology Implementation
 *
 * Provides Railway deployment infrastructure setup.
 * Focuses only on deployment technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata, PluginCategory, IUIDeploymentPlugin, UnifiedInterfaceTemplate } from '../../../../types/plugins.js';
import { ValidationResult } from '../../../../types/agents.js';
export declare class RailwayPlugin extends BasePlugin implements IUIDeploymentPlugin {
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
            options?: never;
        } | {
            id: string;
            name: string;
            type: "string";
            description: string;
            required: boolean;
            default: string;
            group: string;
            options?: never;
        } | {
            id: string;
            name: string;
            type: "boolean";
            description: string;
            required: boolean;
            default: boolean;
            group: string;
            options?: never;
        } | {
            id: string;
            name: string;
            type: "select";
            description: string;
            required: boolean;
            default: string;
            options: {
                value: string;
                label: string;
            }[];
            group: string;
        } | {
            id: string;
            name: string;
            type: "array";
            description: string;
            required: boolean;
            default: string[];
            group: string;
            options?: never;
        } | {
            id: string;
            name: string;
            type: "number";
            description: string;
            required: boolean;
            default: number;
            group: string;
            options?: never;
        })[];
        dependencies: never[];
        validations: never[];
    };
    validateConfiguration(config: Record<string, any>): ValidationResult;
    generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate;
    getDeploymentPlatforms(): string[];
    getEnvironmentOptions(): string[];
    getInfrastructureOptions(): string[];
    install(context: PluginContext): Promise<PluginResult>;
    getDependencies(): string[];
    getDevDependencies(): string[];
    getCompatibility(): any;
    getConflicts(): string[];
    getRequirements(): any[];
    getDefaultConfig(): Record<string, any>;
    getConfigSchema(): any;
    private installRailwayCLI;
}
