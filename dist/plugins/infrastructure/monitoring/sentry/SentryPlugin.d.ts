/**
 * Sentry Monitoring Plugin - Pure Technology Implementation
 *
 * Provides Sentry error tracking and performance monitoring setup.
 * Focuses only on monitoring technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { IPlugin, PluginMetadata, PluginContext, PluginResult, ValidationResult, ConfigSchema, CompatibilityMatrix, PluginRequirement } from '../../../../types/plugin.js';
export declare class SentryPlugin implements IPlugin {
    private runner;
    constructor();
    getMetadata(): PluginMetadata;
    validate(context: PluginContext): Promise<ValidationResult>;
    install(context: PluginContext): Promise<PluginResult>;
    uninstall(context: PluginContext): Promise<PluginResult>;
    update(context: PluginContext): Promise<PluginResult>;
    getCompatibility(): CompatibilityMatrix;
    getDependencies(): string[];
    getConflicts(): string[];
    getRequirements(): PluginRequirement[];
    getDefaultConfig(): Record<string, any>;
    getConfigSchema(): ConfigSchema;
    private installDependencies;
    private createProjectFiles;
    private createErrorResult;
}
