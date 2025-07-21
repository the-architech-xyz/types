/**
 * Chakra UI Plugin - Pure Technology Implementation
 *
 * Provides Chakra UI component library integration using the latest v3.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { IPlugin, PluginMetadata, ValidationResult, PluginContext, PluginResult, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../types/plugin.js';
export declare class ChakraUIPlugin implements IPlugin {
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
    private createChakraConfig;
    private createUIComponents;
    private createButtonComponent;
    private createCardComponent;
    private createInputComponent;
    private createFormComponent;
    private createModalComponent;
    private createPackageExports;
    private generateUnifiedInterfaceFiles;
    private getChakraConfigContent;
    private createErrorResult;
}
