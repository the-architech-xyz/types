import { IPlugin, PluginContext, PluginResult, PluginMetadata, ValidationResult, CompatibilityMatrix, PluginRequirement, ConfigSchema } from '../../../../types/plugin.js';
export declare class RailwayPlugin implements IPlugin {
    private logger;
    private commandRunner;
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
}
