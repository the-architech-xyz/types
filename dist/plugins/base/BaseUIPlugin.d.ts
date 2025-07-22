/**
 * Base UI Plugin Class
 *
 * Provides common functionality for all UI library plugins.
 */
import { BasePlugin } from './BasePlugin.js';
import { UIPluginConfig, IUIPlugin, UILibrary, ComponentOption, ThemeOption, StylingOption, ParameterSchema } from '../../types/plugin-interfaces.js';
import { PluginContext } from '../../types/plugin.js';
import { ValidationResult } from '../../types/agent.js';
export declare abstract class BaseUIPlugin extends BasePlugin implements IUIPlugin {
    private questionGenerator;
    constructor();
    abstract getUILibraries(): UILibrary[];
    abstract getComponentOptions(): ComponentOption[];
    abstract getThemeOptions(): ThemeOption[];
    abstract getStylingOptions(): StylingOption[];
    protected getBaseUISchema(): ParameterSchema;
    protected setupThemeProvider(context: PluginContext, providerImport: string, providerWrapperStart: string, providerWrapperEnd: string): Promise<void>;
    protected configureStyling(config: UIPluginConfig): Promise<void>;
    getDynamicQuestions(context: PluginContext): any[];
    validateConfiguration(config: Record<string, any>): ValidationResult;
    protected abstract getLibraryLabel(library: UILibrary): string;
}
