/**
 * Shadcn/ui Plugin - Pure Technology Implementation
 *
 * Provides Shadcn/ui design system integration using the official shadcn CLI.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { IPlugin, PluginMetadata, ValidationResult, PluginContext, PluginResult, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../types/plugin.js';
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
    private updatePackageJson;
    private createTailwindConfig;
    private createUIComponents;
    private createButtonComponent;
    private createCardComponent;
    private createInputComponent;
    private createLabelComponent;
    private createFormComponent;
    private createDialogComponent;
    private createPackageExports;
    private initializeShadcn;
    private createFrameworkDetectionFiles;
    private createComponentsConfig;
    private setupTailwindCSS;
    private addComponents;
    private customizeConfiguration;
    private buildInitArgs;
    private addCustomConfigurations;
    private createErrorResult;
}
