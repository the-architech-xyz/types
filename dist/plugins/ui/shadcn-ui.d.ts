/**
 * Shadcn/ui Plugin
 *
 * Handles the installation and setup of Shadcn/ui design system.
 * Pure technology implementer - no user interaction or decision making.
 */
import { IPlugin, PluginContext, PluginResult, PluginMetadata, ValidationResult, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../types/plugin.js';
export declare class ShadcnUIPlugin implements IPlugin {
    private templateService;
    private runner;
    constructor();
    getMetadata(): PluginMetadata;
    uninstall(context: PluginContext): Promise<PluginResult>;
    update(context: PluginContext): Promise<PluginResult>;
    install(context: PluginContext): Promise<PluginResult>;
    private updatePackageJson;
    private createTailwindConfig;
    private createUtilities;
    private createComponentStructure;
    private createCSSFiles;
    private installShadcnComponents;
    private createComponentsJson;
    private createComponentManually;
    private createPlaceholderComponent;
    private createIndex;
    validate(context: PluginContext): Promise<ValidationResult>;
    getCompatibility(): CompatibilityMatrix;
    getDependencies(): string[];
    getConflicts(): string[];
    getRequirements(): PluginRequirement[];
    getDefaultConfig(): Record<string, any>;
    getConfigSchema(): ConfigSchema;
}
