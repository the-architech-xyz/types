/**
 * Stripe Payment Plugin - Pure Technology Implementation
 *
 * Provides Stripe payment processing and subscription management setup.
 * Focuses only on payment technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata, PluginCategory, IUIPaymentPlugin, UnifiedInterfaceTemplate } from '../../../../types/plugins.js';
import { ValidationResult } from '../../../../types/agents.js';
export declare class StripePlugin extends BasePlugin implements IUIPaymentPlugin {
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
        })[];
        dependencies: never[];
        validations: never[];
    };
    validateConfiguration(config: Record<string, any>): ValidationResult;
    generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate;
    getPaymentProviders(): string[];
    getPaymentFeatures(): string[];
    getCurrencyOptions(): string[];
    install(context: PluginContext): Promise<PluginResult>;
    getDependencies(): string[];
    getDevDependencies(): string[];
    getCompatibility(): any;
    getConflicts(): string[];
    getRequirements(): any[];
    getDefaultConfig(): Record<string, any>;
    getConfigSchema(): any;
}
