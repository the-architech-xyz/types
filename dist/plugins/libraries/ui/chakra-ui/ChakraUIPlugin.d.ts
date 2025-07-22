/**
 * Chakra UI Plugin - Updated with Latest Best Practices
 *
 * Provides Chakra UI design system integration using the official Chakra UI library.
 * Follows latest Chakra UI documentation and TypeScript best practices.
 *
 * References:
 * - https://chakra-ui.com/getting-started
 * - https://chakra-ui.com/docs/components
 * - https://chakra-ui.com/docs/theming
 */
import { IPlugin, PluginMetadata, ValidationResult, PluginContext, PluginResult, CompatibilityMatrix, ConfigSchema, PluginRequirement } from '../../../../types/plugin.js';
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
    private createThemeConfiguration;
    private createProviderSetup;
    private createComponentExamples;
    private addEnvironmentConfig;
    private generateUnifiedInterfaceFiles;
    private createErrorResult;
}
