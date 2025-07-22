/**
 * Sentry Monitoring Plugin - Pure Technology Implementation
 *
 * Provides Sentry error tracking and performance monitoring setup.
 * Focuses only on monitoring technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { IPlugin, PluginMetadata, ValidationResult, PluginContext, PluginResult, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../../../types/plugin.js';
export declare class SentryPlugin implements IPlugin {
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
    private initializeSentryConfig;
    private createMonitoringFiles;
    private generateUnifiedInterfaceFiles;
    private generateSentryClientConfig;
    private generateSentryServerConfig;
    private generateSentryMonitoring;
    private generateMonitoringUtilities;
    private generateUnifiedIndex;
    private generateEnvConfig;
    private generateSentryProperties;
    private createErrorResult;
}
