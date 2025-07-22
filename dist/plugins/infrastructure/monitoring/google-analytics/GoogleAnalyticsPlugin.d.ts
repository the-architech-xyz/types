import { IPlugin, PluginMetadata, PluginContext, PluginResult, ValidationResult, ConfigSchema, CompatibilityMatrix, PluginRequirement } from '../../../../types/plugin.js';
export declare class GoogleAnalyticsPlugin implements IPlugin {
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
    private createProjectFiles;
    private createErrorResult;
}
