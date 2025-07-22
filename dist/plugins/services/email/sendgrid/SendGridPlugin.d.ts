/**
 * SendGrid Plugin - Pure Technology Implementation
 */
import { IPlugin, PluginMetadata, PluginContext, PluginResult, ValidationResult, ConfigSchema, PluginRequirement, CompatibilityMatrix } from '../../../../types/plugin.js';
export declare class SendGridPlugin implements IPlugin {
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
    private createEmailFiles;
    private createErrorResult;
}
