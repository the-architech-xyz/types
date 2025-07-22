/**
 * Shadcn/ui Plugin - Updated with Latest Best Practices
 *
 * Provides Shadcn/ui design system integration using the official shadcn CLI.
 * Follows latest Shadcn/ui documentation and TypeScript best practices.
 *
 * References:
 * - https://ui.shadcn.com/docs/installation
 * - https://ui.shadcn.com/docs/components
 * - https://ui.shadcn.com/docs/themes
 */
import { IPlugin, PluginMetadata, ValidationResult, PluginContext, PluginResult, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../../../types/plugin.js';
export declare class ShadcnUIPlugin implements IPlugin {
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
    private createTailwindConfig;
    private initializeShadcn;
    private createUIComponents;
    private createPackageExports;
    private generateUnifiedInterfaceFiles;
    private createErrorResult;
}
