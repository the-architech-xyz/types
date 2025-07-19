/**
 * Next.js Framework Plugin
 *
 * Provides Next.js framework setup and configuration.
 * Handles project structure, routing, and Next.js-specific features.
 */
import { IPlugin, PluginMetadata, PluginContext, PluginResult, CompatibilityMatrix, ValidationResult, PluginRequirement, ConfigSchema } from '../../types/plugin.js';
export declare class NextJSPlugin implements IPlugin {
    private templateService;
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
    private createProjectStructure;
    private generateNextConfig;
    private generateTsConfig;
    private generateEslintConfig;
    private generateProjectStructure;
    private createErrorResult;
}
