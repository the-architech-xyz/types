/**
 * MUI (Material-UI) Plugin - Pure Technology Implementation
 *
 * Provides MUI component library integration using the latest v6.
 * Focuses only on technology setup and artifact generation.
 * No user interaction or business logic - that's handled by agents.
 */
import { BaseUIPlugin } from '../../../base/index.js';
import { PluginContext, PluginResult, PluginMetadata } from '../../../../types/plugin.js';
import { UILibrary, ComponentOption, ThemeOption, StylingOption, ParameterSchema, UnifiedInterfaceTemplate } from '../../../../types/plugin-interfaces.js';
export declare class MuiPlugin extends BaseUIPlugin {
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
