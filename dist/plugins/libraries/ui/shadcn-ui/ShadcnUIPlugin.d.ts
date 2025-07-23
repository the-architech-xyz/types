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
import { BaseUIPlugin } from '../../../base/index.js';
import { PluginContext, PluginResult, PluginMetadata } from '../../../../types/plugins.js';
import { UILibrary, ComponentOption, ThemeOption, StylingOption, ParameterSchema, UnifiedInterfaceTemplate } from '../../../../types/plugins.js';
export declare class ShadcnUIPlugin extends BaseUIPlugin {
    private generator;
    constructor();
    getMetadata(): PluginMetadata;
    getParameterSchema(): ParameterSchema;
    getUILibraries(): UILibrary[];
    getComponentOptions(): ComponentOption[];
    getThemeOptions(): ThemeOption[];
    getStylingOptions(): StylingOption[];
    protected getLibraryLabel(library: UILibrary): string;
    generateUnifiedInterface(config: Record<string, any>): UnifiedInterfaceTemplate;
    install(context: PluginContext): Promise<PluginResult>;
}
