/**
 * SendGrid Plugin - Pure Technology Implementation
 *
 * Provides SendGrid email API integration for enterprise-grade email delivery.
 * SendGrid is a leading email delivery service with advanced features like
 * email validation, analytics, and marketing campaigns. Focuses only on technology
 * setup and artifact generation. No user interaction or business logic - that's handled by agents.
 */
import { IPlugin, PluginMetadata, ValidationResult, PluginContext, PluginResult, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../types/plugin.js';
export declare class SendGridPlugin implements IPlugin {
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
    private createEmailConfiguration;
    private createEmailTemplates;
    private createAPIRoutes;
    private createEmailUtilities;
    private generateUnifiedInterfaceFiles;
    private generateEmailClient;
    private generateEmailConfig;
    private generateEmailTypes;
    private generateWelcomeTemplate;
    private generateVerificationTemplate;
    private generateResetPasswordTemplate;
    private generateEmailTemplates;
    private generateWebhookRoute;
    private generateEmailService;
    private generateUnifiedIndex;
    private createErrorResult;
}
