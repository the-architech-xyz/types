/**
 * Tamagui Plugin - Pure Technology Implementation
 *
 * Provides Tamagui UI framework integration.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { BasePlugin } from '../../../base/BasePlugin.js';
import { PluginContext, PluginResult, PluginMetadata, IUIPlugin, UnifiedInterfaceTemplate } from '../../../../types/plugins.js';
export declare class TamaguiPlugin extends BasePlugin implements IUIPlugin {
    private generator;
    constructor();
    getMetadata(): PluginMetadata;
    getParameterSchema(): import("../../../../types/plugins.js").ParameterSchema;
    validateConfiguration(config: Record<string, any>): any;
    generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate;
    getUILibraries(): string[];
    getComponentOptions(): string[];
    getThemeOptions(): string[];
    getStylingOptions(): string[];
    install(context: PluginContext): Promise<PluginResult>;
    getDependencies(): string[];
    getDevDependencies(): string[];
    getCompatibility(): any;
    getConflicts(): string[];
    getRequirements(): any[];
    getDefaultConfig(): Record<string, any>;
    getConfigSchema(): any;
}
