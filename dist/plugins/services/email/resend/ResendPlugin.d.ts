/**
 * Resend Email Plugin - Pure Technology Implementation
 *
 * Provides Resend email API integration for modern email delivery.
 * Resend is a developer-first email API with excellent TypeScript support,
 * webhooks, and analytics. Focuses only on email technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata, PluginCategory, IUIEmailPlugin, UnifiedInterfaceTemplate } from '../../../../types/plugins.js';
import { ValidationResult } from '../../../../types/agents.js';
export declare class ResendPlugin extends BasePlugin implements IUIEmailPlugin {
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
            type: "number";
            description: string;
            required: boolean;
            default: number;
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
    getEmailServices(): string[];
    getEmailFeatures(): string[];
    getTemplateOptions(): string[];
    install(context: PluginContext): Promise<PluginResult>;
    getDependencies(): string[];
    getDevDependencies(): string[];
    getCompatibility(): any;
    getConflicts(): string[];
    getRequirements(): any[];
    getDefaultConfig(): Record<string, any>;
    getConfigSchema(): any;
    private isValidEmail;
}
