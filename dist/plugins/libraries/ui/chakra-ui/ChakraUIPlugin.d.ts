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
import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata, IUIPlugin, UnifiedInterfaceTemplate, ValidationResult } from '../../../../types/plugins.js';
export declare class ChakraUIPlugin extends BasePlugin implements IUIPlugin {
    constructor();
    getMetadata(): PluginMetadata;
    install(context: PluginContext): Promise<PluginResult>;
    uninstall(context: PluginContext): Promise<PluginResult>;
    update(context: PluginContext): Promise<PluginResult>;
    validate(context: PluginContext): Promise<ValidationResult>;
    getCompatibility(): any;
    getDependencies(): string[];
    getConflicts(): string[];
    getRequirements(): any[];
    getDefaultConfig(): Record<string, any>;
    getConfigSchema(): any;
    getParameterSchema(): any;
    validateConfiguration(config: Record<string, any>): ValidationResult;
    generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate;
    getUILibraries(): string[];
    getComponentOptions(): string[];
    getThemeOptions(): string[];
    getStylingOptions(): string[];
    private installChakraDependencies;
    private createThemeConfiguration;
    private createProviderSetup;
    private createComponentExamples;
    private addEnvironmentConfig;
    private generateUnifiedInterfaceFiles;
}
