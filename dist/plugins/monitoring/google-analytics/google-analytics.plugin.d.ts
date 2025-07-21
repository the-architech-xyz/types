import { IPlugin, PluginMetadata, PluginContext, PluginResult, ValidationResult, ConfigSchema, CompatibilityMatrix, PluginRequirement } from '../../../types/plugin.js';
export declare class GoogleAnalyticsPlugin implements IPlugin {
    private logger;
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
    private generateFiles;
    private generateAnalyticsConfig;
    private generateAnalyticsProvider;
    private generateAnalyticsUtils;
    private generateNextConfig;
    private generateEnvironmentVariables;
}
