/**
 * Tamagui Plugin - Pure Technology Implementation
 *
 * Provides Tamagui UI framework integration.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { BaseUIPlugin } from '../../../base/index.js';
import { PluginContext, PluginResult, PluginMetadata } from '../../../../types/plugin.js';
import { UILibrary, ComponentOption, ThemeOption, StylingOption, ParameterSchema, UnifiedInterfaceTemplate } from '../../../../types/plugin-interfaces.js';
export declare class TamaguiPlugin extends BaseUIPlugin {
    private generator;
    constructor();
    getMetadata(): PluginMetadata;
    getParameterSchema(): ParameterSchema;
    getUILibraries(): UILibrary[];
    getComponentOptions(): ComponentOption[];
    getThemeOptions(): ThemeOption[];
    getStylingOptions(): StylingOption[];
    getLibraryLabel(library: UILibrary): string;
    generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate;
    install(context: PluginContext): Promise<PluginResult>;
}
