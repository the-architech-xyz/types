/**
 * Shadcn/ui Plugin - Pure Technology Implementation
 *
 * Provides Shadcn/ui design system integration with Tailwind CSS.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { IPlugin, PluginMetadata, PluginContext, PluginResult, CompatibilityMatrix, ValidationResult, PluginRequirement, ConfigSchema } from '../../types/plugin.js';
export declare class ShadcnUIPlugin implements IPlugin {
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
    private getRadixDependencies;
    private generateTailwindConfig;
    private generatePostCSSConfig;
    private generateGlobalCSS;
    private generateComponentsConfig;
    private generateUtils;
    private generateComponentStructure;
    private generateComponentFile;
    private generatePackageJsonUpdates;
    private createErrorResult;
}
