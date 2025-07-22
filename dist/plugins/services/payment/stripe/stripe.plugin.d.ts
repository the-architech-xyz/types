/**
 * Stripe Payment Plugin - Pure Technology Implementation
 *
 * Provides Stripe payment processing and subscription management setup.
 * Focuses only on payment technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { IPlugin, PluginMetadata, ValidationResult, PluginContext, PluginResult, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../../../types/plugin.js';
export declare class StripePlugin implements IPlugin {
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
    private initializeStripeConfig;
    private createPaymentFiles;
    private generateUnifiedInterfaceFiles;
    private generateStripeClient;
    private generateWebhookRoute;
    private generatePaymentIntentRoute;
    private generatePaymentUtilities;
    private generateUnifiedIndex;
    private generateEnvConfig;
    private createErrorResult;
}
