/**
 * Tamagui Plugin - Cross-Platform UI Framework
 *
 * Provides Tamagui integration using the official @tamagui/cli.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { IPlugin, PluginMetadata, ValidationResult, PluginContext, PluginResult, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../types/plugin.js';
export declare class TamaguiPlugin implements IPlugin {
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
    private initializeTamagui;
    private installAdditionalDependencies;
    private createConfigurationFiles;
    private createExampleComponents;
    private generateTamaguiConfig;
    private generateWebTamaguiConfig;
    private generateReactNativeTamaguiConfig;
    private generateTamaguiCSS;
    private generateButtonComponent;
    private generateWebButtonComponent;
    private generateReactNativeButtonComponent;
    private generateCardComponent;
    private generateWebCardComponent;
    private generateReactNativeCardComponent;
    private generateInputComponent;
    private generateWebInputComponent;
    private generateReactNativeInputComponent;
    private createErrorResult;
}
